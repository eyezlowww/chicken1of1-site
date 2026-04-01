// GET /api/streamdata/admin/inventory
// Returns all inventory lots with product names, ordered by receivedDate desc
// Admin only
//
// POST /api/streamdata/admin/inventory
// Create a new inventory lot with auto-calculated costs and quantities
// Admin only

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { inventoryLots, products } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const costEntryTypeEnum = z.enum(['per_box', 'per_case'])

const createInventoryLotSchema = z
  .object({
    productId: z.string().uuid('Invalid product ID'),
    quantityCases: z.number().int().min(1, 'Must have at least 1 case'),
    boxesPerCase: z.number().int().min(1, 'Must have at least 1 box per case'),
    packsPerBox: z.number().int().min(1, 'Must have at least 1 pack per box'),
    costEntryType: costEntryTypeEnum,
    costPerBox: z.number().min(0).nullable().optional(),
    breakerCostPerBox: z.number().min(0).nullable().optional(),
    costPerCase: z.number().min(0).nullable().optional(),
    breakerCostPerCase: z.number().min(0).nullable().optional(),
    receivedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
    notes: z.string().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.costEntryType === 'per_box') {
      if (data.costPerBox == null || data.costPerBox <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'costPerBox is required when costEntryType is per_box',
          path: ['costPerBox'],
        })
      }
      if (data.breakerCostPerBox == null || data.breakerCostPerBox <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'breakerCostPerBox is required when costEntryType is per_box',
          path: ['breakerCostPerBox'],
        })
      }
    } else if (data.costEntryType === 'per_case') {
      if (data.costPerCase == null || data.costPerCase <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'costPerCase is required when costEntryType is per_case',
          path: ['costPerCase'],
        })
      }
      if (data.breakerCostPerCase == null || data.breakerCostPerCase <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'breakerCostPerCase is required when costEntryType is per_case',
          path: ['breakerCostPerCase'],
        })
      }
    }
  })

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 30, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const lots = await db
      .select({
        id: inventoryLots.id,
        productId: inventoryLots.productId,
        productName: products.name,
        quantityCases: inventoryLots.quantityCases,
        boxesPerCase: inventoryLots.boxesPerCase,
        packsPerBox: inventoryLots.packsPerBox,
        totalBoxes: inventoryLots.totalBoxes,
        totalPacks: inventoryLots.totalPacks,
        ownerCostPerBox: inventoryLots.ownerCostPerBox,
        breakerCostPerBox: inventoryLots.breakerCostPerBox,
        ownerCostPerCase: inventoryLots.ownerCostPerCase,
        breakerCostPerCase: inventoryLots.breakerCostPerCase,
        ownerCostPerPack: inventoryLots.ownerCostPerPack,
        breakerCostPerPack: inventoryLots.breakerCostPerPack,
        remainingCases: inventoryLots.remainingCases,
        remainingBoxes: inventoryLots.remainingBoxes,
        remainingPacks: inventoryLots.remainingPacks,
        receivedDate: inventoryLots.receivedDate,
        notes: inventoryLots.notes,
        createdAt: inventoryLots.createdAt,
        updatedAt: inventoryLots.updatedAt,
      })
      .from(inventoryLots)
      .leftJoin(products, eq(inventoryLots.productId, products.id))
      .orderBy(desc(inventoryLots.receivedDate))

    return NextResponse.json({ lots })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/admin/inventory error:', message)
    return NextResponse.json({ error: 'Failed to fetch inventory lots' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 15, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = createInventoryLotSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const data = parsed.data

    // Verify the product exists
    const product = await db.query.products.findFirst({
      where: eq(products.id, data.productId),
    })
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Calculate derived quantities
    const totalBoxes = data.quantityCases * data.boxesPerCase
    const totalPacks = totalBoxes * data.packsPerBox

    // Calculate costs based on entry type
    let ownerCostPerBox: number
    let breakerCostPerBox: number
    let ownerCostPerCase: number
    let breakerCostPerCase: number

    if (data.costEntryType === 'per_case') {
      ownerCostPerCase = data.costPerCase!
      breakerCostPerCase = data.breakerCostPerCase!
      ownerCostPerBox = ownerCostPerCase / data.boxesPerCase
      breakerCostPerBox = breakerCostPerCase / data.boxesPerCase
    } else {
      ownerCostPerBox = data.costPerBox!
      breakerCostPerBox = data.breakerCostPerBox!
      ownerCostPerCase = ownerCostPerBox * data.boxesPerCase
      breakerCostPerCase = breakerCostPerBox * data.boxesPerCase
    }

    const ownerCostPerPack = ownerCostPerBox / data.packsPerBox
    const breakerCostPerPack = breakerCostPerBox / data.packsPerBox

    const [newLot] = await db
      .insert(inventoryLots)
      .values({
        productId: data.productId,
        quantityCases: data.quantityCases,
        boxesPerCase: data.boxesPerCase,
        packsPerBox: data.packsPerBox,
        totalBoxes,
        totalPacks,
        ownerCostPerBox: ownerCostPerBox.toFixed(2),
        breakerCostPerBox: breakerCostPerBox.toFixed(2),
        ownerCostPerCase: ownerCostPerCase.toFixed(2),
        breakerCostPerCase: breakerCostPerCase.toFixed(2),
        ownerCostPerPack: ownerCostPerPack.toFixed(2),
        breakerCostPerPack: breakerCostPerPack.toFixed(2),
        remainingCases: data.quantityCases,
        remainingBoxes: totalBoxes,
        remainingPacks: totalPacks,
        receivedDate: data.receivedDate,
        notes: data.notes || null,
      })
      .returning()

    return NextResponse.json({ lot: newLot }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/admin/inventory error:', message)
    return NextResponse.json({ error: 'Failed to create inventory lot' }, { status: 500 })
  }
}
