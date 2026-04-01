// Live Break Tracker — real-time P/L tracking during live card breaking streams
// Client component with two states: NOT LIVE (go-live + past sessions) and LIVE (active tracking)

'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────

interface ProductLine {
  id: string
  name: string
  qty: number
  costPerUnit: number
}

interface BreakEntry {
  id: string
  breakNumber: number
  products: ProductLine[]
  totalCogs: number
  spotsSold: number
  revenue: number
  profit: number
  margin: number
  costPerSpot: number
  revenuePerSpot: number
  loggedAt: string
}

interface LiveSession {
  id: string
  platform: string
  notes: string
  startedAt: string
  endedAt: string | null
  breaks: BreakEntry[]
}

interface PastSession {
  id: string
  platform: string
  startedAt: string
  endedAt: string | null
  breakCount: number
  totalSales: number
  totalCogs: number
  totalProfit: number
  duration: string
}

// ─── Helpers ────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function pct(n: number): string {
  if (!isFinite(n)) return '0.0%'
  return (n * 100).toFixed(1) + '%'
}

let _rowId = 0
function nextId(): string {
  return `row-${++_rowId}-${Date.now()}`
}

function elapsedSince(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatDuration(start: string, end: string | null): string {
  const endMs = end ? new Date(end).getTime() : Date.now()
  const ms = endMs - new Date(start).getTime()
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

// ─── SVG Icons ──────────────────────────────────────────────────────────

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SignalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 20h.01" />
      <path d="M7 20v-4" />
      <path d="M12 20v-8" />
      <path d="M17 20V8" />
      <path d="M22 4v16" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ─── Margin Badge ───────────────────────────────────────────────────────

function MarginBadge({ margin }: { margin: number }) {
  const m = margin * 100
  let bg: string, text: string
  if (m > 30) {
    bg = 'bg-green-500/20'
    text = 'text-green-400'
  } else if (m >= 10) {
    bg = 'bg-yellow-500/20'
    text = 'text-yellow-400'
  } else {
    bg = 'bg-blood-500/20'
    text = 'text-blood-400'
  }
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${bg} ${text}`}>
      {pct(margin)}
    </span>
  )
}

// ─── Stat Card ──────────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-blood-900/40 bg-black/60 p-4 backdrop-blur-md">
      <p className="text-xs font-medium uppercase tracking-wider text-cage-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${color || 'text-white'}`}>{value}</p>
    </div>
  )
}

// ─── Product Autocomplete Input ─────────────────────────────────────────

