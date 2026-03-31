// Portal shell layout - server component that checks auth and renders sidebar + main content area
// force-dynamic: auth() must run per-request to read the session cookie.
// Without this, Next.js can statically pre-render the layout at build time
// (when there is no session), caching the unauthenticated shell for all users.

import { auth } from '@/lib/auth'
import PortalProviders from '@/components/portal/Providers'
import SidebarNav from '@/components/portal/SidebarNav'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'StreamData | Chicken1of1',
  description: 'Chicken1of1 streamer portal for managing streams, inventory, and payouts.',
  robots: 'noindex, nofollow',
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  const isAuthenticated = !!session?.user
  const userName = session?.user?.name || session?.user?.email || 'User'
  const userRole = (session?.user as any)?.role || 'streamer'

  return (
    <PortalProviders>
      <div className="min-h-screen bg-dark-950 text-white">
        {isAuthenticated ? (
          <>
            <SidebarNav userName={userName} userRole={userRole} />
            <main className="relative min-h-screen pt-14 lg:pl-64">
              {/* Red gradient background matching main site */}
              <div
                className="pointer-events-none fixed inset-0 lg:left-64"
                style={{
                  background: 'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(185,28,28,0.12) 0%, transparent 70%)',
                }}
                aria-hidden="true"
              />
              {/* Cage wire pattern */}
              <div
                className="pointer-events-none fixed inset-0 lg:left-64 opacity-40"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0V0zm1 1h38v38H1V1z' fill='%23ffffff' fill-opacity='0.02'/%3E%3C/svg%3E")`,
                }}
                aria-hidden="true"
              />
              <div className="relative mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </main>
          </>
        ) : (
          <main className="min-h-screen">{children}</main>
        )}
      </div>
    </PortalProviders>
  )
}
