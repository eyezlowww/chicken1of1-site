// GET /api/streamdata/streams/[id]
// Returns full stream detail with products, inventory, and calculations
// Auth required (must be stream owner or admin)
//
// PUT /api/streamdata/streams/[id]
// Update a draft stream entry
// Auth required (must be stream owner, status must be 'draft')
//
// DELETE /api/streamdata/streams/[id]
// Delete a draft stream entry
// Auth required (must be stream owner, status must be 'draft')

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  streamEntries,
  streamProductsSold,
  streamInventory,
  weeklyPeriods,
} from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { streamEntrySchema } from '@/lib/validations/stream'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 30, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await context.params
    const isAdmin = session!.user.role === 'admin'

    // For non-admin users, filter by userId in the query itself (prevent IDOR)
    const whereClause = isAdmin
      ? eq(streamEntries.id, id)
      : and(eq(streamEntries.id, id), eq(streamEntries.userId, session!.user.id))

    const stream = await db.query.streamEntries.findFirst({
      where: whereClause,
      with: {
        productsSold: {
          with: { product: true },
        },
        inventory: {
          with: { product: true },
        },
        calculation: true,
        weeklyPeriod: true,
      },
    })

    if (!stream) {
      return NextResponse.json(
        { error: 'Stream entry not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ stream })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/streams/[id] error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch stream entry' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 10, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await context.params
    const userId = session!.user.id

    // Fetch existing entry — must be owned by user and in draft status
    const existing = await db.query.streamEntries.findFirst({
      where: and(eq(streamEntries.id, id), eq(streamEntries.userId, userId)),
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Stream entry not found' },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft entries can be updated' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsed = streamEntrySchema.safeParse(body)

    if (!parsed.success) {
      console.error('PUT /api/streamdata/streams/[id] validation error:', parsed.error.message)
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { streamDate, platform, streamSales, orderCount, productsSold, inventory, weeklyPeriodId } =
      parsed.data

    // If weeklyPeriodId is being changed, verify the target period belongs to the user AND is open
    if (weeklyPeriodId !== existing.weeklyPeriodId) {
      const targetPeriod = await db
        .select()
        .from(weeklyPeriods)
        .where(
          and(
            eq(weeklyPeriods.id, weeklyPeriodId),
            eq(weeklyPeriods.userId, userId)
          )
        )

      if (targetPeriod.length === 0) {
        return NextResponse.json(
          { error: 'Target weekly period not found' },
          { status: 404 }
        )
      }

      if (targetPeriod[0].status !== 'open') {
        return NextResponse.json(
          { error: 'Cannot move stream to a closed weekly period' },
          { status: 400 }
        )
      }
    }

    // Update the stream entry
    await db
      .update(streamEntries)
      .set({
        streamDate,
        platform,
        streamSales: streamSales.toFixed(2),
        orderCount,
        weeklyPeriodId,
        updatedAt: new Date(),
      })
      .where(and(eq(streamEntries.id, id), eq(streamEntries.userId, userId)))

    // Replace products sold: delete old, insert new
    await db
      .delete(streamProductsSold)
      .where(eq(streamProductsSold.streamEntryId, id))

    const productSoldRows = productsSold.map((p) => ({
      streamEntryId: id,
      productId: p.productId,
      costPerUnit: p.costPerUnit.toFixed(2),
      amountSold: p.amountSold,
    }))

    await db.insert(streamProductsSold).values(productSoldRows)

    // Replace inventory: delete old, insert new
    await db
      .delete(streamInventory)
      .where(eq(streamInventory.streamEntryId, id))

    if (inventory && inventory.length > 0) {
      const inventoryRows = inventory.map((i) => ({
        streamEntryId: id,
        productId: i.productId,
        cases: i.cases,
        boxes: i.boxes,
        packs: i.packs,
      }))

      await db.insert(streamInventory).values(inventoryRows)
    }

    // Fetch updated entry
    const updated = await db.query.streamEntries.findFirst({
      where: eq(streamEntries.id, id),
      with: {
        productsSold: {
          with: { product: true },
        },
        inventory: {
          with: { product: true },
        },
        calculation: true,
      },
    })

    return NextResponse.json({ stream: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PUT /api/streamdata/streams/[id] error:', message)
    return NextResponse.json(
      { error: 'Failed to update stream entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 10, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await context.params
    const userId = session!.user.id

    // Fetch existing entry
    const existing = await db.query.streamEntries.findFirst({
      where: and(eq(streamEntries.id, id), eq(streamEntries.userId, userId)),
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Stream entry not found' },
        { status: 404 }
      )
    }

    if (existing.status !== 'draft') {
      return NextResponse.json(
        { error: 'Only draft entries can be deleted' },
        { status: 400 }
      )
    }

    // Cascade delete handles streamProductsSold and streamInventory
    await db.delete(streamEntries).where(eq(streamEntries.id, id))

    return NextResponse.json({ message: 'Stream entry deleted' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('DELETE /api/streamdata/streams/[id] error:', message)
    return NextResponse.json(
      { error: 'Failed to delete stream entry' },
      { status: 500 }
    )
  }
}
