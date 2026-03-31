// SessionProvider wrapper for the streamer portal
// Must be a client component to provide NextAuth session context

'use client'

import { SessionProvider } from 'next-auth/react'

export default function PortalProviders({
  children,
}: {
  children: React.ReactNode
}) {
  return <SessionProvider>{children}</SessionProvider>
}
