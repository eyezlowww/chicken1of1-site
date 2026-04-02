'use client'

import { useState, useMemo, useCallback } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────

interface CostRow {
  id: string
  cost: string
}

let counter = 0
function nextId() {
  return `row-${++counter}-${Date.now()}`
}

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

// ─── Preset margin buttons ──────────────────────────────────────────────

const MARGIN_PRESETS = [10, 15, 20, 25, 30, 40, 50]

// ─── Page ───────────────────────────────────────────────────────────────

export default function SpotCalculatorPage() {
  const [costs, setCosts] = useState<CostRow[]>([
    { id: nextId(), cost: '' },
  ])
  const [spots, setSpots] = useState('')
  const [customMargin, setCustomMargin] = useState('')
  const [activeMargin, setActiveMargin] = useState<number | null>(null)
  const [platform, setPlatform] = useState('whatnot')

  // ── Cost handlers ─────────────────────────────────────────────────────

  const addCost = useCallback(() => {
    setCosts((prev) => [...prev, { id: nextId(), cost: '' }])
  }, [])

  const removeCost = useCallback((id: string) => {
    setCosts((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }, [])

  const updateCost = useCallback((id: string, value: string) => {
    setCosts((prev) => prev.map((r) => (r.id === id ? { ...r, cost: value } : r)))
  }, [])

  // ── Calculations ──────────────────────────────────────────────────────

  const totalCost = useMemo(
    () => costs.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0),
    [costs]
  )

  const spotCount = parseInt(spots, 10) || 0

  // Platform fee rates
  const platformFees: Record<string, { rate: number; label: string }> = {
    whatnot: { rate: 0.101, label: 'Whatnot (10.1%)' },
    fanatics: { rate: 0.125, label: 'Fanatics Live (12.5%)' },
    ebay: { rate: 0.132, label: 'eBay Live (13.2%)' },
    tiktok: { rate: 0.08, label: 'TikTok (8%)' },
    none: { rate: 0, label: 'No Platform Fee' },
  }

  const feeRate = platformFees[platform]?.rate ?? 0
  const feeLabel = platformFees[platform]?.label ?? ''

  // Break-even: price per spot where revenue - platform fee = COGS
  // revenue * (1 - feeRate) = totalCost  =>  revenue = totalCost / (1 - feeRate)
  const breakEvenTotal = feeRate < 1 ? totalCost / (1 - feeRate) : totalCost
  const breakEvenPerSpot = spotCount > 0 ? breakEvenTotal / spotCount : 0
  const breakEvenFee = breakEvenTotal * feeRate

  const margin = activeMargin ?? (parseFloat(customMargin) || 0)

  // With margin: price needs to cover COGS + desired profit after platform fee
  // revenue * (1 - feeRate) = totalCost * (1 + margin/100)  =>  revenue = totalCost * (1 + margin/100) / (1 - feeRate)
  const targetNet = totalCost * (1 + margin / 100)
  const totalRevAtMargin = spotCount > 0 && margin > 0
    ? (feeRate < 1 ? targetNet / (1 - feeRate) : targetNet)
    : 0
  const priceWithMargin = spotCount > 0 && margin > 0 ? totalRevAtMargin / spotCount : 0
  const feeAtMargin = totalRevAtMargin * feeRate
  const profitAtMargin = totalRevAtMargin - feeAtMargin - totalCost

  // ── Reset ─────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setCosts([{ id: nextId(), cost: '' }])
    setSpots('')
    setCustomMargin('')
    setActiveMargin(null)
    setPlatform('whatnot')
  }, [])

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Spot Price Calculator</h1>
        <p className="mt-1 text-sm text-cage-400">
          Calculate your break-even spot price and target margins
        </p>
      </div>

      {/* Product Costs */}
      <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-cage-400">
            Product Costs
          </h2>
          <button
            onClick={addCost}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gold-400 hover:text-gold-300 transition-colors"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Product
          </button>
        </div>

        <div className="space-y-3">
          {costs.map((row, i) => (
            <div key={row.id} className="flex items-center gap-3">
              <span className="text-xs text-cage-500 w-6 text-right">{i + 1}.</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cage-500">$</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={row.cost}
                  onChange={(e) => updateCost(row.id, e.target.value)}
                  placeholder="Product cost"
                  className="w-full rounded-lg border border-cage-600 bg-dark-700 py-3 pl-7 pr-3 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
              </div>
              {costs.length > 1 && (
                <button
                  onClick={() => removeCost(row.id)}
                  className="text-cage-500 hover:text-red-400 transition-colors"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-blood-900/20 pt-4">
          <span className="text-sm font-medium text-cage-400">Total COGS</span>
          <span className="text-lg font-bold text-white tabular-nums">{fmt(totalCost)}</span>
        </div>
      </div>

      {/* Spots */}
      <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-6 mb-6">
        <label className="block text-sm font-semibold uppercase tracking-wider text-cage-400 mb-3">
          Number of Spots
        </label>
        <input
          type="number"
          min={1}
          value={spots}
          onChange={(e) => setSpots(e.target.value)}
          placeholder="e.g. 30"
          className="w-full rounded-lg border border-cage-600 bg-dark-700 px-4 py-3 text-lg text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
        />
      </div>

      {/* Platform */}
      <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-6 mb-6">
        <label className="block text-sm font-semibold uppercase tracking-wider text-cage-400 mb-3">
          Platform
        </label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(platformFees).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setPlatform(key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                platform === key
                  ? 'bg-gold-500 text-dark-950'
                  : 'border border-cage-600 bg-dark-700 text-cage-300 hover:border-gold-500/50 hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {totalCost > 0 && spotCount > 0 && (
        <>
          {/* Break Even */}
          <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cage-400 mb-4">
              Break-Even Spot Price
            </h2>
            <div className="text-center">
              <p className="text-4xl font-bold text-white tabular-nums">{fmt(breakEvenPerSpot)}</p>
              <p className="mt-1 text-sm text-cage-500">per spot to break even (0% margin)</p>
              {feeRate > 0 && (
                <p className="mt-2 text-xs text-blood-400">
                  Includes {feeLabel} — {fmt(breakEvenFee)} in fees
                </p>
              )}
            </div>
          </div>

          {/* Margin Calculator */}
          <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-6 mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-cage-400 mb-4">
              Target Margin
            </h2>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              {MARGIN_PRESETS.map((pct) => (
                <button
                  key={pct}
                  onClick={() => { setActiveMargin(pct); setCustomMargin('') }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    activeMargin === pct
                      ? 'bg-gold-500 text-dark-950'
                      : 'border border-cage-600 bg-dark-700 text-cage-300 hover:border-gold-500/50 hover:text-white'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Custom margin */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-cage-400">Custom:</span>
              <div className="relative w-32">
                <input
                  type="number"
                  min={0}
                  max={500}
                  step={1}
                  value={customMargin}
                  onChange={(e) => { setCustomMargin(e.target.value); setActiveMargin(null) }}
                  placeholder="0"
                  className="w-full rounded-lg border border-cage-600 bg-dark-700 px-3 py-2 pr-8 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-cage-500">%</span>
              </div>
            </div>

            {/* Margin results */}
            {margin > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-green-400/70 mb-1">Spot Price at {margin}%</p>
                  <p className="text-2xl font-bold text-green-400 tabular-nums">{fmt(priceWithMargin)}</p>
                </div>
                <div className="rounded-lg border border-gold-500/20 bg-gold-500/5 p-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-gold-400/70 mb-1">Profit at {margin}%</p>
                  <p className="text-2xl font-bold text-gold-400 tabular-nums">{fmt(profitAtMargin)}</p>
                </div>
                <div className="col-span-2 rounded-lg border border-blood-900/30 bg-dark-800/50 p-3 text-center">
                  <span className="text-xs text-cage-500">Gross Revenue: </span>
                  <span className="text-sm font-medium text-white tabular-nums">{fmt(totalRevAtMargin)}</span>
                  {feeRate > 0 && (
                    <>
                      <span className="text-xs text-cage-500 mx-2">|</span>
                      <span className="text-xs text-cage-500">Platform Fee: </span>
                      <span className="text-sm font-medium text-blood-400 tabular-nums">-{fmt(feeAtMargin)}</span>
                    </>
                  )}
                  <span className="text-xs text-cage-500 mx-2">|</span>
                  <span className="text-xs text-cage-500">COGS: </span>
                  <span className="text-sm font-medium text-white tabular-nums">{fmt(totalCost)}</span>
                  <span className="text-xs text-cage-500 mx-2">|</span>
                  <span className="text-xs text-cage-500">Spots: </span>
                  <span className="text-sm font-medium text-white">{spotCount}</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reset */}
      <button
        onClick={reset}
        className="text-sm text-cage-500 hover:text-cage-300 transition-colors"
      >
        Reset Calculator
      </button>
    </div>
  )
}
