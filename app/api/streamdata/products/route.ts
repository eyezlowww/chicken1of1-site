// GET /api/streamdata/products
// Returns all active products, ordered by name
// Auth required (any authenticated user)

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const activeProducts = await db
      .select({
        id: products.id,
        name: products.name,
        manufacturer: products.manufacturer,
        year: products.year,
      })
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(asc(products.name))

    return NextResponse.json({ products: activeProducts })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/products error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
