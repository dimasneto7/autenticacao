import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { UserRole } from '@prisma/client'

import { db } from '@/lib/db'
import authConfig from '@/auth.config'
import { getUserById } from '@/data/user'
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation'
import { getAccountByUserId } from '@/data/account'

export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      })
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // Permitir OAuth sem verificacao de email
      if (account?.provider !== 'credentials') return true

      const existingUser = await getUserById(user.id as string)

      // Previnir sign in sem email de verificacao
      if (!existingUser?.emailVerified) return false

      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        )

        if (!twoFactorConfirmation) {
          return false
        }

        // Delete two factor confirmation for next sign in
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        })
      }

      return true
    },

    async session({ token, session }) {
      console.log({ sessionToken: token })
      if (token.sub && session.user) {
        session.user.id = token.sub
      }

      if (token.role && session.user) {
        session.user.role = token.role as UserRole
      }

      if (session.user) {
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
      }

      if (session.user) {
        session.user.name = token.name
        session.user.email = token.email as string
        session.user.isOAuth = token.isOAuth as boolean
      }
      return session
    },
    async jwt({ token }) {
      if (!token.sub) return token

      const existinUser = await getUserById(token.sub)

      if (!existinUser) return token

      const existingAccount = await getAccountByUserId(existinUser.id)

      token.isOAuth = !!existingAccount
      token.name = existinUser.name
      token.email = existinUser.email
      token.role = existinUser.role
      token.isTwoFactorEnabled = existinUser.isTwoFactorEnabled

      return token
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
