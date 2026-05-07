// GET /api/streamdata/admin/streamers
// Returns all users with their fee configs
// Admin only
//
// POST /api/streamdata/admin/streamers
// Create a new streamer account
// Body: { username, displayName, email, password, supportFeeRate }
// Admin only — hashes password with bcrypt
//
// PATCH /api/streamdata/admin/streamers
// Update a streamer's displayName, email, or isActive status
// Body: { id, displayName?, email?, isActive? }
// Admin only

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, streamerFeeConfig, streamEntries, inviteTokens } from '@/lib/db/schema'
import { eq, count, sql } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createStreamerSchema = z.object({
  username: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric with underscores'),
  displayName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  supportFeeRate: z.number().min(0).max(1),
})

export async function GET(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const allUsers = await db.query.users.findMany({
      columns: {
        id: true,
        username: true,
        displayName: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      with: {
        streamerFeeConfigs: {
          columns: {
            id: true,
            feeName: true,
            rate: true,
            isActive: true,
            effectiveFrom: true,
          },
        },
      },
    })

    // Map users to include hasPassword flag instead of exposing passwordHash
    const streamers = allUsers.map(({ passwordHash, ...user }) => ({
      ...user,
      hasPassword: passwordHash !== '',
    }))

    return NextResponse.json({ streamers })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('GET /api/streamdata/admin/streamers error:', message)
    return NextResponse.json(
      { error: 'Failed to fetch streamers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const parsed = createStreamerSchema.safeParse(body)

    if (!parsed.success) {
      console.error('POST /api/streamdata/admin/streamers validation error:', parsed.error.message)
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { username, displayName, email, password, supportFeeRate } = parsed.data

    // Check for existing username or email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        displayName,
        email,
        passwordHash,
        role: 'streamer',
      })
      .returning({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      })

    // Create support fee config
    await db.insert(streamerFeeConfig).values({
      userId: newUser.id,
      feeName: 'support_fee',
      rate: supportFeeRate.toString(),
    })

    return NextResponse.json({ streamer: newUser }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/admin/streamers error:', message)
    return NextResponse.json(
      { error: 'Failed to create streamer' },
      { status: 500 }
    )
  }
}

const patchStreamerSchema = z.object({
  id: z.string().uuid(),
  displayName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const parsed = patchStreamerSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const { id, displayName, email, isActive } = parsed.data

    const user = await db.query.users.findFirst({ where: eq(users.id, id) })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.role === 'admin' && isActive === false) {
      return NextResponse.json({ error: 'Cannot deactivate admin accounts' }, { status: 403 })
    }

    // Check email uniqueness if changing email
    if (email && email !== user.email) {
      const existing = await db.query.users.findFirst({ where: eq(users.email, email) })
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
      }
    }

    const updates: Record<string, unknown> = { updatedAt: sql`now()` }
    if (displayName !== undefined) updates.displayName = displayName
    if (email !== undefined) updates.email = email
    if (isActive !== undefined) updates.isActive = isActive

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        email: users.email,
        role: users.role,
        isActive: users.isActive,
      })

    return NextResponse.json({ streamer: updated })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('PATCH /api/streamdata/admin/streamers error:', message)
    return NextResponse.json({ error: 'Failed to update streamer' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const body = await request.json()
    const id = body?.id
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    // Can't delete admin accounts
    const user = await db.query.users.findFirst({ where: eq(users.id, id) })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Cannot delete admin accounts' }, { status: 403 })
    }

    // Check if breaker has any stream submissions
    const [submissions] = await db
      .select({ value: count() })
      .from(streamEntries)
      .where(eq(streamEntries.userId, id))

    if ((submissions?.value ?? 0) > 0) {
      return NextResponse.json({
        error: 'This breaker has stream submissions on record and cannot be deleted. Deactivate them instead to preserve historical data.',
      }, { status: 409 })
    }

    // Safe to delete — remove fee configs, invite tokens, then user
    await db.delete(streamerFeeConfig).where(eq(streamerFeeConfig.userId, id))
    await db.delete(inviteTokens).where(eq(inviteTokens.userId, id))
    await db.delete(users).where(eq(users.id, id))

    return NextResponse.json({ deleted: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('DELETE /api/streamdata/admin/streamers error:', message)
    return NextResponse.json({ error: 'Failed to delete breaker' }, { status: 500 })
  }
}
