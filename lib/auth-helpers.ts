// Reusable auth check helpers for API routes
// Wraps NextAuth session checks with DB verification for consistent security

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

interface AuthResult {
  error: NextResponse | null
  session: { user: AuthUser } | null
}

export async function requireAuth(): Promise<AuthResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    }
  }

  // Verify user exists and is active in the database (not just JWT)
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!dbUser || !dbUser.isActive) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    }
  }

  return {
    error: null,
    session: {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.displayName,
        role: dbUser.role,
      },
    },
  }
}

export async function requireAdmin(): Promise<AuthResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    }
  }

  // Verify user's role is admin in the database (not just JWT claim)
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  })

  if (!dbUser || !dbUser.isActive) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    }
  }

  if (dbUser.role !== 'admin') {
    return {
      error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
      session: null,
    }
  }

  return {
    error: null,
    session: {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.displayName,
        role: dbUser.role,
      },
    },
  }
}
