'use server'

import * as z from 'zod'
import { AuthError } from 'next-auth'
import { LoginSchema } from '@/schemas'

import { signIn } from '@/auth'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

export const login = async (values: z.infer<typeof LoginSchema>) => {
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: 'Campos Inválidos' }
  }

  const { email, password } = validatedFields.data

  console.log('email', email)
  console.log('password', password)

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
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
