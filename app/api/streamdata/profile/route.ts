// GET /api/streamdata/profile — return current user's profile data
// PUT /api/streamdata/profile — update display name

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-helpers'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export async function GET() {
  const { error, session } = await requireAuth()
  if (error) return error

  return NextResponse.json({
    displayName: session!.user.name,
    email: session!.user.email,
    role: session!.user.role,
  })
}

const updateSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name too long')
    .trim(),
})

export async function PUT(request: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid request data'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { displayName } = parsed.data

    await db
      .update(users)
      .set({ displayName, updatedAt: new Date() })
      .where(eq(users.id, session!.user.id))

    return NextResponse.json({ message: 'Profile updated', displayName })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PUT /api/streamdata/profile error:', message)
    return NextResponse.json({ error: 'Failed to update profile.' }, { status: 500 })
  }
}
