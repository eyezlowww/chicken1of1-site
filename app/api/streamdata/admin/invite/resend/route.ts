// POST /api/streamdata/admin/invite/resend
// Resend invite email for a streamer who hasn't set their password yet
// Admin only — invalidates existing tokens and sends a new one

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, inviteTokens } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const resendSchema = z.object({
  userId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const { error } = await requireAdmin()
    if (error) return error

    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 10, windowMs: 60000 })
    if (!limit.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const parsed = resendSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }

    const { userId } = parsed.data

    // Verify user exists
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Invalidate existing unused tokens by marking them as used
    await db
      .update(inviteTokens)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(inviteTokens.userId, userId),
          isNull(inviteTokens.usedAt)
        )
      )

    // Generate new invite token (64 hex chars)
    const token = crypto.randomBytes(32).toString('hex')

    // Store with 72-hour expiry
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000)
    await db.insert(inviteTokens).values({
      userId,
      token,
      expiresAt,
    })

    // Send invite email
    const baseUrl = process.env.NEXTAUTH_URL || 'https://chicken1of1.com'
    const setupLink = `${baseUrl}/streamdata/setup?token=${token}`

    await resend.emails.send({
      from: 'Chicken1of1 StreamData <noreply@chicken1of1.com>',
      to: [user.email],
      subject: "You're invited to Chicken1of1 StreamData",
      text: `Hey ${user.displayName}!

You've been invited to join the Chicken1of1 StreamData portal as a streamer.

Click the link below to set your password and get started:

${setupLink}

This link expires in 72 hours. If it expires, ask your admin to resend the invite.

Bauk Bauk Baby!
The Chicken1of1 Team`,
    })

    return NextResponse.json({ message: 'Invite resent successfully' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/admin/invite/resend error:', message)
    return NextResponse.json(
      { error: 'Failed to resend invite' },
      { status: 500 }
    )
  }
}
