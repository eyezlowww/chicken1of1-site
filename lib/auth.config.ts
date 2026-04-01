// Edge-safe NextAuth config (no Node.js-only imports like pg/bcrypt)
// Used by middleware for JWT session verification only.
// The full auth config with credentials provider is in auth.ts.

import type { NextAuthConfig } from 'next-auth'

export const authConfig: NextAuthConfig = {
  providers: [], // Providers are added in auth.ts (can't use bcrypt/pg in Edge)
  pages: {
    signIn: '/streamdata/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 28800, // 8 hours
  },
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
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const pathname = nextUrl.pathname

      // Allow unauthenticated access to login, setup, and forgot-password pages
      if (
        pathname === '/streamdata/login' ||
        pathname === '/streamdata/login/' ||
        pathname.startsWith('/streamdata/setup') ||
        pathname.startsWith('/streamdata/forgot-password') ||
        pathname === '/api/streamdata/setup' ||
        pathname === '/api/streamdata/setup/' ||
        pathname === '/api/streamdata/forgot-password' ||
        pathname === '/api/streamdata/forgot-password/'
      ) {
        // Redirect logged-in users away from login page
        if (isLoggedIn && (pathname === '/streamdata/login' || pathname === '/streamdata/login/')) {
          // Redirect based on role
          const role = (auth?.user as any)?.role
          const target = role === 'admin' ? '/streamdata/admin' : '/streamdata/dashboard'
          return Response.redirect(new URL(target, nextUrl))
        }
        return true
      }

      // API route protection
      if (pathname.startsWith('/api/streamdata')) {
        if (!isLoggedIn) return false // Returns 401
        // Admin route check
        if (pathname.startsWith('/api/streamdata/admin')) {
          if ((auth?.user as any)?.role !== 'admin') return false
        }
        return true
      }

      // Page route protection
      if (pathname.startsWith('/streamdata')) {
        if (!isLoggedIn) return false // Redirects to signIn page
        // Admin page check
        if (pathname.startsWith('/streamdata/admin')) {
          if ((auth?.user as any)?.role !== 'admin') {
            return Response.redirect(new URL('/streamdata/dashboard', nextUrl))
          }
        }
        return true
      }

      return true
    },
  },
}
