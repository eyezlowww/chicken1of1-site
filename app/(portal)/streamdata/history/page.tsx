// Stream History — lists all past stream submissions
// Server component that queries the database directly

import Link from 'next/link'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import {
  streamEntries,
  streamCalculations,
  streamProductsSold,
} from '@/lib/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'

// ─── Types ──────────────────────────────────────────────────────────────
type StreamStatus = 'draft' | 'submitted'

interface HistoryEntry {
  id: string
  date: string
  platform: string
  sales: number
  cogs: number
  grossProfit: number
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

const statusConfig: Record<StreamStatus, { label: string; bg: string; text: string }> = {
  draft: { label: 'Draft', bg: 'bg-dark-700', text: 'text-cage-300' },
  submitted: { label: 'Submitted', bg: 'bg-gold-500/20', text: 'text-gold-400' },
}

// ─── Icons ──────────────────────────────────────────────────────────────
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}

function ArrowUpDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 15l5 5 5-5" />
      <path d="M7 9l5-5 5 5" />
    </svg>
  )
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

// ─── Page ───────────────────────────────────────────────────────────────
export default async function HistoryPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/streamdata/login')

  const userId = session.user.id

  // Fetch all stream entries for this user, ordered by date desc
  const entries = await db
    .select({
      id: streamEntries.id,
      streamDate: streamEntries.streamDate,
      platform: streamEntries.platform,
      streamSales: streamEntries.streamSales,
      status: streamEntries.status,
    })
    .from(streamEntries)
    .where(eq(streamEntries.userId, userId))
    .orderBy(desc(streamEntries.streamDate))

  // Fetch calculations for all entries
  const entryIds = entries.map((e) => e.id)
  let calcsMap = new Map<
    string,
    { totalCogs: string; grossProfit: string; breakerPayout: string }
  >()

  if (entryIds.length > 0) {
    const calcs = await db
      .select({
        streamEntryId: streamCalculations.streamEntryId,
        totalCogs: streamCalculations.totalCogs,
        grossProfit: streamCalculations.grossProfit,
        breakerPayout: streamCalculations.breakerPayout,
      })
      .from(streamCalculations)
      .where(
        sql`${streamCalculations.streamEntryId} IN (${sql.join(
          entryIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )

    calcsMap = new Map(calcs.map((c) => [c.streamEntryId, c]))
  }

  // Fetch COGS from products sold for entries without calculations (drafts)
  let cogsByStream: Record<string, number> = {}
  if (entryIds.length > 0) {
    const cogsRows = await db
      .select({
        streamEntryId: streamProductsSold.streamEntryId,
        totalCogs: sql<string>`SUM(${streamProductsSold.costPerUnit}::numeric * ${streamProductsSold.amountSold})`,
      })
      .from(streamProductsSold)
      .where(
        sql`${streamProductsSold.streamEntryId} IN (${sql.join(
          entryIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      )
      .groupBy(streamProductsSold.streamEntryId)

    for (const row of cogsRows) {
      cogsByStream[row.streamEntryId] = parseFloat(row.totalCogs || '0')
    }
  }

  // Build history entries
  const streams: HistoryEntry[] = entries.map((e) => {
    const calc = calcsMap.get(e.id)
    const cogs = calc ? parseFloat(calc.totalCogs) : (cogsByStream[e.id] ?? 0)
    const grossProfit = calc ? parseFloat(calc.grossProfit) : 0
    const payout = calc ? parseFloat(calc.breakerPayout) : 0
    return {
      id: e.id,
      date: e.streamDate,
      platform: e.platform ?? 'Whatnot',
      sales: parseFloat(e.streamSales),
      cogs,
      grossProfit,
      payout,
      status: e.status,
    }
  })

  // Filter — for now show all (filters are static since this is a server component)
  const activeFilter: StreamStatus | 'all' = 'all'
  const filtered = activeFilter === 'all' ? streams : streams.filter((s) => s.status === activeFilter)

  const totalSales = filtered.reduce((sum, s) => sum + s.sales, 0)
  const totalPayout = filtered.reduce((sum, s) => sum + s.payout, 0)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
            Stream History
          </h1>
          <p className="mt-1 text-cage-400 text-sm">
            All your past stream submissions, sorted by most recent.
          </p>
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl px-5 py-4">
          <p className="text-xs text-cage-500 uppercase tracking-wider">Total Streams</p>
          <p className="text-2xl font-bold text-white mt-1">{filtered.length}</p>
        </div>
        <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl px-5 py-4">
          <p className="text-xs text-cage-500 uppercase tracking-wider">Total Sales</p>
          <p className="text-2xl font-bold text-white mt-1 tabular-nums">{fmt(totalSales)}</p>
        </div>
        <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl px-5 py-4">
          <p className="text-xs text-cage-500 uppercase tracking-wider">Total Payout</p>
          <p className="text-2xl font-bold text-green-400 mt-1 tabular-nums">{fmt(totalPayout)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-cage-400 text-sm">
          <FilterIcon className="w-4 h-4" />
          <span>Filter:</span>
        </div>
        {(['all', 'draft', 'submitted'] as const).map((filter) => {
          const isActive = activeFilter === filter
          return (
            <button
              key={filter}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gold-500 text-gray-950'
                  : 'bg-dark-700 text-cage-400 hover:text-white hover:bg-dark-700'
              }`}
              aria-current={isActive ? 'true' : undefined}
            >
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-cage-400 text-left border-b border-blood-900/40">
                <th className="px-6 py-3 font-medium">
                  <span className="inline-flex items-center gap-1">
                    Date
                    <ArrowUpDownIcon className="w-3 h-3" />
                  </span>
                </th>
                <th className="px-6 py-3 font-medium">Platform</th>
                <th className="px-6 py-3 font-medium text-right">Sales</th>
                <th className="px-6 py-3 font-medium text-right">COGS</th>
                <th className="px-6 py-3 font-medium text-right">Gross Profit</th>
                <th className="px-6 py-3 font-medium text-right">Payout</th>
                <th className="px-6 py-3 font-medium text-center">Status</th>
                <th className="px-6 py-3 font-medium"><span className="sr-only">Details</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cage-700/50">
              {filtered.map((stream) => {
                const badge = statusConfig[stream.status]
                return (
                  <tr
                    key={stream.id}
                    className="hover:bg-dark-700/40 transition-colors group"
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
                    <td className="px-6 py-4 text-white text-right tabular-nums">
                      {stream.status === 'draft' ? '\u2014' : fmt(stream.grossProfit)}
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
                    <td className="px-6 py-4">
                      <Link
                        href={`/streamdata/history/${stream.id}`}
                        className="text-cage-500 group-hover:text-gold-400 transition-colors"
                        aria-label={`View details for stream on ${formatDate(stream.date)}`}
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="px-6 py-16 text-center">
            <p className="text-cage-400">No streams found. Submit your first stream to see it here.</p>
          </div>
        )}
      </div>
    </div>
  )
}
