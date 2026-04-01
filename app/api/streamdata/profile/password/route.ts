// POST /api/streamdata/profile/password — change current user's password
// Requires: valid session, correct current password, new password min 8 chars

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = passwordSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid request data'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { currentPassword, newPassword } = parsed.data

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password.' },
        { status: 400 }
      )
    }

    // Fetch user's current password hash from the database
    const dbUser = await db.query.users.findFirst({
      where: eq(users.id, session!.user.id),
      columns: { passwordHash: true },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 })
    }

    // Hash new password with bcrypt (12 rounds, matching setup route)
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update password in database
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, session!.user.id))

    return NextResponse.json({ message: 'Password updated successfully.' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/profile/password error:', message)
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 })
  }
}
