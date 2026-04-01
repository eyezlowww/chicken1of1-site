// POST /api/streamdata/forgot-password
// Generates a password reset token and sends an email with a reset link.
// Reuses invite_tokens table — the setup page handles the actual password change.
// Always returns success to avoid revealing whether an email exists.

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, inviteTokens } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { z } from 'zod'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const GENERIC_SUCCESS_MESSAGE =
  "If an account with that email exists, we've sent a password reset link."

export async function POST(request: NextRequest) {
  try {
    // Strict rate limit: 3 requests per 15 minutes per IP
    const ip = getClientIp(request)
    const limit = rateLimit(ip, { maxRequests: 3, windowMs: 15 * 60 * 1000 })
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      // Return generic success even on bad input to avoid info leakage
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE })
    }

    const { email } = parsed.data

    // Look up user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase().trim()),
    })

    if (!user) {
      // Do NOT reveal that the email doesn't exist
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE })
    }

    // Invalidate any existing unused tokens for this user
    // We mark them as "used" so the setup page rejects them
    const now = new Date()
    const existingTokens = await db.query.inviteTokens.findMany({
      where: and(eq(inviteTokens.userId, user.id), isNull(inviteTokens.usedAt)),
    })

    for (const t of existingTokens) {
      await db
        .update(inviteTokens)
        .set({ usedAt: now })
        .where(eq(inviteTokens.id, t.id))
    }

    // Generate a new token (64 hex chars)
    const token = crypto.randomBytes(32).toString('hex')

    // Store with 1-hour expiry
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)
    await db.insert(inviteTokens).values({
      userId: user.id,
      token,
      expiresAt,
    })

    // Send reset email via Resend
    const baseUrl = process.env.NEXTAUTH_URL || 'https://chicken1of1.com'
    const resetLink = `${baseUrl}/streamdata/setup?token=${token}`

    await resend.emails.send({
      from: 'Chicken1of1 StreamData <noreply@chicken1of1.com>',
      to: [user.email],
      subject: 'Reset your StreamData password',
      text: `Hey ${user.displayName}!

We received a request to reset your StreamData portal password.

Click the link below to set a new password:

${resetLink}

This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password won't change.

Bauk Bauk Baby!
The Chicken1of1 Team`,
    })

    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/forgot-password error:', message)
    // Still return generic success on server errors to avoid info leakage
    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE })
  }
}
