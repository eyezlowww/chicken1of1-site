// Admin Live Monitor — view currently live breakers and past session history
// Client component: fetches from /api/streamdata/admin/live, renders live cards + history table

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

/* ---------- types ---------- */

interface LiveSession {
  id: string
  userDisplayName: string | null
  username: string | null
  platform: string | null
  startedAt: string
  endedAt: string | null
  status: 'live' | 'ended'
  breakCount: number
  totalSales: string
  totalCogs: string
  totalProfit: string
}

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

function formatDuration(startedAt: string, endedAt: string | null): string {
  const start = new Date(startedAt).getTime()
  const end = endedAt ? new Date(endedAt).getTime() : Date.now()
  const diffMs = Math.max(0, end - start)
  const hrs = Math.floor(diffMs / 3600000)
  const mins = Math.floor((diffMs % 3600000) / 60000)
  const secs = Math.floor((diffMs % 60000) / 1000)
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`
  if (mins > 0) return `${mins}m ${secs}s`
  return `${secs}s`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ---------- running timer hook ---------- */

function useRunningTimer(startedAt: string, isLive: boolean): string {
  const [display, setDisplay] = useState(() => formatDuration(startedAt, null))

  useEffect(() => {
    if (!isLive) {
      setDisplay(formatDuration(startedAt, null))
      return
    }
    const tick = () => setDisplay(formatDuration(startedAt, null))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startedAt, isLive])

  return display
}

/* ---------- live card component ---------- */

function LiveCard({ session }: { session: LiveSession }) {
  const timer = useRunningTimer(session.startedAt, true)

  return (
    <div className="rounded-xl border border-blood-900/40 bg-black/60 p-5 backdrop-blur-md">
      {/* Header: live dot + name */}
      <div className="mb-4 flex items-center gap-3">
        <span className="relative flex h-3 w-3" aria-label="Live indicator">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
        </span>
        <h3 className="text-lg font-bold text-white">
          {session.userDisplayName || session.username || 'Unknown'}
        </h3>
        <span className="rounded-full bg-dark-700 px-2.5 py-0.5 text-xs font-medium text-cage-300">
          {session.platform || 'Unknown'}
        </span>
      </div>

      {/* Timer */}
      <p className="mb-4 font-mono text-2xl font-bold text-gold-400">{timer}</p>

      {/* Stats grid */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-cage-500">Breaks</p>
          <p className="text-lg font-semibold text-white">{session.breakCount}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-cage-500">Sales</p>
          <p className="text-lg font-semibold text-green-400">{fmt(session.totalSales)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-cage-500">COGS</p>
          <p className="text-lg font-semibold text-white">{fmt(session.totalCogs)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-cage-500">Profit</p>
          <p className={`text-lg font-semibold ${profitColor(session.totalProfit)}`}>
            {fmt(session.totalProfit)}
          </p>
        </div>
      </div>

      {/* Action */}
      <Link
        href={`/streamdata/admin/live/${session.id}`}
        className="inline-flex items-center gap-2 rounded-lg bg-gold-500/10 px-4 py-2 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/20"
      >
        View Details
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  )
}

/* ---------- page component ---------- */

export default function AdminLiveMonitorPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/streamdata/admin/live')
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`)
      }
      const data = await res.json()
      setSessions(data.sessions ?? [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSessions, 30000)
    return () => clearInterval(interval)
  }, [fetchSessions])

  const liveSessions = sessions.filter((s) => s.status === 'live')
  const pastSessions = sessions.filter((s) => s.status === 'ended')

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={fetchSessions}
          className="rounded-lg bg-gold-500/10 px-4 py-2 text-sm font-medium text-gold-400 transition-colors hover:bg-gold-500/20"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* ── Section 1: Currently Live ──────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center gap-3">
          <h2 className="text-xl font-bold text-white">Currently Live</h2>
          {liveSessions.length > 0 && (
            <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-400">
              {liveSessions.length} LIVE
            </span>
          )}
        </div>

        {liveSessions.length === 0 ? (
          <div className="rounded-xl border border-blood-900/40 bg-black/60 p-8 text-center backdrop-blur-md">
            <svg
              className="mx-auto mb-3 h-12 w-12 text-cage-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.348 14.652a3.75 3.75 0 010-5.304m5.304 0a3.75 3.75 0 010 5.304m-7.425 2.121a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788M12 12h.008v.008H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
            <p className="text-cage-400">No breakers currently live</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {liveSessions.map((session) => (
              <LiveCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>

      {/* ── Section 2: Past Sessions ──────────────────────────── */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-white">Past Sessions</h2>

        {pastSessions.length === 0 ? (
          <div className="rounded-xl border border-blood-900/40 bg-black/60 p-8 text-center backdrop-blur-md">
            <p className="text-cage-400">No past sessions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-blood-900/40">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500">
                    Breaker
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500">
                    Platform
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500">
                    Date
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    Breaks
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    Sales
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    COGS
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    Profit
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500 text-right">
                    Margin
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cage-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blood-900/20">
                {pastSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="transition-colors hover:bg-dark-800/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-white">
                      {session.userDisplayName || session.username || 'Unknown'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-cage-300">
                      {session.platform || '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-cage-300">
                      {formatDate(session.startedAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-cage-300">
                      {formatDuration(session.startedAt, session.endedAt)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-white">
                      {session.breakCount}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-green-400">
                      {fmt(session.totalSales)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-white">
                      {fmt(session.totalCogs)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-medium ${profitColor(
                        session.totalProfit
                      )}`}
                    >
                      {fmt(session.totalProfit)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right ${profitColor(
                        session.totalProfit
                      )}`}
                    >
                      {pct(session.totalProfit, session.totalSales)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <Link
                        href={`/streamdata/admin/live/${session.id}`}
                        className="text-sm font-medium text-gold-400 transition-colors hover:text-gold-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
