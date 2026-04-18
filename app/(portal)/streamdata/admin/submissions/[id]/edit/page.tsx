'use client'

// Admin edit page for a stream submission.
// Allows editing core stream fields and adjustment, then recalculates payout.
// Products sold are not editable here — delete and resubmit for that.

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ''}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

interface StreamData {
  id: string
  streamDate: string
  platform: string
  streamSales: string
  orderCount: number
  status: string
  user: { displayName: string }
  calculation: {
    breakerPayout: string
    grossProfit: string
    totalCogs: string
    adjustmentAmount: string | null
    adjustmentNote: string | null
  } | null
}

export default function EditSubmissionPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<StreamData | null>(null)

  // Form fields
  const [streamDate, setStreamDate] = useState('')
  const [streamSales, setStreamSales] = useState('')
  const [orderCount, setOrderCount] = useState('')
  const [adjustmentType, setAdjustmentType] = useState<'+' | '-'>('+')
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentNote, setAdjustmentNote] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/streamdata/streams/${id}`)
        if (!res.ok) throw new Error('Failed to load submission')
        const data = await res.json()
        const s: StreamData = data.stream
        setStream(s)
        setStreamDate(s.streamDate)
        setStreamSales(s.streamSales)
        setOrderCount(String(s.orderCount))

        // Pre-fill adjustment if one exists
        const existingAdj = parseFloat(s.calculation?.adjustmentAmount ?? '0')
        if (existingAdj !== 0) {
          setAdjustmentType(existingAdj >= 0 ? '+' : '-')
          setAdjustmentAmount(String(Math.abs(existingAdj)))
        }
        setAdjustmentNote(s.calculation?.adjustmentNote ?? '')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      const adjAmt = parseFloat(adjustmentAmount) || 0
      const signedAdj = adjAmt > 0 ? (adjustmentType === '+' ? adjAmt : -adjAmt) : 0

      const res = await fetch(`/api/streamdata/admin/submissions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          streamDate,
          platform: stream?.platform ?? 'Whatnot',
          streamSales: parseFloat(streamSales) || 0,
          orderCount: parseInt(orderCount, 10) || 0,
          adjustmentAmount: signedAdj !== 0 ? signedAdj : undefined,
          adjustmentNote: adjustmentNote.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Save failed (${res.status})`)
      }

      router.push(`/streamdata/admin/submissions/${id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-950">
        <SpinnerIcon className="h-8 w-8 text-gold-500" />
      </div>
    )
  }

  if (!stream) {
    return (
      <div className="min-h-screen bg-dark-950 px-4 py-8">
        <p className="text-red-400">Submission not found.</p>
      </div>
    )
  }

  const currentPayout = stream.calculation ? parseFloat(stream.calculation.breakerPayout) : null

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Back */}
      <div className="mb-6">
        <Link
          href={`/streamdata/admin/submissions/${id}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-cage-300 transition-colors hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Submission
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Edit Submission — {stream.user.displayName}
        </h1>
        <p className="mt-1 text-sm text-cage-400">
          Changes here recalculate the breaker payout immediately.
          To change products sold, delete this submission and have the breaker resubmit.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-6 max-w-2xl">
        {/* Stream Info */}
        <section className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
          <h2 className="mb-5 text-lg font-semibold text-white">Stream Info</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-cage-300 mb-1.5">Stream Date</label>
              <input
                type="date"
                value={streamDate}
                onChange={(e) => setStreamDate(e.target.value)}
                className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cage-300 mb-1.5">Platform</label>
              <div className="w-full bg-dark-700/60 border border-cage-600/50 rounded-lg px-4 py-2.5 text-cage-400 text-sm">
                {stream.platform ?? 'Whatnot'}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-cage-300 mb-1.5">Stream Sales</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cage-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={streamSales}
                  onChange={(e) => setStreamSales(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-dark-700 border border-cage-600 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent tabular-nums"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-cage-300 mb-1.5">Order Count</label>
              <input
                type="number"
                min="0"
                step="1"
                value={orderCount}
                onChange={(e) => setOrderCount(e.target.value)}
                placeholder="0"
                className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent tabular-nums"
              />
            </div>
          </div>
        </section>

        {/* Adjustment */}
        <section className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
          <h2 className="mb-1 text-lg font-semibold text-white">Show Adjustment</h2>
          <p className="text-xs text-cage-500 mb-4">Override or correct the breaker adjustment for this stream.</p>
          <div className="flex items-center gap-3">
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as '+' | '-')}
              className="w-16 bg-dark-700 border border-cage-600 rounded-lg px-2 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="+">+</option>
              <option value="-">-</option>
            </select>
            <div className="relative flex-1 max-w-[160px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cage-500 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                className="w-full bg-dark-700 border border-cage-600 rounded-lg pl-7 pr-3 py-2.5 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <input
              type="text"
              placeholder="Note (e.g. sold a card)"
              value={adjustmentNote}
              onChange={(e) => setAdjustmentNote(e.target.value)}
              className="flex-1 bg-dark-700 border border-cage-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </section>

        {/* Current payout info */}
        {currentPayout !== null && (
          <div className="rounded-lg border border-cage-600/50 bg-dark-700/40 px-4 py-3 text-sm text-cage-400">
            Current stored payout: <span className="font-semibold text-green-400">{fmt(currentPayout)}</span>
            {' '}— saving will recalculate this.
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <SpinnerIcon className="h-4 w-4" />}
            {saving ? 'Saving...' : 'Save & Recalculate'}
          </button>
          <Link
            href={`/streamdata/admin/submissions/${id}`}
            className="inline-flex items-center gap-2 bg-dark-700 border border-cage-600 text-cage-300 font-medium px-6 py-3 rounded-lg transition-colors hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}
