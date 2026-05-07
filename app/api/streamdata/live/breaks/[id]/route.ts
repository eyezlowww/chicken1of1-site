// DELETE /api/streamdata/live/breaks/[id]
// Remove a break (only from active sessions, owner only)
// Cascade deletes break products via FK constraint

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { liveBreaks, liveSessions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAuth } from '@/lib/auth-helpers'
import { z } from 'zod'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error, session } = await requireAuth()
    if (error) return error

    const { id } = await params
    const idParsed = z.string().uuid().safeParse(id)
    if (!idParsed.success) {
      return NextResponse.json({ error: 'Invalid break ID' }, { status: 400 })
    }

    const userId = session!.user.id

    // Fetch the break with its session
    const breakRecord = await db.query.liveBreaks.findFirst({
      where: eq(liveBreaks.id, id),
      with: {
        session: {
          columns: { id: true, userId: true, status: true },
        },
      },
    })

    if (!breakRecord) {
      return NextResponse.json({ error: 'Break not found' }, { status: 404 })
    }

    // Must be the session owner
    if (breakRecord.session.userId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Can only delete from active sessions
    if (breakRecord.session.status !== 'live') {
      return NextResponse.json(
        { error: 'Cannot delete breaks from an ended session' },
        { status: 409 }
      )
    }

    // Delete the break (cascade deletes products via FK)
    const [deleted] = await db
      .delete(liveBreaks)
      .where(eq(liveBreaks.id, id))
      .returning({ id: liveBreaks.id, breakNumber: liveBreaks.breakNumber })

    return NextResponse.json({ deleted: true, break: deleted })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('DELETE /api/streamdata/live/breaks/[id] error:', message)
    return NextResponse.json(
      { error: 'Failed to delete live break' },
      { status: 500 }
    )
  }
}
