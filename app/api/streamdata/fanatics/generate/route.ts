// POST /api/streamdata/fanatics/generate
// Generate a Fanatics Direct monthly breaker report for a specific SKU.
// Aggregates FC Pro orders, stream submissions, and inventory data.
// Admin only, rate limited to 5 per minute.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  fcProOrders,
  streamEntries,
  streamProductsSold,
  products,
  inventoryLots,
  liveSessions,
} from '@/lib/db/schema'
import { and, eq, gte, lte, sql, desc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { productMatchScore, inferProductType } from '@/lib/fanatics/product-match'
import { z } from 'zod'

const generateSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2099),
  productName: z.string().min(1, 'Product name is required'),
})

interface WeekBreakdown {
  weekNumber: number
  casesBroken: number
  avgCaseSalePrice: number
}

interface FanaticsReport {
  breakerName: string
  breakerSTK: string
  email: string
  product: string
  productType: string | null
  existingInventoryPriorToMonth: number
  casesPurchasedThisMonth: number
  casesRemainingInInventory: number
  weeks: WeekBreakdown[]
  totalCasesBrokenThisMonth: number
  avgCaseSalePriceFullMonth: number
  breakTypes: string[]
  breakPlatforms: string[]
  avgBreakDuration: number | null
  daysToSellOut: number | null
  distributorCases: number | null
  distributorPrice: number | null
  dataCompleteness: number
  manualFieldsNeeded: string[]
}

/**
 * Determine which week of the month a day falls into.
 * Week 1 = days 1-7, Week 2 = 8-14, Week 3 = 15-21, Week 4 = 22+
 */
