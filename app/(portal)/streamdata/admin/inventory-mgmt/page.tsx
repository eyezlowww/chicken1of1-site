// Admin Inventory Management — two-tab layout
// Tab 1: Inventory — add lots, stock summary, lots table, recent transactions
// Tab 2: Product Catalog — add/edit/delete/toggle products inline
'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface Product {
  id: string
  name: string
  sku: string | null
  streetDate: string | null
  manufacturer: string | null
  year: number | null
  isActive: boolean
  createdAt: string
}

interface InventoryLot {
  id: string
  productId: string
  productName: string | null
  quantityCases: number
  boxesPerCase: number
  packsPerBox: number
  totalBoxes: number
  totalPacks: number
  ownerCostPerBox: string
  breakerCostPerBox: string
  ownerCostPerCase: string
  breakerCostPerCase: string
  ownerCostPerPack: string
  breakerCostPerPack: string
  remainingCases: number
  remainingBoxes: number
  remainingPacks: number
  receivedDate: string
  notes: string | null
  createdAt: string
  updatedAt: string | null
}

interface InventoryTransaction {
  id: string
  inventoryLotId: string
  userId: string
  userName: string | null
  productName: string | null
  transactionType: string
  unitType: string
  quantity: number
  costPerUnit: string | null
  notes: string | null
  createdAt: string
}

/* ─── Helpers ───────────────────────────────────────────────────────────── */

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-US')
}

/* ─── SVG Icons ─────────────────────────────────────────────────────────── */

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? ''}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  )
}

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  )
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  )
}

/* ─── SearchableProductSelect (reused pattern from submit page) ────────── */

