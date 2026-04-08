'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ─── Types ──────────────────────────────────────────────────────────────

interface ImportResult {
  imported: number
  duplicates: number
  total: number
  dateRange?: { start: string; end: string }
}

interface FCProOrder {
  orderDate: string
  productName: string
  quantity: number
  totalCost: number
  sku?: string
}

interface SKUOption {
  productName: string
  casesPurchased: number
  totalCost: number
}

interface WeekData {
  casesBroken: string
  avgCaseSalePrice: string
}

interface ReportData {
  // Breaker Information
  breakerName: string
  breakerAccountSTK: string
  email: string
  // Topps Direct Data Collection
  product: string
  productType: string
  existingInventory: string
  totalCasesPurchased: string
  totalCasesBroken: string
  totalCasesRemaining: string
  weeks: WeekData[]
  avgCaseSalePriceFullMonth: string
  breakType: string[]
  breakPlatform: string[]
  avgBreakDuration: string
  daysToSellOut: string
  // Distributor Data
  distributorCases: string
  distributorPrice: string
}

type FieldSource = 'auto' | 'review' | 'manual'

interface FieldMeta {
  source: FieldSource
  label: string
}

// ─── Constants ──────────────────────────────────────────────────────────

const PRODUCT_TYPES = [
  'Hobby', 'Jumbo', 'Breakers Delight', 'Sapphire', 'Hat Trick',
  'Mega', 'Qualifying Lap', 'Compact', 'Mania', 'Super Jumbo',
  'Ginter X', 'FDI',
]

const BREAK_TYPES = [
  'Pick Your Player', 'Pick Your Team', 'Random', 'Mixers',
  'Serial Number', 'Personal', 'Other',
]

const BREAK_PLATFORMS = [
  'Fanatics Live', 'Whatnot', 'Tiktok', 'Ebay Live', 'Loupe',
  'Youtube', 'Facebook', 'Other', 'District',
]

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const STORAGE_KEY = 'fanatics-report-breaker-info'

// ─── Helpers ────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

function inferProductType(name: string): string {
  const lower = name.toLowerCase()
  for (const type of PRODUCT_TYPES) {
    if (lower.includes(type.toLowerCase())) return type
  }
  return ''
}

function getPreviousMonth(): { month: number; year: number } {
  const now = new Date()
  const m = now.getMonth() // 0-indexed
  if (m === 0) return { month: 11, year: now.getFullYear() - 1 }
  return { month: m - 1, year: now.getFullYear() }
}

// ─── Sub-Components ─────────────────────────────────────────────────────

