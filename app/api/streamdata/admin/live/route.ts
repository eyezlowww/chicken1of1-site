// GET /api/streamdata/admin/live
// Admin view — return all live sessions across all users
// Includes break counts, totals, and user display names

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { liveSessions, liveBreaks, users } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    // Fetch all sessions with aggregated break data and user info
    const sessions = await db
      .select({
        id: liveSessions.id,
        userId: liveSessions.userId,
        userDisplayName: users.displayName,
        username: users.username,
        platform: liveSessions.platform,
        startedAt: liveSessions.startedAt,
        endedAt: liveSessions.endedAt,
        status: liveSessions.status,
        notes: liveSessions.notes,
        createdAt: liveSessions.createdAt,
        breakCount: sql<number>`coalesce(count(${liveBreaks.id}), 0)::int`,
        totalSales: sql<string>`coalesce(sum(${liveBreaks.salesTotal}::numeric), 0)::text`,
        totalCogs: sql<string>`coalesce(sum(${liveBreaks.totalCogs}::numeric), 0)::text`,
        totalProfit: sql<string>`coalesce(sum(${liveBreaks.profit}::numeric), 0)::text`,
      })
      .from(liveSessions)
      .leftJoin(users, eq(liveSessions.userId, users.id))
      .leftJoin(liveBreaks, eq(liveSessions.id, liveBreaks.sessionId))
      .groupBy(
        liveSessions.id,
        liveSessions.userId,
        users.displayName,
        users.username,
        liveSessions.platform,
        liveSessions.startedAt,
        liveSessions.endedAt,
        liveSessions.status,
        liveSessions.notes,
        liveSessions.createdAt
      )
      .orderBy(desc(liveSessions.startedAt))

    return NextResponse.json({ sessions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/admin/live error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch live sessions' },
      { status: 500 }
    )
  }
}
