// Admin dashboard — overview of all streamers, revenue, and recent activity
// Server component: queries the database directly via Drizzle ORM

import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  users,
  streamEntries,
  streamCalculations,
  streamerFeeConfig,
} from '@/lib/db/schema'
import { eq, and, desc, sql, gte } from 'drizzle-orm'
import { redirect } from 'next/navigation'

/* ---------- helpers ---------- */

function fmt(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const statusBadge: Record<string, string> = {
  draft: 'bg-dark-700 text-cage-300',
  submitted: 'bg-gold-500/20 text-gold-400',
  approved: 'bg-green-500/20 text-green-400',
}

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
}

/* ---------- component ---------- */

export default async function AdminDashboardPage() {
  // Auth check
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/streamdata/login')
  }

  // Current month boundaries
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split('T')[0]

  // 1. Count active streamers
  const activeStreamersResult = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.role, 'streamer'), eq(users.isActive, true)))
  const activeStreamersCount = activeStreamersResult[0]?.count ?? 0

  // 2. This month's total revenue (sum of stream_sales for entries this month)
  const revenueResult = await db
    .select({
      totalSales: sql<string>`coalesce(sum(${streamEntries.streamSales}), 0)`,
    })
    .from(streamEntries)
    .where(gte(streamEntries.streamDate, monthStart))
  const totalRevenue = parseFloat(revenueResult[0]?.totalSales ?? '0')

  // 3. This month's total breaker payouts and chicken payouts
  const payoutsResult = await db
    .select({
      totalBreakerPayout: sql<string>`coalesce(sum(${streamCalculations.breakerPayout}), 0)`,
      totalChickenPayout: sql<string>`coalesce(sum(${streamCalculations.chickenPayout}), 0)`,
    })
    .from(streamCalculations)
    .innerJoin(streamEntries, eq(streamCalculations.streamEntryId, streamEntries.id))
    .where(gte(streamEntries.streamDate, monthStart))
  const totalBreakerPayout = parseFloat(payoutsResult[0]?.totalBreakerPayout ?? '0')
  const totalChickenPayout = parseFloat(payoutsResult[0]?.totalChickenPayout ?? '0')

  // 3b. All-time lifetime totals (across all submitted entries)
  const lifetimeRevenueResult = await db
    .select({
      totalRevenue: sql<string>`coalesce(sum(${streamEntries.streamSales}), 0)`,
    })
    .from(streamEntries)
    .where(eq(streamEntries.status, 'submitted'))
  const lifetimeRevenue = parseFloat(lifetimeRevenueResult[0]?.totalRevenue ?? '0')

  const lifetimePayoutsResult = await db
    .select({
      totalBreakerPayout: sql<string>`coalesce(sum(${streamCalculations.breakerPayout}), 0)`,
      totalChickenPayout: sql<string>`coalesce(sum(${streamCalculations.chickenPayout}), 0)`,
    })
    .from(streamCalculations)
    .innerJoin(streamEntries, eq(streamCalculations.streamEntryId, streamEntries.id))
    .where(eq(streamEntries.status, 'submitted'))
  const lifetimeBreakerPayout = parseFloat(lifetimePayoutsResult[0]?.totalBreakerPayout ?? '0')
  const lifetimeChickenPayout = parseFloat(lifetimePayoutsResult[0]?.totalChickenPayout ?? '0')

  // 4. Per-streamer stats: weekly sales, payout, stream count, support fee rate
  //    Get the most recent week's data for each active streamer
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  const weekStart = startOfWeek.toISOString().split('T')[0]

  const streamerStatsRaw = await db
    .select({
      userId: users.id,
      name: users.displayName,
      isActive: users.isActive,
      weekSales: sql<string>`coalesce(sum(${streamEntries.streamSales}), 0)`,
      weekPayout: sql<string>`coalesce(sum(${streamCalculations.breakerPayout}), 0)`,
      streamCount: sql<number>`count(${streamEntries.id})::int`,
    })
    .from(users)
    .leftJoin(
      streamEntries,
      and(
        eq(streamEntries.userId, users.id),
        gte(streamEntries.streamDate, weekStart)
      )
    )
    .leftJoin(streamCalculations, eq(streamCalculations.streamEntryId, streamEntries.id))
    .where(eq(users.role, 'streamer'))
    .groupBy(users.id, users.displayName, users.isActive)

  // Get support fee rates for each streamer
  const feeConfigs = await db
    .select({
      userId: streamerFeeConfig.userId,
      rate: streamerFeeConfig.rate,
    })
    .from(streamerFeeConfig)
    .where(
      and(
        eq(streamerFeeConfig.feeName, 'support_fee'),
        eq(streamerFeeConfig.isActive, true)
      )
    )

  const feeMap = new Map(feeConfigs.map((f) => [f.userId, parseFloat(f.rate)]))

  const streamers = streamerStatsRaw.map((s) => ({
    name: s.name,
    weekSales: parseFloat(s.weekSales),
    weekPayout: parseFloat(s.weekPayout),
    streams: s.streamCount,
    supportFee: Math.round((feeMap.get(s.userId) ?? 0) * 100),
    status: s.isActive ? ('active' as const) : ('inactive' as const),
  }))

  // 5. Last 10 stream entries across all users
  const recentActivityRaw = await db
    .select({
      id: streamEntries.id,
      streamer: users.displayName,
      date: streamEntries.streamDate,
      sales: streamEntries.streamSales,
      status: streamEntries.status,
    })
    .from(streamEntries)
    .innerJoin(users, eq(streamEntries.userId, users.id))
    .orderBy(desc(streamEntries.createdAt))
    .limit(10)

  const recentActivity = recentActivityRaw.map((a) => ({
    id: a.id,
    streamer: a.streamer,
    date: a.date,
    sales: fmt(parseFloat(a.sales)),
    status: a.status,
  }))

  // Build stats cards
  const stats = [
    {
      title: 'Revenue',
      subtitle: 'THIS MONTH',
      value: fmt(totalRevenue),
      valueColor: 'text-green-400',
      note: `${streamers.length} breaker(s) active`,
      noteColor: 'text-white',
    },
    {
      title: 'Breaker',
      subtitle: 'THIS MONTH',
      value: fmt(totalBreakerPayout),
      valueColor: 'text-green-400',
      note: '',
      noteColor: '',
    },
    {
      title: 'Chicken',
      subtitle: 'THIS MONTH',
      value: fmt(totalChickenPayout),
      valueColor: 'text-green-400',
      note: '',
      noteColor: '',
    },
    {
      title: 'Breakers',
      subtitle: 'ACTIVE',
      value: String(activeStreamersCount),
      valueColor: 'text-white',
      note: '',
      noteColor: '',
    },
  ]

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-cage-400">
            Overview of all breaker activity and revenue
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {[
            { href: '/streamdata/admin/submissions', label: 'Submissions' },
            { href: '/streamdata/admin/payouts', label: 'Payouts' },
            { href: '/streamdata/admin/fees', label: 'Fees' },
            { href: '/streamdata/admin/streamers', label: 'Breakers' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg border border-blood-900/40 bg-black/60 backdrop-blur-md px-4 py-2 text-sm font-medium text-cage-300 transition-colors hover:border-indigo-500/50 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Stats row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.title}
            className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-6"
          >
            <h3 className="text-lg font-bold text-white">{s.title}</h3>
            <p className="text-[11px] font-medium uppercase tracking-widest text-cage-500">{s.subtitle}</p>
            <p className={`mt-4 text-3xl font-bold tabular-nums ${s.valueColor}`}>{s.value}</p>
            {s.note && <p className={`mt-2 text-xs ${s.noteColor}`}>{s.note}</p>}
          </div>
        ))}
      </div>

      {/* All-time one-liner */}
      <div className="mb-8 -mt-4 flex flex-wrap items-center gap-1 text-sm text-cage-500">
        <span>All Time:</span>
        <span className="text-gold-400 font-medium">{fmt(lifetimeRevenue)}</span>
        <span>&middot; Breaker</span>
        <span className="text-green-400 font-medium">{fmt(lifetimeBreakerPayout)}</span>
        <span>&middot; Chicken</span>
        <span className="text-gold-400 font-medium">{fmt(lifetimeChickenPayout)}</span>
      </div>

      {/* Per-streamer cards */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Breaker Performance — This Week
        </h2>
        {streamers.length === 0 ? (
          <p className="text-sm text-cage-500">No breaker data available yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {streamers.map((st) => (
              <div
                key={st.name}
                className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white">
                    {st.name}
                  </h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      st.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-dark-700 text-cage-400'
                    }`}
                  >
                    {st.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <dl className="mt-4 space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-cage-400">Sales</dt>
                    <dd className="text-sm font-medium text-white">
                      {fmt(st.weekSales)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-cage-400">Payout</dt>
                    <dd className="text-sm font-medium text-white">
                      {fmt(st.weekPayout)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-cage-400">Streams</dt>
                    <dd className="text-sm font-medium text-white">
                      {st.streams}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-cage-400">Support Fee</dt>
                    <dd>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          st.supportFee >= 30
                            ? 'bg-gold-500/20 text-gold-400'
                            : 'bg-indigo-500/20 text-indigo-400'
                        }`}
                      >
                        {st.supportFee}%
                      </span>
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Recent Activity
        </h2>
        <div className="overflow-hidden rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-blood-900/40">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400">
                    Breaker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cage-700/50">
                {recentActivity.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-cage-500">
                      No recent activity.
                    </td>
                  </tr>
                ) : (
                  recentActivity.map((a) => (
                    <tr
                      key={a.id}
                      className="transition-colors hover:bg-dark-700/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                        {a.streamer}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-cage-300">
                        {a.date}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-cage-300">
                        {a.sales}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Link
                          href={`/streamdata/admin/submissions/${a.id}`}
                          className="text-sm font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
