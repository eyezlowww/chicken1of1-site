// Sidebar navigation client component for mobile toggle and active link highlighting

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'
import FeedbackPopup from './FeedbackPopup'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const streamerNav: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/streamdata/dashboard',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: 'Submit Stream',
    href: '/streamdata/submit',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    label: 'Live Tracker',
    href: '/streamdata/live',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    label: 'History',
    href: '/streamdata/history',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Payouts',
    href: '/streamdata/payouts',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    label: 'Spot Calculator',
    href: '/streamdata/tools/spot-calculator',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008H15.75v-.008zm0 2.25h.008v.008H15.75V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
      </svg>
    ),
  },
  {
    label: 'PYT Calculator',
    href: '/streamdata/tools/pyt-calculator',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
]

const adminNav: NavItem[] = [
  {
    label: 'Admin Dashboard',
    href: '/streamdata/admin',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/streamdata/admin/analytics',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: 'Manage Fees',
    href: '/streamdata/admin/fees',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Manage Breakers',
    href: '/streamdata/admin/streamers',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    label: 'Product Management',
    href: '/streamdata/admin/products',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    label: 'Live Monitor',
    href: '/streamdata/admin/live',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    label: 'All Payouts',
    href: '/streamdata/admin/payouts',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
]

// Map routes to page titles for the top bar
const pageTitles: Record<string, string> = {
  '/streamdata/dashboard': 'Dashboard',
  '/streamdata/submit': 'Submit Stream',
  '/streamdata/history': 'Stream History',
  '/streamdata/inventory': 'Breaker Inventory',
  '/streamdata/admin/inventory-mgmt': 'Stock Management',
  '/streamdata/live': 'Live Break Tracker',
  '/streamdata/payouts': 'Payouts',
  '/streamdata/admin': 'Admin Dashboard',
  '/streamdata/admin/analytics': 'Analytics',
  '/streamdata/admin/fees': 'Manage Fees',
  '/streamdata/admin/streamers': 'Manage Breakers',
  '/streamdata/admin/products': 'Products',
  '/streamdata/admin/live': 'Live Monitor',
  '/streamdata/admin/payouts': 'All Payouts',
  '/streamdata/tools/spot-calculator': 'Spot Calculator',
  '/streamdata/tools/pyt-calculator': 'PYT Calculator',
  '/streamdata/tools/fanatics-report': 'Fanatics Report',
  '/streamdata/profile': 'Profile & Settings',
}

interface SidebarNavProps {
  userName: string
  userRole: string
}

export default function SidebarNav({ userName, userRole }: SidebarNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [liveCount, setLiveCount] = useState(0)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const pathname = usePathname()

  const isAdmin = userRole === 'admin'
  const pageTitle = pageTitles[pathname] || 'StreamData'

  // Poll for live breakers count (admin only)
  useEffect(() => {
    if (!isAdmin) return
    async function checkLive() {
      try {
        const res = await fetch('/api/streamdata/admin/live')
        if (res.ok) {
          const data = await res.json()
          const count = (data.sessions || []).filter((s: any) => s.status === 'live').length
          setLiveCount(count)
        }
      } catch { /* silent */ }
    }
    checkLive()
    const interval = setInterval(checkLive, 30000) // every 30s
    return () => clearInterval(interval)
  }, [isAdmin])

  // Get initials for avatar
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  function NavLink({ item }: { item: NavItem }) {
    const isActive = pathname === item.href
    return (
      <Link
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          isActive
            ? 'bg-gold-500/10 text-gold-500'
            : 'text-cage-400 hover:bg-dark-800 hover:text-white'
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {item.icon}
        {item.label}
      </Link>
    )
  }

  const sidebarContent = (
    <>
      {/* Logo area */}
      <div className="flex h-16 items-center gap-3 border-b border-blood-900/40 px-4">
        <img src="/logo-chicken1of1.svg" alt="Chicken1of1" className="h-9 w-9" />
        <div className="flex flex-col">
          <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-sm font-bold tracking-wide text-transparent" style={{ fontFamily: 'var(--font-oswald)' }}>
            CHICKEN1OF1
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-cage-500">
            StreamData
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Portal navigation">
        {isAdmin ? (
          <>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-cage-600">
              Admin
            </div>
            {adminNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
            <div className="mb-2 mt-6 px-3 text-[11px] font-semibold uppercase tracking-wider text-cage-600">
              Tools
            </div>
            {/* Submit Stream — admin can submit on behalf of a streamer */}
            <NavLink item={streamerNav[1]} />
            {/* Breaker Inventory — what each breaker currently has */}
            <NavLink item={{
              label: 'Breaker Inventory',
              href: '/streamdata/inventory',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                </svg>
              ),
            }} />
            {/* Stock Management — admin inventory management */}
            <NavLink item={{
              label: 'Stock Management',
              href: '/streamdata/admin/inventory-mgmt',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              ),
            }} />
            {/* Fanatics Report — monthly Topps Direct data collection */}
            <NavLink item={{
              label: 'Fanatics Report',
              href: '/streamdata/tools/fanatics-report',
              icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              ),
            }} />
          </>
        ) : (
          <>
            <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-cage-600">
              Menu
            </div>
            {streamerNav.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </>
        )}
      </nav>

      {/* Feedback button */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setFeedbackOpen(true)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-cage-500 transition-colors hover:bg-dark-800 hover:text-cage-300"
          aria-label="Send feedback"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
          </svg>
          Feedback
        </button>
      </div>

      {/* User info + Logout at bottom */}
      <div className="border-t border-blood-900/40 p-3">
        <Link
          href="/streamdata/profile"
          onClick={() => setMobileOpen(false)}
          className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-dark-800"
          title="Profile & Settings"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-dark-700 text-xs font-bold text-white">
            {initials}
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <span className="truncate text-sm font-medium text-white">
              {userName}
            </span>
            <span
              className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                isAdmin
                  ? 'bg-gold-500/15 text-gold-400'
                  : 'bg-dark-700 text-cage-400'
              }`}
            >
              {userRole === 'streamer' ? 'Breaker' : userRole}
            </span>
          </div>
          <svg className="h-4 w-4 flex-shrink-0 text-cage-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </Link>
        <LogoutButton />
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-blood-900/60 bg-black lg:flex"
        aria-label="Sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-blood-900/40 bg-dark-950/80 px-4 backdrop-blur-sm lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="rounded-lg p-1.5 text-cage-400 hover:bg-dark-800 hover:text-white"
          aria-label="Open navigation menu"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <span className="text-sm font-semibold text-white">{pageTitle}</span>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Sidebar panel */}
          <aside
            className="fixed inset-y-0 left-0 flex w-64 flex-col bg-black"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-4 rounded-lg p-1 text-cage-500 hover:text-white"
              aria-label="Close navigation menu"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop top bar */}
      <div className="hidden lg:fixed lg:left-64 lg:right-0 lg:top-0 lg:z-20 lg:flex lg:h-14 lg:items-center lg:justify-between lg:border-b lg:border-blood-900/40 lg:bg-dark-950/80 lg:px-6 lg:backdrop-blur-sm">
        <h1 className="text-sm font-semibold text-white">{pageTitle}</h1>
        {/* Live indicator — centered */}
        {isAdmin && liveCount > 0 && (
          <Link href="/streamdata/admin/live" className="flex items-center gap-2 rounded-full border border-blood-600/40 bg-blood-950/60 px-3 py-1 transition-colors hover:border-blood-500/50">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
            </span>
            <span className="text-xs font-medium text-white">{liveCount} Live</span>
          </Link>
        )}
        <div className="flex items-center gap-3">
          <span className="text-sm text-cage-400">{userName}</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-700 text-xs font-bold text-white">
            {initials}
          </div>
        </div>
      </div>

      {/* Feedback popup */}
      <FeedbackPopup open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </>
  )
}
