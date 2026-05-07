// GET /api/streamdata/live/sessions
// Returns user's live sessions (most recent first)
// If ?active=true, returns only the active/live session
//
// POST /api/streamdata/live/sessions
// Start a new live session. Only one active session allowed per user.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { liveSessions } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { createSessionSchema } from '@/lib/validations/live-break'

export async function GET(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const userId = session!.user.id
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    if (activeOnly) {
      const activeSession = await db.query.liveSessions.findFirst({
        where: and(
          eq(liveSessions.userId, userId),
          eq(liveSessions.status, 'live')
        ),
        with: {
          breaks: {
            with: { products: true },
            orderBy: (breaks, { asc }) => [asc(breaks.breakNumber)],
          },
        },
      })

      return NextResponse.json({ session: activeSession || null })
    }

    const sessions = await db.query.liveSessions.findMany({
      where: eq(liveSessions.userId, userId),
      orderBy: [desc(liveSessions.startedAt)],
      with: {
        breaks: {
          with: { products: true },
          orderBy: (breaks, { asc }) => [asc(breaks.breakNumber)],
        },
      },
    })

    return NextResponse.json({ sessions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/live/sessions error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch live sessions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    // Reject oversized payloads (10KB limit — sessions are small)
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > 10240) {
      return NextResponse.json(
        { error: 'Request payload too large' },
        { status: 413 }
      )
    }

    const body = await request.json()
    const parsed = createSessionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      )
    }

    const userId = session!.user.id

    // Enforce: only one active session per user
    const existingActive = await db.query.liveSessions.findFirst({
      where: and(
        eq(liveSessions.userId, userId),
        eq(liveSessions.status, 'live')
      ),
    })

    if (existingActive) {
      return NextResponse.json(
        { error: 'You already have an active live session. End it before starting a new one.' },
        { status: 409 }
      )
    }

    const [newSession] = await db
      .insert(liveSessions)
      .values({
        userId,
        platform: parsed.data.platform,
        startedAt: new Date(),
        status: 'live',
        notes: parsed.data.notes || null,
      })
      .returning()

    return NextResponse.json({ session: newSession }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/live/sessions error:', message)
    return NextResponse.json(
      { error: 'Failed to create live session' },
      { status: 500 }
    )
  }
}
