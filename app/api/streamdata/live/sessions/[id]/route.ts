// GET /api/streamdata/live/sessions/[id]
// Return full session with all breaks and their products
// Must be session owner or admin
//
// PUT /api/streamdata/live/sessions/[id]
// End the session (set endedAt, status to 'ended')
// Must be session owner

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { liveSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { endSessionSchema } from '@/lib/validations/live-break'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 30, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await params
    const idParsed = z.string().uuid().safeParse(id)
    if (!idParsed.success) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }

    const liveSession = await db.query.liveSessions.findFirst({
      where: eq(liveSessions.id, id),
      with: {
        user: {
          columns: { id: true, displayName: true, username: true },
        },
        breaks: {
          with: { products: true },
          orderBy: (breaks, { asc }) => [asc(breaks.breakNumber)],
        },
      },
    })

    if (!liveSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Must be owner or admin
    const userId = session!.user.id
    const isAdmin = session!.user.role === 'admin'
    if (liveSession.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ session: liveSession })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/live/sessions/[id] error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch live session' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 10, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { id } = await params
    const idParsed = z.string().uuid().safeParse(id)
    if (!idParsed.success) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 })
    }

    const body = await request.json()
    const parsed = endSessionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input. Expected { "action": "end" }' },
        { status: 400 }
      )
    }

    const userId = session!.user.id

    // Fetch session and verify ownership
    const liveSession = await db.query.liveSessions.findFirst({
      where: eq(liveSessions.id, id),
    })

    if (!liveSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (liveSession.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (liveSession.status === 'ended') {
      return NextResponse.json(
        { error: 'Session is already ended' },
        { status: 409 }
      )
    }

    const [updatedSession] = await db
      .update(liveSessions)
      .set({
        status: 'ended',
        endedAt: new Date(),
      })
      .where(eq(liveSessions.id, id))
      .returning()

    return NextResponse.json({ session: updatedSession })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PUT /api/streamdata/live/sessions/[id] error:', message)
    return NextResponse.json(
      { error: 'Failed to end live session' },
      { status: 500 }
    )
  }
}