function SearchableProductSelect({
  products,
  value,
  onChange,
  placeholder,
}: {
  products: Product[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const selectedProduct = products.find((p) => p.id === value)

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
        className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2.5 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow"
        aria-label="Select a product"
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <ChevronDownIcon className="h-4 w-4 text-cage-400" />
      </div>
      {open && (
        <div className="absolute z-50 max-h-60 w-full overflow-auto rounded-lg border border-cage-600 bg-dark-700 shadow-xl mt-1" role="listbox">
          {filtered.length === 0 ? (
            <div className="px-3 py-2 text-sm text-cage-500">No products found</div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.id}
                type="button"
                role="option"
                aria-selected={p.id === value}
                onClick={() => {
                  onChange(p.id)
                  setOpen(false)
                  setSearch('')
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gold-500/10 hover:text-gold-400 transition-colors ${
                  p.id === value ? 'bg-gold-500/10 text-gold-400' : 'text-cage-300'
                }`}
              >
                {p.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Inline New Product Panel ──────────────────────────────────────────── */

function InlineNewProductPanel({
  onCreated,
  onCancel,
}: {
  onCreated: (product: Product) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [streetDate, setStreetDate] = useState('')
  const [year, setYear] = useState('')
  const [manufacturer, setManufacturer] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Product name is required.')
      return
    }

    const body: Record<string, unknown> = { name: name.trim() }
    if (sku.trim()) body.sku = sku.trim()
    if (streetDate) body.streetDate = streetDate
    if (manufacturer.trim()) body.manufacturer = manufacturer.trim()
    if (year) {
      const yr = parseInt(year, 10)
      if (isNaN(yr) || yr < 1900 || yr > 2100) {
        setError('Year must be between 1900 and 2100.')
        return
      }
      body.year = yr
    }

    setCreating(true)
    try {
      const res = await fetch('/api/streamdata/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Create failed (${res.status})`)
      }

      const data = await res.json()
      onCreated(data.product)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="mt-3 border border-gold-500/30 rounded-lg bg-dark-800/60 p-4">
      <p className="text-sm font-medium text-gold-400 mb-3">New Product</p>

      {error && (
        <div className="mb-3 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-cage-300 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2025 Panini Prizm UFC"
              className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cage-300 mb-1">SKU</label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. PAN-PRIZM-UFC-25"
              className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cage-300 mb-1">Street Date</label>
            <input
              type="date"
              value={streetDate}
              onChange={(e) => setStreetDate(e.target.value)}
              className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cage-300 mb-1">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2025"
              min="1900"
              max="2100"
              className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow tabular-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cage-300 mb-1">Manufacturer</label>
            <input
              type="text"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g. Panini"
              className="w-full bg-dark-700 border border-cage-600 rounded-lg px-3 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center gap-1.5 bg-gold-500 hover:bg-gold-400 text-gray-950 font-semibold px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs"
          >
            {creating ? <SpinnerIcon className="w-3 h-3" /> : <PlusIcon className="w-3 h-3" />}
            Create & Select
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={creating}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-cage-400 hover:text-cage-300 hover:bg-cage-500/10"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

/* ─── Main Component ────────────────────────────────────────────────────── */

export default function InventoryManagementPage() {
  // Tab state
  const [activeTab, setActiveTab] = useState<'inventory' | 'catalog'>('inventory')

  // Data state
  const [products, setProducts] = useState<Product[]>([])
  const [lots, setLots] = useState<InventoryLot[]>([])
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Inventory form state
  const [formProductId, setFormProductId] = useState('')
  const [formCases, setFormCases] = useState('')
  const [formBoxesPerCase, setFormBoxesPerCase] = useState('')
  const [formPacksPerBox, setFormPacksPerBox] = useState('')
  const [formCostMethod, setFormCostMethod] = useState<'per_box' | 'per_case'>('per_box')
  const [formOwnerCostPerBox, setFormOwnerCostPerBox] = useState('')
  const [formBreakerCostPerBox, setFormBreakerCostPerBox] = useState('')
  const [formOwnerCostPerCase, setFormOwnerCostPerCase] = useState('')
  const [formBreakerCostPerCase, setFormBreakerCostPerCase] = useState('')
  const [formReceivedDate, setFormReceivedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [formNotes, setFormNotes] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Inline new product panel (inventory tab)
  const [showNewProductPanel, setShowNewProductPanel] = useState(false)

  // Inventory table state
  const [lotSearch, setLotSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Inventory edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCases, setEditCases] = useState('')
  const [editBoxesPerCase, setEditBoxesPerCase] = useState('')
  const [editPacksPerBox, setEditPacksPerBox] = useState('')
  const [editOwnerCostPerBox, setEditOwnerCostPerBox] = useState('')
  const [editBreakerCostPerBox, setEditBreakerCostPerBox] = useState('')
  const [editReceivedDate, setEditReceivedDate] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Product catalog state
  const [catalogSearch, setCatalogSearch] = useState('')
  const [newProdName, setNewProdName] = useState('')
  const [newProdSku, setNewProdSku] = useState('')
  const [newProdStreetDate, setNewProdStreetDate] = useState('')
  const [newProdYear, setNewProdYear] = useState('')
  const [newProdManufacturer, setNewProdManufacturer] = useState('')
  const [catalogCreating, setCatalogCreating] = useState(false)
  const [catalogCreateError, setCatalogCreateError] = useState<string | null>(null)
  const [catalogEditingId, setCatalogEditingId] = useState<string | null>(null)
  const [catalogEditName, setCatalogEditName] = useState('')
  const [catalogEditSku, setCatalogEditSku] = useState('')
  const [catalogEditStreetDate, setCatalogEditStreetDate] = useState('')
  const [catalogEditYear, setCatalogEditYear] = useState('')
  const [catalogEditManufacturer, setCatalogEditManufacturer] = useState('')
  const [catalogSaving, setCatalogSaving] = useState(false)
  const [catalogTogglingId, setCatalogTogglingId] = useState<string | null>(null)
  const [catalogDeletingId, setCatalogDeletingId] = useState<string | null>(null)

  /* ─── Data Fetching ─────────────────────────────────────────────────── */

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/streamdata/admin/products')
      if (!res.ok) throw new Error('Failed to load products')
      const data = await res.json()
      setProducts(data.products ?? [])
    } catch {
      // Products are not critical for inventory tab, silently fail
    }
  }, [])

  const fetchLots = useCallback(async () => {
    try {
      const res = await fetch('/api/streamdata/admin/inventory')
      if (!res.ok) throw new Error('Failed to load inventory lots')
      const data = await res.json()
      setLots(data.lots ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory')
    }
  }, [])

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/streamdata/admin/inventory/transactions?limit=20')
      if (!res.ok) return
      const data = await res.json()
      setTransactions(data.transactions ?? [])
    } catch {
      // Silently fail — transactions are supplemental
    }
  }, [])

  useEffect(() => {
    async function loadAll() {
      setLoading(true)
      await Promise.all([fetchProducts(), fetchLots(), fetchTransactions()])
      setLoading(false)
    }
    loadAll()
  }, [fetchProducts, fetchLots, fetchTransactions])

  /* ─── Auto-calculated Preview ───────────────────────────────────────── */

  const preview = useMemo(() => {
    const cases = parseInt(formCases, 10) || 0
    const boxesPerCase = parseInt(formBoxesPerCase, 10) || 0
    const packsPerBox = parseInt(formPacksPerBox, 10) || 0

    const totalBoxes = cases * boxesPerCase
    const totalPacks = totalBoxes * packsPerBox

    let ownerPerBox = 0
    let breakerPerBox = 0
    let ownerPerCase = 0
    let breakerPerCase = 0

    if (formCostMethod === 'per_box') {
      ownerPerBox = parseFloat(formOwnerCostPerBox) || 0
      breakerPerBox = parseFloat(formBreakerCostPerBox) || 0
      ownerPerCase = ownerPerBox * boxesPerCase
      breakerPerCase = breakerPerBox * boxesPerCase
    } else {
      ownerPerCase = parseFloat(formOwnerCostPerCase) || 0
      breakerPerCase = parseFloat(formBreakerCostPerCase) || 0
      ownerPerBox = boxesPerCase > 0 ? ownerPerCase / boxesPerCase : 0
      breakerPerBox = boxesPerCase > 0 ? breakerPerCase / boxesPerCase : 0
    }

    const ownerPerPack = packsPerBox > 0 ? ownerPerBox / packsPerBox : 0
    const breakerPerPack = packsPerBox > 0 ? breakerPerBox / packsPerBox : 0
    const totalInvestment = ownerPerBox * totalBoxes
    const totalBreakerValue = breakerPerBox * totalBoxes
    const breakerHasValue = breakerPerBox > 0
    const markup = ownerPerBox > 0 && breakerHasValue ? ((breakerPerBox - ownerPerBox) / ownerPerBox) * 100 : 0

    return {
      totalBoxes,
      totalPacks,
      ownerPerBox,
      breakerPerBox,
      ownerPerCase,
      breakerPerCase,
      ownerPerPack,
      breakerPerPack,
      totalInvestment,
      totalBreakerValue,
      markup,
      breakerHasValue,
      hasData: cases > 0 && boxesPerCase > 0,
    }
  }, [
    formCases,
    formBoxesPerCase,
    formPacksPerBox,
    formCostMethod,
    formOwnerCostPerBox,
    formBreakerCostPerBox,
    formOwnerCostPerCase,
    formBreakerCostPerCase,
  ])

  /* ─── Stock Summary ─────────────────────────────────────────────────── */

  const stockSummary = useMemo(() => {
    const inStockLots = lots.filter(
      (l) => l.remainingCases > 0 || l.remainingBoxes > 0 || l.remainingPacks > 0
    )
    const distinctProducts = new Set(inStockLots.map((l) => l.productId)).size
    const totalCases = inStockLots.reduce((sum, l) => sum + l.remainingCases, 0)
    const totalBoxes = inStockLots.reduce((sum, l) => sum + l.remainingBoxes, 0)
    const totalInvestment = inStockLots.reduce(
      (sum, l) => sum + Number(l.ownerCostPerBox) * l.remainingBoxes,
      0
    )

    return { distinctProducts, totalCases, totalBoxes, totalInvestment }
  }, [lots])

  /* ─── Create Lot ────────────────────────────────────────────────────── */

  const resetForm = () => {
    setFormProductId('')
    setFormCases('')
    setFormBoxesPerCase('')
    setFormPacksPerBox('')
    setFormCostMethod('per_box')
    setFormOwnerCostPerBox('')
    setFormBreakerCostPerBox('')
    setFormOwnerCostPerCase('')
    setFormBreakerCostPerCase('')
    setFormReceivedDate(new Date().toISOString().split('T')[0])
    setFormNotes('')
    setShowNewProductPanel(false)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)

    if (!formProductId) {
      setCreateError('Please select a product.')
      return
    }

    const cases = parseInt(formCases, 10)
    const boxesPerCase = parseInt(formBoxesPerCase, 10)
    const packsPerBox = parseInt(formPacksPerBox, 10)

    if (!cases || cases < 1) {
      setCreateError('Cases must be at least 1.')
      return
    }
    if (!boxesPerCase || boxesPerCase < 1) {
      setCreateError('Boxes per case must be at least 1.')
      return
    }
    if (!packsPerBox || packsPerBox < 1) {
      setCreateError('Packs per box must be at least 1.')
      return
    }

    const body: Record<string, unknown> = {
      productId: formProductId,
      quantityCases: cases,
      boxesPerCase,
      packsPerBox,
      costEntryType: formCostMethod,
      receivedDate: formReceivedDate,
    }

    if (formNotes.trim()) body.notes = formNotes.trim()

    if (formCostMethod === 'per_box') {
      const ownerCost = parseFloat(formOwnerCostPerBox)
      if (!ownerCost || ownerCost <= 0) {
        setCreateError('Owner cost per box is required.')
        return
      }
      body.costPerBox = ownerCost
      const breakerCost = parseFloat(formBreakerCostPerBox)
      if (breakerCost && breakerCost > 0) {
        body.breakerCostPerBox = breakerCost
      }
    } else {
      const ownerCost = parseFloat(formOwnerCostPerCase)
      if (!ownerCost || ownerCost <= 0) {
        setCreateError('Owner cost per case is required.')
        return
      }
      body.costPerCase = ownerCost
      const breakerCost = parseFloat(formBreakerCostPerCase)
      if (breakerCost && breakerCost > 0) {
        body.breakerCostPerCase = breakerCost
      }
    }

    setCreating(true)

    try {
      const res = await fetch('/api/streamdata/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Create failed (${res.status})`)
      }

      resetForm()
      await fetchLots()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create inventory lot')
    } finally {
      setCreating(false)
    }
  }

  /* ─── Edit Lot ──────────────────────────────────────────────────────── */

  const startEditing = (lot: InventoryLot) => {
    setEditingId(lot.id)
    setEditCases(String(lot.quantityCases))
    setEditBoxesPerCase(String(lot.boxesPerCase))
    setEditPacksPerBox(String(lot.packsPerBox))
    setEditOwnerCostPerBox(lot.ownerCostPerBox)
    setEditBreakerCostPerBox(lot.breakerCostPerBox)
    setEditReceivedDate(lot.receivedDate)
    setEditNotes(lot.notes || '')
  }

  const cancelEditing = () => {
    setEditingId(null)
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    setSaving(true)

    try {
      const body: Record<string, unknown> = {}

      const cases = parseInt(editCases, 10)
      const bpc = parseInt(editBoxesPerCase, 10)
      const ppb = parseInt(editPacksPerBox, 10)
      const ownerCpb = parseFloat(editOwnerCostPerBox)
      const breakerCpb = parseFloat(editBreakerCostPerBox)

      if (cases && cases >= 1) body.quantityCases = cases
      if (bpc && bpc >= 1) body.boxesPerCase = bpc
      if (ppb && ppb >= 1) body.packsPerBox = ppb
      if (ownerCpb >= 0) body.ownerCostPerBox = ownerCpb
      if (breakerCpb >= 0) body.breakerCostPerBox = breakerCpb
      if (editReceivedDate) body.receivedDate = editReceivedDate
      body.notes = editNotes.trim() || null

      const res = await fetch(`/api/streamdata/admin/inventory/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Update failed')
      }

      cancelEditing()
      await fetchLots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lot')
    } finally {
      setSaving(false)
    }
  }

  /* ─── Delete Lot ────────────────────────────────────────────────────── */

  const handleDelete = async (lot: InventoryLot) => {
    if (!window.confirm(`Delete lot for ${lot.productName || 'Unknown Product'}? This cannot be undone.`))
      return

    setDeletingId(lot.id)

    try {
      const res = await fetch(`/api/streamdata/admin/inventory/${lot.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }

      setLots((prev) => prev.filter((l) => l.id !== lot.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lot')
    } finally {
      setDeletingId(null)
    }
  }

  /* ─── Filtered Lots ─────────────────────────────────────────────────── */

  const filteredLots = lots.filter(
    (l) =>
      !lotSearch ||
      (l.productName && l.productName.toLowerCase().includes(lotSearch.toLowerCase()))
  )

  /* ─── Product Catalog Actions ───────────────────────────────────────── */

  const handleCatalogCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCatalogCreateError(null)

    if (!newProdName.trim()) {
      setCatalogCreateError('Product name is required.')
      return
    }

    const body: Record<string, unknown> = { name: newProdName.trim() }
    if (newProdSku.trim()) body.sku = newProdSku.trim()
    if (newProdStreetDate) body.streetDate = newProdStreetDate
    if (newProdManufacturer.trim()) body.manufacturer = newProdManufacturer.trim()
    if (newProdYear) {
      const yr = parseInt(newProdYear, 10)
      if (isNaN(yr) || yr < 1900 || yr > 2100) {
        setCatalogCreateError('Year must be between 1900 and 2100.')
        return
      }
      body.year = yr
    }

    setCatalogCreating(true)
    try {
      const res = await fetch('/api/streamdata/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Create failed (${res.status})`)
      }

      setNewProdName('')
      setNewProdSku('')
      setNewProdStreetDate('')
      setNewProdYear('')
      setNewProdManufacturer('')
      await fetchProducts()
    } catch (err) {
      setCatalogCreateError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setCatalogCreating(false)
    }
  }

  const startCatalogEdit = (product: Product) => {
    setCatalogEditingId(product.id)
    setCatalogEditName(product.name)
    setCatalogEditSku(product.sku ?? '')
    setCatalogEditStreetDate(product.streetDate ?? '')
    setCatalogEditYear(product.year ? String(product.year) : '')
    setCatalogEditManufacturer(product.manufacturer ?? '')
  }

  const cancelCatalogEdit = () => {
    setCatalogEditingId(null)
  }

  const handleCatalogSaveEdit = async () => {
    if (!catalogEditingId || !catalogEditName.trim()) return

    setCatalogSaving(true)
    try {
      const body: Record<string, unknown> = {
        id: catalogEditingId,
        name: catalogEditName.trim(),
      }
      if (catalogEditSku.trim()) body.sku = catalogEditSku.trim()
      if (catalogEditStreetDate) body.streetDate = catalogEditStreetDate
      if (catalogEditManufacturer.trim()) body.manufacturer = catalogEditManufacturer.trim()
      if (catalogEditYear) {
        const yr = parseInt(catalogEditYear, 10)
        if (isNaN(yr) || yr < 1900 || yr > 2100) {
          setError('Year must be between 1900 and 2100.')
          setCatalogSaving(false)
          return
        }
        body.year = yr
      }

      const res = await fetch('/api/streamdata/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Save failed')
      }

      cancelCatalogEdit()
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setCatalogSaving(false)
    }
  }

  const handleCatalogToggleActive = async (product: Product) => {
    setCatalogTogglingId(product.id)
    try {
      const res = await fetch('/api/streamdata/admin/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, isActive: !product.isActive }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Toggle failed')
      }

      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle product')
    } finally {
      setCatalogTogglingId(null)
    }
  }

  const handleCatalogDelete = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return

    setCatalogDeletingId(product.id)
    try {
      const res = await fetch('/api/streamdata/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        if (data.deactivated) {
          // Product was auto-deactivated instead of deleted due to FK constraint
          setProducts((prev) =>
            prev.map((p) => (p.id === product.id ? { ...p, isActive: false } : p))
          )
          setError(data.error)
          return
        }
        throw new Error(data.error || 'Delete failed')
      }

      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    } finally {
      setCatalogDeletingId(null)
    }
  }

  const filteredCatalogProducts = products.filter(
    (p) =>
      !catalogSearch ||
      p.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(catalogSearch.toLowerCase())) ||
      (p.manufacturer && p.manufacturer.toLowerCase().includes(catalogSearch.toLowerCase()))
  )

  /* ─── Loading State ─────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-white tracking-tight mb-2">
          Stock Management
        </h1>
        <p className="text-cage-400 text-sm mb-8">Loading inventory...</p>
        <div className="flex items-center justify-center py-16">
          <SpinnerIcon className="w-8 h-8 text-gold-500" />
        </div>
      </div>
    )
  }

  /* ─── Render ────────────────────────────────────────────────────────── */

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
          Stock Management
        </h1>
        <p className="mt-1 text-cage-400 text-sm">
          Manage inventory lots and the product catalog.
        </p>
      </div>

      {/* Global error banner */}
      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4">
          <p className="text-red-400 font-medium text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-1 text-xs text-cage-500 hover:text-cage-300 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ─── Tab bar ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'inventory'
              ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
              : 'bg-dark-700 text-cage-400 hover:text-cage-300'
          }`}
        >
          Inventory
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'catalog'
              ? 'bg-gold-500/20 text-gold-400 border border-gold-500/40'
              : 'bg-dark-700 text-cage-400 hover:text-cage-300'
          }`}
        >
          Product Catalog
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: INVENTORY
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <>
          {/* ────────────── Section 1: Add New Inventory Lot ────────────── */}
          <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl p-6 mb-8">
            <h2 className="font-heading text-lg font-semibold text-white mb-4">
              Add New Inventory Lot
            </h2>

            {createError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{createError}</p>
              </div>
            )}

            <form onSubmit={handleCreate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* Product */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-cage-300 mb-1.5">
                    Product <span className="text-red-400">*</span>
                  </label>
                  <SearchableProductSelect
                    products={products.filter((p) => p.isActive)}
                    value={formProductId}
                    onChange={setFormProductId}
                    placeholder="Search and select product..."
                  />
                  {/* New Product toggle */}
                  {!showNewProductPanel && (
                    <button
                      type="button"
                      onClick={() => setShowNewProductPanel(true)}
                      className="mt-1.5 inline-flex items-center gap-1 text-xs text-gold-500 hover:text-gold-400 transition-colors"
                    >
                      <PlusIcon className="w-3 h-3" />
                      New Product
                    </button>
                  )}
                  {showNewProductPanel && (
                    <InlineNewProductPanel
                      onCreated={(product) => {
                        setProducts((prev) => [product, ...prev])
                        setFormProductId(product.id)
                        setShowNewProductPanel(false)
                      }}
                      onCancel={() => setShowNewProductPanel(false)}
                    />
                  )}
                </div>

                {/* Quantity Cases */}
                <div>
                  <label htmlFor="inv-cases" className="block text-sm font-medium text-cage-300 mb-1.5">
                    Cases <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="inv-cases"
                    type="number"
                    min="1"
                    value={formCases}
                    onChange={(e) => setFormCases(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm tabular-nums"
                  />
                </div>

                {/* Boxes per Case */}
                <div>
                  <label htmlFor="inv-bpc" className="block text-sm font-medium text-cage-300 mb-1.5">
                    Boxes per Case <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="inv-bpc"
                    type="number"
                    min="1"
                    value={formBoxesPerCase}
                    onChange={(e) => setFormBoxesPerCase(e.target.value)}
                    placeholder="e.g. 12"
                    className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm tabular-nums"
                  />
                </div>

                {/* Packs per Box */}
                <div>
                  <label htmlFor="inv-ppb" className="block text-sm font-medium text-cage-300 mb-1.5">
                    Packs per Box <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="inv-ppb"
                    type="number"
                    min="1"
                    value={formPacksPerBox}
                    onChange={(e) => setFormPacksPerBox(e.target.value)}
                    placeholder="e.g. 24"
                    className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm tabular-nums"
                  />
                </div>

                {/* Cost Entry Method */}
                <div>
                  <label className="block text-sm font-medium text-cage-300 mb-1.5">
                    Cost Entry Method
                  </label>
                  <div className="flex gap-1 bg-dark-700 border border-cage-600 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setFormCostMethod('per_box')}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        formCostMethod === 'per_box'
                          ? 'bg-gold-500/20 text-gold-400'
                          : 'text-cage-400 hover:text-white'
                      }`}
                    >
                      Per Box
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormCostMethod('per_case')}
                      className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        formCostMethod === 'per_case'
                          ? 'bg-gold-500/20 text-gold-400'
                          : 'text-cage-400 hover:text-white'
                      }`}
                    >
                      Per Case
                    </button>
                  </div>
                </div>

                {/* Cost Inputs — conditional on method */}
                {formCostMethod === 'per_box' ? (
                  <>
                    <div>
                      <label htmlFor="inv-owner-box" className="block text-sm font-medium text-cage-300 mb-1.5">
                        Owner Cost / Box <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cage-500 text-sm">$</span>
                        <input
                          id="inv-owner-box"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formOwnerCostPerBox}
                          onChange={(e) => setFormOwnerCostPerBox(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-dark-700 border border-cage-600 rounded-lg pl-7 pr-4 py-2.5 text-green-400 placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm tabular-nums"
                        />
                      </div>
                      {parseFloat(formOwnerCostPerBox) > 0 && parseInt(formBoxesPerCase, 10) > 0 && (
                        <p className="text-xs text-cage-500 mt-1">= {fmt(parseFloat(formOwnerCostPerBox) * parseInt(formBoxesPerCase, 10))} per case (auto-calculated)</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="inv-breaker-box" className="block text-sm font-medium text-cage-300 mb-1.5">
                        Breaker Cost / Box <span className="text-cage-500 text-xs">(optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cage-500 text-sm">$</span>
                        <input
                          id="inv-breaker-box"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formBreakerCostPerBox}
                          onChange={(e) => setFormBreakerCostPerBox(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-dark-700 border border-cage-600 rounded-lg pl-7 pr-4 py-2.5 text-green-400 placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm tabular-nums"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label htmlFor="inv-owner-case" className="block text-sm font-medium text-cage-300 mb-1.5">
                        Owner Cost / Case <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cage-500 text-sm">$</span>
                        <input
                          id="inv-owner-case"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formOwnerCostPerCase}
                          onChange={(e) => setFormOwnerCostPerCase(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-dark-700 border border-cage-600 rounded-lg pl-7 pr-4 py-2.5 text-green-400 placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm tabular-nums"
                        />
                      </div>
                      {parseFloat(formOwnerCostPerCase) > 0 && parseInt(formBoxesPerCase, 10) > 0 && (
                        <p className="text-xs text-cage-500 mt-1">= {fmt(parseFloat(formOwnerCostPerCase) / parseInt(formBoxesPerCase, 10))} per box (auto-calculated)</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="inv-breaker-case" className="block text-sm font-medium text-cage-300 mb-1.5">
                        Breaker Cost / Case <span className="text-cage-500 text-xs">(optional)</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cage-500 text-sm">$</span>
                        <input
                          id="inv-breaker-case"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formBreakerCostPerCase}
                          onChange={(e) => setFormBreakerCostPerCase(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-dark-700 border border-cage-600 rounded-lg pl-7 pr-4 py-2.5 text-green-400 placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm tabular-nums"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Received Date */}
                <div>
                  <label htmlFor="inv-date" className="block text-sm font-medium text-cage-300 mb-1.5">
                    Received Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="inv-date"
                    type="date"
                    value={formReceivedDate}
                    onChange={(e) => setFormReceivedDate(e.target.value)}
                    className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm [color-scheme:dark]"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label htmlFor="inv-notes" className="block text-sm font-medium text-cage-300 mb-1.5">
                    Notes
                  </label>
                  <input
                    id="inv-notes"
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="Optional notes..."
                    className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm"
                  />
                </div>
              </div>

              {/* Auto-calculated preview */}
              {preview.hasData && (
                <div className="mb-4 bg-dark-800/60 border border-cage-700/50 rounded-lg p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-cage-500 mb-3">
                    Calculated Preview
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 text-sm">
                    <div>
                      <span className="text-cage-400">Total Boxes:</span>{' '}
                      <span className="text-white font-medium tabular-nums">{fmtNum(preview.totalBoxes)}</span>
                    </div>
                    <div>
                      <span className="text-cage-400">Total Packs:</span>{' '}
                      <span className="text-white font-medium tabular-nums">{fmtNum(preview.totalPacks)}</span>
                    </div>
                    <div>
                      <span className="text-cage-400">Owner / Box:</span>{' '}
                      <span className="text-green-400 font-medium tabular-nums">{fmt(preview.ownerPerBox)}</span>
                    </div>
                    <div>
                      <span className="text-cage-400">Breaker / Box:</span>{' '}
                      <span className="text-green-400 font-medium tabular-nums">{fmt(preview.breakerPerBox)}</span>
                    </div>
                    <div>
                      <span className="text-cage-400">Owner / Case:</span>{' '}
                      <span className="text-green-400 font-medium tabular-nums">{fmt(preview.ownerPerCase)}</span>
                    </div>
                    <div>
                      <span className="text-cage-400">Breaker / Case:</span>{' '}
                      <span className="text-green-400 font-medium tabular-nums">{fmt(preview.breakerPerCase)}</span>
                    </div>
                    <div>
                      <span className="text-cage-400">Owner / Pack:</span>{' '}
                      <span className="text-green-400 font-medium tabular-nums">{fmt(preview.ownerPerPack)}</span>
                    </div>
                    <div>
                      <span className="text-cage-400">Breaker / Pack:</span>{' '}
                      <span className="text-green-400 font-medium tabular-nums">{fmt(preview.breakerPerPack)}</span>
                    </div>
                    <div>
                      <span className="text-cage-400">Total Investment:</span>{' '}
                      <span className="text-green-400 font-semibold tabular-nums">{fmt(preview.totalInvestment)}</span>
                    </div>
                    <div>
                      <span className="text-cage-400">Total Breaker Value:</span>{' '}
                      {preview.breakerHasValue ? (
                        <span className="text-green-400 font-semibold tabular-nums">{fmt(preview.totalBreakerValue)}</span>
                      ) : (
                        <span className="text-cage-500 font-semibold">TBD</span>
                      )}
                    </div>
                    <div>
                      <span className="text-cage-400">Markup:</span>{' '}
                      {preview.breakerHasValue ? (
                        <span className={`font-semibold tabular-nums ${preview.markup > 0 ? 'text-green-400' : preview.markup < 0 ? 'text-red-400' : 'text-cage-400'}`}>
                          {preview.markup.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-cage-500 font-semibold">--</span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-950 font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {creating ? (
                  <SpinnerIcon className="w-4 h-4" />
                ) : (
                  <PlusIcon className="w-4 h-4" />
                )}
                Add Inventory
              </button>
            </form>
          </section>

          {/* ────────────── Section 2: Stock Summary ────────────────────── */}
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Products in Stock',
                value: fmtNum(stockSummary.distinctProducts),
                sub: 'distinct products',
              },
              {
                label: 'Cases in Stock',
                value: fmtNum(stockSummary.totalCases),
                sub: 'total remaining',
              },
              {
                label: 'Boxes in Stock',
                value: fmtNum(stockSummary.totalBoxes),
                sub: 'total remaining',
              },
              {
                label: 'Total Investment',
                value: fmt(stockSummary.totalInvestment),
                sub: 'owner cost remaining',
                isMoney: true,
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-cage-500 mb-1">
                  {card.label}
                </p>
                <p
                  className={`text-2xl font-bold tabular-nums ${
                    card.isMoney ? 'text-green-400' : 'text-white'
                  }`}
                >
                  {card.value}
                </p>
                <p className="text-xs text-cage-500 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </section>

          {/* ────────────── Section 3: Inventory Lots Table ─────────────── */}
          <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-blood-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="font-heading text-lg font-semibold text-white">
                Inventory Lots
              </h2>
              <input
                type="text"
                value={lotSearch}
                onChange={(e) => setLotSearch(e.target.value)}
                placeholder="Filter by product name..."
                className="w-full sm:w-72 bg-dark-700 border border-cage-600 rounded-lg px-4 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blood-900/40">
                    {['Product', 'Received', 'Cases', 'Boxes', 'Packs', 'Owner $/box', 'Breaker $/box', 'Remaining (C/B/P)', 'Status', 'Actions'].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cage-500 whitespace-nowrap"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cage-700/50">
                  {filteredLots.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-cage-500 text-sm">
                        {lotSearch ? 'No lots match your filter.' : 'No inventory lots found. Add one above.'}
                      </td>
                    </tr>
                  ) : (
                    filteredLots.map((lot) => {
                      const isEditing = editingId === lot.id
                      const isInStock =
                        lot.remainingCases > 0 || lot.remainingBoxes > 0 || lot.remainingPacks > 0

                      return (
                        <tr
                          key={lot.id}
                          className={`hover:bg-dark-700/30 transition-colors ${
                            !isInStock ? 'opacity-50' : ''
                          }`}
                        >
                          {/* Product */}
                          <td className="px-4 py-3 text-sm text-white font-medium max-w-[200px] truncate">
                            {lot.productName || 'Unknown'}
                          </td>

                          {/* Received */}
                          <td className="px-4 py-3 text-sm text-cage-400 tabular-nums whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="date"
                                value={editReceivedDate}
                                onChange={(e) => setEditReceivedDate(e.target.value)}
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-36 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent [color-scheme:dark]"
                              />
                            ) : (
                              lot.receivedDate
                            )}
                          </td>

                          {/* Cases */}
                          <td className="px-4 py-3 text-sm text-cage-400 tabular-nums">
                            {isEditing ? (
                              <input
                                type="number"
                                min="1"
                                value={editCases}
                                onChange={(e) => setEditCases(e.target.value)}
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-16 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent tabular-nums"
                              />
                            ) : (
                              lot.quantityCases
                            )}
                          </td>

                          {/* Boxes */}
                          <td className="px-4 py-3 text-sm text-cage-400 tabular-nums">
                            {isEditing ? (
                              <input
                                type="number"
                                min="1"
                                value={editBoxesPerCase}
                                onChange={(e) => setEditBoxesPerCase(e.target.value)}
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-16 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent tabular-nums"
                              />
                            ) : (
                              lot.totalBoxes
                            )}
                          </td>

                          {/* Packs */}
                          <td className="px-4 py-3 text-sm text-cage-400 tabular-nums">
                            {isEditing ? (
                              <input
                                type="number"
                                min="1"
                                value={editPacksPerBox}
                                onChange={(e) => setEditPacksPerBox(e.target.value)}
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-16 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent tabular-nums"
                              />
                            ) : (
                              lot.totalPacks
                            )}
                          </td>

                          {/* Owner $/box */}
                          <td className="px-4 py-3 text-sm text-green-400 tabular-nums whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editOwnerCostPerBox}
                                onChange={(e) => setEditOwnerCostPerBox(e.target.value)}
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-green-400 w-20 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent tabular-nums"
                              />
                            ) : (
                              fmt(Number(lot.ownerCostPerBox))
                            )}
                          </td>

                          {/* Breaker $/box */}
                          <td className="px-4 py-3 text-sm text-green-400 tabular-nums whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={editBreakerCostPerBox}
                                onChange={(e) => setEditBreakerCostPerBox(e.target.value)}
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-green-400 w-20 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent tabular-nums"
                              />
                            ) : (
                              !lot.breakerCostPerBox || lot.breakerCostPerBox === '0.00'
                                ? <span className="text-cage-500">Not set</span>
                                : fmt(Number(lot.breakerCostPerBox))
                            )}
                          </td>

                          {/* Remaining (C/B/P) */}
                          <td className="px-4 py-3 text-sm text-cage-300 tabular-nums whitespace-nowrap">
                            <span className="text-white font-medium">{lot.remainingCases}c</span>
                            {' / '}
                            <span className="text-white font-medium">{lot.remainingBoxes}b</span>
                            {' / '}
                            <span className="text-white font-medium">{lot.remainingPacks}p</span>
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                isInStock
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-red-500/10 text-red-400'
                              }`}
                            >
                              {isInStock ? 'In Stock' : 'Depleted'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            {isEditing ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleSaveEdit}
                                  disabled={saving}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                >
                                  {saving && <SpinnerIcon className="w-3 h-3" />}
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditing}
                                  disabled={saving}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-cage-400 hover:text-cage-300 hover:bg-cage-500/10"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startEditing(lot)}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                  title="Edit lot"
                                >
                                  <PencilIcon className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(lot)}
                                  disabled={deletingId === lot.id}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                  title="Delete lot"
                                >
                                  {deletingId === lot.id ? (
                                    <SpinnerIcon className="w-3.5 h-3.5" />
                                  ) : (
                                    <TrashIcon className="w-3.5 h-3.5" />
                                  )}
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ────────────── Section 4: Recent Transactions ──────────────── */}
          <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-blood-900/40">
              <h2 className="font-heading text-lg font-semibold text-white">
                Recent Transactions
              </h2>
              <p className="text-xs text-cage-500 mt-0.5">Last 20 inventory movements</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blood-900/40">
                    {['Date', 'Breaker', 'Product', 'Type', 'Unit', 'Qty', 'Cost', 'Notes'].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cage-500 whitespace-nowrap"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cage-700/50">
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-cage-500 text-sm">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="px-4 py-3 text-sm text-cage-400 tabular-nums whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-white font-medium">
                          {tx.userName || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm text-cage-300 max-w-[180px] truncate">
                          {tx.productName || 'Unknown'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                              tx.transactionType === 'sale'
                                ? 'bg-red-500/10 text-red-400'
                                : tx.transactionType === 'return'
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-cage-500/10 text-cage-400'
                            }`}
                          >
                            {tx.transactionType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-cage-400">{tx.unitType}</td>
                        <td className="px-4 py-3 text-sm text-white tabular-nums font-medium">
                          {tx.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-400 tabular-nums whitespace-nowrap">
                          {tx.costPerUnit ? fmt(Number(tx.costPerUnit)) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-cage-500 max-w-[150px] truncate">
                          {tx.notes || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: PRODUCT CATALOG
      ══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'catalog' && (
        <>
          {/* ────────────── Add New Product Form ────────────────────────── */}
          <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl p-6 mb-8">
            <h2 className="font-heading text-lg font-semibold text-white mb-4">
              Add New Product
            </h2>

            {catalogCreateError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{catalogCreateError}</p>
              </div>
            )}

            <form onSubmit={handleCatalogCreate}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="sm:col-span-2 lg:col-span-1">
                  <label htmlFor="cat-name" className="block text-sm font-medium text-cage-300 mb-1.5">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="cat-name"
                    type="text"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    placeholder="e.g. 2025 Panini Prizm UFC"
                    className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="cat-sku" className="block text-sm font-medium text-cage-300 mb-1.5">
                    SKU
                  </label>
                  <input
                    id="cat-sku"
                    type="text"
                    value={newProdSku}
                    onChange={(e) => setNewProdSku(e.target.value)}
                    placeholder="e.g. PAN-PRIZM-UFC-25"
                    className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="cat-street-date" className="block text-sm font-medium text-cage-300 mb-1.5">
                    Street Date
                  </label>
                  <input
                    id="cat-street-date"
                    type="date"
                    value={newProdStreetDate}
                    onChange={(e) => setNewProdStreetDate(e.target.value)}
                    className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label htmlFor="cat-year" className="block text-sm font-medium text-cage-300 mb-1.5">
                    Year
                  </label>
                  <input
                    id="cat-year"
                    type="number"
                    value={newProdYear}
                    onChange={(e) => setNewProdYear(e.target.value)}
                    placeholder="e.g. 2025"
                    min="1900"
                    max="2100"
                    className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm tabular-nums"
                  />
                </div>
                <div>
                  <label htmlFor="cat-manufacturer" className="block text-sm font-medium text-cage-300 mb-1.5">
                    Manufacturer
                  </label>
                  <input
                    id="cat-manufacturer"
                    type="text"
                    value={newProdManufacturer}
                    onChange={(e) => setNewProdManufacturer(e.target.value)}
                    placeholder="e.g. Panini"
                    className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={catalogCreating}
                className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-950 font-semibold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {catalogCreating ? (
                  <SpinnerIcon className="w-4 h-4" />
                ) : (
                  <PlusIcon className="w-4 h-4" />
                )}
                Add Product
              </button>
            </form>
          </section>

          {/* ────────────── Products Table ───────────────────────────────── */}
          <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-blood-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-semibold text-white">Products</h2>
                <p className="text-xs text-cage-500 mt-0.5">{products.length} total products</p>
              </div>
              <input
                type="text"
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                placeholder="Search by name, SKU, or manufacturer..."
                className="w-full sm:w-80 bg-dark-700 border border-cage-600 rounded-lg px-4 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blood-900/40">
                    {['Name', 'SKU', 'Street Date', 'Year', 'Manufacturer', 'Status', 'Actions'].map(
                      (header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cage-500 whitespace-nowrap"
                        >
                          {header}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-cage-700/50">
                  {filteredCatalogProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-cage-500 text-sm">
                        {catalogSearch ? 'No products match your search.' : 'No products found.'}
                      </td>
                    </tr>
                  ) : (
                    filteredCatalogProducts.map((product) => {
                      const isEditing = catalogEditingId === product.id
                      return (
                        <tr
                          key={product.id}
                          className={`hover:bg-dark-700/30 transition-colors ${
                            !product.isActive ? 'opacity-50' : ''
                          }`}
                        >
                          {/* Name */}
                          <td className="px-4 py-3 text-sm text-white font-medium max-w-[200px]">
                            {isEditing ? (
                              <input
                                type="text"
                                value={catalogEditName}
                                onChange={(e) => setCatalogEditName(e.target.value)}
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                              />
                            ) : (
                              <span className="truncate block">{product.name}</span>
                            )}
                          </td>

                          {/* SKU */}
                          <td className="px-4 py-3 text-sm text-cage-400">
                            {isEditing ? (
                              <input
                                type="text"
                                value={catalogEditSku}
                                onChange={(e) => setCatalogEditSku(e.target.value)}
                                placeholder="SKU"
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-32 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                              />
                            ) : (
                              product.sku || <span className="text-cage-600">&mdash;</span>
                            )}
                          </td>

                          {/* Street Date */}
                          <td className="px-4 py-3 text-sm text-cage-400 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="date"
                                value={catalogEditStreetDate}
                                onChange={(e) => setCatalogEditStreetDate(e.target.value)}
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-36 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent [color-scheme:dark]"
                              />
                            ) : (
                              product.streetDate || <span className="text-cage-600">&mdash;</span>
                            )}
                          </td>

                          {/* Year */}
                          <td className="px-4 py-3 text-sm text-cage-400 tabular-nums">
                            {isEditing ? (
                              <input
                                type="number"
                                value={catalogEditYear}
                                onChange={(e) => setCatalogEditYear(e.target.value)}
                                min="1900"
                                max="2100"
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-20 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent tabular-nums"
                              />
                            ) : (
                              product.year || <span className="text-cage-600">&mdash;</span>
                            )}
                          </td>

                          {/* Manufacturer */}
                          <td className="px-4 py-3 text-sm text-cage-400">
                            {isEditing ? (
                              <input
                                type="text"
                                value={catalogEditManufacturer}
                                onChange={(e) => setCatalogEditManufacturer(e.target.value)}
                                placeholder="Manufacturer"
                                className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-28 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                              />
                            ) : (
                              product.manufacturer || <span className="text-cage-600">&mdash;</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                product.isActive
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-dark-700 text-cage-400'
                              }`}
                            >
                              {product.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            {isEditing ? (
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleCatalogSaveEdit}
                                  disabled={catalogSaving}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                >
                                  {catalogSaving ? <SpinnerIcon className="w-3 h-3" /> : null}
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelCatalogEdit}
                                  disabled={catalogSaving}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-cage-400 hover:text-cage-300 hover:bg-cage-500/10"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => startCatalogEdit(product)}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                                >
                                  <PencilIcon className="w-3.5 h-3.5" />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCatalogToggleActive(product)}
                                  disabled={catalogTogglingId === product.id}
                                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                    product.isActive
                                      ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10'
                                      : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                                  }`}
                                >
                                  {catalogTogglingId === product.id ? (
                                    <SpinnerIcon className="w-3.5 h-3.5" />
                                  ) : null}
                                  {product.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCatalogDelete(product)}
                                  disabled={catalogDeletingId === product.id}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  {catalogDeletingId === product.id ? (
                                    <SpinnerIcon className="w-3.5 h-3.5" />
                                  ) : (
                                    <TrashIcon className="w-3.5 h-3.5" />
                                  )}
                                  Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
