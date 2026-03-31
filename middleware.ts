// Route protection middleware for streamer portal
// Uses Edge-safe auth config (no pg/bcrypt imports)
// Full auth with DB access is in lib/auth.ts (used by API routes + server components)

import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

export const { auth: middleware } = NextAuth(authConfig)

export const config = {
  matcher: ['/streamdata/:path*', '/api/streamdata/:path*'],
}
