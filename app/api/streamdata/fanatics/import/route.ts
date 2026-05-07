// POST /api/streamdata/fanatics/import
// Import FC Pro order CSV data into the database.
// Upserts by order_number to handle re-imports without duplicates.
// Admin only, rate limited to 5 per minute.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { fcProOrders } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { parseFcProCsv } from '@/lib/fanatics/csv-parser'
import { z } from 'zod'

const importSchema = z.object({
  csv: z.string().min(1, 'CSV content is required').max(5_000_000, 'CSV too large (max 5MB)'),
})

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const parsed = importSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    // Parse the CSV
    let orders
    try {
      orders = parseFcProCsv(parsed.data.csv)
    } catch (parseErr) {
      const message = parseErr instanceof Error ? parseErr.message : 'CSV parsing failed'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    if (orders.length === 0) {
      return NextResponse.json(
        { error: 'No valid orders found in CSV' },
        { status: 400 }
      )
    }

    let imported = 0
    let skipped = 0

    // Upsert each order — use order_number as the dedup key
    for (const order of orders) {
      const existing = await db.query.fcProOrders.findFirst({
        where: eq(fcProOrders.orderNumber, order.orderNumber),
      })

      if (existing) {
        // Update existing order with latest data
        await db
          .update(fcProOrders)
          .set({
            orderDate: order.orderDate,
            productName: order.productName,
            productType: order.productType,
            caseQuantity: order.caseQuantity,
            subtotal: order.subtotal?.toFixed(2) ?? null,
            shipping: order.shipping?.toFixed(2) ?? null,
            discounts: order.discounts?.toFixed(2) ?? null,
            totalPrice: order.totalPrice?.toFixed(2) ?? null,
            paymentMethod: order.paymentMethod,
          })
          .where(eq(fcProOrders.orderNumber, order.orderNumber))
        skipped++
      } else {
        await db.insert(fcProOrders).values({
          orderNumber: order.orderNumber,
          orderDate: order.orderDate,
          productName: order.productName,
          productType: order.productType,
          caseQuantity: order.caseQuantity,
          subtotal: order.subtotal?.toFixed(2) ?? null,
          shipping: order.shipping?.toFixed(2) ?? null,
          discounts: order.discounts?.toFixed(2) ?? null,
          totalPrice: order.totalPrice?.toFixed(2) ?? null,
          paymentMethod: order.paymentMethod,
        })
        imported++
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      orders,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/fanatics/import error:', message)
    return NextResponse.json(
      { error: 'Failed to import FC Pro orders' },
      { status: 500 }
    )
  }
}
