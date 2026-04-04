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

// ─── Platform fee options ────────────────────────────────────────────────

const PLATFORMS = [
  { key: 'whatnot', label: 'Whatnot (10.9%)', rate: 0.109 },
  { key: 'none', label: 'No Fee', rate: 0 },
  { key: 'custom', label: 'Custom', rate: 0 },
]

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
  const [customFeeRate, setCustomFeeRate] = useState('')

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

  // ── Platform fee rate ─────────────────────────────────────────────────
  const selectedPlatform = PLATFORMS.find((p) => p.key === platform) ?? PLATFORMS[0]
  const feeRate = platform === 'custom'
    ? (parseFloat(customFeeRate) || 0) / 100
    : selectedPlatform.rate

  // ── Break-even (accounts for platform fee) ────────────────────────────
  const breakEvenTotal = feeRate < 1 && spotCount > 0 ? totalCost / (1 - feeRate) : 0
  const breakEvenPerSpot = spotCount > 0 ? breakEvenTotal / spotCount : 0
  const breakEvenFee = breakEvenTotal * feeRate

  // ── Margin calculation (accounts for platform fee) ────────────────────
  const margin = activeMargin ?? (parseFloat(customMargin) || 0)

  const targetNet = totalCost * (1 + margin / 100)
  const totalRevAtMargin = spotCount > 0 && margin > 0 && feeRate < 1
    ? targetNet / (1 - feeRate)
    : 0
  const priceWithMargin = spotCount > 0 && margin > 0
    ? totalRevAtMargin / spotCount
    : 0
  const feeAtMargin = totalRevAtMargin * feeRate
  const profitAtMargin = totalRevAtMargin - feeAtMargin - totalCost

  // ── Reset ─────────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    setCosts([{ id: nextId(), cost: '' }])
    setSpots('')
    setCustomMargin('')
    setActiveMargin(null)
    setPlatform('whatnot')
    setCustomFeeRate('')
  }, [])

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Spot Price Calculator</h1>
        <p className="mt-1 text-sm text-cage-400">
          Calculate your break-even spot price and target margins
        </p>
      </div>

      {/* Top row: Product Costs + Spots + Platform */}
      <div className="grid gap-4 mb-6 sm:grid-cols-4">
        {/* Product Costs */}
        <div className="sm:col-span-2 rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-cage-400">
              Product Costs
            </h2>
            <button
              onClick={addCost}
              className="text-xs font-medium text-gold-400 hover:text-gold-300 transition-colors"
            >
              + Add Product
            </button>
          </div>
          <div className="space-y-2">
            {costs.map((row, i) => (
              <div key={row.id} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-cage-500">$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={row.cost}
                    onChange={(e) => updateCost(row.id, e.target.value)}
                    placeholder="Cost"
                    className="w-full rounded border border-cage-600 bg-dark-700 py-2 pl-5 pr-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                  />
                </div>
                {costs.length > 1 && (
                  <button onClick={() => removeCost(row.id)} className="text-cage-500 hover:text-red-400 transition-colors">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-blood-900/20 pt-3">
            <span className="text-xs text-cage-400">COGS</span>
            <span className="text-sm font-bold text-white tabular-nums">{fmt(totalCost)}</span>
          </div>
        </div>

        {/* Spots */}
        <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-cage-400 mb-3">
            Spots
          </label>
          <input
            type="number"
            min={1}
            max={999}
            value={spots}
            onChange={(e) => setSpots(e.target.value)}
            placeholder="e.g. 30"
            className="w-full rounded border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          />
        </div>

        {/* Platform */}
        <div className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md p-4">
          <label className="block text-xs font-semibold uppercase tracking-wider text-cage-400 mb-3">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full rounded border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
          >
            {PLATFORMS.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
          {platform === 'custom' && (
            <div className="mt-2 relative">
              <input
                type="number"
                min={0}
                max={100}
                step={0.1}
                value={customFeeRate}
                onChange={(e) => setCustomFeeRate(e.target.value)}
                placeholder="Fee %"
                className="w-full rounded border border-cage-600 bg-dark-700 px-3 py-2 pr-8 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-cage-500">%</span>
            </div>
          )}
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
                <p className="mt-2 text-sm text-blood-400 tabular-nums">
                  Includes {fmt(breakEvenFee)} platform fee ({(feeRate * 100).toFixed(1)}%)
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
                {feeRate > 0 && (
                  <div className="col-span-2 rounded-lg border border-blood-900/30 bg-dark-800/50 p-3 text-center">
                    <span className="text-xs text-cage-500">Platform Fee: </span>
                    <span className="text-sm font-medium text-blood-400 tabular-nums">{fmt(feeAtMargin)}</span>
                    <span className="text-xs text-cage-500 mx-2">|</span>
                    <span className="text-xs text-cage-500">Net After Fee: </span>
                    <span className="text-sm font-medium text-white tabular-nums">{fmt(totalRevAtMargin - feeAtMargin)}</span>
                  </div>
                )}
                <div className="col-span-2 rounded-lg border border-blood-900/30 bg-dark-800/50 p-3 text-center">
                  <span className="text-xs text-cage-500">Total Revenue: </span>
                  <span className="text-sm font-medium text-white tabular-nums">{fmt(totalRevAtMargin)}</span>
                  <span className="text-xs text-cage-500 mx-2">|</span>
                  <span className="text-xs text-cage-500">Total Cost: </span>
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