function StatusDot({ source }: { source: FieldSource }) {
  const colors: Record<FieldSource, string> = {
    auto: 'bg-emerald-500',
    review: 'bg-yellow-500',
    manual: 'bg-red-500',
  }
  const titles: Record<FieldSource, string> = {
    auto: 'Auto-filled from data',
    review: 'Needs review (calculated or fuzzy match)',
    manual: 'Manual entry required',
  }
  return (
    <span
      className={`inline-block h-2 w-2 flex-shrink-0 rounded-full ${colors[source]}`}
      title={titles[source]}
      aria-label={titles[source]}
    />
  )
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center gap-2" role="navigation" aria-label="Report generation steps">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1
        const isActive = step === current
        const isComplete = step < current
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-gold-500 text-black'
                  : isComplete
                    ? 'bg-gold-500/20 text-gold-400'
                    : 'bg-dark-700 text-cage-500'
              }`}
              aria-current={isActive ? 'step' : undefined}
            >
              {isComplete ? (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < total && (
              <div className={`h-0.5 w-8 sm:w-12 ${step < current ? 'bg-gold-500/40' : 'bg-dark-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function MultiSelectPills({
  options,
  selected,
  onChange,
}: {
  options: string[]
  selected: string[]
  onChange: (val: string[]) => void
}) {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt))
    } else {
      onChange([...selected, opt])
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-gold-500/20 text-gold-400 ring-1 ring-gold-500/40'
                : 'bg-dark-700 text-cage-400 hover:bg-dark-600 hover:text-cage-300'
            }`}
            aria-pressed={isSelected}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────────────

export default function FanaticsReportPage() {
  // Step management
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1 — FC Pro Import
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [importError, setImportError] = useState('')
  const [recentOrders, setRecentOrders] = useState<FCProOrder[]>([])
  const [isDragging, setIsDragging] = useState(false)

  // Step 2 — Month & SKU
  const prev = getPreviousMonth()
  const [selectedMonth, setSelectedMonth] = useState(prev.month)
  const [selectedYear, setSelectedYear] = useState(prev.year)
  const [skus, setSkus] = useState<SKUOption[]>([])
  const [loadingSkus, setLoadingSkus] = useState(false)
  const [selectedSku, setSelectedSku] = useState<SKUOption | null>(null)

  // Step 3 — Report Data
  const [report, setReport] = useState<ReportData | null>(null)
  const [fieldMeta, setFieldMeta] = useState<Record<string, FieldMeta>>({})
  const [loadingReport, setLoadingReport] = useState(false)
  const [copied, setCopied] = useState(false)

  // ── Persist breaker info across SKU changes ───────────────────────────

  const [breakerInfo, setBreakerInfo] = useState({
    breakerName: '',
    breakerAccountSTK: '',
    email: '',
  })

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setBreakerInfo(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(breakerInfo))
    } catch {
      // ignore
    }
  }, [breakerInfo])

  // Sync breaker info into report when report changes
  useEffect(() => {
    if (report) {
      setReport((prev) =>
        prev
          ? {
              ...prev,
              breakerName: breakerInfo.breakerName || prev.breakerName,
              breakerAccountSTK: breakerInfo.breakerAccountSTK || prev.breakerAccountSTK,
              email: breakerInfo.email || prev.email,
            }
          : prev
      )
    }
    // Only run when breakerInfo changes, not report
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakerInfo])

  // ── Step 1: Import ────────────────────────────────────────────────────

  const handleFileSelect = useCallback((file: File) => {
    if (file && file.name.endsWith('.csv')) {
      setImportFile(file)
      setImportError('')
    } else {
      setImportError('Please select a CSV file')
    }
  }, [])

  const handleImport = useCallback(async () => {
    if (!importFile) return
    setImporting(true)
    setImportError('')
    try {
      const text = await importFile.text()
      const res = await fetch('/api/streamdata/fanatics/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv: text }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Import failed' }))
        throw new Error(err.error || 'Import failed')
      }
      const data = await res.json()
      setImportResult(data)
      setRecentOrders(data.recentOrders || [])
      setCurrentStep(2)
    } catch (err: any) {
      setImportError(err.message || 'Failed to import CSV')
    } finally {
      setImporting(false)
    }
  }, [importFile])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  // ── Step 2: Fetch SKUs ────────────────────────────────────────────────

  useEffect(() => {
    if (currentStep < 2) return
    setLoadingSkus(true)
    setSkus([])
    setSelectedSku(null)
    fetch(`/api/streamdata/fanatics/skus?month=${selectedMonth + 1}&year=${selectedYear}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch SKUs')
        return res.json()
      })
      .then((data) => setSkus(data.skus || []))
      .catch(() => setSkus([]))
      .finally(() => setLoadingSkus(false))
  }, [currentStep, selectedMonth, selectedYear])

  // ── Step 3: Generate Report ───────────────────────────────────────────

  const handleGenerateReport = useCallback(
    async (sku: SKUOption) => {
      setSelectedSku(sku)
      setLoadingReport(true)
      setCurrentStep(3)
      try {
        const res = await fetch('/api/streamdata/fanatics/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            month: selectedMonth + 1,
            year: selectedYear,
            productName: sku.productName,
          }),
        })
        if (!res.ok) throw new Error('Failed to generate report')
        const data = await res.json()

        const inferredType = inferProductType(sku.productName)
        const autoWeeks: WeekData[] = (data.weeks || [{ casesBroken: '', avgCaseSalePrice: '' }, { casesBroken: '', avgCaseSalePrice: '' }, { casesBroken: '', avgCaseSalePrice: '' }, { casesBroken: '', avgCaseSalePrice: '' }]).map(
          (w: any) => ({
            casesBroken: w.casesBroken?.toString() || '',
            avgCaseSalePrice: w.avgCaseSalePrice?.toString() || '',
          })
        )
        // Ensure 4 weeks
        while (autoWeeks.length < 4) {
          autoWeeks.push({ casesBroken: '', avgCaseSalePrice: '' })
        }

        const newReport: ReportData = {
          breakerName: breakerInfo.breakerName || data.breakerName || '',
          breakerAccountSTK: breakerInfo.breakerAccountSTK || data.breakerAccountSTK || '',
          email: breakerInfo.email || data.email || '',
          product: data.product || sku.productName,
          productType: data.productType || inferredType,
          existingInventory: data.existingInventory?.toString() || '',
          totalCasesPurchased: data.totalCasesPurchased?.toString() || sku.casesPurchased.toString(),
          totalCasesBroken: data.totalCasesBroken?.toString() || '',
          totalCasesRemaining: data.totalCasesRemaining?.toString() || '',
          weeks: autoWeeks,
          avgCaseSalePriceFullMonth: data.avgCaseSalePriceFullMonth?.toString() || '',
          breakType: data.breakType || [],
          breakPlatform: data.breakPlatform || [],
          avgBreakDuration: data.avgBreakDuration?.toString() || '',
          daysToSellOut: data.daysToSellOut?.toString() || '',
          distributorCases: '',
          distributorPrice: '',
        }

        // Build field metadata
        const meta: Record<string, FieldMeta> = {}
        const setMeta = (key: string, label: string, val: any, isCalc = false) => {
          if (val !== undefined && val !== null && val !== '' && val !== 0) {
            meta[key] = { source: isCalc ? 'review' : 'auto', label }
          } else {
            meta[key] = { source: 'manual', label }
          }
        }
        setMeta('product', 'Product', data.product || sku.productName)
        setMeta('productType', 'Product Type', data.productType || inferredType, !data.productType && !!inferredType)
        setMeta('existingInventory', 'Existing Inventory', data.existingInventory)
        setMeta('totalCasesPurchased', 'Cases Purchased', data.totalCasesPurchased || sku.casesPurchased)
        setMeta('totalCasesBroken', 'Cases Broken', data.totalCasesBroken)
        setMeta('totalCasesRemaining', 'Cases Remaining', data.totalCasesRemaining, true)
        for (let i = 0; i < 4; i++) {
          setMeta(`week${i}_cases`, `Week ${i + 1} Cases`, autoWeeks[i]?.casesBroken)
          setMeta(`week${i}_price`, `Week ${i + 1} Avg Price`, autoWeeks[i]?.avgCaseSalePrice)
        }
        setMeta('avgCaseSalePriceFullMonth', 'Avg Case Sale Price (Month)', data.avgCaseSalePriceFullMonth, true)
        setMeta('breakType', 'Break Type', data.breakType?.length ? data.breakType : null)
        setMeta('breakPlatform', 'Break Platform', data.breakPlatform?.length ? data.breakPlatform : null)
        setMeta('avgBreakDuration', 'Avg Break Duration', data.avgBreakDuration)
        setMeta('daysToSellOut', 'Days to Sell Out', data.daysToSellOut, true)
        meta['distributorCases'] = { source: 'manual', label: 'Distributor Cases' }
        meta['distributorPrice'] = { source: 'manual', label: 'Distributor Price' }
        meta['breakerName'] = { source: breakerInfo.breakerName ? 'auto' : 'manual', label: 'Breaker Name' }
        meta['breakerAccountSTK'] = { source: breakerInfo.breakerAccountSTK ? 'auto' : 'manual', label: 'Breaker STK' }
        meta['email'] = { source: breakerInfo.email ? 'auto' : 'manual', label: 'Email' }

        setFieldMeta(meta)
        setReport(newReport)
      } catch {
        setReport(null)
        setFieldMeta({})
      } finally {
        setLoadingReport(false)
      }
    },
    [selectedMonth, selectedYear, breakerInfo]
  )

  // ── Auto-calculate full month avg + remaining ─────────────────────────

  useEffect(() => {
    if (!report) return
    const weeks = report.weeks
    let totalCases = 0
    let weightedSum = 0
    for (const w of weeks) {
      const c = parseFloat(w.casesBroken) || 0
      const p = parseFloat(w.avgCaseSalePrice) || 0
      totalCases += c
      weightedSum += c * p
    }
    const avgPrice = totalCases > 0 ? (weightedSum / totalCases).toFixed(2) : ''
    const purchased = parseFloat(report.totalCasesPurchased) || 0
    const existing = parseFloat(report.existingInventory) || 0
    const broken = parseFloat(report.totalCasesBroken) || totalCases
    const remaining = (existing + purchased - broken).toString()

    setReport((prev) => {
      if (!prev) return prev
      const updated = { ...prev }
      if (totalCases > 0) {
        updated.avgCaseSalePriceFullMonth = avgPrice
        updated.totalCasesBroken = broken.toString()
        updated.totalCasesRemaining = remaining
      }
      return updated
    })
    // Only recalc when weeks data changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [report?.weeks])

  // ── Data Completeness ─────────────────────────────────────────────────

  const completeness = useMemo(() => {
    const entries = Object.values(fieldMeta)
    if (entries.length === 0) return { percent: 0, autoCount: 0, manualCount: 0 }
    const autoCount = entries.filter((e) => e.source === 'auto' || e.source === 'review').length
    const manualCount = entries.filter((e) => e.source === 'manual').length
    return {
      percent: Math.round((autoCount / entries.length) * 100),
      autoCount,
      manualCount,
    }
  }, [fieldMeta])

  // ── Update report field ───────────────────────────────────────────────

  const updateField = useCallback((key: keyof ReportData, value: any) => {
    setReport((prev) => (prev ? { ...prev, [key]: value } : prev))
    // Also persist breaker info
    if (key === 'breakerName' || key === 'breakerAccountSTK' || key === 'email') {
      setBreakerInfo((prev) => ({ ...prev, [key]: value }))
    }
  }, [])

  const updateWeek = useCallback((index: number, field: keyof WeekData, value: string) => {
    setReport((prev) => {
      if (!prev) return prev
      const weeks = [...prev.weeks]
      weeks[index] = { ...weeks[index], [field]: value }
      return { ...prev, weeks }
    })
  }, [])

  // ── Export: Copy All Fields ───────────────────────────────────────────

  const copyAllFields = useCallback(() => {
    if (!report) return
    const lines: string[] = [
      `Breaker Name: ${report.breakerName}`,
      `Breaker Account STK: ${report.breakerAccountSTK}`,
      `Email: ${report.email}`,
      `Product: ${report.product}`,
      `Product Type: ${report.productType}`,
      `Existing Inventory Prior to This Month: ${report.existingInventory}`,
      `Total Cases Purchased This Month: ${report.totalCasesPurchased}`,
      `Total Cases Broken This Month: ${report.totalCasesBroken}`,
      `Total Cases Remaining in Inventory: ${report.totalCasesRemaining}`,
    ]
    report.weeks.forEach((w, i) => {
      lines.push(`Cases Broken - Week ${i + 1}: ${w.casesBroken}`)
      lines.push(`Average Case Sale Price - Week ${i + 1}: ${w.avgCaseSalePrice}`)
    })
    lines.push(
      `Average Case Sale Price - Full Month: ${report.avgCaseSalePriceFullMonth}`,
      `Break Type: ${report.breakType.join(', ')}`,
      `Break Platform: ${report.breakPlatform.join(', ')}`,
      `Average Break Duration (min): ${report.avgBreakDuration}`,
      `Days to Sell Out: ${report.daysToSellOut}`,
      `Distributor Cases: ${report.distributorCases}`,
      `Distributor Price: ${report.distributorPrice}`
    )
    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [report])

  // ── Export: CSV ───────────────────────────────────────────────────────

  const exportCSV = useCallback(() => {
    if (!report) return
    const headers = [
      'Breaker Name', 'Breaker Account STK', 'Email', 'Product', 'Product Type',
      'Existing Inventory', 'Total Cases Purchased', 'Total Cases Broken',
      'Total Cases Remaining',
      'Cases Broken - Week 1', 'Avg Case Sale Price - Week 1',
      'Cases Broken - Week 2', 'Avg Case Sale Price - Week 2',
      'Cases Broken - Week 3', 'Avg Case Sale Price - Week 3',
      'Cases Broken - Week 4', 'Avg Case Sale Price - Week 4',
      'Avg Case Sale Price - Full Month', 'Break Type', 'Break Platform',
      'Avg Break Duration (min)', 'Days to Sell Out',
      'Distributor Cases', 'Distributor Price',
    ]
    const values = [
      report.breakerName, report.breakerAccountSTK, report.email,
      report.product, report.productType, report.existingInventory,
      report.totalCasesPurchased, report.totalCasesBroken,
      report.totalCasesRemaining,
      report.weeks[0]?.casesBroken || '', report.weeks[0]?.avgCaseSalePrice || '',
      report.weeks[1]?.casesBroken || '', report.weeks[1]?.avgCaseSalePrice || '',
      report.weeks[2]?.casesBroken || '', report.weeks[2]?.avgCaseSalePrice || '',
      report.weeks[3]?.casesBroken || '', report.weeks[3]?.avgCaseSalePrice || '',
      report.avgCaseSalePriceFullMonth,
      report.breakType.join('; '), report.breakPlatform.join('; '),
      report.avgBreakDuration, report.daysToSellOut,
      report.distributorCases, report.distributorPrice,
    ]
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    const csv = [headers.map(escape).join(','), values.map(escape).join(',')].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fanatics-report-${MONTH_NAMES[selectedMonth]}-${selectedYear}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [report, selectedMonth, selectedYear])

  // ── Reset to Step 2 ──────────────────────────────────────────────────

  const startNewReport = useCallback(() => {
    setSelectedSku(null)
    setReport(null)
    setFieldMeta({})
    setCurrentStep(2)
  }, [])

  // ── Year range for dropdown ───────────────────────────────────────────

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear()
    return [current - 1, current, current + 1]
  }, [])

  // ── Field border helper ───────────────────────────────────────────────

  const fieldBorder = (key: string) => {
    const meta = fieldMeta[key]
    if (!meta) return 'border-cage-600'
    if (meta.source === 'auto') return 'border-l-emerald-500 border-l-2 border-cage-600'
    if (meta.source === 'review') return 'border-l-yellow-500 border-l-2 border-cage-600'
    return 'border-l-red-500 border-l-2 border-cage-600'
  }

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Fanatics Monthly Report</h1>
        <p className="mt-1 text-sm text-cage-400">
          Generate your mandatory Topps Direct data collection form
        </p>
      </div>

      <StepIndicator current={currentStep} total={3} />

      {/* ── STEP 1: FC Pro Import ──────────────────────────────────────── */}
      {currentStep === 1 && (
        <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
          <h2 className="mb-4 text-lg font-semibold text-white">Import FC Pro Orders</h2>
          <p className="mb-6 text-sm text-cage-400">
            Upload your FC Pro order export CSV to automatically populate purchase data.
          </p>

          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? 'border-gold-500 bg-gold-500/5'
                : importFile
                  ? 'border-emerald-500/50 bg-emerald-500/5'
                  : 'border-cage-600 bg-dark-800/50 hover:border-cage-500'
            }`}
            role="button"
            tabIndex={0}
            aria-label="Drop CSV file here or click to browse"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                document.getElementById('csv-file-input')?.click()
              }
            }}
            onClick={() => document.getElementById('csv-file-input')?.click()}
          >
            <input
              id="csv-file-input"
              type="file"
              accept=".csv"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileSelect(file)
              }}
              aria-label="Choose CSV file"
            />

            {importFile ? (
              <>
                <svg className="mb-2 h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-emerald-400">{importFile.name}</span>
                <span className="mt-1 text-xs text-cage-500">
                  {(importFile.size / 1024).toFixed(1)} KB
                </span>
              </>
            ) : (
              <>
                <svg className="mb-2 h-8 w-8 text-cage-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-sm text-cage-400">
                  Drag & drop your FC Pro CSV here
                </span>
                <span className="mt-1 text-xs text-cage-500">or click to browse</span>
              </>
            )}
          </div>

          {importError && (
            <p className="mt-3 text-sm text-red-400" role="alert">{importError}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleImport}
              disabled={!importFile || importing}
              className="rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importing ? 'Importing...' : 'Import Orders'}
            </button>

            {/* Skip import if orders already exist */}
            <button
              onClick={() => setCurrentStep(2)}
              className="text-sm text-cage-400 underline underline-offset-2 hover:text-cage-300"
            >
              Skip (use existing orders)
            </button>
          </div>

          {/* Import results */}
          {importResult && (
            <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
              <p className="text-sm text-emerald-400">
                Imported <strong>{importResult.imported}</strong> orders
                {importResult.duplicates > 0 && (
                  <>, <span className="text-cage-400">{importResult.duplicates} already existed</span></>
                )}
              </p>
              {importResult.dateRange && (
                <p className="mt-1 text-xs text-cage-500">
                  Date range: {importResult.dateRange.start} - {importResult.dateRange.end}
                </p>
              )}
            </div>
          )}

          {/* Recent orders preview */}
          {recentOrders.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-cage-400">
                Recently Imported ({recentOrders.length} shown)
              </h3>
              <div className="overflow-x-auto rounded-lg border border-blood-900/30">
                <table className="w-full text-sm" role="table">
                  <thead>
                    <tr className="border-b border-blood-900/30 text-left text-xs text-cage-500">
                      <th className="px-3 py-2 font-medium">Date</th>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium text-right">Qty</th>
                      <th className="px-3 py-2 font-medium text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order, i) => (
                      <tr key={i} className="border-b border-blood-900/20 last:border-0">
                        <td className="px-3 py-2 text-cage-400">{order.orderDate}</td>
                        <td className="px-3 py-2 text-white">{order.productName}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-cage-300">{order.quantity}</td>
                        <td className="px-3 py-2 text-right tabular-nums text-cage-300">{fmt(order.totalCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 2: Select Month & SKU ─────────────────────────────────── */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Month/Year Selector */}
          <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
            <h2 className="mb-4 text-lg font-semibold text-white">Select Report Period</h2>
            <div className="flex flex-wrap gap-4">
              <div>
                <label htmlFor="report-month" className="mb-1.5 block text-xs font-medium text-cage-400">
                  Month
                </label>
                <select
                  id="report-month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  className="rounded border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                >
                  {MONTH_NAMES.map((name, i) => (
                    <option key={name} value={i}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="report-year" className="mb-1.5 block text-xs font-medium text-cage-400">
                  Year
                </label>
                <select
                  id="report-year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="rounded border border-cage-600 bg-dark-700 px-3 py-2 text-sm text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Available SKUs */}
          <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Available Products — {MONTH_NAMES[selectedMonth]} {selectedYear}
            </h2>

            {loadingSkus ? (
              <div className="flex items-center gap-3 py-8 text-cage-400">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                </svg>
                Loading products...
              </div>
            ) : skus.length === 0 ? (
              <div className="rounded-lg border border-cage-700 bg-dark-800/50 p-6 text-center">
                <p className="text-sm text-cage-400">
                  No FC Pro orders found for {MONTH_NAMES[selectedMonth]} {selectedYear}.
                </p>
                <p className="mt-1 text-xs text-cage-500">
                  Import your FC Pro CSV first, or select a different month.
                </p>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="mt-4 text-sm text-gold-400 underline underline-offset-2 hover:text-gold-300"
                >
                  Go back to import
                </button>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {skus.map((sku) => (
                  <button
                    key={sku.productName}
                    onClick={() => handleGenerateReport(sku)}
                    className="group rounded-lg border border-cage-700 bg-dark-800/50 p-4 text-left transition-all hover:border-gold-500/50 hover:bg-dark-700/50"
                  >
                    <h3 className="text-sm font-medium text-white group-hover:text-gold-400">
                      {sku.productName}
                    </h3>
                    <div className="mt-2 flex items-center gap-4 text-xs text-cage-400">
                      <span>{sku.casesPurchased} cases</span>
                      <span>{fmt(sku.totalCost)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentStep(1)}
            className="text-sm text-cage-400 underline underline-offset-2 hover:text-cage-300"
          >
            Back to import
          </button>
        </div>
      )}

      {/* ── STEP 3: Generated Report ───────────────────────────────────── */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {loadingReport ? (
            <div className="flex items-center gap-3 rounded-xl border border-blood-900/40 bg-black/60 p-12 backdrop-blur-md">
              <svg className="h-5 w-5 animate-spin text-gold-500" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
              </svg>
              <span className="text-sm text-cage-400">Generating report for {selectedSku?.productName}...</span>
            </div>
          ) : report ? (
            <>
              {/* Data Completeness Bar */}
              <div className="rounded-xl border border-blood-900/40 bg-black/60 p-4 backdrop-blur-md">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-cage-400">Data Completeness</span>
                  <span className="font-medium text-white">
                    {completeness.percent}% auto-filled, {completeness.manualCount} field{completeness.manualCount !== 1 ? 's' : ''} need manual entry
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-dark-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-gold-500 transition-all"
                    style={{ width: `${completeness.percent}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center gap-4 text-[10px] text-cage-500">
                  <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" /> Auto-filled</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-yellow-500" /> Needs review</span>
                  <span className="flex items-center gap-1"><span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" /> Manual entry</span>
                </div>
              </div>

              {/* Section: Breaker Information */}
              <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">
                  Breaker Information
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.breakerName?.source || 'manual'} />
                      Breaker Name
                    </label>
                    <input
                      type="text"
                      value={report.breakerName}
                      onChange={(e) => updateField('breakerName', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('breakerName')}`}
                      placeholder="Your breaker name"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.breakerAccountSTK?.source || 'manual'} />
                      Breaker Account STK
                    </label>
                    <input
                      type="text"
                      value={report.breakerAccountSTK}
                      onChange={(e) => updateField('breakerAccountSTK', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('breakerAccountSTK')}`}
                      placeholder="Account STK"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.email?.source || 'manual'} />
                      Email
                    </label>
                    <input
                      type="email"
                      value={report.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('email')}`}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Topps Direct Data Collection */}
              <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
                <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-gold-400">
                  Topps Direct Data Collection
                </h2>

                {/* Product + Product Type */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.product?.source || 'manual'} />
                      Product
                    </label>
                    <input
                      type="text"
                      value={report.product}
                      onChange={(e) => updateField('product', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('product')}`}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.productType?.source || 'manual'} />
                      Product Type
                    </label>
                    <select
                      value={report.productType}
                      onChange={(e) => updateField('productType', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('productType')}`}
                    >
                      <option value="">Select type...</option>
                      {PRODUCT_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Inventory Row */}
                <div className="mt-4 grid gap-4 sm:grid-cols-4">
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.existingInventory?.source || 'manual'} />
                      Existing Inventory
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={report.existingInventory}
                      onChange={(e) => updateField('existingInventory', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('existingInventory')}`}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.totalCasesPurchased?.source || 'manual'} />
                      Cases Purchased
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={report.totalCasesPurchased}
                      onChange={(e) => updateField('totalCasesPurchased', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('totalCasesPurchased')}`}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.totalCasesBroken?.source || 'manual'} />
                      Cases Broken
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={report.totalCasesBroken}
                      onChange={(e) => updateField('totalCasesBroken', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('totalCasesBroken')}`}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.totalCasesRemaining?.source || 'manual'} />
                      Cases Remaining
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={report.totalCasesRemaining}
                      onChange={(e) => updateField('totalCasesRemaining', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('totalCasesRemaining')}`}
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Weekly Breakdown */}
                <div className="mt-6">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-cage-500">
                    Weekly Breakdown
                  </h3>
                  <div className="grid gap-3">
                    {report.weeks.map((week, i) => (
                      <div key={i} className="grid grid-cols-[auto_1fr_1fr] items-center gap-3">
                        <span className="w-16 text-xs font-medium text-cage-500">Week {i + 1}</span>
                        <div>
                          <label className="mb-1 flex items-center gap-1.5 text-[10px] text-cage-500">
                            <StatusDot source={fieldMeta[`week${i}_cases`]?.source || 'manual'} />
                            Cases Broken
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={week.casesBroken}
                            onChange={(e) => updateWeek(i, 'casesBroken', e.target.value)}
                            className={`w-full rounded border bg-dark-700 px-3 py-1.5 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder(`week${i}_cases`)}`}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="mb-1 flex items-center gap-1.5 text-[10px] text-cage-500">
                            <StatusDot source={fieldMeta[`week${i}_price`]?.source || 'manual'} />
                            Avg Case Sale Price ($)
                          </label>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={week.avgCaseSalePrice}
                            onChange={(e) => updateWeek(i, 'avgCaseSalePrice', e.target.value)}
                            className={`w-full rounded border bg-dark-700 px-3 py-1.5 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder(`week${i}_price`)}`}
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Full Month Average */}
                <div className="mt-4">
                  <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                    <StatusDot source={fieldMeta.avgCaseSalePriceFullMonth?.source || 'review'} />
                    Average Case Sale Price — Full Month ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={report.avgCaseSalePriceFullMonth}
                    onChange={(e) => updateField('avgCaseSalePriceFullMonth', e.target.value)}
                    className={`max-w-xs rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('avgCaseSalePriceFullMonth')}`}
                    placeholder="Auto-calculated"
                  />
                </div>

                {/* Break Type + Platform */}
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.breakType?.source || 'manual'} />
                      Break Type
                    </label>
                    <MultiSelectPills
                      options={BREAK_TYPES}
                      selected={report.breakType}
                      onChange={(val) => updateField('breakType', val)}
                    />
                  </div>
                  <div>
                    <label className="mb-2 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.breakPlatform?.source || 'manual'} />
                      Break Platform
                    </label>
                    <MultiSelectPills
                      options={BREAK_PLATFORMS}
                      selected={report.breakPlatform}
                      onChange={(val) => updateField('breakPlatform', val)}
                    />
                  </div>
                </div>

                {/* Duration + Days to Sell Out */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.avgBreakDuration?.source || 'manual'} />
                      Average Break Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={report.avgBreakDuration}
                      onChange={(e) => updateField('avgBreakDuration', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('avgBreakDuration')}`}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source={fieldMeta.daysToSellOut?.source || 'manual'} />
                      Days to Sell Out (#)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={report.daysToSellOut}
                      onChange={(e) => updateField('daysToSellOut', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('daysToSellOut')}`}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Distributor Data */}
              <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gold-400">
                  Distributor Data
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source="manual" />
                      Cases bought from distributors for this SKU
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={report.distributorCases}
                      onChange={(e) => updateField('distributorCases', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('distributorCases')}`}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 flex items-center gap-2 text-xs font-medium text-cage-400">
                      <StatusDot source="manual" />
                      Price per case from distributor ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={report.distributorPrice}
                      onChange={(e) => updateField('distributorPrice', e.target.value)}
                      className={`w-full rounded border bg-dark-700 px-3 py-2 text-sm text-white placeholder-cage-500 focus:border-gold-500 focus:outline-none focus:ring-1 focus:ring-gold-500 ${fieldBorder('distributorPrice')}`}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Export Actions */}
              <div className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={copyAllFields}
                    className="flex items-center gap-2 rounded-lg bg-gold-500 px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gold-400"
                  >
                    {copied ? (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        Copy All Fields
                      </>
                    )}
                  </button>

                  <button
                    onClick={exportCSV}
                    className="flex items-center gap-2 rounded-lg border border-cage-600 bg-dark-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-dark-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export as CSV
                  </button>

                  <button
                    onClick={startNewReport}
                    className="text-sm text-cage-400 underline underline-offset-2 hover:text-cage-300"
                  >
                    Start New Report
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-blood-900/40 bg-black/60 p-8 text-center backdrop-blur-md">
              <p className="text-sm text-cage-400">Failed to generate report. Please try again.</p>
              <button
                onClick={startNewReport}
                className="mt-4 text-sm text-gold-400 underline underline-offset-2 hover:text-gold-300"
              >
                Go back
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
