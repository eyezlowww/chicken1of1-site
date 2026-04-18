// Zod validation schemas for stream entry forms and API requests

import { z } from 'zod'

export const productSoldSchema = z.object({
  productId: z.string().uuid(),
  costPerUnit: z.number().min(0).max(99999.99),
  amountSold: z.number().int().min(0).max(10000),
})

export const inventoryItemSchema = z.object({
  productId: z.string().uuid(),
  cases: z.number().int().min(0).default(0),
  boxes: z.number().int().min(0).default(0),
  packs: z.number().int().min(0).default(0),
})

export const streamEntrySchema = z.object({
  streamDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  platform: z.enum(['Whatnot']),
  streamSales: z.number().min(0).max(999999.99),
  orderCount: z.number().int().min(0).max(10000),
  productsSold: z.array(productSoldSchema).min(1).max(50),
  inventory: z.array(inventoryItemSchema).max(50).optional(),
  weeklyPeriodId: z.string().uuid(),
  status: z.enum(['draft', 'submitted']).default('draft'),
  adjustmentAmount: z.number().min(-99999.99).max(99999.99).optional(),
  adjustmentNote: z.string().max(500).optional(),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export type ProductSoldInput = z.infer<typeof productSoldSchema>
export type InventoryItemInput = z.infer<typeof inventoryItemSchema>
export type StreamEntryInput = z.infer<typeof streamEntrySchema>
export type LoginInput = z.infer<typeof loginSchema>
