// Full NextAuth v5 configuration with credentials provider
// Uses bcrypt + pg (Node.js only) — NOT safe for Edge/middleware
// For middleware, use auth.config.ts instead

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import { users } from './db/schema'
import { eq } from 'drizzle-orm'

// Pre-computed dummy hash for timing-safe comparison when user is not found
const DUMMY_HASH = '$2a$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[auth] Missing email or password')
          return null
        }

        console.log('[auth] Attempting login for:', credentials.email)

        try {
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email as string),
          })

          console.log('[auth] User found:', !!user)

          const hashToCompare = user?.passwordHash ?? DUMMY_HASH
          const isValid = await bcrypt.compare(
            credentials.password as string,
            hashToCompare
          )

          console.log('[auth] Password valid:', isValid)

          if (!user || !user.isActive || !isValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.displayName,
            role: user.role,
          }
        } catch (err) {
          console.error('[auth] Authorize error:', (err as Error).message)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = (user as any).role ?? 'streamer'
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        ;(session.user as any).role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: '/streamdata/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 28800, // 8 hours
  },
})
