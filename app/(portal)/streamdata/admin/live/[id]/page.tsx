// Admin Live Session Detail — full breakdown of a single live session
// Server component: fetches session data server-side with admin auth

import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { liveSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/* ---------- helpers ---------- */

function fmt(n: string | number): string {
  return (parseFloat(String(n)) || 0).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}

function pct(profit: string | number, sales: string | number): string {
  const s = parseFloat(String(sales)) || 0
  const p = parseFloat(String(profit)) || 0
  if (s === 0) return '0.0%'
  return `${((p / s) * 100).toFixed(1)}%`
}

function profitColor(val: string | number): string {
  const n = parseFloat(String(val)) || 0
  if (n > 0) return 'text-green-400'
  if (n < 0) return 'text-red-400'
  return 'text-cage-400'
}

function marginBg(val: string | number, sales: string | number): string {
  const s = parseFloat(String(sales)) || 0
  const p = parseFloat(String(val)) || 0
  if (s === 0) return 'bg-dark-700 text-cage-400'
  const margin = (p / s) * 100
  if (margin >= 20) return 'bg-green-500/20 text-green-400'
  if (margin >= 0) return 'bg-green-500/10 text-green-300'
  return 'bg-red-500/20 text-red-400'
}

function formatDuration(startedAt: string | Date, endedAt: string | Date | null): string {
  const start = new Date(startedAt).getTime()
  const end = endedAt ? new Date(endedAt).getTime() : Date.now()
  const diffMs = Math.max(0, end - start)
  const hrs = Math.floor(diffMs / 3600000)
  const mins = Math.floor((diffMs % 3600000) / 60000)
  if (hrs > 0) return `${hrs}h ${mins}m`
  return `${mins}m`
}

function formatDateTime(iso: string | Date): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatTime(iso: string | Date): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/* ---------- types ---------- */

interface BreakProduct {
  id: string
  productName: string
  quantity: number
  costPerUnit: string
  totalCost: string
}

interface Break {
  id: string
  breakNumber: number
  totalCogs: string
  spotsSold: number
  salesTotal: string
  profit: string
  costPerSpot: string | null
  revenuePerSpot: string | null
  notes: string | null
  createdAt: string
  products: BreakProduct[]
}

interface SessionUser {
  id: string
  displayName: string
  username: string
}

interface FullSession {
  id: string
  userId: string
  platform: string | null
  startedAt: string
  endedAt: string | null
  status: 'live' | 'ended'
  notes: string | null
  user: SessionUser
  breaks: Break[]
}

/* ---------- summary card component ---------- */

function SummaryCard({
  label,
  value,
  colorClass,
}: {
  label: string
  value: string
  colorClass?: string
}) {
  return (
    <div className="rounded-xl border border-blood-900/40 bg-black/60 p-4 backdrop-blur-md">
      <p className="text-xs font-medium uppercase tracking-wider text-cage-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colorClass || 'text-white'}`}>{value}</p>
    </div>
  )
}

/* ---------- page component ---------- */

export default async function AdminLiveSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Auth guard
  const authSession = await auth()
  if (!authSession?.user || (authSession.user as any).role !== 'admin') {
    redirect('/streamdata/login')
  }

  const { id } = await params

  // Fetch session with breaks and products
  const liveSession = await db.query.liveSessions.findFirst({
    where: eq(liveSessions.id, id),
    with: {
      user: {
        columns: { id: true, displayName: true, username: true },
      },
      breaks: {
        with: { products: true },
        orderBy: (breaks, { asc }) => [asc(breaks.breakNumber)],
      },
    },
  })

  if (!liveSession) {
    redirect('/streamdata/admin/live')
  }

  const session = liveSession as unknown as FullSession

  // Compute totals
  const totalBreaks = session.breaks.length
  const totalCogs = session.breaks.reduce(
    (sum, b) => sum + (parseFloat(b.totalCogs) || 0),
    0
  )
  const totalSales = session.breaks.reduce(
    (sum, b) => sum + (parseFloat(b.salesTotal) || 0),
    0
  )
  const totalProfit = session.breaks.reduce(
    (sum, b) => sum + (parseFloat(b.profit) || 0),
    0
  )
  const avgMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0

  return (
    <div className="space-y-6">
      {/* ── Back link ──────────────────────────────────────── */}
      <Link
        href="/streamdata/admin/live"
        className="inline-flex items-center gap-2 text-sm font-medium text-cage-400 transition-colors hover:text-white"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Live Monitor
      </Link>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {session.user.displayName}&apos;s Stream
          </h1>
          <p className="mt-1 text-sm text-cage-400">
            {formatDateTime(session.startedAt)}
            {session.platform && (
              <span className="ml-2 rounded-full bg-dark-700 px-2.5 py-0.5 text-xs font-medium text-cage-300">
                {session.platform}
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status badge */}
          {session.status === 'live' ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-sm font-bold text-red-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
              </span>
              LIVE
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-dark-700 px-3 py-1 text-sm font-medium text-cage-400">
              Ended
            </span>
          )}

          {/* Duration */}
          <span className="rounded-full bg-dark-700 px-3 py-1 font-mono text-sm text-cage-300">
            {formatDuration(session.startedAt, session.endedAt)}
          </span>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <SummaryCard label="Total Breaks" value={String(totalBreaks)} />
        <SummaryCard label="Total COGS" value={fmt(totalCogs)} />
        <SummaryCard
          label="Total Sales"
          value={fmt(totalSales)}
          colorClass="text-green-400"
        />
        <SummaryCard
          label="Total Profit"
          value={fmt(totalProfit)}
          colorClass={totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}
        />
        <SummaryCard
          label="Avg Margin"
          value={`${avgMargin.toFixed(1)}%`}
          colorClass={avgMargin >= 0 ? 'text-green-400' : 'text-red-400'}
        />
      </div>

      {/* ── Breaks Table ───────────────────────────────────── */}
      <section>
        <h2 className="mb-4 text-lg font-bold text-white">Breaks</h2>

        {session.breaks.length === 0 ? (
          <div className="rounded-xl border border-blood-900/40 bg-black/60 p-8 text-center backdrop-blur-md">
            <p className="text-cage-400">No breaks recorded for this session</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blood-900/40">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500">
                    #
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500">
                    Products
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    COGS
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    Spots
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    Revenue
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    Margin
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    Cost/Spot
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    Rev/Spot
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blood-900/20">
                {session.breaks.map((brk) => {
                  const productNames =
                    brk.products.length > 0
                      ? brk.products
                          .map(
                            (p) =>
                              `${p.productName}${p.quantity > 1 ? ` x${p.quantity}` : ''}`
                          )
                          .join(', ')
                      : '—'

                  return (
                    <tr
                      key={brk.id}
                      className="transition-colors hover:bg-dark-800/50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono font-medium text-white">
                        {brk.breakNumber}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-cage-300" title={productNames}>
                        {productNames}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-white">
                        {fmt(brk.totalCogs)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-white">
                        {brk.spotsSold}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-green-400">
                        {fmt(brk.salesTotal)}
                      </td>
                      <td
                        className={`whitespace-nowrap px-4 py-3 text-right font-medium ${profitColor(
                          brk.profit
                        )}`}
                      >
                        {fmt(brk.profit)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${marginBg(
                            brk.profit,
                            brk.salesTotal
                          )}`}
                        >
                          {pct(brk.profit, brk.salesTotal)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-cage-300">
                        {brk.costPerSpot ? fmt(brk.costPerSpot) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-cage-300">
                        {brk.revenuePerSpot ? fmt(brk.revenuePerSpot) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-cage-400">
                        {formatTime(brk.createdAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>

              {/* Totals row */}
              <tfoot>
                <tr className="border-t border-blood-900/40 bg-dark-900/50 font-medium">
                  <td className="px-4 py-3 text-white" colSpan={2}>
                    Totals
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {fmt(totalCogs)}
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {session.breaks.reduce((s, b) => s + b.spotsSold, 0)}
                  </td>
                  <td className="px-4 py-3 text-right text-green-400">
                    {fmt(totalSales)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-bold ${
                      totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {fmt(totalProfit)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${marginBg(
                        totalProfit,
                        totalSales
                      )}`}
                    >
                      {pct(totalProfit, totalSales)}
                    </span>
                  </td>
                  <td className="px-4 py-3" colSpan={3} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>

      {/* ── Notes ──────────────────────────────────────────── */}
      {session.notes && (
        <section className="rounded-xl border border-blood-900/40 bg-black/60 p-5 backdrop-blur-md">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider text-cage-500">
            Session Notes
          </h3>
          <p className="text-sm text-cage-300">{session.notes}</p>
        </section>
      )}
    </div>
  )
}
