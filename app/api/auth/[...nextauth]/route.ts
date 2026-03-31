// NextAuth API route handler with rate limiting on login attempts

import { handlers } from '@/lib/auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { NextRequest, NextResponse } from 'next/server'

export const { GET } = handlers

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)

  // Rate limit: 5 attempts per 15 minutes per IP
  const limiter = rateLimit(ip, {
    maxRequests: 20,
    windowMs: 5 * 60 * 1000, // 5 minutes
  })

  if (!limiter.success) {
    return NextResponse.json(
      {
        error: 'Too many login attempts. Please try again later.',
        retryAfterMs: limiter.resetIn,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(limiter.resetIn / 1000)),
        },
      }
    )
  }

  return handlers.POST(request)
}
