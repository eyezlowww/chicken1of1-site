// GET /api/streamdata/inventory/available
// Returns available inventory for breakers, grouped by product
// Shows only breaker costs (never owner costs)
// Auth required (any user)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { inventoryLots, products } from '@/lib/db/schema'
import { eq, gt, or, asc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

interface AvailableProduct {
  productId: string
  productName: string
  availableCases: number
  availableBoxes: number
  availablePacks: number
  breakerCostPerCase: string | null
  breakerCostPerBox: string | null
  breakerCostPerPack: string | null
}

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAuth()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 30, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Fetch all lots with remaining stock > 0
    const lots = await db
      .select({
        productId: inventoryLots.productId,
        productName: products.name,
        remainingCases: inventoryLots.remainingCases,
        remainingBoxes: inventoryLots.remainingBoxes,
        remainingPacks: inventoryLots.remainingPacks,
        breakerCostPerCase: inventoryLots.breakerCostPerCase,
        breakerCostPerBox: inventoryLots.breakerCostPerBox,
        breakerCostPerPack: inventoryLots.breakerCostPerPack,
        receivedDate: inventoryLots.receivedDate,
      })
      .from(inventoryLots)
      .innerJoin(products, eq(inventoryLots.productId, products.id))
      .where(
        or(
          gt(inventoryLots.remainingCases, 0),
          gt(inventoryLots.remainingBoxes, 0),
          gt(inventoryLots.remainingPacks, 0)
        )
      )
      .orderBy(asc(products.name), asc(inventoryLots.receivedDate))

    // Group by product, aggregate remaining quantities.
    // For cost, use the oldest lot's breaker cost (FIFO — that's the cost
    // they'll be charged on the next deduction).
    const grouped = new Map<string, AvailableProduct>()

    for (const lot of lots) {
      const existing = grouped.get(lot.productId)
      if (existing) {
        existing.availableCases += lot.remainingCases
        existing.availableBoxes += lot.remainingBoxes
        existing.availablePacks += lot.remainingPacks
        // Keep the first (oldest) lot's cost — already set since we ordered by receivedDate asc
      } else {
        grouped.set(lot.productId, {
          productId: lot.productId,
          productName: lot.productName!,
          availableCases: lot.remainingCases,
          availableBoxes: lot.remainingBoxes,
          availablePacks: lot.remainingPacks,
          breakerCostPerCase: lot.breakerCostPerCase ?? null,
          breakerCostPerBox: lot.breakerCostPerBox ?? null,
          breakerCostPerPack: lot.breakerCostPerPack ?? null,
        })
      }
    }

    const available = Array.from(grouped.values())

    return NextResponse.json({ products: available })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/inventory/available error:', message)
    return NextResponse.json({ error: 'Failed to fetch available inventory' }, { status: 500 })
  }
}
