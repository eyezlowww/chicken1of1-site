// Seed script for Chicken1of1 streamer portal database
// Run with: npx tsx lib/db/seed.ts
// Safe to run multiple times -- uses ON CONFLICT DO NOTHING patterns

import { config } from 'dotenv'
config({ path: '.env.local' })

import { Pool } from 'pg'
import { drizzle } from 'drizzle-orm/node-postgres'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { sql } from 'drizzle-orm'
import * as schema from './schema'

function generateRandomPassword(length = 24): string {
  return crypto.randomBytes(length).toString('base64url').slice(0, length)
}

async function seed() {
  // Guard: prevent running in production
  if (process.env.NODE_ENV === 'production') {
    console.error('ERROR: Seed script must not be run in production.')
    process.exit(1)
  }

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set.')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  })
  const db = drizzle(pool, { schema })

  console.log('Seeding database...\n')

  // ── Resolve passwords from env or generate random ones ─────────────────────
  let streamerPassword = process.env.SEED_STREAMER_PASSWORD
  let adminPassword = process.env.SEED_ADMIN_PASSWORD

  if (!streamerPassword) {
    streamerPassword = generateRandomPassword()
    console.log(`  Generated breaker password: ${streamerPassword}`)
    console.log('  (Set SEED_STREAMER_PASSWORD env var to use a fixed password)\n')
  }

  if (!adminPassword) {
    adminPassword = generateRandomPassword()
    console.log(`  Generated admin password: ${adminPassword}`)
    console.log('  (Set SEED_ADMIN_PASSWORD env var to use a fixed password)\n')
  }

  // ── Hash passwords ─────────────────────────────────────────────────────────
  const streamerHash = await bcrypt.hash(streamerPassword, 12)
  const adminHash = await bcrypt.hash(adminPassword, 12)

  // ── Seed users ─────────────────────────────────────────────────────────────
  const streamerUsers = [
    {
      username: 'buh',
      displayName: 'Buh',
      email: 'buh@chicken1of1.com',
      passwordHash: streamerHash,
      role: 'streamer' as const,
    },
    {
      username: 'kccards',
      displayName: 'KC Cards',
      email: 'kccards@chicken1of1.com',
      passwordHash: streamerHash,
      role: 'streamer' as const,
    },
    {
      username: 'evan',
      displayName: 'Evan',
      email: 'evan@chicken1of1.com',
      passwordHash: streamerHash,
      role: 'streamer' as const,
    },
    {
      username: 'jasond',
      displayName: 'Jason D',
      email: 'jasond@chicken1of1.com',
      passwordHash: streamerHash,
      role: 'streamer' as const,
    },
  ]

  const adminUsers = [
    {
      username: 'admin',
      displayName: 'Admin',
      email: 'admin@chicken1of1.com',
      passwordHash: adminHash,
      role: 'admin' as const,
    },
  ]

  const allUsers = [...streamerUsers, ...adminUsers]

  for (const user of allUsers) {
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoNothing({ target: schema.users.username })
    console.log(`  User: ${user.displayName} (${user.role})`)
  }
  console.log('')

  // ── Fetch inserted users for FK references ─────────────────────────────────
  const dbUsers = await db.select().from(schema.users)
  const userMap = new Map(dbUsers.map((u) => [u.username, u]))

  // ── Seed global fee config ─────────────────────────────────────────────────
  const globalFees = [
    {
      name: 'platform_fee',
      rate: '0.101000',
      flatAmount: null,
      feeType: 'percentage' as const,
    },
    {
      name: 'product_fee',
      rate: '0.020000',
      flatAmount: null,
      feeType: 'percentage' as const,
    },
    {
      name: 'per_order_fee',
      rate: null,
      flatAmount: '0.30',
      feeType: 'flat_per_order' as const,
    },
  ]

  for (const fee of globalFees) {
    await db
      .insert(schema.globalFeeConfig)
      .values(fee)
      .onConflictDoNothing({ target: schema.globalFeeConfig.name })
    console.log(`  Global fee: ${fee.name} (${fee.feeType})`)
  }
  console.log('')

  // ── Seed streamer fee configs ──────────────────────────────────────────────
  const streamerFees = [
    { username: 'buh', rate: '0.200000' },
    { username: 'kccards', rate: '0.200000' },
    { username: 'evan', rate: '0.200000' },
    { username: 'jasond', rate: '0.300000' },
  ]

  for (const sf of streamerFees) {
    const user = userMap.get(sf.username)
    if (!user) {
      console.warn(`  WARNING: User ${sf.username} not found, skipping fee config`)
      continue
    }
    // Use raw SQL for upsert since streamer_fee_config has no unique constraint on (user_id, fee_name)
    await db.execute(sql`
      INSERT INTO streamer_fee_config (user_id, fee_name, rate, is_active, effective_from, updated_at)
      SELECT ${user.id}, 'support_fee', ${sf.rate}::decimal, true, CURRENT_DATE, NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM streamer_fee_config
        WHERE user_id = ${user.id} AND fee_name = 'support_fee' AND is_active = true
      )
    `)
    console.log(`  Breaker fee: ${user.displayName} support_fee = ${sf.rate}`)
  }
  console.log('')

  // ── Seed products from mma-products.json (full catalog) ─────────────────────
  const fs = await import('fs')
  const path = await import('path')
  const mmaPath = path.resolve(process.cwd(), 'content/mma-products.json')
  const mmaData = JSON.parse(fs.readFileSync(mmaPath, 'utf-8'))
  const productData: Array<{ name: string; manufacturer: string; year: number }> = mmaData.products.map(
    (p: { name: string; brand: string; year: number }) => ({
      name: p.name,
      manufacturer: p.brand,
      year: p.year,
    })
  )

  for (const product of productData) {
    await db.execute(sql`
      INSERT INTO products (name, manufacturer, year, is_active, created_at)
      SELECT ${product.name}, ${product.manufacturer}, ${product.year}, true, NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM products WHERE name = ${product.name}
      )
    `)
    console.log(`  Product: ${product.name}`)
  }
  console.log(`  Total: ${productData.length} products`)

  console.log('\nSeed complete.')

  await pool.end()
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
