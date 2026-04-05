'use client'

// Stream Submission Form — mirrors the Google Sheet structure
// Sections: Stream Info, Products Sold, Real-Time Calculations, Inventory In Hand
// Fetches products and fees from API, submits to /api/streamdata/streams

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import { calculateStreamPayout, type FeeConfig } from '@/lib/calculations'
import { getCurrentWeekNumber } from '@/lib/week-utils'
import Link from 'next/link'

// ─── Constants ──────────────────────────────────────────────────────────
const PLATFORMS = ['Whatnot'] as const

// ─── Types ──────────────────────────────────────────────────────────────
interface Product {
  id: string
  name: string
  manufacturer: string | null
  year: number | null
}

interface ProductRow {
  id: string
  productId: string
  unitType: 'case' | 'box' | 'pack'
  costPerUnit: string
  amountSold: string
}

interface AvailableProduct {
  productId: string
  productName: string
  availableCases: number
  availableBoxes: number
  availablePacks: number
  breakerCostPerCase: string | null
  breakerCostPerBox: string
  breakerCostPerPack: string | null
}

interface InventoryRow {
  id: string
  productId: string
  cases: string
  boxes: string
  packs: string
}

interface WeekPeriod {
  id: string
  weekNumber: number
  year: number
  month: number
  status: string
  label: string
}

// ─── Helpers ────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function pct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

let rowCounter = 0
function nextId(): string {
  return `row-${++rowCounter}-${Date.now()}`
}

// ─── SVG Icons ──────────────────────────────────────────────────────────
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ''}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

