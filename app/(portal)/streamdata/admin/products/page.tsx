// Product management — view all products, add new, toggle active/inactive
'use client'

import { useState, useEffect, useCallback } from 'react'

/* ---------- types ---------- */

interface Product {
  id: string
  name: string
  manufacturer: string | null
  year: number | null
  isActive: boolean
  createdAt: string
}

/* ---------- icons ---------- */

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
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

/* ---------- component ---------- */

export default function ProductManagementPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // New product form
  const [newName, setNewName] = useState('')
  const [newManufacturer, setNewManufacturer] = useState('')
  const [newYear, setNewYear] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Toggling state tracker
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editManufacturer, setEditManufacturer] = useState('')
  const [editYear, setEditYear] = useState('')
  const [saving, setSaving] = useState(false)

  // Deleting state tracker
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Search / filter
  const [search, setSearch] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/streamdata/admin/products')
      if (!res.ok) throw new Error('Failed to load products')
      const data = await res.json()
      setProducts(data.products ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) {
      setCreateError('Product name is required.')
      return
    }

    setCreating(true)
    setCreateError(null)

    try {
      const trimmedName = newName.trim()
      const trimmedManufacturer = newManufacturer.trim()
      const body: { name: string; manufacturer?: string; year?: number } = {
        name: trimmedName,
      }
      if (trimmedManufacturer) body.manufacturer = trimmedManufacturer
      let yr: number | undefined
      if (newYear) {
        yr = parseInt(newYear, 10)
        if (isNaN(yr) || yr < 1900 || yr > 2100) {
          setCreateError('Year must be between 1900 and 2100.')
          setCreating(false)
          return
        }
        body.year = yr
      }

      // Auto-prefix name with year and manufacturer if not already present
      if (yr && trimmedManufacturer && !trimmedName.startsWith(String(yr))) {
        body.name = `${yr} ${trimmedManufacturer} ${trimmedName}`
      } else if (yr && !trimmedManufacturer && !trimmedName.startsWith(String(yr))) {
        body.name = `${yr} ${trimmedName}`
      }

      const res = await fetch('/api/streamdata/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Create failed (${res.status})`)
      }

      // Reset form and reload
      setNewName('')
      setNewManufacturer('')
      setNewYear('')
      await fetchProducts()
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create product')
    } finally {
      setCreating(false)
    }
  }

  const handleToggleActive = async (product: Product) => {
    setTogglingId(product.id)
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

      // Update local state
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle product')
    } finally {
      setTogglingId(null)
    }
  }

  const startEditing = (product: Product) => {
    setEditingId(product.id)
    setEditName(product.name)
    setEditManufacturer(product.manufacturer ?? '')
    setEditYear(product.year ? String(product.year) : '')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditName('')
    setEditManufacturer('')
    setEditYear('')
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editName.trim()) return

    setSaving(true)
    try {
      const body: { id: string; name: string; manufacturer?: string; year?: number } = {
        id: editingId,
        name: editName.trim(),
      }
      if (editManufacturer.trim()) body.manufacturer = editManufacturer.trim()
      if (editYear) {
        const yr = parseInt(editYear, 10)
        if (isNaN(yr) || yr < 1900 || yr > 2100) {
          setError('Year must be between 1900 and 2100.')
          setSaving(false)
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

      cancelEditing()
      await fetchProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return

    setDeletingId(product.id)
    try {
      const res = await fetch('/api/streamdata/admin/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }

      setProducts((prev) => prev.filter((p) => p.id !== product.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product')
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.manufacturer && p.manufacturer.toLowerCase().includes(search.toLowerCase()))
  )

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-heading text-3xl font-bold text-white tracking-tight mb-2">
          Products
        </h1>
        <p className="text-cage-400 text-sm mb-8">Loading products...</p>
        <div className="flex items-center justify-center py-16">
          <SpinnerIcon className="w-8 h-8 text-gold-500" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-white tracking-tight">
          Products
        </h1>
        <p className="mt-1 text-cage-400 text-sm">
          Manage the product catalog. {products.length} total products.
        </p>
      </div>

      {/* Error banner */}
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

      {/* Add Product Form */}
      <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl p-6 mb-8">
        <h2 className="font-heading text-lg font-semibold text-white mb-4">
          Add New Product
        </h2>

        {createError && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{createError}</p>
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-cage-300 mb-1.5">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              id="product-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. 2024 Panini Prizm UFC"
              className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm"
            />
          </div>
          <div>
            <label htmlFor="product-manufacturer" className="block text-sm font-medium text-cage-300 mb-1.5">
              Manufacturer
            </label>
            <input
              id="product-manufacturer"
              type="text"
              value={newManufacturer}
              onChange={(e) => setNewManufacturer(e.target.value)}
              placeholder="e.g. Panini"
              className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm"
            />
          </div>
          <div>
            <label htmlFor="product-year" className="block text-sm font-medium text-cage-300 mb-1.5">
              Year
            </label>
            <input
              id="product-year"
              type="number"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
              placeholder="e.g. 2024"
              min="1900"
              max="2100"
              className="w-full bg-dark-700 border border-cage-600 rounded-lg px-4 py-2.5 text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow text-sm tabular-nums"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-gray-950 font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm h-[42px]"
          >
            {creating ? (
              <SpinnerIcon className="w-4 h-4" />
            ) : (
              <PlusIcon className="w-4 h-4" />
            )}
            Add Product
          </button>
        </form>
      </section>

      {/* Product Table */}
      <section className="bg-black/60 backdrop-blur-md border border-blood-900/40 rounded-xl overflow-hidden">
        {/* Search bar */}
        <div className="px-6 py-4 border-b border-blood-900/40">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or manufacturer..."
            className="w-full sm:w-80 bg-dark-700 border border-cage-600 rounded-lg px-4 py-2 text-sm text-white placeholder-cage-400 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent transition-shadow"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-blood-900/40">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cage-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cage-500">
                  Manufacturer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cage-500">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-cage-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-cage-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cage-700/50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-cage-500 text-sm">
                    {search ? 'No products match your search.' : 'No products found.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isEditing = editingId === product.id

                  return (
                    <tr
                      key={product.id}
                      className={`hover:bg-dark-700/30 transition-colors ${
                        !product.isActive ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="px-6 py-3 text-sm text-white font-medium">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          />
                        ) : (
                          product.name
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-cage-400">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editManufacturer}
                            onChange={(e) => setEditManufacturer(e.target.value)}
                            className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-full focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent"
                          />
                        ) : (
                          product.manufacturer || '\u2014'
                        )}
                      </td>
                      <td className="px-6 py-3 text-sm text-cage-400 tabular-nums">
                        {isEditing ? (
                          <input
                            type="number"
                            value={editYear}
                            onChange={(e) => setEditYear(e.target.value)}
                            min="1900"
                            max="2100"
                            className="bg-dark-700 border border-cage-600 rounded px-2 py-1 text-sm text-white w-20 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent tabular-nums"
                          />
                        ) : (
                          product.year || '\u2014'
                        )}
                      </td>
                      <td className="px-6 py-3">
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
                      <td className="px-6 py-3 text-right">
                        {isEditing ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              disabled={saving}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            >
                              {saving ? <SpinnerIcon className="w-3 h-3" /> : null}
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
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEditing(product)}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleActive(product)}
                              disabled={togglingId === product.id}
                              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                product.isActive
                                  ? 'text-red-400 hover:bg-red-500/10'
                                  : 'text-green-400 hover:bg-green-500/10'
                              }`}
                            >
                              {togglingId === product.id ? (
                                <SpinnerIcon className="w-3 h-3" />
                              ) : null}
                              {product.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(product)}
                              disabled={deletingId === product.id}
                              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              {deletingId === product.id ? (
                                <SpinnerIcon className="w-3 h-3" />
                              ) : null}
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
    </div>
  )
}
