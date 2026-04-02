// POST /api/streamdata/admin/invite
// Invite a new streamer via magic link email
// Admin only — creates user without password, sends invite email

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, streamerFeeConfig, inviteTokens } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-helpers'
import { z } from 'zod'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

const inviteSchema = z.object({
  email: z.string().email(),
  displayName: z.string().min(1).max(100),
  username: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric with underscores'),
  supportFeeRate: z.number().min(0).max(1),
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
    const parsed = inviteSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid request data'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { email, displayName, username, supportFeeRate } = parsed.data

    // Check for existing username or email
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    })
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const existingEmail = await db.query.users.findFirst({
      where: eq(users.email, email),
    })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Create user with empty password hash (cannot log in until they set password)
    // bcrypt.compare will always return false for an empty string hash
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        displayName,
        email,
        passwordHash: '',
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

    // Generate invite token (64 hex chars)
    const token = crypto.randomBytes(32).toString('hex')

    // Store token with 72-hour expiry
    const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000)
    await db.insert(inviteTokens).values({
      userId: newUser.id,
      token,
      expiresAt,
    })

    // Send invite email
    const baseUrl = process.env.NEXTAUTH_URL || 'https://chicken1of1.com'
    const setupLink = `${baseUrl}/streamdata/setup?token=${token}`

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Chicken1of1 StreamData <noreply@chicken1of1.com>',
      to: [email],
      subject: "You're invited to Chicken1of1 StreamData",
      text: `Hey ${displayName}!

You've been invited to join the Chicken1of1 StreamData portal as a streamer.

Click the link below to set your password and get started:

${setupLink}

This link expires in 72 hours. If it expires, ask your admin to resend the invite.

Bauk Bauk Baby!
The Chicken1of1 Team`,
    })

    if (emailError) {
      console.error('Resend invite email error:', emailError)
      // User was created but email failed — inform the admin so they can resend
      return NextResponse.json(
        {
          streamer: newUser,
          warning: 'Streamer created but invite email failed to send',
          emailError: emailError.message,
        },
        { status: 201 }
      )
    }

    console.log('Invite email sent successfully:', emailData?.id)
    return NextResponse.json({ streamer: newUser }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('POST /api/streamdata/admin/invite error:', message)
    return NextResponse.json(
      { error: `Failed to invite streamer: ${message}` },
      { status: 500 }
    )
  }
}
