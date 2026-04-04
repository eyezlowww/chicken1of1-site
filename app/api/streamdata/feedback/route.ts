// POST /api/streamdata/feedback — submit user feedback via email
// Any authenticated user can submit feedback (breakers and admins)

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { requireAuth } from '@/lib/auth-helpers'
import { z } from 'zod'

const resend = new Resend(process.env.RESEND_API_KEY)

const feedbackSchema = z.object({
  type: z.enum(['suggestion', 'bug', 'feature'], {
    error: 'Type must be suggestion, bug, or feature',
  }),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be under 2000 characters')
    .trim(),
})

const typeLabels: Record<string, string> = {
  suggestion: 'Suggestion',
  bug: 'Bug Report',
  feature: 'Feature Request',
}

export async function POST(request: NextRequest) {
  const { error, session } = await requireAuth()
  if (error) return error

  try {
    const body = await request.json()
    const parsed = feedbackSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'Invalid request data'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { type, message } = parsed.data
    const user = session!.user
    const label = typeLabels[type] || type

    const emailContent = `
StreamData Portal Feedback

Type: ${label}
From: ${user.name} (${user.email})
Role: ${user.role === 'streamer' ? 'Breaker' : user.role}

Message:
${message}

---
Sent from StreamData Portal Feedback
Time: ${new Date().toLocaleString()}
    `.trim()

    await resend.emails.send({
      from: 'Feedback <noreply@chicken1of1.com>',
      to: ['hello@chicken1of1.com'],
      subject: `[StreamData Feedback] ${label} from ${user.name}`,
      text: emailContent,
      replyTo: user.email,
    })

    return NextResponse.json({ message: 'Feedback submitted successfully!' }, { status: 200 })
  } catch (err) {
    console.error('Feedback submission error:', err)
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again.' },
      { status: 500 }
    )
  }
}
