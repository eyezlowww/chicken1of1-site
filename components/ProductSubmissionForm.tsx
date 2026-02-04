'use client'

import { useState, useMemo } from 'react'
import mmaProducts from '@/content/mma-products.json'

const FORMATS = [
  { value: 'hobby-box', label: 'Hobby Box' },
  { value: 'retail', label: 'Retail' },
  { value: 'blaster', label: 'Blaster' },
  { value: 'mega', label: 'Mega' },
  { value: 'case', label: 'Case' },
]

interface ProductItem {
  year: string
  product: string
  format: string
  quantity: number
  boxesPerCase: number | null
}

interface FormData {
  products: ProductItem[]
  condition: string
  priceExpectation: string
  notes: string
  name: string
  email: string
  phone: string
  preferredContact: string
  instagram: string
}

const EMPTY_PRODUCT: ProductItem = { year: '', product: '', format: 'hobby-box', quantity: 1, boxesPerCase: null }

export default function ProductSubmissionForm() {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<FormData>({
    products: [{ ...EMPTY_PRODUCT }],
    condition: 'factory-sealed',
    priceExpectation: '',
    notes: '',
    name: '',
    email: '',
    phone: '',
    preferredContact: 'email',
    instagram: '',
  })

  // Get unique years sorted descending (newest first)
  const years = useMemo(() => {
    const uniqueYears = Array.from(new Set(mmaProducts.products.map((p) => p.year)))
    return uniqueYears.sort((a, b) => b - a)
  }, [])

  // Get products filtered by selected year
  const getProductsForYear = (year: string) => {
    if (!year) return []
    return mmaProducts.products.filter((p) => p.year === parseInt(year))
  }

  const addProduct = () => {
    setFormData({
      ...formData,
      products: [...formData.products, { ...EMPTY_PRODUCT }],
    })
  }

  const removeProduct = (index: number) => {
    setFormData({
      ...formData,
      products: formData.products.filter((_, i) => i !== index),
    })
  }

  const updateProduct = (index: number, field: keyof ProductItem, value: string | number | null) => {
    const updated = [...formData.products]
    if (field === 'year') {
      // Reset product when year changes
      updated[index] = { ...updated[index], year: value as string, product: '' }
    } else if (field === 'format') {
      // Reset boxesPerCase when format changes away from case
      updated[index] = {
        ...updated[index],
        format: value as string,
        boxesPerCase: value === 'case' ? updated[index].boxesPerCase : null,
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    setFormData({ ...formData, products: updated })
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/sell-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSubmitted(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="octagon-border w-24 h-24 bg-gold-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-heading text-3xl font-bold text-white uppercase mb-4">Submission Received!</h3>
        <p className="text-cage-300 text-lg mb-2">We will review your products and reach out within 24 hours.</p>
        <p className="text-cage-400 mb-8">Check your email for a confirmation.</p>
        <button
          onClick={() => {
            setSubmitted(false)
            setStep(1)
            setFormData({
              products: [{ ...EMPTY_PRODUCT }],
              condition: 'factory-sealed',
              priceExpectation: '',
              notes: '',
              name: '',
              email: '',
              phone: '',
              preferredContact: 'email',
              instagram: '',
            })
          }}
          className="btn-outline"
        >
          Submit Another
        </button>
      </div>
    )
  }

  return (
    <div className="bg-dark-800 rounded-xl border border-cage-700 p-6 md:p-8">
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-8 mb-8">
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => s < step && setStep(s)}
            className={`w-10 h-10 rounded-full flex items-center justify-center font-heading text-sm font-bold border-2 transition-all ${
              s === step
                ? 'bg-gold-500 text-dark-950 border-gold-400'
                : s < step
                ? 'bg-gold-500/20 text-gold-400 border-gold-500/50 cursor-pointer'
                : 'bg-dark-700 text-cage-500 border-cage-600'
            }`}
            aria-label={`Step ${s}${s === step ? ' (current)' : s < step ? ' (completed)' : ''}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Step 1: Products */}
      {step === 1 && (
        <div>
          <h3 className="font-heading text-xl font-bold text-white uppercase tracking-wide mb-6">
            What Are You Selling?
          </h3>
          {formData.products.map((item, index) => (
            <div key={index} className="mb-4 p-4 bg-dark-900 rounded-lg border border-cage-700">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Year Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-xs text-cage-400 mb-1">Year</label>
                  <select
                    value={item.year}
                    onChange={(e) => updateProduct(index, 'year', e.target.value)}
                    className="input"
                    aria-label={`Year for product ${index + 1}`}
                  >
                    <option value="">Year...</option>
                    {years.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                {/* Product Dropdown (filtered by year) */}
                <div className="md:col-span-4">
                  <label className="block text-xs text-cage-400 mb-1">Product</label>
                  <select
                    value={item.product}
                    onChange={(e) => updateProduct(index, 'product', e.target.value)}
                    className="input"
                    disabled={!item.year}
                    aria-label={`Product ${index + 1}`}
                  >
                    <option value="">{item.year ? 'Select a product...' : 'Select year first...'}</option>
                    {getProductsForYear(item.year).map((p) => (
                      <option key={p.name} value={p.name}>{p.name}</option>
                    ))}
                    <option value="other">Other (describe in notes)</option>
                  </select>
                </div>

                {/* Format Dropdown */}
                <div className="md:col-span-2">
                  <label className="block text-xs text-cage-400 mb-1">Format</label>
                  <select
                    value={item.format}
                    onChange={(e) => updateProduct(index, 'format', e.target.value)}
                    className="input"
                    aria-label={`Format for product ${index + 1}`}
                  >
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <label className="block text-xs text-cage-400 mb-1">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="input"
                    aria-label={`Quantity for product ${index + 1}`}
                  />
                </div>

                {/* Remove Button */}
                <div className="md:col-span-2 flex items-end">
                  {formData.products.length > 1 && (
                    <button
                      onClick={() => removeProduct(index)}
                      className="w-full px-3 py-2 bg-blood-600/20 text-blood-400 rounded-lg hover:bg-blood-600/30 transition-colors text-sm"
                      aria-label={`Remove product ${index + 1}`}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Boxes Per Case popup (inline) */}
              {item.format === 'case' && (
                <div className="mt-3 p-3 bg-gold-500/5 border border-gold-500/20 rounded-lg">
                  <label className="block text-xs text-gold-400 mb-1 font-medium">
                    How many boxes per case?
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.boxesPerCase || ''}
                    onChange={(e) => updateProduct(index, 'boxesPerCase', parseInt(e.target.value) || null)}
                    placeholder="e.g. 12"
                    className="input w-32"
                    aria-label={`Boxes per case for product ${index + 1}`}
                  />
                </div>
              )}
            </div>
          ))}
          <button onClick={addProduct} className="btn-outline text-sm mb-8">
            + Add Another Product
          </button>
          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!formData.products.some(p => p.product)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Condition & Expectations */}
      {step === 2 && (
        <div>
          <h3 className="font-heading text-xl font-bold text-white uppercase tracking-wide mb-6">
            Condition & Expectations
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-cage-300 mb-3">Condition</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: 'factory-sealed', label: 'Factory Sealed', desc: 'Untouched, original wrap' },
                  { value: 'minor-wear', label: 'Minor Wear', desc: 'Light shelf wear, still sealed' },
                  { value: 'damaged', label: 'Damaged', desc: 'Dents, tears, or opened' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFormData({ ...formData, condition: opt.value })}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      formData.condition === opt.value
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-cage-700 bg-dark-900 hover:border-cage-500'
                    }`}
                    aria-pressed={formData.condition === opt.value}
                  >
                    <div className="font-bold text-white text-sm">{opt.label}</div>
                    <div className="text-xs text-cage-400 mt-1">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="priceExpectation" className="block text-sm font-medium text-cage-300 mb-2">
                What are you looking to get? (optional)
              </label>
              <input
                id="priceExpectation"
                type="text"
                value={formData.priceExpectation}
                onChange={(e) => setFormData({ ...formData, priceExpectation: e.target.value })}
                placeholder="e.g. $500 for the lot, or $100 per box"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-cage-300 mb-2">
                Additional Notes (optional)
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                placeholder="Anything else we should know about the products..."
                className="input"
              />
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button onClick={() => setStep(3)} className="btn-primary">Next Step</button>
          </div>
        </div>
      )}

      {/* Step 3: Contact Info */}
      {step === 3 && (
        <div>
          <h3 className="font-heading text-xl font-bold text-white uppercase tracking-wide mb-6">
            Your Contact Info
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-cage-300 mb-2">Name *</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-cage-300 mb-2">Email *</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-cage-300 mb-2">Phone (optional)</label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="instagram" className="block text-sm font-medium text-cage-300 mb-2">Instagram Handle (optional)</label>
                <input
                  id="instagram"
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  placeholder="@username"
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-cage-300 mb-2">Preferred Contact Method</label>
              <div className="flex gap-3" role="group" aria-label="Preferred contact method">
                {['email', 'phone', 'instagram'].map((m) => (
                  <button
                    key={m}
                    onClick={() => setFormData({ ...formData, preferredContact: m })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.preferredContact === m
                        ? 'bg-gold-500 text-dark-950'
                        : 'bg-dark-900 text-cage-300 border border-cage-700 hover:border-cage-500'
                    }`}
                    aria-pressed={formData.preferredContact === m}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-blood-600/20 border border-blood-600 rounded-lg text-blood-400 text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="flex justify-between mt-8">
            <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.name || !formData.email}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
