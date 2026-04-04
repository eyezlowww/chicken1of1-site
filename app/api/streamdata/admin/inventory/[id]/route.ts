// PUT /api/streamdata/admin/inventory/[id]
// Update an inventory lot (quantities, costs, notes)
// Admin only
//
// DELETE /api/streamdata/admin/inventory/[id]
// Delete an inventory lot (only if no transactions exist against it)
// Admin only

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { inventoryLots, inventoryTransactions } from '@/lib/db/schema'
import { eq, count } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const updateInventoryLotSchema = z.object({
  quantityCases: z.number().int().min(1).optional(),
  boxesPerCase: z.number().int().min(1).optional(),
  packsPerBox: z.number().int().min(1).optional(),
  ownerCostPerBox: z.number().min(0).optional(),
  breakerCostPerBox: z.number().min(0).optional(),
  remainingCases: z.number().int().min(0).optional(),
  remainingBoxes: z.number().int().min(0).optional(),
  remainingPacks: z.number().int().min(0).optional(),
  receivedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
    .optional(),
  notes: z.string().max(1000).nullable().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 15, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await params
    const idSchema = z.string().uuid()
    const idParsed = idSchema.safeParse(id)
    if (!idParsed.success) {
      return NextResponse.json({ error: 'Invalid lot ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = updateInventoryLotSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    // Fetch existing lot
    const existingLot = await db.query.inventoryLots.findFirst({
      where: eq(inventoryLots.id, id),
    })
    if (!existingLot) {
      return NextResponse.json({ error: 'Inventory lot not found' }, { status: 404 })
    }

    const updates = parsed.data

    // Recalculate derived values if structure fields changed
    const quantityCases = updates.quantityCases ?? existingLot.quantityCases
    const boxesPerCase = updates.boxesPerCase ?? existingLot.boxesPerCase
    const packsPerBox = updates.packsPerBox ?? existingLot.packsPerBox
    const ownerCostPerBox = updates.ownerCostPerBox ?? Number(existingLot.ownerCostPerBox)
    const breakerCostPerBox = updates.breakerCostPerBox ?? Number(existingLot.breakerCostPerBox)

    const totalBoxes = quantityCases * boxesPerCase
    const totalPacks = totalBoxes * packsPerBox
    const ownerCostPerCase = ownerCostPerBox * boxesPerCase
    const breakerCostPerCase = breakerCostPerBox * boxesPerCase
    const ownerCostPerPack = ownerCostPerBox / packsPerBox
    const breakerCostPerPack = breakerCostPerBox / packsPerBox

    // Use explicit remaining values if provided, otherwise recalculate only if
    // structure changed (remaining should not exceed new totals)
    const remainingCases = updates.remainingCases ?? Math.min(existingLot.remainingCases, quantityCases)
    const remainingBoxes = updates.remainingBoxes ?? Math.min(existingLot.remainingBoxes, totalBoxes)
    const remainingPacks = updates.remainingPacks ?? Math.min(existingLot.remainingPacks, totalPacks)

    const [updatedLot] = await db
      .update(inventoryLots)
      .set({
        quantityCases,
        boxesPerCase,
        packsPerBox,
        totalBoxes,
        totalPacks,
        ownerCostPerBox: ownerCostPerBox.toFixed(2),
        breakerCostPerBox: breakerCostPerBox.toFixed(2),
        ownerCostPerCase: ownerCostPerCase.toFixed(2),
        breakerCostPerCase: breakerCostPerCase.toFixed(2),
        ownerCostPerPack: ownerCostPerPack.toFixed(2),
        breakerCostPerPack: breakerCostPerPack.toFixed(2),
        remainingCases,
        remainingBoxes,
        remainingPacks,
        receivedDate: updates.receivedDate ?? existingLot.receivedDate,
        notes: updates.notes !== undefined ? updates.notes : existingLot.notes,
        updatedAt: new Date(),
      })
      .where(eq(inventoryLots.id, id))
      .returning()

    return NextResponse.json({ lot: updatedLot })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PUT /api/streamdata/admin/inventory/[id] error:', message)
    return NextResponse.json({ error: 'Failed to update inventory lot' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 15, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await params
    const idSchema = z.string().uuid()
    const idParsed = idSchema.safeParse(id)
    if (!idParsed.success) {
      return NextResponse.json({ error: 'Invalid lot ID' }, { status: 400 })
    }

    // Check for existing transactions — cannot delete if any exist
    const [txCount] = await db
      .select({ value: count() })
      .from(inventoryTransactions)
      .where(eq(inventoryTransactions.inventoryLotId, id))

    if (txCount && txCount.value > 0) {
      return NextResponse.json(
        { error: 'Cannot delete lot with existing transactions. Adjust quantities instead.' },
        { status: 409 }
      )
    }

    const [deleted] = await db
      .delete(inventoryLots)
      .where(eq(inventoryLots.id, id))
      .returning({ id: inventoryLots.id, productId: inventoryLots.productId })

    if (!deleted) {
      return NextResponse.json({ error: 'Inventory lot not found' }, { status: 404 })
    }

    return NextResponse.json({ deleted: true, lot: deleted })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('DELETE /api/streamdata/admin/inventory/[id] error:', message)
    return NextResponse.json({ error: 'Failed to delete inventory lot' }, { status: 500 })
  }
}
