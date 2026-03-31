// Streamer Dashboard — shows weekly stats, recent streams, and weekly summary
// Fetches real data from the database via server component

import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  streamEntries,
  streamCalculations,
  weeklyPeriods,
  streamProductsSold,
} from '@/lib/db/schema'
import { eq, and, desc, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { getWeeksForMonth } from '@/lib/week-utils'

// ─── Types ─────────────────────────────────────────────────────────────
type StreamStatus = 'draft' | 'submitted'

interface RecentStream {
  id: string
  date: string
  platform: string
  sales: number
  cogs: number
  payout: number
  status: StreamStatus
}

// ─── Helpers ────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getWeekDateRange(year: number, month: number, weekNumber: number): string {
  const weeks = getWeeksForMonth(year, month)
  const week = weeks.find((w) => w.weekNumber === weekNumber)
  if (!week) return `Week ${weekNumber}`
  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' }
  return `${week.startDate.toLocaleDateString('en-US', opts)} \u2013 ${week.endDate.toLocaleDateString('en-US', { ...opts, year: 'numeric' })}`
}

const statusConfig: Record<StreamStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-dark-700', text: 'text-cage-300' },
  submitted: { label: 'Submitted', bg: 'bg-gold-500/20', text: 'text-gold-400' },
}

// ─── SVG Icons ──────────────────────────────────────────────────────────
function DollarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="5" width="22" height="16" rx="2" />
      <path d="M16 14h.01" />
      <path d="M1 10h22" />
    </svg>
  )
}

function VideoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" />
    </svg>
  )
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/streamdata/login')

  const userId = session.user.id
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  // Get current month's weekly periods
  const periods = await db
    .select()
    .from(weeklyPeriods)
    .where(
      and(
        eq(weeklyPeriods.userId, userId),
        eq(weeklyPeriods.year, currentYear),
        eq(weeklyPeriods.month, currentMonth)
      )
    )
    .orderBy(desc(weeklyPeriods.weekNumber))

  // Determine current week: use the latest period that has stream entries, or the first open period
  let currentPeriod = periods[0] ?? null
  let currentPeriodLabel = 'No weekly period'

  // Fetch all stream entries for this month's periods
  const periodIds = periods.map((p) => p.id)

  let allStreams: Array<{
    id: string
    streamDate: string
    platform: string | null
    streamSales: string
    orderCount: number
    status: 'draft' | 'submitted'
    weeklyPeriodId: string
  }> = []

  if (periodIds.length > 0) {
    allStreams = await db
      .select({
        id: streamEntries.id,
        streamDate: streamEntries.streamDate,
        platform: streamEntries.platform,
        streamSales: streamEntries.streamSales,
        orderCount: streamEntries.orderCount,
        status: streamEntries.status,
        weeklyPeriodId: streamEntries.weeklyPeriodId,
      })
      .from(streamEntries)
      .where(
        and(
          eq(streamEntries.userId, userId),
          sql`${streamEntries.weeklyPeriodId} IN (${sql.join(
            periodIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )
      )
      .orderBy(desc(streamEntries.streamDate))
  }

  // Find the most recent period with streams, or fall back to latest period
  if (allStreams.length > 0) {
    const mostRecentStreamPeriodId = allStreams[0].weeklyPeriodId
    const periodWithStreams = periods.find((p) => p.id === mostRecentStreamPeriodId)
    if (periodWithStreams) {
      currentPeriod = periodWithStreams
    }
  }

  if (currentPeriod) {
    currentPeriodLabel = `Week ${currentPeriod.weekNumber} \u2014 ${getWeekDateRange(currentPeriod.year, currentPeriod.month, currentPeriod.weekNumber)}`
  }

  // Filter streams for the current period
  const currentWeekStreams = currentPeriod
    ? allStreams.filter((s) => s.weeklyPeriodId === currentPeriod!.id)
    : []

  // Fetch calculations for current week streams
  const currentWeekStreamIds = currentWeekStreams.map((s) => s.id)
  let calculations: Array<{
    streamEntryId: string
    totalCogs: string
    breakerPayout: string
    chickenPayout: string
  }> = []

  if (currentWeekStreamIds.length > 0) {
    calculations = await db
      .select({
        streamEntryId: streamCalculations.streamEntryId,
        totalCogs: streamCalculations.totalCogs,
        breakerPayout: streamCalculations.breakerPayout,
        chickenPayout: streamCalculations.chickenPayout,
      })
      .from(streamCalculations)
      .where(
        sql`${streamCalculations.streamEntryId} IN (${sql.join(
          currentWeekStreamIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
  }

  // Also fetch COGS from streamProductsSold for drafts that don't have calculations
  let productCogsByStream: Record<string, number> = {}
  if (currentWeekStreamIds.length > 0) {
    const cogsRows = await db
      .select({
        streamEntryId: streamProductsSold.streamEntryId,
        totalCogs: sql<string>`SUM(${streamProductsSold.costPerUnit}::numeric * ${streamProductsSold.amountSold})`,
      })
      .from(streamProductsSold)
      .where(
        sql`${streamProductsSold.streamEntryId} IN (${sql.join(
          currentWeekStreamIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
      .groupBy(streamProductsSold.streamEntryId)

    for (const row of cogsRows) {
      productCogsByStream[row.streamEntryId] = parseFloat(row.totalCogs || '0')
    }
  }

  const calcByStreamId = new Map(calculations.map((c) => [c.streamEntryId, c]))

  // Compute stats
  const submittedStreams = currentWeekStreams.filter((s) => s.status === 'submitted')
  const draftStreams = currentWeekStreams.filter((s) => s.status === 'draft')

  const weekSales = currentWeekStreams.reduce((sum, s) => sum + parseFloat(s.streamSales), 0)
  const weekPayout = calculations.reduce((sum, c) => sum + parseFloat(c.breakerPayout), 0)
  const streamsThisWeek = submittedStreams.length
  const pendingDrafts = draftStreams.length

  // Build recent streams list (last 10 across all periods this month)
  const last10Streams = allStreams.slice(0, 10)

  // Fetch calculations for last 10 streams
  const last10Ids = last10Streams.map((s) => s.id)
  let last10Calcs: Array<{
    streamEntryId: string
    totalCogs: string
    breakerPayout: string
  }> = []

  if (last10Ids.length > 0) {
    last10Calcs = await db
      .select({
        streamEntryId: streamCalculations.streamEntryId,
        totalCogs: streamCalculations.totalCogs,
        breakerPayout: streamCalculations.breakerPayout,
      })
      .from(streamCalculations)
      .where(
        sql`${streamCalculations.streamEntryId} IN (${sql.join(
          last10Ids.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
  }

  // Fetch product COGS for last 10 streams
  let last10CogsByStream: Record<string, number> = {}
  if (last10Ids.length > 0) {
    const cogsRows = await db
      .select({
        streamEntryId: streamProductsSold.streamEntryId,
        totalCogs: sql<string>`SUM(${streamProductsSold.costPerUnit}::numeric * ${streamProductsSold.amountSold})`,
      })
      .from(streamProductsSold)
      .where(
        sql`${streamProductsSold.streamEntryId} IN (${sql.join(
          last10Ids.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
      .groupBy(streamProductsSold.streamEntryId)

    for (const row of cogsRows) {
      last10CogsByStream[row.streamEntryId] = parseFloat(row.totalCogs || '0')
    }
  }

  const last10CalcMap = new Map(last10Calcs.map((c) => [c.streamEntryId, c]))

  const recentStreams: RecentStream[] = last10Streams.map((s) => {
    const calc = last10CalcMap.get(s.id)
    const cogs = calc ? parseFloat(calc.totalCogs) : (last10CogsByStream[s.id] ?? 0)
    const payout = calc ? parseFloat(calc.breakerPayout) : 0
    return {
      id: s.id,
      date: s.streamDate,
      platform: s.platform ?? 'Whatnot',
      sales: parseFloat(s.streamSales),
      cogs,
      payout,
      status: s.status,
    }
  })

  // Weekly summary
  const weeklyChickenPayout = calculations.reduce(
    (sum, c) => sum + parseFloat(c.chickenPayout),
    0
  )
  const weeklyAdjustments = currentPeriod
    ? parseFloat(currentPeriod.weeklyAdjustments ?? '0')
    : 0
  const breakerTotalPayout = weekPayout + weeklyAdjustments

  const weeklySummary = {
    runningSales: weekSales,
    breakerPayout: weekPayout,
    chickenPayout: weeklyChickenPayout,
    weeklyAdjustments,
    breakerTotalPayout,
  }

  const hasStreams = recentStreams.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
            Dashboard
          </h1>
          <p className="mt-1 text-cage-400 text-sm">
            {currentPeriodLabel}
          </p>
        </div>
        <Link
          href="/streamdata/submit"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-950 font-semibold px-5 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark-950"
        >
          <PlusIcon className="w-4 h-4" />
          Submit Stream
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="This Week&rsquo;s Sales"
          value={fmt(weekSales)}
          icon={<DollarIcon className="w-5 h-5" />}
          borderColor="border-l-gold-500"
          iconBg="bg-gold-500/10 text-gold-400"
        />
        <StatCard
          label="This Week&rsquo;s Payout"
          value={fmt(weekPayout)}
          icon={<WalletIcon className="w-5 h-5" />}
          borderColor="border-l-green-500"
          iconBg="bg-green-500/10 text-green-400"
        />
        <StatCard
          label="Streams This Week"
          value={String(streamsThisWeek)}
          icon={<VideoIcon className="w-5 h-5" />}
          borderColor="border-l-blue-500"
          iconBg="bg-blue-500/10 text-blue-400"
        />
        <StatCard
          label="Pending Drafts"
          value={String(pendingDrafts)}
          icon={<FileIcon className="w-5 h-5" />}
          borderColor="border-l-cage-500"
          iconBg="bg-dark-700 text-cage-400"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Streams — 2 cols */}
        <div className="lg:col-span-2 bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-blood-900/40 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-white">Recent Streams</h2>
            <Link
              href="/streamdata/history"
              className="text-sm text-gold-400 hover:text-gold-300 transition-colors"
            >
              View All
            </Link>
          </div>

          {hasStreams ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-cage-400 text-left border-b border-blood-900/40">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Platform</th>
                    <th className="px-6 py-3 font-medium text-right">Sales</th>
                    <th className="px-6 py-3 font-medium text-right">COGS</th>
                    <th className="px-6 py-3 font-medium text-right">Payout</th>
                    <th className="px-6 py-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cage-700/50">
                  {recentStreams.map((stream) => {
                    const badge = statusConfig[stream.status]
                    return (
                      <tr
                        key={stream.id}
                        className="hover:bg-dark-700/40 transition-colors"
                      >
                        <td className="px-6 py-4 text-white whitespace-nowrap">
                          {formatDate(stream.date)}
                        </td>
                        <td className="px-6 py-4 text-cage-300 whitespace-nowrap">
                          {stream.platform}
                        </td>
                        <td className="px-6 py-4 text-white text-right tabular-nums">
                          {fmt(stream.sales)}
                        </td>
                        <td className="px-6 py-4 text-cage-300 text-right tabular-nums">
                          {fmt(stream.cogs)}
                        </td>
                        <td className="px-6 py-4 text-white font-medium text-right tabular-nums">
                          {stream.status === 'draft' ? '\u2014' : fmt(stream.payout)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center">
              <FileIcon className="w-10 h-10 text-cage-600 mx-auto mb-3" />
              <p className="text-cage-400 mb-4">
                No streams submitted yet. Submit your first stream!
              </p>
              <Link
                href="/streamdata/submit"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-950 font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
              >
                <PlusIcon className="w-4 h-4" />
                Submit Stream
              </Link>
            </div>
          )}
        </div>

        {/* Weekly Summary — 1 col */}
        <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl p-6">
          <h2 className="font-heading text-lg font-semibold text-white mb-6">
            Weekly Summary
          </h2>

          <div className="space-y-4">
            <SummaryRow label="Running Sales Total" value={fmt(weeklySummary.runningSales)} />
            <SummaryRow label="Running Breaker Payout" value={fmt(weeklySummary.breakerPayout)} />

            <div className="border-t border-blood-900/40 pt-4">
              <SummaryRow
                label="Weekly Adjustments"
                value={fmt(weeklySummary.weeklyAdjustments)}
                muted
              />
            </div>

            <div className="border-t border-cage-600 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">Breaker Total Payout</span>
                <span className="text-2xl font-bold text-green-400 tabular-nums">
                  {fmt(weeklySummary.breakerTotalPayout)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  icon,
  borderColor,
  iconBg,
}: {
  label: string
  value: string
  icon: React.ReactNode
  borderColor: string
  iconBg: string
}) {
  return (
    <div
      className={`bg-black/60 backdrop-blur-md border border-blood-900/40 border-l-4 ${borderColor} rounded-xl p-5 flex items-start gap-4`}
    >
      <div className={`flex-shrink-0 rounded-lg p-2.5 ${iconBg}`}>{icon}</div>
      <div className="min-w-0">
        <p
          className="text-sm text-cage-400 truncate"
          dangerouslySetInnerHTML={{ __html: label }}
        />
        <p className="mt-1 text-2xl font-bold text-white tabular-nums">{value}</p>
      </div>
    </div>
  )
}

function SummaryRow({
  label,
  value,
  muted = false,
}: {
  label: string
  value: string
  muted?: boolean
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? 'text-cage-500 text-sm' : 'text-cage-400 text-sm'}>{label}</span>
      <span
        className={`tabular-nums font-medium ${muted ? 'text-cage-500' : 'text-white'}`}
      >
        {value}
      </span>
    </div>
  )
}
