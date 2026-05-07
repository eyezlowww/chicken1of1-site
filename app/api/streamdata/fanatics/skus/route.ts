// GET /api/streamdata/fanatics/skus?month=3&year=2026
// Returns distinct FC Pro product names for a given month with totals.
// Used to populate the SKU selector on the frontend report generator.
// Admin only, rate limited to 15 per minute.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { fcProOrders } from '@/lib/db/schema'
import { and, gte, lte, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'

const querySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2099),
})

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const params = Object.fromEntries(request.nextUrl.searchParams)
    const parsed = querySchema.safeParse(params)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid month/year' },
        { status: 400 }
      )
    }

    const { month, year } = parsed.data

    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDay = new Date(year, month, 0).getDate()
    const endDate = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    const skus = await db
      .select({
        productName: fcProOrders.productName,
        totalCases: sql<number>`COALESCE(SUM(${fcProOrders.caseQuantity}), 0)`.as('total_cases'),
        totalCost: sql<string>`COALESCE(SUM(${fcProOrders.totalPrice}::numeric), 0)`.as(
          'total_cost'
        ),
        orderCount: sql<number>`COUNT(*)`.as('order_count'),
      })
      .from(fcProOrders)
      .where(
        and(
          gte(fcProOrders.orderDate, startDate),
          lte(fcProOrders.orderDate, endDate)
        )
      )
      .groupBy(fcProOrders.productName)
      .orderBy(fcProOrders.productName)

    return NextResponse.json({
      month,
      year,
      skus: skus.map((s) => ({
        productName: s.productName,
        totalCases: Number(s.totalCases),
        totalCost: parseFloat(String(s.totalCost)),
        orderCount: Number(s.orderCount),
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/fanatics/skus error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch SKUs' },
      { status: 500 }
    )
  }
}
