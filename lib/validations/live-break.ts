// Zod validation schemas for live break tracking API routes

import { z } from 'zod'

// ── Session schemas ───────────────────────────────────────────────────────────

export const createSessionSchema = z.object({
  platform: z.string().max(50).default('Whatnot'),
  notes: z.string().max(2000).nullable().optional(),
})

export const endSessionSchema = z.object({
  action: z.literal('end'),
})

// ── Break schemas ─────────────────────────────────────────────────────────────

export const breakProductSchema = z.object({
  productId: z.string().uuid().nullable().optional(),
  productName: z.string().min(1).max(200),
  quantity: z.number().int().min(1).max(1000).default(1),
  costPerUnit: z.number().min(0).max(99999.99),
})

export const createBreakSchema = z.object({
  sessionId: z.string().uuid(),
  products: z.array(breakProductSchema).min(1).max(50),
  spotsSold: z.number().int().min(1).max(10000),
  salesTotal: z.number().min(0).max(999999.99),
  notes: z.string().max(2000).nullable().optional(),
})

// ── Types ─────────────────────────────────────────────────────────────────────

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type EndSessionInput = z.infer<typeof endSessionSchema>
export type BreakProductInput = z.infer<typeof breakProductSchema>
export type CreateBreakInput = z.infer<typeof createBreakSchema>
