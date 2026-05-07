// GET /api/streamdata/admin/products
// Returns all products (active and inactive), ordered by year desc, name asc
// Admin only
//
// POST /api/streamdata/admin/products
// Create a new product
// Body: { name, manufacturer?, year? }
// Admin only
//
// PATCH /api/streamdata/admin/products
// Toggle product active/inactive
// Body: { id, isActive }
// Admin only

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'

const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  manufacturer: z.string().max(50).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
})

const toggleProductSchema = z.object({
  id: z.string().uuid(),
  isActive: z.boolean(),
})

const updateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  manufacturer: z.string().max(50).optional(),
  year: z.number().int().min(1900).max(2100).optional(),
})

const deleteProductSchema = z.object({
  id: z.string().uuid(),
})

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const allProducts = await db
      .select({
        id: products.id,
        name: products.name,
        manufacturer: products.manufacturer,
        year: products.year,
        isActive: products.isActive,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(sql`COALESCE(${products.year}, 0)`), asc(products.name))

    return NextResponse.json({ products: allProducts })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/admin/products error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const parsed = createProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { name, manufacturer, year } = parsed.data

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        manufacturer: manufacturer || null,
        year: year || null,
      })
      .returning({
        id: products.id,
        name: products.name,
        manufacturer: products.manufacturer,
        year: products.year,
        isActive: products.isActive,
        createdAt: products.createdAt,
      })

    return NextResponse.json({ product: newProduct }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/admin/products error:', message)
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const parsed = toggleProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { id, isActive } = parsed.data

    const [updated] = await db
      .update(products)
      .set({ isActive })
      .where(eq(products.id, id))
      .returning({
        id: products.id,
        name: products.name,
        isActive: products.isActive,
      })

    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PATCH /api/streamdata/admin/products error:', message)
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const parsed = updateProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { id, name, manufacturer, year } = parsed.data

    const [updated] = await db
      .update(products)
      .set({ name, manufacturer: manufacturer || null, year: year || null })
      .where(eq(products.id, id))
      .returning({
        id: products.id,
        name: products.name,
        manufacturer: products.manufacturer,
        year: products.year,
        isActive: products.isActive,
      })

    if (!updated) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PUT /api/streamdata/admin/products error:', message)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const parsed = deleteProductSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const { id } = parsed.data

    try {
      const [deleted] = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning({ id: products.id, name: products.name })

      if (!deleted) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 })
      }

      return NextResponse.json({ deleted: true, product: deleted })
    } catch (deleteErr: any) {
      // FK constraint — product is referenced by stream entries or inventory
      if (deleteErr?.code === '23503' || deleteErr?.message?.includes('foreign key') || deleteErr?.message?.includes('violates')) {
        // Auto-deactivate instead of delete
        await db
          .update(products)
          .set({ isActive: false })
          .where(eq(products.id, id))

        return NextResponse.json({
          error: 'Product has been used in stream submissions and cannot be deleted. It has been deactivated instead.',
          deactivated: true,
        }, { status: 409 })
      }
      throw deleteErr
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('DELETE /api/streamdata/admin/products error:', message)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
