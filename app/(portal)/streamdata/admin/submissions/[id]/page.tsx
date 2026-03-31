// Submission detail page — shows full stream entry data for admin review
// Server component: queries the database directly via Drizzle ORM

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import {
  streamEntries,
  streamCalculations,
  streamProductsSold,
  streamInventory,
  products,
  users,
  weeklyPeriods,
  globalFeeConfig,
  streamerFeeConfig,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/* ---------- helpers ---------- */

function fmt(n: number): string {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function pct(n: number): string {
  return (n * 100).toFixed(1) + '%'
}

const statusBadge: Record<string, string> = {
  draft: 'bg-dark-700 text-cage-300',
  submitted: 'bg-gold-500/20 text-gold-400',
  approved: 'bg-green-500/20 text-green-400',
}

const statusLabel: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
}

/* ---------- sub-components ---------- */

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

/* ---------- page ---------- */

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Auth check — admin only
  const session = await auth()
  if (!session?.user || (session.user as any).role !== 'admin') {
    redirect('/streamdata/login')
  }

  const { id } = await params

  // Fetch the stream entry
  const entry = await db.query.streamEntries.findFirst({
    where: eq(streamEntries.id, id),
    with: {
      user: true,
      calculation: true,
      productsSold: {
        with: {
          product: true,
        },
      },
      inventory: {
        with: {
          product: true,
        },
      },
      weeklyPeriod: true,
    },
  })

  if (!entry) {
    notFound()
  }

  // Fetch fee config for percentage display
  const globalFees = await db
    .select({
      name: globalFeeConfig.name,
      rate: globalFeeConfig.rate,
      flatAmount: globalFeeConfig.flatAmount,
      feeType: globalFeeConfig.feeType,
    })
    .from(globalFeeConfig)
    .where(eq(globalFeeConfig.isActive, true))

  const streamerFees = await db
    .select({
      feeName: streamerFeeConfig.feeName,
      rate: streamerFeeConfig.rate,
    })
    .from(streamerFeeConfig)
    .where(
      and(
        eq(streamerFeeConfig.userId, entry.userId),
        eq(streamerFeeConfig.isActive, true)
      )
    )

  // Parse fee rates for display
  const platformFeeRate = parseFloat(
    globalFees.find((f) => f.name === 'platform_fee')?.rate ?? '0'
  )
  const productFeeRate = parseFloat(
    globalFees.find((f) => f.name === 'product_fee')?.rate ?? '0'
  )
  const perOrderFee = parseFloat(
    globalFees.find((f) => f.name === 'order_fee')?.flatAmount ?? '0.30'
  )
  const supportFeeRate = parseFloat(
    streamerFees.find((f) => f.feeName === 'support_fee')?.rate ?? '0'
  )

  // Parse numbers
  const streamSales = parseFloat(entry.streamSales)
  const orderCount = entry.orderCount

  const calc = entry.calculation
    ? {
        totalCogs: parseFloat(entry.calculation.totalCogs),
        platformFee: parseFloat(entry.calculation.platformFee),
        productFee: parseFloat(entry.calculation.productFee),
        orderAmountCost: parseFloat(entry.calculation.orderAmountCost),
        grossProfit: parseFloat(entry.calculation.grossProfit),
        supportFee: parseFloat(entry.calculation.supportFee),
        breakerPayout: parseFloat(entry.calculation.breakerPayout),
        chickenPayout: parseFloat(entry.calculation.chickenPayout),
      }
    : null

  // Weekly period adjustments
  const weeklyAdj = entry.weeklyPeriod
    ? parseFloat(entry.weeklyPeriod.weeklyAdjustments ?? '0')
    : 0
  const adjNotes = entry.weeklyPeriod?.adjustmentNotes ?? null

  return (
    <div className="min-h-screen bg-dark-950 px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <Link
          href="/streamdata/admin/submissions"
          className="inline-flex items-center gap-2 text-sm font-medium text-cage-300 transition-colors hover:text-white"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Submissions
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Stream Submission &mdash; {entry.user.displayName}
          </h1>
          <p className="mt-1 text-sm text-cage-400">
            {entry.streamDate} &middot; {entry.platform ?? 'Whatnot'}
          </p>
        </div>
        <span
          className={`inline-flex self-start rounded-full px-3 py-1 text-xs font-medium ${
            statusBadge[entry.status] ?? 'bg-dark-700 text-cage-300'
          }`}
        >
          {statusLabel[entry.status] ?? entry.status}
        </span>
      </div>

      <div className="space-y-6">
        {/* ───────────────── Stream Info ───────────────── */}
        <section className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
          <h2 className="mb-4 text-lg font-semibold text-white">Stream Info</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-cage-500">Date</p>
              <p className="mt-1 text-sm font-medium text-white">{entry.streamDate}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-cage-500">Platform</p>
              <p className="mt-1 text-sm font-medium text-white">
                {entry.platform ?? 'Whatnot'}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-cage-500">Stream Sales</p>
              <p className="mt-1 text-sm font-medium text-gold-400">{fmt(streamSales)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-cage-500">Order Count</p>
              <p className="mt-1 text-sm font-medium text-white">{orderCount}</p>
            </div>
          </div>
        </section>

        {/* ───────────────── Products Sold ───────────────── */}
        <section className="rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md overflow-hidden">
          <div className="p-6 pb-0">
            <h2 className="mb-4 text-lg font-semibold text-white">Products Sold</h2>
          </div>
          {entry.productsSold.length === 0 ? (
            <p className="px-6 pb-6 text-sm text-cage-500">No products recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blood-900/40 bg-dark-700">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400">
                      Product
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-cage-400">
                      Cost/Unit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-cage-400">
                      Qty Sold
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-cage-400">
                      COGS
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cage-700/50">
                  {entry.productsSold.map((ps) => {
                    const cost = parseFloat(ps.costPerUnit)
                    const qty = ps.amountSold
                    const cogs = cost * qty
                    return (
                      <tr
                        key={ps.id}
                        className="transition-colors hover:bg-dark-700/50"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                          {ps.product.name}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm tabular-nums text-cage-300">
                          {fmt(cost)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm tabular-nums text-cage-300">
                          {qty}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm tabular-nums font-medium text-gold-400">
                          {fmt(cogs)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {calc && (
                  <tfoot>
                    <tr className="border-t border-blood-900/40">
                      <td
                        colSpan={3}
                        className="px-6 py-3 text-right text-sm font-medium text-cage-400"
                      >
                        Total COGS
                      </td>
                      <td className="px-6 py-3 text-right text-sm tabular-nums font-bold text-white">
                        {fmt(calc.totalCogs)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </section>

        {/* ───────────────── Calculation Breakdown ───────────────── */}
        {calc && (
          <section className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
            <h2 className="mb-5 text-lg font-semibold text-white">
              Calculation Breakdown
            </h2>

            <div className="grid grid-cols-1 gap-x-8 gap-y-0 sm:grid-cols-2">
              {/* Left column — deductions */}
              <div className="space-y-3">
                <CalcRow label="Total Stream Sales" value={fmt(streamSales)} highlight />
                <CalcRow label="Cost of Goods Sold" value={`- ${fmt(calc.totalCogs)}`} />
                <CalcRow
                  label={`Platform Fee (${pct(platformFeeRate)})`}
                  value={`- ${fmt(calc.platformFee)}`}
                />
                <CalcRow
                  label={`Product Fee (${pct(productFeeRate)})`}
                  value={`- ${fmt(calc.productFee)}`}
                />
                <CalcRow
                  label={`Order Fee ($${perOrderFee.toFixed(2)} x ${orderCount})`}
                  value={`- ${fmt(calc.orderAmountCost)}`}
                />
              </div>

              {/* Right column — results */}
              <div className="mt-3 space-y-3 sm:mt-0">
                {/* Gross Profit */}
                <div className="rounded-lg border border-cage-600 bg-dark-700 p-4">
                  <div className="mb-1 text-xs uppercase tracking-wider text-cage-500">
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
                  label={`Support Fee (${pct(supportFeeRate)})`}
                  value={`- ${fmt(calc.supportFee)}`}
                />

                {/* Breaker Payout */}
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4">
                  <div className="mb-1 text-xs uppercase tracking-wider text-green-400">
                    Breaker Payout
                  </div>
                  <div className="text-3xl font-bold tabular-nums text-green-400">
                    {fmt(calc.breakerPayout)}
                  </div>
                </div>

                {/* Chicken Payout — admin-only */}
                <div className="rounded-lg border border-gold-500/30 bg-gold-500/10 p-4">
                  <div className="mb-1 text-xs uppercase tracking-wider text-gold-400">
                    Chicken Payout
                  </div>
                  <div className="text-3xl font-bold tabular-nums text-gold-400">
                    {fmt(calc.chickenPayout)}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ───────────────── Inventory In Hand ───────────────── */}
        {entry.inventory.length > 0 && (
          <section className="overflow-hidden rounded-xl border border-blood-900/40 bg-black/60 backdrop-blur-md">
            <div className="p-6 pb-0">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Inventory In Hand
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-blood-900/40 bg-dark-700">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-cage-400">
                      Product
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-cage-400">
                      Cases
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-cage-400">
                      Boxes
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-cage-400">
                      Packs
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cage-700/50">
                  {entry.inventory.map((inv) => (
                    <tr
                      key={inv.id}
                      className="transition-colors hover:bg-dark-700/50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-white">
                        {inv.product.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm tabular-nums text-cage-300">
                        {inv.cases ?? 0}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm tabular-nums text-cage-300">
                        {inv.boxes ?? 0}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm tabular-nums text-cage-300">
                        {inv.packs ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ───────────────── Weekly Adjustments ───────────────── */}
        {weeklyAdj !== 0 && (
          <section className="rounded-xl border border-blood-900/40 bg-black/60 p-6 backdrop-blur-md">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Show Adjustments
            </h2>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-cage-500">Amount</p>
                <p
                  className={`mt-1 text-lg font-bold tabular-nums ${
                    weeklyAdj >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {weeklyAdj >= 0 ? '+' : ''}
                  {fmt(weeklyAdj)}
                </p>
              </div>
              {adjNotes && (
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wider text-cage-500">Note</p>
                  <p className="mt-1 text-sm text-cage-300">{adjNotes}</p>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
