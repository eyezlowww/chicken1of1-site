// POST /api/streamdata/setup
// Set password for an invited streamer using their invite token
// No auth required — this is for users who don't have a password yet

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, inviteTokens } from '@/lib/db/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'

const setupSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per 15 minutes per IP
    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 5, windowMs: 15 * 60 * 1000 })
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(limit.resetIn / 1000)),
          },
        }
      )
    }

    const body = await request.json()
    const parsed = setupSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid request data'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { token, password } = parsed.data

    // Find the token: must exist, not expired, not already used
    const invite = await db.query.inviteTokens.findFirst({
      where: and(
        eq(inviteTokens.token, token),
        isNull(inviteTokens.usedAt),
        gt(inviteTokens.expiresAt, new Date())
      ),
    })

    if (!invite) {
      return NextResponse.json(
        { error: 'Invalid or expired invite link. Please ask your admin for a new invite.' },
        { status: 400 }
      )
    }

    // Hash password with bcrypt (12 rounds)
    const passwordHash = await bcrypt.hash(password, 12)

    // Update user's password
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, invite.userId))

    // Mark token as used
    await db
      .update(inviteTokens)
      .set({ usedAt: new Date() })
      .where(eq(inviteTokens.id, invite.id))

    return NextResponse.json({ message: 'Password set successfully' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/setup error:', message)
    return NextResponse.json(
      { error: 'Failed to set password. Please try again.' },
      { status: 500 }
    )
  }
}
