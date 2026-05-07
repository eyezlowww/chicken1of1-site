// POST /api/streamdata/live/breaks
// Add a break to an active live session
// Auto-calculates: totalCogs, profit, costPerSpot, revenuePerSpot, breakNumber

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { liveSessions, liveBreaks, liveBreakProducts } from '@/lib/db/schema'
import { eq, and, count } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { createBreakSchema } from '@/lib/validations/live-break'

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    // Reject oversized payloads (50KB limit)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > 51200) {
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      )
    }

    const body = await request.json()
    const parsed = createBreakSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { sessionId, products, spotsSold, salesTotal, notes } = parsed.data
    const userId = session!.user.id

    // Verify session belongs to user and is 'live'
    const liveSession = await db.query.liveSessions.findFirst({
      where: and(
        eq(liveSessions.id, sessionId),
        eq(liveSessions.userId, userId)
      ),
    })

    if (!liveSession) {
      return NextResponse.json(
        { error: 'Live session not found' },
        { status: 404 }
      )
    }

    if (liveSession.status !== 'live') {
      return NextResponse.json(
        { error: 'Cannot add breaks to an ended session' },
        { status: 409 }
      )
    }

    // Calculate breakNumber (count existing breaks + 1)
    const [breakCount] = await db
      .select({ value: count() })
      .from(liveBreaks)
      .where(eq(liveBreaks.sessionId, sessionId))

    const breakNumber = (breakCount?.value ?? 0) + 1

    // Calculate totals from products
    const totalCogs = products.reduce(
      (sum, p) => sum + p.quantity * p.costPerUnit,
      0
    )
    const profit = salesTotal - totalCogs
    const costPerSpot = spotsSold > 0 ? totalCogs / spotsSold : 0
    const revenuePerSpot = spotsSold > 0 ? salesTotal / spotsSold : 0

    // Insert break
    const [newBreak] = await db
      .insert(liveBreaks)
      .values({
        sessionId,
        breakNumber,
        totalCogs: totalCogs.toFixed(2),
        spotsSold,
        salesTotal: salesTotal.toFixed(2),
        profit: profit.toFixed(2),
        costPerSpot: costPerSpot.toFixed(2),
        revenuePerSpot: revenuePerSpot.toFixed(2),
        notes: notes || null,
      })
      .returning()

    // Insert break products
    const productRows = products.map((p) => ({
      breakId: newBreak.id,
      productId: p.productId || null,
      productName: p.productName,
      quantity: p.quantity,
      costPerUnit: p.costPerUnit.toFixed(2),
      totalCost: (p.quantity * p.costPerUnit).toFixed(2),
    }))

    await db.insert(liveBreakProducts).values(productRows)

    // Fetch complete break with products
    const completeBreak = await db.query.liveBreaks.findFirst({
      where: eq(liveBreaks.id, newBreak.id),
      with: { products: true },
    })

    return NextResponse.json({ break: completeBreak }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/live/breaks error:', message)
    return NextResponse.json(
      { error: 'Failed to create live break' },
      { status: 500 }
    )
  }
}