function getWeekOfMonth(day: number): number {
  if (day <= 7) return 1
  if (day <= 14) return 2
  if (day <= 21) return 3
  return 4
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const parsed = generateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { month, year, productName } = parsed.data

    // Date boundaries for the target month
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    // Previous month boundaries (for prior inventory)
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate()
    const prevEndDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevLastDay).padStart(2, '0')}`

    // ── 1. FC Pro orders for this product in this month ──────────────────
    const fcOrders = await db
      .select()
      .from(fcProOrders)
      .where(
        and(
          eq(fcProOrders.productName, productName),
          gte(fcProOrders.orderDate, startDate),
          lte(fcProOrders.orderDate, endDate)
        )
      )

    const casesPurchasedThisMonth = fcOrders.reduce(
      (sum, o) => sum + o.caseQuantity,
      0
    )

    // ── 2. Find matching stream products ─────────────────────────────────
    // Get all products from the database to find best match
    const allProducts = await db.select().from(products)
    const matchingProducts = allProducts
      .map((p) => ({ ...p, score: productMatchScore(productName, p.name) }))
      .filter((p) => p.score >= 0.3)
      .sort((a, b) => b.score - a.score)

    const matchedProductIds = matchingProducts.map((p) => p.id)

    // ── 3. Stream entries for this month with matching products ───────────
    const weeklyBreakdown: WeekBreakdown[] = [
      { weekNumber: 1, casesBroken: 0, avgCaseSalePrice: 0 },
      { weekNumber: 2, casesBroken: 0, avgCaseSalePrice: 0 },
      { weekNumber: 3, casesBroken: 0, avgCaseSalePrice: 0 },
      { weekNumber: 4, casesBroken: 0, avgCaseSalePrice: 0 },
    ]

    // Track totals per week for average calculation
    const weekSalesTotals = [0, 0, 0, 0]
    const platforms = new Set<string>()

    if (matchedProductIds.length > 0) {
      // Get stream entries for this month
      const entries = await db
        .select({
          streamDate: streamEntries.streamDate,
          platform: streamEntries.platform,
          streamSales: streamEntries.streamSales,
          productId: streamProductsSold.productId,
          amountSold: streamProductsSold.amountSold,
          costPerUnit: streamProductsSold.costPerUnit,
        })
        .from(streamEntries)
        .innerJoin(streamProductsSold, eq(streamProductsSold.streamEntryId, streamEntries.id))
        .where(
          and(
            gte(streamEntries.streamDate, startDate),
            lte(streamEntries.streamDate, endDate),
            sql`${streamProductsSold.productId} IN (${sql.join(
              matchedProductIds.map((id) => sql`${id}`),
              sql`, `
            )})`
          )
        )

      for (const entry of entries) {
        const day = new Date(entry.streamDate).getDate()
        const weekIdx = getWeekOfMonth(day) - 1

        const amount = entry.amountSold ?? 0
        const cost = parseFloat(entry.costPerUnit ?? '0')

        weeklyBreakdown[weekIdx].casesBroken += amount
        weekSalesTotals[weekIdx] += amount * cost

        if (entry.platform) {
          platforms.add(entry.platform)
        }
      }

      // Calculate average sale price per week
      for (let i = 0; i < 4; i++) {
        if (weeklyBreakdown[i].casesBroken > 0) {
          weeklyBreakdown[i].avgCaseSalePrice = Math.round(
            (weekSalesTotals[i] / weeklyBreakdown[i].casesBroken) * 100
          ) / 100
        }
      }
    }

    const totalCasesBroken = weeklyBreakdown.reduce((s, w) => s + w.casesBroken, 0)
    const totalSales = weekSalesTotals.reduce((s, v) => s + v, 0)
    const avgCaseSalePrice =
      totalCasesBroken > 0 ? Math.round((totalSales / totalCasesBroken) * 100) / 100 : 0

    // ── 4. Inventory data ────────────────────────────────────────────────
    let existingInventoryPrior = 0
    let casesRemaining = 0

    if (matchedProductIds.length > 0) {
      // Prior month ending inventory: sum remaining cases from lots received before this month
      const priorLots = await db
        .select({
          remaining: inventoryLots.remainingCases,
        })
        .from(inventoryLots)
        .where(
          and(
            sql`${inventoryLots.productId} IN (${sql.join(
              matchedProductIds.map((id) => sql`${id}`),
              sql`, `
            )})`,
            lte(inventoryLots.receivedDate, prevEndDate)
          )
        )

      existingInventoryPrior = priorLots.reduce((s, l) => s + (l.remaining ?? 0), 0)

      // Current remaining: sum remaining cases from all lots for this product
      const currentLots = await db
        .select({
          remaining: inventoryLots.remainingCases,
        })
        .from(inventoryLots)
        .where(
          sql`${inventoryLots.productId} IN (${sql.join(
            matchedProductIds.map((id) => sql`${id}`),
            sql`, `
          )})`
        )

      casesRemaining = currentLots.reduce((s, l) => s + (l.remaining ?? 0), 0)
    }

    // ── 5. Live session duration data ────────────────────────────────────
    let avgBreakDuration: number | null = null

    const sessions = await db
      .select({
        startedAt: liveSessions.startedAt,
        endedAt: liveSessions.endedAt,
      })
      .from(liveSessions)
      .where(
        and(
          gte(liveSessions.startedAt, new Date(`${startDate}T00:00:00Z`)),
          lte(liveSessions.startedAt, new Date(`${endDate}T23:59:59Z`)),
          eq(liveSessions.status, 'ended')
        )
      )

    if (sessions.length > 0) {
      const durations = sessions
        .filter((s) => s.endedAt)
        .map((s) => {
          const start = new Date(s.startedAt).getTime()
          const end = new Date(s.endedAt!).getTime()
          return (end - start) / 60000 // minutes
        })
        .filter((d) => d > 0)

      if (durations.length > 0) {
        avgBreakDuration = Math.round(
          durations.reduce((s, d) => s + d, 0) / durations.length
        )
      }
    }

    // ── 6. Infer product type ────────────────────────────────────────────
    const productType = inferProductType(productName)

    // ── 7. Data completeness scoring ─────────────────────────────────────
    const manualFieldsNeeded: string[] = []
    let fieldsTotal = 12
    let fieldsFilled = 0

    // Auto-filled fields check
    if (casesPurchasedThisMonth > 0) fieldsFilled++
    else manualFieldsNeeded.push('casesPurchasedThisMonth')

    if (totalCasesBroken > 0) fieldsFilled++
    else manualFieldsNeeded.push('weeklyBreakdown (no stream data found)')

    if (existingInventoryPrior >= 0) fieldsFilled++ // 0 is valid
    if (casesRemaining >= 0) fieldsFilled++

    if (productType) fieldsFilled++
    else manualFieldsNeeded.push('productType')

    if (platforms.size > 0) fieldsFilled++
    else manualFieldsNeeded.push('breakPlatforms')

    if (avgBreakDuration !== null) fieldsFilled++
    else manualFieldsNeeded.push('avgBreakDuration')

    // Always manual
    manualFieldsNeeded.push('breakTypes')
    manualFieldsNeeded.push('distributorCases')
    manualFieldsNeeded.push('distributorPrice')
    manualFieldsNeeded.push('daysToSellOut')
    manualFieldsNeeded.push('breakerSTK (verify)')

    // breakerName, email, breakerSTK counted as auto since hardcoded
    fieldsFilled += 3 // breaker info always present
    fieldsTotal += 2 // distributor fields

    const dataCompleteness = Math.round((fieldsFilled / fieldsTotal) * 100)

    // ── 8. Build report ──────────────────────────────────────────────────
    const report: FanaticsReport = {
      // Breaker info (hardcoded for now — pull from admin settings later)
      breakerName: 'Chicken1of1',
      breakerSTK: '',
      email: 'hello@chicken1of1.com',

      product: productName,
      productType,

      existingInventoryPriorToMonth: existingInventoryPrior,
      casesPurchasedThisMonth,
      casesRemainingInInventory: casesRemaining,

      weeks: weeklyBreakdown,

      totalCasesBrokenThisMonth: totalCasesBroken,
      avgCaseSalePriceFullMonth: avgCaseSalePrice,

      breakTypes: [],
      breakPlatforms: Array.from(platforms),
      avgBreakDuration,
      daysToSellOut: null,

      distributorCases: null,
      distributorPrice: null,

      dataCompleteness,
      manualFieldsNeeded,
    }

    return NextResponse.json(report)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/fanatics/generate error:', message)
    return NextResponse.json(
      { error: 'Failed to generate Fanatics report' },
      { status: 500 }
    )
  }
}
