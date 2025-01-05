import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'

import { db } from '@/lib/db'
import authConfig from '@/auth.config'

export const { auth, handlers, signIn, signOut } = NextAuth({
  callbacks: {
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub
      }
      console.log({ session })
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  ...authConfig,
})
