// GET /api/streamdata/admin/submissions?streamer=xxx&status=xxx
// Returns all stream entries across all streamers with calculations
// Filterable by streamer and status
// Admin only

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { streamEntries, users } from '@/lib/db/schema'
import { eq, and, desc, type SQL } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 30, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { searchParams } = new URL(request.url)
    const streamerFilter = searchParams.get('streamer')
    const statusFilter = searchParams.get('status')

    // Build conditions array
    const conditions: SQL[] = []

    if (streamerFilter) {
      conditions.push(eq(streamEntries.userId, streamerFilter))
    }

    if (statusFilter === 'draft' || statusFilter === 'submitted') {
      conditions.push(eq(streamEntries.status, statusFilter))
    }

    const whereClause =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : and(...conditions)
        : undefined

    const streams = await db.query.streamEntries.findMany({
      where: whereClause,
      orderBy: [desc(streamEntries.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            displayName: true,
          },
        },
        productsSold: {
          with: { product: true },
        },
        calculation: true,
        weeklyPeriod: true,
      },
    })

    return NextResponse.json({ streams })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/admin/submissions error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