function ProductInput({
  value,
  onChange,
  suggestions,
}: {
  value: string
  onChange: (v: string) => void
  suggestions: string[]
}) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (value.length >= 2) {
      const lower = value.toLowerCase()
      setFilteredSuggestions(
        suggestions.filter((s) => s.toLowerCase().includes(lower)).slice(0, 6)
      )
    } else {
      setFilteredSuggestions([])
    }
  }, [value, suggestions])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setShowSuggestions(true)
        }}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Product name"
        className="w-full rounded-lg border border-blood-900/40 bg-dark-900 px-3 py-2.5 text-sm text-white placeholder-cage-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
      />
      {showSuggestions && filteredSuggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-40 overflow-y-auto rounded-lg border border-blood-900/40 bg-dark-900 py-1 shadow-xl">
          {filteredSuggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => {
                  onChange(s)
                  setShowSuggestions(false)
                }}
                className="w-full px-3 py-1.5 text-left text-sm text-cage-300 hover:bg-dark-800 hover:text-white"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Main Page Component ────────────────────────────────────────────────

export default function LiveTrackerPage() {
  // ── State ───────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true)
  const [activeSession, setActiveSession] = useState<LiveSession | null>(null)
  const [pastSessions, setPastSessions] = useState<PastSession[]>([])
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null)
  const [expandedBreaks, setExpandedBreaks] = useState<BreakEntry[]>([])

  // Go-live form
  const [platform, setPlatform] = useState('Whatnot')
  const [notes, setNotes] = useState('')
  const [goingLive, setGoingLive] = useState(false)

  // Add break form
  const [products, setProducts] = useState<ProductLine[]>([
    { id: nextId(), name: '', qty: 1, costPerUnit: 0 },
  ])
  const [spotsSold, setSpotsSold] = useState<number>(0)
  const [revenue, setRevenue] = useState<number>(0)
  const [loggingBreak, setLoggingBreak] = useState(false)

  // Product suggestions
  const [productSuggestions, setProductSuggestions] = useState<string[]>([])

  // Timer
  const [elapsed, setElapsed] = useState('00:00:00')

  // End stream summary
  const [showSummary, setShowSummary] = useState(false)
  const [summaryData, setSummaryData] = useState<{
    totalBreaks: number
    totalSales: number
    totalCogs: number
    totalProfit: number
    avgMargin: number
    duration: string
  } | null>(null)

  // ── Derived values ──────────────────────────────────────────────────
  const totalCogs = useMemo(
    () => products.reduce((sum, p) => sum + p.qty * p.costPerUnit, 0),
    [products]
  )

  const previewProfit = revenue - totalCogs
  const previewCostPerSpot = spotsSold > 0 ? totalCogs / spotsSold : 0
  const previewRevenuePerSpot = spotsSold > 0 ? revenue / spotsSold : 0
  const previewMargin = revenue > 0 ? previewProfit / revenue : 0

  // Running totals
  const runningTotals = useMemo(() => {
    if (!activeSession) return { breaks: 0, cogs: 0, sales: 0, profit: 0, margin: 0 }
    const breaks = activeSession.breaks
    const totalCogs = breaks.reduce((s, b) => s + b.totalCogs, 0)
    const totalSales = breaks.reduce((s, b) => s + b.revenue, 0)
    const totalProfit = breaks.reduce((s, b) => s + b.profit, 0)
    const margin = totalSales > 0 ? totalProfit / totalSales : 0
    return { breaks: breaks.length, cogs: totalCogs, sales: totalSales, profit: totalProfit, margin }
  }, [activeSession])

  // ── Timer effect ────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeSession) return
    const tick = () => setElapsed(elapsedSince(activeSession.startedAt))
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [activeSession])

  // ── Fetch on mount ──────────────────────────────────────────────────
  useEffect(() => {
    async function init() {
      try {
        // Check for active session
        const activeRes = await fetch('/api/streamdata/live/sessions?active=true')
        if (activeRes.ok) {
          const data = await activeRes.json()
          if (data.session) {
            setActiveSession(data.session)
          }
        }

        // Fetch past sessions
        const pastRes = await fetch('/api/streamdata/live/sessions')
        if (pastRes.ok) {
          const data = await pastRes.json()
          setPastSessions(data.sessions || [])
        }

        // Fetch product suggestions
        const prodRes = await fetch('/api/streamdata/admin/products')
        if (prodRes.ok) {
          const data = await prodRes.json()
          setProductSuggestions(
            (data.products || []).map((p: { name: string }) => p.name)
          )
        }
      } catch {
        // Silently handle — user can retry
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // ── Actions ─────────────────────────────────────────────────────────

  const handleGoLive = useCallback(async () => {
    setGoingLive(true)
    try {
      const res = await fetch('/api/streamdata/live/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, notes }),
      })
      if (!res.ok) throw new Error('Failed to start session')
      const data = await res.json()
      setActiveSession(data.session)
    } catch {
      alert('Failed to go live. Please try again.')
    } finally {
      setGoingLive(false)
    }
  }, [platform, notes])

  const handleLogBreak = useCallback(async () => {
    if (!activeSession) return
    if (totalCogs === 0 && revenue === 0) return

    setLoggingBreak(true)
    try {
      const res = await fetch('/api/streamdata/live/breaks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeSession.id,
          products: products.filter((p) => p.name.trim()),
          spotsSold,
          revenue,
        }),
      })
      if (!res.ok) throw new Error('Failed to log break')
      const data = await res.json()

      // Add the new break to the session
      setActiveSession((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          breaks: [data.break, ...prev.breaks],
        }
      })

      // Reset form
      setProducts([{ id: nextId(), name: '', qty: 1, costPerUnit: 0 }])
      setSpotsSold(0)
      setRevenue(0)
    } catch {
      alert('Failed to log break. Please try again.')
    } finally {
      setLoggingBreak(false)
    }
  }, [activeSession, products, spotsSold, revenue, totalCogs])

  const handleEndStream = useCallback(async () => {
    if (!activeSession) return
    if (!confirm('End this stream? You can still view the session in your history.')) return

    try {
      const res = await fetch(`/api/streamdata/live/sessions/${activeSession.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      })
      if (!res.ok) throw new Error('Failed to end session')

      // Show summary
      const totalSales = runningTotals.sales
      const totalCogsVal = runningTotals.cogs
      const totalProfit = runningTotals.profit
      const avgMargin = runningTotals.margin
      setSummaryData({
        totalBreaks: runningTotals.breaks,
        totalSales,
        totalCogs: totalCogsVal,
        totalProfit,
        avgMargin,
        duration: elapsed,
      })
      setShowSummary(true)
      setActiveSession(null)

      // Refresh past sessions
      const pastRes = await fetch('/api/streamdata/live/sessions')
      if (pastRes.ok) {
        const data = await pastRes.json()
        setPastSessions(data.sessions || [])
      }
    } catch {
      alert('Failed to end stream. Please try again.')
    }
  }, [activeSession, runningTotals, elapsed])

  const handleExpandSession = useCallback(async (sessionId: string) => {
    if (expandedSessionId === sessionId) {
      setExpandedSessionId(null)
      setExpandedBreaks([])
      return
    }
    try {
      const res = await fetch(`/api/streamdata/live/sessions/${sessionId}`)
      if (res.ok) {
        const data = await res.json()
        setExpandedBreaks(data.session?.breaks || [])
        setExpandedSessionId(sessionId)
      }
    } catch {
      // Silently handle
    }
  }, [expandedSessionId])

  // ── Product row handlers ────────────────────────────────────────────

  const addProductRow = useCallback(() => {
    setProducts((prev) => [...prev, { id: nextId(), name: '', qty: 1, costPerUnit: 0 }])
  }, [])

  const removeProductRow = useCallback((id: string) => {
    setProducts((prev) => (prev.length > 1 ? prev.filter((p) => p.id !== id) : prev))
  }, [])

  const updateProduct = useCallback((id: string, field: keyof ProductLine, value: string | number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    )
  }, [])

  // ── Loading state ───────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-500 border-t-transparent" />
      </div>
    )
  }

  // ── Summary modal ───────────────────────────────────────────────────

  if (showSummary && summaryData) {
    return (
      <div className="mx-auto max-w-lg space-y-6 py-8">
        <div className="rounded-xl border border-blood-900/40 bg-black/60 p-8 text-center backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-oswald)' }}>
            Stream Ended
          </h2>
          <p className="mt-1 text-sm text-cage-400">Here is your session summary.</p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-dark-900 p-4">
              <p className="text-xs uppercase tracking-wider text-cage-500">Total Breaks</p>
              <p className="mt-1 text-2xl font-bold text-white">{summaryData.totalBreaks}</p>
            </div>
            <div className="rounded-lg bg-dark-900 p-4">
              <p className="text-xs uppercase tracking-wider text-cage-500">Duration</p>
              <p className="mt-1 text-2xl font-bold text-white">{summaryData.duration}</p>
            </div>
            <div className="rounded-lg bg-dark-900 p-4">
              <p className="text-xs uppercase tracking-wider text-cage-500">Total Sales</p>
              <p className="mt-1 text-2xl font-bold text-green-400">{fmt(summaryData.totalSales)}</p>
            </div>
            <div className="rounded-lg bg-dark-900 p-4">
              <p className="text-xs uppercase tracking-wider text-cage-500">Total COGS</p>
              <p className="mt-1 text-2xl font-bold text-white">{fmt(summaryData.totalCogs)}</p>
            </div>
            <div className="rounded-lg bg-dark-900 p-4">
              <p className="text-xs uppercase tracking-wider text-cage-500">Total Profit</p>
              <p className={`mt-1 text-2xl font-bold ${summaryData.totalProfit >= 0 ? 'text-green-400' : 'text-blood-400'}`}>
                {fmt(summaryData.totalProfit)}
              </p>
            </div>
            <div className="rounded-lg bg-dark-900 p-4">
              <p className="text-xs uppercase tracking-wider text-cage-500">Avg Margin</p>
              <p className="mt-1 text-2xl font-bold text-white">{pct(summaryData.avgMargin)}</p>
            </div>
          </div>

          <button
            onClick={() => setShowSummary(false)}
            className="mt-8 rounded-lg bg-gold-500 px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-gold-400"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  // ── LIVE state ──────────────────────────────────────────────────────

  if (activeSession) {
    const breaks = activeSession.breaks

    return (
      <div className="space-y-6">
        {/* Top bar: LIVE indicator + timer + end stream */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-blood-900/40 bg-black/60 px-5 py-3 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3" aria-label="Live indicator">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blood-500 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-blood-500" />
            </span>
            <span className="text-sm font-bold uppercase tracking-wider text-blood-400">LIVE</span>
            <span className="text-sm text-cage-400">on {activeSession.platform}</span>
          </div>
          <div className="font-mono text-lg font-bold tabular-nums text-white">{elapsed}</div>
          <button
            onClick={handleEndStream}
            className="rounded-lg bg-blood-600 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blood-500"
          >
            End Stream
          </button>
        </div>

        {/* Running totals strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <StatCard label="Total Breaks" value={String(runningTotals.breaks)} />
          <StatCard label="Total COGS" value={fmt(runningTotals.cogs)} />
          <StatCard label="Total Sales" value={fmt(runningTotals.sales)} color="text-green-400" />
          <StatCard
            label="Total Profit"
            value={fmt(runningTotals.profit)}
            color={runningTotals.profit >= 0 ? 'text-green-400' : 'text-blood-400'}
          />
          <StatCard label="Avg Margin" value={pct(runningTotals.margin)} />
        </div>

        {/* Add break form */}
        <div className="rounded-xl border border-blood-900/40 bg-black/60 p-5 backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400">
            Log Break #{breaks.length + 1}
          </h3>

          {/* Product rows */}
          <div className="mt-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wider text-cage-500">
              Products in this break
            </p>
            {products.map((p) => (
              <div key={p.id} className="flex flex-wrap items-end gap-2 sm:flex-nowrap">
                <div className="w-full sm:flex-1">
                  <ProductInput
                    value={p.name}
                    onChange={(v) => updateProduct(p.id, 'name', v)}
                    suggestions={productSuggestions}
                  />
                </div>
                <div className="w-16">
                  <label className="sr-only">Qty</label>
                  <input
                    type="number"
                    min={1}
                    value={p.qty}
                    onChange={(e) => updateProduct(p.id, 'qty', parseInt(e.target.value) || 1)}
                    placeholder="Qty"
                    className="w-full rounded-lg border border-blood-900/40 bg-dark-900 px-3 py-2.5 text-center text-sm text-white placeholder-cage-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                  />
                </div>
                <div className="w-28">
                  <label className="sr-only">Cost per unit</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cage-500">$</span>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={p.costPerUnit || ''}
                      onChange={(e) => updateProduct(p.id, 'costPerUnit', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                      className="w-full rounded-lg border border-blood-900/40 bg-dark-900 py-2.5 pl-7 pr-3 text-sm text-white placeholder-cage-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                    />
                  </div>
                </div>
                <div className="flex w-20 items-center justify-end text-sm font-medium text-cage-300">
                  {fmt(p.qty * p.costPerUnit)}
                </div>
                <button
                  type="button"
                  onClick={() => removeProductRow(p.id)}
                  className="rounded-lg p-2 text-cage-500 transition-colors hover:bg-dark-800 hover:text-blood-400"
                  aria-label="Remove product row"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addProductRow}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-gold-400 transition-colors hover:bg-dark-800"
            >
              <PlusIcon className="h-3.5 w-3.5" />
              Add Product
            </button>
          </div>

          {/* COGS total */}
          <div className="mt-4 flex items-center justify-between border-t border-blood-900/20 pt-4">
            <span className="text-sm font-medium text-cage-400">Total COGS</span>
            <span className="text-sm font-bold text-white">{fmt(totalCogs)}</span>
          </div>

          {/* Spots + Revenue */}
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-cage-500">
                Spots Sold
              </label>
              <input
                type="number"
                min={0}
                value={spotsSold || ''}
                onChange={(e) => setSpotsSold(parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full rounded-lg border border-blood-900/40 bg-dark-900 px-3 py-3 text-sm text-white placeholder-cage-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-cage-500">
                Revenue This Break
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cage-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={revenue || ''}
                  onChange={(e) => setRevenue(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-blood-900/40 bg-dark-900 py-3 pl-7 pr-3 text-sm text-white placeholder-cage-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                />
              </div>
            </div>
          </div>

          {/* Preview calculations */}
          {(totalCogs > 0 || revenue > 0) && (
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-dark-900/50 p-3 sm:grid-cols-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-cage-600">Profit</p>
                <p className={`text-sm font-bold ${previewProfit >= 0 ? 'text-green-400' : 'text-blood-400'}`}>
                  {fmt(previewProfit)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-cage-600">Cost/Spot</p>
                <p className="text-sm font-bold text-white">{spotsSold > 0 ? fmt(previewCostPerSpot) : '--'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-cage-600">Rev/Spot</p>
                <p className="text-sm font-bold text-white">{spotsSold > 0 ? fmt(previewRevenuePerSpot) : '--'}</p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-cage-600">Margin</p>
                <MarginBadge margin={previewMargin} />
              </div>
            </div>
          )}

          {/* Log break button */}
          <button
            onClick={handleLogBreak}
            disabled={loggingBreak || (totalCogs === 0 && revenue === 0)}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-6 py-4 text-base font-bold text-black shadow-lg transition-all hover:from-gold-400 hover:to-gold-500 disabled:cursor-not-allowed disabled:opacity-40 sm:text-lg"
          >
            {loggingBreak ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                Logging...
              </span>
            ) : (
              `Log Break #${breaks.length + 1}`
            )}
          </button>
        </div>

        {/* Break history table */}
        {breaks.length > 0 && (
          <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
            <div className="border-b border-blood-900/20 px-5 py-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-cage-400">
                Break History ({breaks.length})
              </h3>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blood-900/20 text-left text-xs uppercase tracking-wider text-cage-600">
                    <th className="px-5 py-3 font-medium">#</th>
                    <th className="px-5 py-3 font-medium">Products</th>
                    <th className="px-5 py-3 font-medium text-right">COGS</th>
                    <th className="px-5 py-3 font-medium text-right">Spots</th>
                    <th className="px-5 py-3 font-medium text-right">Revenue</th>
                    <th className="px-5 py-3 font-medium text-right">Profit</th>
                    <th className="px-5 py-3 font-medium text-right">Margin</th>
                    <th className="px-5 py-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blood-900/10">
                  {breaks.map((b) => (
                    <tr key={b.id} className="text-cage-300 hover:bg-dark-900/30">
                      <td className="px-5 py-3 font-bold text-white">{b.breakNumber}</td>
                      <td className="max-w-[200px] truncate px-5 py-3">
                        {b.products.map((p) => p.name).join(', ') || '--'}
                      </td>
                      <td className="px-5 py-3 text-right">{fmt(b.totalCogs)}</td>
                      <td className="px-5 py-3 text-right">{b.spotsSold}</td>
                      <td className="px-5 py-3 text-right">{fmt(b.revenue)}</td>
                      <td className={`px-5 py-3 text-right font-medium ${b.profit >= 0 ? 'text-green-400' : 'text-blood-400'}`}>
                        {fmt(b.profit)}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <MarginBadge margin={b.margin} />
                      </td>
                      <td className="px-5 py-3 text-right text-cage-500">
                        {new Date(b.loggedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-blood-900/10 md:hidden">
              {breaks.map((b) => (
                <div key={b.id} className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">Break #{b.breakNumber}</span>
                    <span className="text-xs text-cage-500">
                      {new Date(b.loggedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-cage-400">
                    {b.products.map((p) => p.name).join(', ') || '--'}
                  </p>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <p className="text-cage-600">COGS</p>
                      <p className="font-medium text-white">{fmt(b.totalCogs)}</p>
                    </div>
                    <div>
                      <p className="text-cage-600">Spots</p>
                      <p className="font-medium text-white">{b.spotsSold}</p>
                    </div>
                    <div>
                      <p className="text-cage-600">Revenue</p>
                      <p className="font-medium text-white">{fmt(b.revenue)}</p>
                    </div>
                    <div>
                      <p className="text-cage-600">Profit</p>
                      <p className={`font-medium ${b.profit >= 0 ? 'text-green-400' : 'text-blood-400'}`}>
                        {fmt(b.profit)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end">
                    <MarginBadge margin={b.margin} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── NOT LIVE state ──────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* Go Live card */}
      <div className="mx-auto max-w-lg rounded-xl border border-blood-900/40 bg-black/60 p-8 text-center backdrop-blur-md">
        <SignalIcon className="mx-auto h-12 w-12 text-cage-600" />
        <h2 className="mt-4 text-xl font-bold text-white" style={{ fontFamily: 'var(--font-oswald)' }}>
          Ready to Break?
        </h2>
        <p className="mt-2 text-sm text-cage-400">
          Start tracking your breaks in real-time. Log COGS, spots, and revenue as you go.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-left text-xs font-medium uppercase tracking-wider text-cage-500">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-lg border border-blood-900/40 bg-dark-900 px-3 py-2.5 text-sm text-white focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
            >
              <option value="Whatnot">Whatnot</option>
              <option value="Fanatics Live">Fanatics Live</option>
              <option value="eBay Live">eBay Live</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-left text-xs font-medium uppercase tracking-wider text-cage-500">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. UFC 315 break night"
              className="w-full rounded-lg border border-blood-900/40 bg-dark-900 px-3 py-2.5 text-sm text-white placeholder-cage-600 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
            />
          </div>
        </div>

        <button
          onClick={handleGoLive}
          disabled={goingLive}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 px-8 py-4 text-lg font-bold text-black shadow-lg transition-all hover:from-gold-400 hover:to-gold-500 hover:shadow-gold-500/20 disabled:opacity-50"
          style={{ fontFamily: 'var(--font-oswald)' }}
        >
          {goingLive ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              Going Live...
            </span>
          ) : (
            'GO LIVE'
          )}
        </button>
      </div>

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
          <div className="border-b border-blood-900/20 px-5 py-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cage-400">
              Past Sessions
            </h3>
          </div>
          <div className="divide-y divide-blood-900/10">
            {pastSessions.map((session) => (
              <div key={session.id}>
                <button
                  onClick={() => handleExpandSession(session.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-dark-900/30"
                  aria-expanded={expandedSessionId === session.id}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="text-sm font-medium text-white">
                        {formatDateTime(session.startedAt)}
                      </span>
                      <span className="rounded-full bg-dark-700 px-2 py-0.5 text-[11px] font-medium text-cage-400">
                        {session.platform}
                      </span>
                      <span className="text-xs text-cage-500">
                        {session.duration} &middot; {session.breakCount} break{session.breakCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-cage-400">
                      <span>Sales: <span className="font-medium text-green-400">{fmt(session.totalSales)}</span></span>
                      <span>COGS: <span className="font-medium text-white">{fmt(session.totalCogs)}</span></span>
                      <span>
                        Profit:{' '}
                        <span className={`font-medium ${session.totalProfit >= 0 ? 'text-green-400' : 'text-blood-400'}`}>
                          {fmt(session.totalProfit)}
                        </span>
                      </span>
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`ml-3 h-5 w-5 flex-shrink-0 text-cage-500 transition-transform ${
                      expandedSessionId === session.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Expanded breaks */}
                {expandedSessionId === session.id && expandedBreaks.length > 0 && (
                  <div className="border-t border-blood-900/10 bg-dark-950/50 px-5 py-3">
                    <div className="space-y-2">
                      {expandedBreaks.map((b) => (
                        <div
                          key={b.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-dark-900/40 px-3 py-2 text-xs"
                        >
                          <span className="font-bold text-white">#{b.breakNumber}</span>
                          <span className="truncate text-cage-400">
                            {b.products.map((p) => p.name).join(', ') || '--'}
                          </span>
                          <span className="text-cage-300">{fmt(b.totalCogs)}</span>
                          <span className="text-cage-300">{b.spotsSold} spots</span>
                          <span className="text-green-400">{fmt(b.revenue)}</span>
                          <span className={b.profit >= 0 ? 'text-green-400' : 'text-blood-400'}>
                            {fmt(b.profit)}
                          </span>
                          <MarginBadge margin={b.margin} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