// ─── Searchable Product Combobox ───────────────────────────────────────
function SearchableProductSelect({
  products,
  value,
  onChange,
  placeholder,
  dropUp = false,
  availableInventory,
  unitType,
}: {
  products: Product[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  dropUp?: boolean
  availableInventory?: AvailableProduct[]
  unitType?: 'case' | 'box' | 'pack'
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Build a lookup of available inventory by productId
  const inventoryMap = useMemo(() => {
    const map = new Map<string, AvailableProduct>()
    if (availableInventory) {
      for (const item of availableInventory) {
        map.set(item.productId, item)
      }
    }
    return map
  }, [availableInventory])

  // Helper to get available qty label for a product
  function getAvailLabel(productId: string): string {
    const inv = inventoryMap.get(productId)
    if (!inv) return ''
    const ut = unitType || 'box'
    if (ut === 'case' && inv.availableCases > 0) return ` (${inv.availableCases} cases avail)`
    if (ut === 'box' && inv.availableBoxes > 0) return ` (${inv.availableBoxes} boxes avail)`
    if (ut === 'pack' && inv.availablePacks > 0) return ` (${inv.availablePacks} packs avail)`
    // Fallback: show whichever has stock
    const parts: string[] = []
    if (inv.availableCases > 0) parts.push(`${inv.availableCases} cases`)
    if (inv.availableBoxes > 0) parts.push(`${inv.availableBoxes} boxes`)
    if (inv.availablePacks > 0) parts.push(`${inv.availablePacks} packs`)
    return parts.length > 0 ? ` (${parts.join(' / ')} avail)` : ''
  }

  // If we have inventory data, show inventory products first, then others
  const sortedProducts = useMemo(() => {
    if (!availableInventory || availableInventory.length === 0) return products
    return [...products].sort((a, b) => {
      const aHas = inventoryMap.has(a.id) ? 0 : 1
      const bHas = inventoryMap.has(b.id) ? 0 : 1
      return aHas - bHas
    })
  }, [products, availableInventory, inventoryMap])

  // Filter products by search term
  const filtered = sortedProducts.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  // Get display name for selected product
  const selectedProduct = products.find((p) => p.id === value)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || 'Search products...'}
        value={open ? search : selectedProduct?.name || ''}
        onChange={(e) => {
          setSearch(e.target.value)
          if (!open) setOpen(true)
        }}
        onFocus={() => {
          setOpen(true)
          setSearch('')
        }}
        className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow"
      />
      {/* Dropdown arrow indicator */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="h-4 w-4 text-cage-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      {open && (
        <div className={`absolute z-50 max-h-60 w-full overflow-auto rounded-lg border border-cage-600 bg-dark-700 shadow-xl ${dropUp ? 'bottom-full mb-1' : 'mt-1'}`}>
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-cage-500">No products found</div>
          ) : (
            filtered.map((p) => {
              const inv = inventoryMap.get(p.id)
              const hasStock = !!inv
              const availLabel = getAvailLabel(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    onChange(p.id)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gold-500/10 hover:text-gold-400 transition-colors ${
                    p.id === value ? 'bg-gold-500/10 text-gold-400' : hasStock ? 'text-cage-300' : 'text-cage-500'
                  }`}
                >
                  {p.name}
                  {availLabel && (
                    <span className="text-xs text-gold-500/70 ml-1">{availLabel}</span>
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

// ─── Page Component ─────────────────────────────────────────────────────
export default function SubmitStreamPage() {
  // ─── Data loading state ───────────────────────────────────────────────
  const [productList, setProductList] = useState<Product[]>([])
  const [availableInventory, setAvailableInventory] = useState<AvailableProduct[]>([])
  const [fees, setFees] = useState<FeeConfig | null>(null)
  const [weeks, setWeeks] = useState<WeekPeriod[]>([])
  const [selectedWeekId, setSelectedWeekId] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Section 1: Stream Info
  const [streamDate, setStreamDate] = useState('')
  const [platform, setPlatform] = useState('Whatnot')
  const [streamSales, setStreamSales] = useState('')
  const [orderAmount, setOrderAmount] = useState('')

  // Section 2: Products Sold
  const [products, setProducts] = useState<ProductRow[]>([
    { id: nextId(), productId: '', unitType: 'box', costPerUnit: '', amountSold: '' },
  ])

  // Section 3b: Show Adjustments
  const [adjustmentType, setAdjustmentType] = useState<'+' | '-'>('-')
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentNote, setAdjustmentNote] = useState('')

  // Section 4: Inventory
  const [inventory, setInventory] = useState<InventoryRow[]>([])

  // Collapsible sections
  const [inventoryOpen, setInventoryOpen] = useState(true)

  // Submission state
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<{
    status: 'draft' | 'submitted'
    breakerPayout?: number
    chickenPayout?: number
  } | null>(null)

  // ─── Load products, fees, and weeks on mount ──────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setLoadError(null)

        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth() + 1

        const [productsRes, feesRes, weeksRes, inventoryRes] = await Promise.all([
          fetch('/api/streamdata/products'),
          fetch('/api/streamdata/fees'),
          fetch(`/api/streamdata/weeks?year=${year}&month=${month}`),
          fetch('/api/streamdata/inventory/available'),
        ])

        if (!productsRes.ok) throw new Error('Failed to load products')
        if (!feesRes.ok) throw new Error('Failed to load fee configuration')
        if (!weeksRes.ok) throw new Error('Failed to load weekly periods')

        const productsData = await productsRes.json()
        const feesData = await feesRes.json()
        const weeksData = await weeksRes.json()

        // Inventory is optional — don't block form if it fails
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json()
          setAvailableInventory(inventoryData.products ?? [])
        }

        setProductList(productsData.products ?? [])

        // Build fee config from API response
        const feeConfig: FeeConfig = {
          platformFeeRate: feesData.global?.platformFeeRate ?? 0,
          productFeeRate: feesData.global?.productFeeRate ?? 0,
          perOrderFee: feesData.global?.perOrderFee ?? 0,
          supportFeeRate: feesData.streamer?.supportFeeRate ?? 0,
        }
        setFees(feeConfig)

        const weeksList: WeekPeriod[] = weeksData.weeks ?? []
        setWeeks(weeksList)

        // Auto-select the current week using Monday-Sunday week logic
        if (weeksList.length > 0) {
          const currentWeekNum = getCurrentWeekNumber(now, now.getFullYear(), now.getMonth() + 1)
          const currentWeek = weeksList.find((w) => w.weekNumber === currentWeekNum)
          // If the current date falls before the first Monday (week 0), default to week 1
          setSelectedWeekId(currentWeek?.id ?? weeksList[0].id)
        }
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Use loaded fees or fallback
  const activeFees: FeeConfig = fees ?? {
    platformFeeRate: 0,
    productFeeRate: 0,
    perOrderFee: 0,
    supportFeeRate: 0,
  }

  // ─── Product row handlers ─────────────────────────────────────────────
  // Build a lookup of available inventory by productId
  const inventoryMap = useMemo(() => {
    const map = new Map<string, AvailableProduct>()
    for (const item of availableInventory) {
      map.set(item.productId, item)
    }
    return map
  }, [availableInventory])

  const addProduct = useCallback(() => {
    setProducts((prev) => [
      ...prev,
      { id: nextId(), productId: '', unitType: 'box', costPerUnit: '', amountSold: '' },
    ])
  }, [])

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev))
  }, [])

  // Get breaker cost from inventory for a given product + unit type
  const getBreakerCost = useCallback(
    (productId: string, unitType: 'case' | 'box' | 'pack'): string | null => {
      const inv = inventoryMap.get(productId)
      if (!inv) return null
      switch (unitType) {
        case 'case': return inv.breakerCostPerCase
        case 'box': return inv.breakerCostPerBox
        case 'pack': return inv.breakerCostPerPack
      }
    },
    [inventoryMap]
  )

  const updateProduct = useCallback(
    (id: string, field: keyof Omit<ProductRow, 'id'>, value: string) => {
      setProducts((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r
          const updated = { ...r, [field]: value }

          // Auto-fill cost when product or unitType changes
          if (field === 'productId' || field === 'unitType') {
            const pid = field === 'productId' ? value : r.productId
            const ut = field === 'unitType' ? (value as 'case' | 'box' | 'pack') : r.unitType
            const cost = getBreakerCost(pid, ut)
            if (cost) {
              updated.costPerUnit = cost
            }
          }

          return updated
        })
      )
    },
    [getBreakerCost]
  )

  // ─── Inventory row handlers ───────────────────────────────────────────
  const addInventory = useCallback(() => {
    setInventory((prev) => [
      ...prev,
      { id: nextId(), productId: '', cases: '', boxes: '', packs: '' },
    ])
  }, [])

  const removeInventory = useCallback((id: string) => {
    setInventory((prev) => prev.filter((r) => r.id !== id))
  }, [])

  const updateInventory = useCallback(
    (id: string, field: keyof Omit<InventoryRow, 'id'>, value: string) => {
      setInventory((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
      )
    },
    []
  )

  // ─── Real-time calculations ───────────────────────────────────────────
  const sales = parseFloat(streamSales) || 0
  const orders = parseInt(orderAmount, 10) || 0

  const productsSoldForCalc = useMemo(
    () =>
      products.map((p) => ({
        costPerUnit: parseFloat(p.costPerUnit) || 0,
        amountSold: parseInt(p.amountSold, 10) || 0,
      })),
    [products]
  )

  const calc = useMemo(
    () => calculateStreamPayout(sales, orders, productsSoldForCalc, activeFees),
    [sales, orders, productsSoldForCalc, activeFees]
  )

  const totalCogs = useMemo(
    () =>
      products.reduce((sum, p) => {
        const cost = parseFloat(p.costPerUnit) || 0
        const qty = parseInt(p.amountSold, 10) || 0
        return sum + cost * qty
      }, 0),
    [products]
  )

  // ─── Build request body ───────────────────────────────────────────────
  function buildRequestBody(status: 'draft' | 'submitted') {
    // Filter out empty product rows
    const validProducts = products
      .filter((p) => p.productId && (parseFloat(p.costPerUnit) > 0 || parseInt(p.amountSold, 10) > 0))
      .map((p) => ({
        productId: p.productId,
        unitType: p.unitType,
        costPerUnit: parseFloat(p.costPerUnit) || 0,
        amountSold: parseInt(p.amountSold, 10) || 0,
      }))

    // Filter out empty inventory rows
    const validInventory = inventory
      .filter((i) => i.productId)
      .map((i) => ({
        productId: i.productId,
        cases: parseInt(i.cases, 10) || 0,
        boxes: parseInt(i.boxes, 10) || 0,
        packs: parseInt(i.packs, 10) || 0,
      }))

    return {
      streamDate,
      platform: platform || 'Whatnot',
      streamSales: parseFloat(streamSales) || 0,
      orderCount: parseInt(orderAmount, 10) || 0,
      productsSold: validProducts,
      inventory: validInventory.length > 0 ? validInventory : undefined,
      weeklyPeriodId: selectedWeekId,
      status,
    }
  }

  // ─── Form actions ─────────────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!selectedWeekId) {
      setSubmitError('No weekly period available. Please try again.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const body = buildRequestBody('draft')

      if (body.productsSold.length === 0) {
        setSubmitError('Please add at least one product with cost and quantity.')
        setSubmitting(false)
        return
      }

      const res = await fetch('/api/streamdata/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Save failed (${res.status})`)
      }

      setSubmitSuccess({ status: 'draft' })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save draft')
    } finally {
      setSubmitting(false)
    }
  }

  const showError = (msg: string) => {
    setSubmitError(msg)
  }

  const handleSubmit = async () => {
    if (!streamDate || !streamSales) {
      showError('Please fill in Stream Date and Stream Sales.')
      return
    }
    if (!selectedWeekId) {
      showError('No weekly period available. Please try again.')
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const body = buildRequestBody('submitted')

      if (body.productsSold.length === 0) {
        showError('Please add at least one product with cost and quantity.')
        setSubmitting(false)
        return
      }

      // Inventory is mandatory — must report what's left in hand
      const validInv = inventory.filter((i) => i.productId)
      if (validInv.length === 0) {
        showError('Please add your Inventory In Hand before submitting. Report what product you have remaining after this stream.')
        setSubmitting(false)
        setInventoryOpen(true)
        return
      }

      const res = await fetch('/api/streamdata/streams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Submission failed (${res.status})`)
      }

      const data = await res.json()
      const calcResult = data.stream?.calculation
      const streamEntryId: string | undefined = data.stream?.id

      // Deduct inventory for each product that has inventory lots
      if (streamEntryId) {
        const deductWarnings: string[] = []
        for (const p of body.productsSold) {
          // Only deduct if the product has inventory
          if (!inventoryMap.has(p.productId)) continue

          try {
            const deductRes = await fetch('/api/streamdata/inventory/deduct', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                productId: p.productId,
                unitType: p.unitType,
                quantity: p.amountSold,
                streamEntryId,
              }),
            })

            if (!deductRes.ok) {
              const deductData = await deductRes.json().catch(() => ({}))
              const productName = productList.find((pl) => pl.id === p.productId)?.name || p.productId
              deductWarnings.push(`${productName}: ${deductData.error || 'deduction failed'}`)
            }
          } catch {
            // Network error on deduction — don't block
            const productName = productList.find((pl) => pl.id === p.productId)?.name || p.productId
            deductWarnings.push(`${productName}: network error during deduction`)
          }
        }

        if (deductWarnings.length > 0) {
          // Show warnings but still mark as success (stream data is saved)
          setSubmitError(`Stream submitted, but inventory deduction warnings: ${deductWarnings.join('; ')}`)
        }
      }

      setSubmitSuccess({
        status: 'submitted',
        breakerPayout: calcResult ? parseFloat(calcResult.breakerPayout) : undefined,
        chickenPayout: calcResult ? parseFloat(calcResult.chickenPayout) : undefined,
      })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit stream')
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Loading state ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
            Submit Stream
          </h1>
          <p className="mt-1 text-cage-400 text-sm">Loading form data...</p>
        </div>
        <div className="flex items-center justify-center py-16">
          <SpinnerIcon className="w-8 h-8 text-gold-500" />
        </div>
      </div>
    )
  }

  // ─── Load error state ─────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
            Submit Stream
          </h1>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-red-400 font-medium mb-2">Failed to load form data</p>
          <p className="text-cage-400 text-sm mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-dark-700 hover:bg-dark-700 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // ─── Success state ────────────────────────────────────────────────────
  if (submitSuccess) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
            Submit Stream
          </h1>
        </div>
        <div className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl p-8 text-center">
          <CheckCircleIcon className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-white mb-2">
            {submitSuccess.status === 'submitted'
              ? 'Stream Submitted!'
              : 'Draft Saved!'}
          </h2>
          <p className="text-cage-400 mb-6">
            {submitSuccess.status === 'submitted'
              ? 'Your stream has been submitted and the payout has been calculated.'
              : 'Your stream has been saved as a draft. You can submit it later.'}
          </p>

          {submitSuccess.status === 'submitted' &&
            submitSuccess.breakerPayout !== undefined && (
              <div className="max-w-xs mx-auto mb-8">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <p className="text-xs text-green-400 uppercase tracking-wider mb-1">
                    Breaker Payout
                  </p>
                  <p className="text-2xl font-bold text-green-400 tabular-nums">
                    {fmt(submitSuccess.breakerPayout)}
                  </p>
                </div>
              </div>
            )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/streamdata/dashboard"
              className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-950 font-semibold px-5 py-2.5 rounded-lg transition-colors"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={() => {
                setSubmitSuccess(null)
                setStreamDate('')
                setPlatform('Whatnot')
                setStreamSales('')
                setOrderAmount('')
                setProducts([{ id: nextId(), productId: '', unitType: 'box', costPerUnit: '', amountSold: '' }])
                setInventory([])
              }}
              className="inline-flex items-center gap-2 bg-dark-700 hover:bg-dark-700 border border-cage-600 text-cage-300 font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ─── Render form ──────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
          Submit Stream
        </h1>
        <p className="mt-1 text-cage-400 text-sm">
          Enter your stream sales data below. Calculations update in real time.
        </p>
      </div>

      {/* Error banner */}
      {submitError && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4 flex items-start gap-3">
          <XIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium text-sm">{submitError}</p>
          </div>
          <button
            onClick={() => setSubmitError(null)}
            className="ml-auto text-cage-500 hover:text-cage-300"
          >
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="space-y-8">
        {/* ───────────────────── Section 1: Stream Info ───────────────── */}
        <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl p-6">
          <h2 className="font-heading text-lg font-semibold text-white mb-5">
            Stream Info
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <FieldGroup label="Week" htmlFor="weekly-period">
              <select
                id="weekly-period"
                value={selectedWeekId}
                onChange={(e) => setSelectedWeekId(e.target.value)}
                className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow appearance-none"
              >
                {weeks.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-cage-500">Select which week of the month this stream belongs to</p>
            </FieldGroup>

            <FieldGroup label="Stream Date" htmlFor="stream-date">
              <input
                id="stream-date"
                type="date"
                value={streamDate}
                onChange={(e) => setStreamDate(e.target.value)}
                className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow"
              />
            </FieldGroup>

            <FieldGroup label="Platform" htmlFor="platform">
              <div
                id="platform"
                className="w-full bg-dark-700/60 border border-cage-600/50 rounded-lg px-4 py-2.5 text-white text-sm"
              >
                Whatnot
              </div>
            </FieldGroup>

            <FieldGroup label="Stream Sales" htmlFor="stream-sales">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cage-500">
                  $
                </span>
                <input
                  id="stream-sales"
                  type="number"
                  step="0.01"
                  min="0"
                  value={streamSales}
                  onChange={(e) => setStreamSales(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-dark-700 border border-cage-600 rounded-lg pl-8 pr-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow tabular-nums"
                />
              </div>
            </FieldGroup>

            <FieldGroup label="Order Amount" htmlFor="order-amount">
              <input
                id="order-amount"
                type="number"
                min="0"
                step="1"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                placeholder="Number of orders"
                className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow tabular-nums"
              />
            </FieldGroup>
          </div>
        </section>

        {/* ───────────────────── Section 2: Products Sold ────────────── */}
        <section className="relative z-10 bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl p-6 overflow-visible">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg font-semibold text-white">Products Sold <span className="text-xs font-normal text-red-400 ml-2">* Required</span></h2>
            <button
              type="button"
              onClick={addProduct}
              className="inline-flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-300 transition-colors font-medium"
            >
              <PlusIcon className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {/* Column headers (hidden on mobile) */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_110px_120px_90px_110px_36px] gap-3 mb-2 px-1">
            <span className="text-xs text-cage-500 uppercase tracking-wider">Product</span>
            <span className="text-xs text-cage-500 uppercase tracking-wider">Unit Type</span>
            <span className="text-xs text-cage-500 uppercase tracking-wider">Cost/Unit</span>
            <span className="text-xs text-cage-500 uppercase tracking-wider">Qty Sold</span>
            <span className="text-xs text-cage-500 uppercase tracking-wider">COGS</span>
            <span />
          </div>

          <div className="space-y-3">
            {products.map((row) => {
              const rowCogs =
                (parseFloat(row.costPerUnit) || 0) * (parseInt(row.amountSold, 10) || 0)
              const rowInv = inventoryMap.get(row.productId)
              return (
                <div key={row.id} className="space-y-1">
                  <div
                    className="grid grid-cols-1 sm:grid-cols-[1fr_110px_120px_90px_110px_36px] gap-3 items-end bg-dark-700/40 sm:bg-transparent rounded-lg sm:rounded-none p-3 sm:p-0"
                  >
                    {/* Product select */}
                    <div>
                      <label className="sm:hidden text-xs text-cage-500 mb-1 block">Product</label>
                      <SearchableProductSelect
                        products={productList}
                        value={row.productId}
                        onChange={(id) => updateProduct(row.id, 'productId', id)}
                        placeholder="Search products..."
                        availableInventory={availableInventory}
                        unitType={row.unitType}
                      />
                    </div>

                    {/* Unit Type */}
                    <div>
                      <label className="sm:hidden text-xs text-cage-500 mb-1 block">Unit Type</label>
                      <select
                        value={row.unitType}
                        onChange={(e) => updateProduct(row.id, 'unitType', e.target.value)}
                        className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow appearance-none"
                        aria-label="Unit type"
                      >
                        <option value="case">Case</option>
                        <option value="box">Box</option>
                        <option value="pack">Pack</option>
                      </select>
                    </div>

                    {/* Cost per unit — auto-filled from inventory, editable as override */}
                    <div>
                      <label className="sm:hidden text-xs text-cage-500 mb-1 block">Cost/Unit</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cage-500 text-sm">
                          $
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.costPerUnit}
                          onChange={(e) => updateProduct(row.id, 'costPerUnit', e.target.value)}
                          placeholder="0.00"
                          className={`w-full border rounded-lg pl-7 pr-2 py-2 text-sm placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow tabular-nums ${
                            rowInv ? 'bg-dark-700 border-gold-500/30 text-white' : 'bg-dark-700 border-cage-600 text-white'
                          }`}
                          aria-label="Cost per unit"
                        />
                      </div>
                    </div>

                    {/* Amount sold */}
                    <div>
                      <label className="sm:hidden text-xs text-cage-500 mb-1 block">Qty Sold</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.amountSold}
                        onChange={(e) => updateProduct(row.id, 'amountSold', e.target.value)}
                        placeholder="0"
                        className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow tabular-nums"
                        aria-label="Amount sold"
                      />
                    </div>

                    {/* COGS (read-only) */}
                    <div>
                      <label className="sm:hidden text-xs text-cage-500 mb-1 block">COGS</label>
                      <div className="bg-dark-700/60 border border-cage-600/50 rounded-lg px-3 py-2 text-sm text-cage-300 tabular-nums">
                        {fmt(rowCogs)}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeProduct(row.id)}
                      disabled={products.length <= 1}
                      className="self-center sm:self-end p-2 text-cage-500 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors rounded-lg hover:bg-red-500/10"
                      aria-label="Remove product row"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Available stock indicator */}
                  {rowInv && row.productId && (
                    <div className="px-1 sm:px-0">
                      <p className="text-xs text-cage-500">
                        Available: {rowInv.availableCases} cases / {rowInv.availableBoxes} boxes / {rowInv.availablePacks} packs
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Total COGS */}
          <div className="mt-4 pt-4 border-t border-blood-900/40 flex items-center justify-between">
            <span className="text-sm text-cage-400 font-medium">Total COGS</span>
            <span className="text-lg font-bold text-white tabular-nums">{fmt(totalCogs)}</span>
          </div>
        </section>

        {/* ───────────────────── Section 3: Calculation Breakdown ─────── */}
        <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl p-6">
          <h2 className="font-heading text-lg font-semibold text-white mb-5">
            Calculation Breakdown
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-0">
            {/* Left column — deductions */}
            <div className="space-y-3">
              <CalcRow label="Total Stream Sales" value={fmt(sales)} highlight />
              <CalcRow label="Cost of Goods Sold" value={`- ${fmt(calc.totalCogs)}`} />
              <CalcRow
                label={`Platform Fee (${pct(activeFees.platformFeeRate)})`}
                value={`- ${fmt(calc.platformFee)}`}
              />
              <CalcRow
                label={`Product Fee (${pct(activeFees.productFeeRate)})`}
                value={`- ${fmt(calc.productFee)}`}
              />
              <CalcRow
                label={`Order Fee ($${activeFees.perOrderFee.toFixed(2)} x ${orders})`}
                value={`- ${fmt(calc.orderAmountCost)}`}
              />
            </div>

            {/* Right column — results */}
            <div className="space-y-3 mt-3 sm:mt-0">
              {/* Gross Profit */}
              <div className="bg-dark-700 border border-cage-600 rounded-lg p-4">
                <div className="text-xs text-cage-500 uppercase tracking-wider mb-1">
                  Gross Profit
                </div>
                <div
                  className={`text-2xl font-bold tabular-nums ${
                    calc.grossProfit >= 0 ? 'text-white' : 'text-red-400'
                  }`}
                >
                  {fmt(calc.grossProfit)}
                </div>
              </div>

              <CalcRow
                label={`Support Fee (${pct(activeFees.supportFeeRate)})`}
                value={`- ${fmt(calc.supportFee)}`}
              />

              {/* Breaker Payout */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <div className="text-xs text-green-400 uppercase tracking-wider mb-1">
                  Breaker Payout
                </div>
                <div className="text-3xl font-bold text-green-400 tabular-nums">
                  {fmt(calc.breakerPayout)}
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ───────────────────── Section 3b: Show Adjustments ─────── */}
        <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl p-6">
          <h2 className="font-heading text-lg font-semibold text-white mb-1">
            Show Adjustments <span className="text-xs font-normal text-cage-500 ml-2">Optional</span>
          </h2>
          <p className="text-xs text-cage-500 mb-4">
            Add any extra costs or credits for this show (e.g. priority shipping, card sales)
          </p>
          <div className="flex items-center gap-3">
            <select
              value={adjustmentType}
              onChange={(e) => setAdjustmentType(e.target.value as '+' | '-')}
              className="w-16 bg-dark-700 border border-cage-600 rounded-lg px-2 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500"
            >
              <option value="+">+</option>
              <option value="-">-</option>
            </select>
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cage-500 text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={adjustmentAmount}
                onChange={(e) => setAdjustmentAmount(e.target.value)}
                className="w-full bg-dark-700 border border-cage-600 rounded-lg pl-7 pr-3 py-2.5 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
              />
            </div>
            <input
              type="text"
              placeholder="Note (e.g. priority shipping)"
              value={adjustmentNote}
              onChange={(e) => setAdjustmentNote(e.target.value)}
              className="flex-1 bg-dark-700 border border-cage-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500"
            />
          </div>
          {(parseFloat(adjustmentAmount) || 0) > 0 && (
            <div className="mt-3 text-sm">
              <span className="text-cage-400">Adjusted Breaker Payout: </span>
              <span className={`font-semibold tabular-nums ${adjustmentType === '+' ? 'text-green-400' : 'text-red-400'}`}>
                {fmt(calc.breakerPayout + (adjustmentType === '+' ? 1 : -1) * (parseFloat(adjustmentAmount) || 0))}
              </span>
              <span className="text-cage-600 ml-2">
                ({adjustmentType === '+' ? '+' : '-'}{fmt(parseFloat(adjustmentAmount) || 0)})
              </span>
            </div>
          )}
        </section>

        {/* ───────────────────── Section 4: Inventory In Hand ────────── */}
        <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl overflow-visible">
          <button
            type="button"
            onClick={() => setInventoryOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-dark-700/30 transition-colors text-left"
            aria-expanded={inventoryOpen}
          >
            <h2 className="font-heading text-lg font-semibold text-white">
              Inventory In Hand <span className="text-xs font-normal text-red-400 ml-2">* Required</span>
            </h2>
            {inventoryOpen ? (
              <ChevronUpIcon className="w-5 h-5 text-cage-400" />
            ) : (
              <ChevronDownIcon className="w-5 h-5 text-cage-400" />
            )}
          </button>

          {inventoryOpen && (
            <div className="px-6 pb-6">
              <div className="flex items-center justify-end mb-4">
                <button
                  type="button"
                  onClick={addInventory}
                  className="inline-flex items-center gap-1.5 text-sm text-gold-400 hover:text-gold-300 transition-colors font-medium"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Inventory Item
                </button>
              </div>

              {inventory.length === 0 ? (
                <div className="text-center py-8 text-cage-500 text-sm">
                  No inventory items added. Click &ldquo;Add Inventory Item&rdquo; to track what
                  you have in hand.
                </div>
              ) : (
                <>
                  {/* Column headers (hidden on mobile) */}
                  <div className="hidden sm:grid sm:grid-cols-[1fr_100px_100px_100px_36px] gap-3 mb-2 px-1">
                    <span className="text-xs text-cage-500 uppercase tracking-wider">Product</span>
                    <span className="text-xs text-cage-500 uppercase tracking-wider">Cases</span>
                    <span className="text-xs text-cage-500 uppercase tracking-wider">Boxes</span>
                    <span className="text-xs text-cage-500 uppercase tracking-wider">Packs</span>
                    <span />
                  </div>

                  <div className="space-y-3">
                    {inventory.map((row) => (
                      <div
                        key={row.id}
                        className="grid grid-cols-1 sm:grid-cols-[1fr_100px_100px_100px_36px] gap-3 items-end bg-dark-700/40 sm:bg-transparent rounded-lg sm:rounded-none p-3 sm:p-0"
                      >
                        <div>
                          <label className="sm:hidden text-xs text-cage-500 mb-1 block">
                            Product
                          </label>
                          <SearchableProductSelect
                            products={productList}
                            value={row.productId}
                            onChange={(id) => updateInventory(row.id, 'productId', id)}
                            placeholder="Search products..."
                            dropUp
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs text-cage-500 mb-1 block">
                            Cases
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={row.cases}
                            onChange={(e) =>
                              updateInventory(row.id, 'cases', e.target.value)
                            }
                            placeholder="0"
                            className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow tabular-nums"
                            aria-label="Cases"
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs text-cage-500 mb-1 block">
                            Boxes
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={row.boxes}
                            onChange={(e) =>
                              updateInventory(row.id, 'boxes', e.target.value)
                            }
                            placeholder="0"
                            className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow tabular-nums"
                            aria-label="Boxes"
                          />
                        </div>

                        <div>
                          <label className="sm:hidden text-xs text-cage-500 mb-1 block">
                            Packs
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="1"
                            value={row.packs}
                            onChange={(e) =>
                              updateInventory(row.id, 'packs', e.target.value)
                            }
                            placeholder="0"
                            className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow tabular-nums"
                            aria-label="Packs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => removeInventory(row.id)}
                          className="self-center sm:self-end p-2 text-cage-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                          aria-label="Remove inventory row"
                        >
                          <XIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </section>

        {/* ───────────────────── Bottom Actions ──────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2 pb-8">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-dark-700 hover:bg-dark-700 border border-cage-600 text-cage-300 font-medium px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-cage-500 focus:ring-offset-2 focus:ring-offset-dark-950"
          >
            {submitting ? (
              <SpinnerIcon className="w-4 h-4" />
            ) : (
              <SaveIcon className="w-4 h-4" />
            )}
            Save Draft
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-950 font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 focus:ring-offset-dark-950"
          >
            {submitting ? (
              <SpinnerIcon className="w-4 h-4" />
            ) : (
              <SendIcon className="w-4 h-4" />
            )}
            Submit Stream
          </button>
        </div>
      </div>
      {/* Fixed toast for errors */}
      {submitError && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 w-[90%] max-w-lg animate-[slideUp_0.3s_ease-out]">
          <div className="bg-red-950/95 border border-red-500/40 rounded-xl px-5 py-4 flex items-center gap-3 shadow-2xl backdrop-blur-sm">
            <XIcon className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-sm font-medium flex-1">{submitError}</p>
            <button
              onClick={() => setSubmitError(null)}
              className="text-red-400/60 hover:text-red-300 flex-shrink-0"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ─────────────────────────────────────────────────────
function FieldGroup({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-cage-300 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function CalcRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className={`text-sm ${highlight ? 'text-white font-medium' : 'text-cage-400'}`}>
        {label}
      </span>
      <span
        className={`tabular-nums text-sm font-medium ${
          highlight ? 'text-white' : 'text-cage-300'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
