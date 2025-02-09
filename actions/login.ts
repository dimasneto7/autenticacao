'use server'

import * as z from 'zod'
import { AuthError } from 'next-auth'

import { signIn } from '@/auth'
import { db } from '@/lib/db'
import { LoginSchema } from '@/schemas'
import { getUserByEmail } from '@/data/user'
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token'
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'
import { sendVerificationEmail, sendTwoFactorTokenEmail } from '@/lib/mail'
import { generateVerificationToken, generateTwoFactorToken } from '@/lib/tokens'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

export const login = async (
  values: z.infer<typeof LoginSchema>,
  callbackUrl?: string | null
) => {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Campos Inválidos' }
  }

  const { email, password, code } = validatedFields.data

  const existingUser = await getUserByEmail(email)

  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Email não cadastrado!' }
  }

  if (!existingUser.emailVerified) {
    const verificationToken = await generateVerificationToken(
      existingUser.email
    )

    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token
    )

    return { success: 'Confirmação de email enviada!' }
  }

  if (existingUser && existingUser.isTwoFactorEnabled && existingUser.email) {
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email)

      if (!twoFactorToken) {
        return { error: 'Código Inválido' }
      }

      if (twoFactorToken.token !== code) {
        return { error: 'Código Inválido' }
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date()

      if (hasExpired) {
        return { error: 'O código expirou!' }
      }

      await db.twoFactorToken.delete({
        where: {
          id: twoFactorToken.id,
        },
      })

      const existingConfirmation = await getTwoFactorConfirmationByUserId(
        existingUser.id
      )

      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        })
      }

      await db.twoFactorConfirmation.create({
        data: {
          userId: existingUser.id,
        },
      })
    } else {
      const twoFactorToken = await generateTwoFactorToken(existingUser.email)

      await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token)

      return { twoFactor: true }
    }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    })
  } catch (error) {
    console.log('error ', error)
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Credenciais inválidas' }
        default:
          return { error: 'Ops, algo saiu errado' }
      }
    }
    throw error
  }
}
