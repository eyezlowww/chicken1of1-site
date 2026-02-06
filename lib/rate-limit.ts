// Simple in-memory rate limiter for API routes
// Note: This resets on serverless function cold starts, but provides basic protection

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

interface RateLimitConfig {
  maxRequests: number  // Maximum requests allowed
  windowMs: number     // Time window in milliseconds
}

export function rateLimit(
  ip: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 60000 }
): { success: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const key = ip

  // Clean up old entries periodically
  if (Math.random() < 0.1) {
    for (const k in store) {
      if (store[k].resetTime < now) {
        delete store[k]
      }
    }
  }

  if (!store[key] || store[key].resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowMs,
    }
  }

  store[key].count++

  if (store[key].count > config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: store[key].resetTime - now,
    }
  }

  return {
    success: true,
    remaining: config.maxRequests - store[key].count,
    resetIn: store[key].resetTime - now,
  }
}

export function getClientIp(request: Request): string {
  // Try various headers for the real IP
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // Fallback
  return 'unknown'
}
