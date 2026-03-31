// Drizzle ORM schema for Chicken1of1 streamer portal
// Defines all tables for stream tracking, fee calculation, and payout management

import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  date,
  timestamp,
  pgEnum,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Enums ──────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', ['streamer', 'admin'])
export const feeTypeEnum = pgEnum('fee_type', ['percentage', 'flat_per_order'])
export const periodStatusEnum = pgEnum('period_status', ['open', 'closed'])
export const entryStatusEnum = pgEnum('entry_status', ['draft', 'submitted'])

// ── Users ──────────────────────────────────────────────────────────────────────

export const users = pgTable('portal_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: varchar('username', { length: 50 }).unique().notNull(),
  displayName: varchar('display_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').default('streamer').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Products ───────────────────────────────────────────────────────────────────

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  manufacturer: varchar('manufacturer', { length: 50 }),
  year: integer('year'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Global Fee Config ──────────────────────────────────────────────────────────

export const globalFeeConfig = pgTable('global_fee_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).unique().notNull(),
  rate: decimal('rate', { precision: 10, scale: 6 }),
  flatAmount: decimal('flat_amount', { precision: 10, scale: 2 }),
  feeType: feeTypeEnum('fee_type').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  updatedBy: uuid('updated_by').references(() => users.id),
})

// ── Streamer Fee Config ────────────────────────────────────────────────────────

export const streamerFeeConfig = pgTable('streamer_fee_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  feeName: varchar('fee_name', { length: 50 }).notNull(),
  rate: decimal('rate', { precision: 10, scale: 6 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  effectiveFrom: date('effective_from').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Weekly Periods ─────────────────────────────────────────────────────────────

export const weeklyPeriods = pgTable('weekly_periods', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  weekNumber: integer('week_number').notNull(),
  status: periodStatusEnum('status').default('open').notNull(),
  weeklyAdjustments: decimal('weekly_adjustments', { precision: 10, scale: 2 }).default('0'),
  adjustmentNotes: text('adjustment_notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Stream Entries ─────────────────────────────────────────────────────────────

export const streamEntries = pgTable('stream_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  weeklyPeriodId: uuid('weekly_period_id')
    .references(() => weeklyPeriods.id)
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  streamDate: date('stream_date').notNull(),
  platform: varchar('platform', { length: 50 }).default('Whatnot'),
  streamSales: decimal('stream_sales', { precision: 10, scale: 2 }).notNull(),
  orderCount: integer('order_count').notNull(),
  status: entryStatusEnum('status').default('draft').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// ── Stream Products Sold ───────────────────────────────────────────────────────

export const streamProductsSold = pgTable('stream_products_sold', {
  id: uuid('id').defaultRandom().primaryKey(),
  streamEntryId: uuid('stream_entry_id')
    .references(() => streamEntries.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => products.id)
    .notNull(),
  costPerUnit: decimal('cost_per_unit', { precision: 10, scale: 2 }).notNull(),
  amountSold: integer('amount_sold').notNull(),
})

// ── Stream Inventory ───────────────────────────────────────────────────────────

export const streamInventory = pgTable('stream_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  streamEntryId: uuid('stream_entry_id')
    .references(() => streamEntries.id, { onDelete: 'cascade' })
    .notNull(),
  productId: uuid('product_id')
    .references(() => products.id)
    .notNull(),
  cases: integer('cases').default(0),
  boxes: integer('boxes').default(0),
  packs: integer('packs').default(0),
})

// ── Stream Calculations ────────────────────────────────────────────────────────

export const streamCalculations = pgTable(
  'stream_calculations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    streamEntryId: uuid('stream_entry_id')
      .references(() => streamEntries.id)
      .notNull(),
    totalCogs: decimal('total_cogs', { precision: 10, scale: 2 }).notNull(),
    platformFee: decimal('platform_fee', { precision: 10, scale: 2 }).notNull(),
    productFee: decimal('product_fee', { precision: 10, scale: 2 }).notNull(),
    orderAmountCost: decimal('order_amount_cost', { precision: 10, scale: 2 }).notNull(),
    grossProfit: decimal('gross_profit', { precision: 10, scale: 2 }).notNull(),
    supportFee: decimal('support_fee', { precision: 10, scale: 2 }).notNull(),
    breakerPayout: decimal('breaker_payout', { precision: 10, scale: 2 }).notNull(),
    chickenPayout: decimal('chicken_payout', { precision: 10, scale: 2 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('stream_calculations_entry_idx').on(table.streamEntryId)]
)

// ── Payout Records ─────────────────────────────────────────────────────────────

export const payoutRecords = pgTable('payout_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  weeklyPeriodId: uuid('weekly_period_id')
    .references(() => weeklyPeriods.id)
    .notNull(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  runningSalesTotal: decimal('running_sales_total', { precision: 10, scale: 2 }),
  runningBreakerTotal: decimal('running_breaker_total', { precision: 10, scale: 2 }),
  runningChickenTotal: decimal('running_chicken_total', { precision: 10, scale: 2 }),
  weeklyAdjustments: decimal('weekly_adjustments', { precision: 10, scale: 2 }).default('0'),
  adjustmentNotes: text('adjustment_notes'),
  breakersTotalWeeklyPayout: decimal('breakers_total_weekly_payout', {
    precision: 10,
    scale: 2,
  }),
  isPaid: boolean('is_paid').default(false).notNull(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Invite Tokens ─────────────────────────────────────────────────────────────

export const inviteTokens = pgTable('invite_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id)
    .notNull(),
  token: varchar('token', { length: 255 }).unique().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  usedAt: timestamp('used_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// ── Relations ──────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  streamerFeeConfigs: many(streamerFeeConfig),
  weeklyPeriods: many(weeklyPeriods),
  streamEntries: many(streamEntries),
  payoutRecords: many(payoutRecords),
  inviteTokens: many(inviteTokens),
}))

export const inviteTokensRelations = relations(inviteTokens, ({ one }) => ({
  user: one(users, {
    fields: [inviteTokens.userId],
    references: [users.id],
  }),
}))

export const globalFeeConfigRelations = relations(globalFeeConfig, ({ one }) => ({
  updatedByUser: one(users, {
    fields: [globalFeeConfig.updatedBy],
    references: [users.id],
  }),
}))

export const streamerFeeConfigRelations = relations(streamerFeeConfig, ({ one }) => ({
  user: one(users, {
    fields: [streamerFeeConfig.userId],
    references: [users.id],
  }),
}))

export const weeklyPeriodsRelations = relations(weeklyPeriods, ({ one, many }) => ({
  user: one(users, {
    fields: [weeklyPeriods.userId],
    references: [users.id],
  }),
  streamEntries: many(streamEntries),
  payoutRecords: many(payoutRecords),
}))

export const streamEntriesRelations = relations(streamEntries, ({ one, many }) => ({
  weeklyPeriod: one(weeklyPeriods, {
    fields: [streamEntries.weeklyPeriodId],
    references: [weeklyPeriods.id],
  }),
  user: one(users, {
    fields: [streamEntries.userId],
    references: [users.id],
  }),
  productsSold: many(streamProductsSold),
  inventory: many(streamInventory),
  calculation: one(streamCalculations, {
    fields: [streamEntries.id],
    references: [streamCalculations.streamEntryId],
  }),
}))

export const streamProductsSoldRelations = relations(streamProductsSold, ({ one }) => ({
  streamEntry: one(streamEntries, {
    fields: [streamProductsSold.streamEntryId],
    references: [streamEntries.id],
  }),
  product: one(products, {
    fields: [streamProductsSold.productId],
    references: [products.id],
  }),
}))

export const streamInventoryRelations = relations(streamInventory, ({ one }) => ({
  streamEntry: one(streamEntries, {
    fields: [streamInventory.streamEntryId],
    references: [streamEntries.id],
  }),
  product: one(products, {
    fields: [streamInventory.productId],
    references: [products.id],
  }),
}))

export const streamCalculationsRelations = relations(streamCalculations, ({ one }) => ({
  streamEntry: one(streamEntries, {
    fields: [streamCalculations.streamEntryId],
    references: [streamEntries.id],
  }),
}))

export const payoutRecordsRelations = relations(payoutRecords, ({ one }) => ({
  weeklyPeriod: one(weeklyPeriods, {
    fields: [payoutRecords.weeklyPeriodId],
    references: [weeklyPeriods.id],
  }),
  user: one(users, {
    fields: [payoutRecords.userId],
    references: [users.id],
  }),
}))

export const productsRelations = relations(products, ({ many }) => ({
  streamProductsSold: many(streamProductsSold),
  streamInventory: many(streamInventory),
}))
