// POST /api/streamdata/inventory/deduct
// Deduct inventory when a breaker sells units
// Uses FIFO — deducts from the oldest lot first, spills to next if needed
// Creates audit trail via inventoryTransactions
// Auth required (any user)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { inventoryLots, inventoryTransactions, products } from '@/lib/db/schema'
import { eq, gt, asc, and } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const deductSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  unitType: z.enum(['case', 'box', 'pack']),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
  streamEntryId: z.string().uuid('Invalid stream entry ID').nullable().optional(),
})

// Maps unitType to the correct remaining/cost fields on the inventoryLots table
function getFieldsForUnitType(unitType: 'case' | 'box' | 'pack') {
  switch (unitType) {
    case 'case':
      return {
        remaining: 'remainingCases' as const,
        cost: 'breakerCostPerCase' as const,
      }
    case 'box':
      return {
        remaining: 'remainingBoxes' as const,
        cost: 'breakerCostPerBox' as const,
      }
    case 'pack':
      return {
        remaining: 'remainingPacks' as const,
        cost: 'breakerCostPerPack' as const,
      }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 30, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = deductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { productId, unitType, quantity, streamEntryId } = parsed.data
    const fields = getFieldsForUnitType(unitType)

    // Verify product exists
    const product = await db.query.products.findFirst({
      where: eq(products.id, productId),
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Fetch lots with remaining stock for this product, ordered by receivedDate asc (FIFO)
    const availableLots = await db
      .select()
      .from(inventoryLots)
      .where(
        and(
          eq(inventoryLots.productId, productId),
          gt(inventoryLots[fields.remaining], 0)
        )
      )
      .orderBy(asc(inventoryLots.receivedDate), asc(inventoryLots.createdAt))

    // Calculate total available
    const totalAvailable = availableLots.reduce(
      (sum, lot) => sum + lot[fields.remaining],
      0
    )

    if (totalAvailable < quantity) {
      return NextResponse.json(
        {
          error: `Insufficient stock. Requested ${quantity} ${unitType}(s), only ${totalAvailable} available.`,
        },
        { status: 409 }
      )
    }

    // FIFO deduction across lots
    let remaining = quantity
    const transactionRecords: {
      lotId: string
      deducted: number
      costPerUnit: string | null
    }[] = []

    for (const lot of availableLots) {
      if (remaining <= 0) break

      const lotRemaining = lot[fields.remaining]
      const deductFromLot = Math.min(remaining, lotRemaining)
      remaining -= deductFromLot

      const costPerUnit = lot[fields.cost]

      // Update the lot's remaining quantity
      const newRemaining = lotRemaining - deductFromLot

      // Build the update object dynamically based on unit type
      const updateValues: Record<string, unknown> = {
        updatedAt: new Date(),
      }
      updateValues[fields.remaining] = newRemaining

      // Also update related remaining counts for consistency:
      // If deducting cases, also deduct the equivalent boxes and packs
      // If deducting boxes, also deduct the equivalent packs
      if (unitType === 'case') {
        const boxesDeducted = deductFromLot * lot.boxesPerCase
        const packsDeducted = boxesDeducted * lot.packsPerBox
        updateValues.remainingBoxes = Math.max(0, lot.remainingBoxes - boxesDeducted)
        updateValues.remainingPacks = Math.max(0, lot.remainingPacks - packsDeducted)
      } else if (unitType === 'box') {
        const packsDeducted = deductFromLot * lot.packsPerBox
        updateValues.remainingPacks = Math.max(0, lot.remainingPacks - packsDeducted)
        // Recalculate remaining cases: floor(remainingBoxes / boxesPerCase)
        const newRemainingBoxes = lot.remainingBoxes - deductFromLot
        updateValues.remainingCases = Math.floor(newRemainingBoxes / lot.boxesPerCase)
      } else if (unitType === 'pack') {
        // Recalculate remaining boxes and cases from packs
        const newRemainingPacks = lot.remainingPacks - deductFromLot
        updateValues.remainingBoxes = Math.floor(newRemainingPacks / lot.packsPerBox)
        updateValues.remainingCases = Math.floor(
          (updateValues.remainingBoxes as number) / lot.boxesPerCase
        )
      }

      await db
        .update(inventoryLots)
        .set(updateValues)
        .where(eq(inventoryLots.id, lot.id))

      // Record the transaction
      await db.insert(inventoryTransactions).values({
        inventoryLotId: lot.id,
        userId: session.user.id,
        streamEntryId: streamEntryId || null,
        transactionType: 'sale',
        unitType,
        quantity: deductFromLot,
        costPerUnit,
        notes: null,
      })

      transactionRecords.push({
        lotId: lot.id,
        deducted: deductFromLot,
        costPerUnit,
      })
    }

    return NextResponse.json({
      success: true,
      productId,
      unitType,
      totalDeducted: quantity,
      transactions: transactionRecords,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/inventory/deduct error:', message)
    return NextResponse.json({ error: 'Failed to deduct inventory' }, { status: 500 })
  }
}
