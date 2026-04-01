// Admin inventory page — shows per-streamer inventory and combined totals
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { streamInventory, streamEntries, products, users } from '@/lib/db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'

interface InventoryItem {
  productName: string
  cases: number
  boxes: number
  packs: number
  streamDate: string
}

interface StreamerInventory {
  streamerName: string
  streamerId: string
  items: InventoryItem[]
  lastUpdated: string
}

interface TotalInventory {
  productName: string
  totalCases: number
  totalBoxes: number
  totalPacks: number
}

export default async function InventoryPage() {
  const session = await auth()
  if (!session) redirect('/streamdata/login')

  const isAdmin = (session.user as any).role === 'admin'
  if (!isAdmin) redirect('/streamdata/dashboard')

  let streamerInventories: StreamerInventory[] = []
  let totalInventory: TotalInventory[] = []

  try {
    // Get all streamers
    const streamers = await db
      .select({ id: users.id, displayName: users.displayName })
      .from(users)
      .where(eq(users.role, 'streamer'))
      .orderBy(users.displayName)

    // For each streamer, get their LATEST stream's inventory
    for (const streamer of streamers) {
      // Find their most recent stream entry that has inventory data
      const latestStream = await db
        .select({
          streamEntryId: streamEntries.id,
          streamDate: streamEntries.streamDate,
        })
        .from(streamEntries)
        .innerJoin(streamInventory, eq(streamInventory.streamEntryId, streamEntries.id))
        .where(eq(streamEntries.userId, streamer.id))
        .orderBy(desc(streamEntries.streamDate))
        .limit(1)

      if (latestStream.length === 0) {
        streamerInventories.push({
          streamerName: streamer.displayName,
          streamerId: streamer.id,
          items: [],
          lastUpdated: 'No data',
        })
        continue
      }

      const entryId = latestStream[0].streamEntryId
      const streamDate = latestStream[0].streamDate?.toString() ?? ''

      // Get inventory items for that stream
      const items = await db
        .select({
          productName: products.name,
          cases: streamInventory.cases,
          boxes: streamInventory.boxes,
          packs: streamInventory.packs,
        })
        .from(streamInventory)
        .innerJoin(products, eq(streamInventory.productId, products.id))
        .where(eq(streamInventory.streamEntryId, entryId))
        .orderBy(products.name)

      streamerInventories.push({
        streamerName: streamer.displayName,
        streamerId: streamer.id,
        items: items.map((item) => ({
          productName: item.productName,
          cases: item.cases ?? 0,
          boxes: item.boxes ?? 0,
          packs: item.packs ?? 0,
          streamDate,
        })),
        lastUpdated: streamDate,
      })
    }

    // Build combined total inventory across all streamers
    const totalsMap = new Map<string, TotalInventory>()
    for (const si of streamerInventories) {
      for (const item of si.items) {
        const existing = totalsMap.get(item.productName)
        if (existing) {
          existing.totalCases += item.cases
          existing.totalBoxes += item.boxes
          existing.totalPacks += item.packs
        } else {
          totalsMap.set(item.productName, {
            productName: item.productName,
            totalCases: item.cases,
            totalBoxes: item.boxes,
            totalPacks: item.packs,
          })
        }
      }
    }
    totalInventory = Array.from(totalsMap.values()).sort((a, b) =>
      a.productName.localeCompare(b.productName)
    )
  } catch (err) {
    console.error('Inventory query error:', (err as Error).message)
  }

  const hasAnyInventory = streamerInventories.some((s) => s.items.length > 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Inventory</h1>
      <p className="mt-1 text-sm text-cage-400">
        Current inventory in hand across all breakers
      </p>

      {!hasAnyInventory ? (
        <div className="mt-8 rounded-xl border border-blood-900/40 bg-black p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-cage-600" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <p className="mt-4 text-cage-400">No inventory data yet.</p>
          <p className="mt-1 text-sm text-cage-500">
            Inventory is recorded when breakers submit their streams.
          </p>
        </div>
      ) : (
        <>
          {/* ── Combined Total Inventory ───────────────────────────────── */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold text-white">
              Total Inventory
              <span className="ml-2 text-sm font-normal text-cage-400">
                (combined across all breakers)
              </span>
            </h2>
            <div className="overflow-x-auto rounded-xl border border-blood-900/40 bg-black">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blood-900/40 text-left text-xs uppercase text-cage-400">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Cases</th>
                    <th className="px-4 py-3 text-right">Boxes</th>
                    <th className="px-4 py-3 text-right">Packs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cage-700/30">
                  {totalInventory.map((item) => (
                    <tr key={item.productName} className="text-cage-300 hover:bg-dark-800/50">
                      <td className="px-4 py-3 font-medium text-white">{item.productName}</td>
                      <td className="px-4 py-3 text-right font-mono text-gold-400">{item.totalCases}</td>
                      <td className="px-4 py-3 text-right font-mono text-gold-400">{item.totalBoxes}</td>
                      <td className="px-4 py-3 text-right font-mono text-gold-400">{item.totalPacks}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-blood-900/40 font-semibold text-white">
                    <td className="px-4 py-3">TOTAL</td>
                    <td className="px-4 py-3 text-right font-mono text-gold-500">
                      {totalInventory.reduce((s, i) => s + i.totalCases, 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gold-500">
                      {totalInventory.reduce((s, i) => s + i.totalBoxes, 0)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-gold-500">
                      {totalInventory.reduce((s, i) => s + i.totalPacks, 0)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* ── Per-Streamer Inventory ─────────────────────────────────── */}
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-semibold text-white">By Breaker</h2>
            <div className="grid gap-6">
              {streamerInventories.map((si) => (
                <div key={si.streamerId} className="rounded-xl border border-blood-900/40 bg-black p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">{si.streamerName}</h3>
                      <p className="text-xs text-cage-500">
                        Last updated: {si.lastUpdated}
                      </p>
                    </div>
                    {si.items.length > 0 && (
                      <span className="rounded-full bg-gold-500/15 px-3 py-1 text-xs font-medium text-gold-400">
                        {si.items.length} product{si.items.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {si.items.length === 0 ? (
                    <p className="text-sm text-cage-500">No inventory reported yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-cage-700/30 text-left text-xs uppercase text-cage-400">
                            <th className="pb-2 pr-4">Product</th>
                            <th className="pb-2 pr-4 text-right">Cases</th>
                            <th className="pb-2 pr-4 text-right">Boxes</th>
                            <th className="pb-2 text-right">Packs</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-cage-700/20">
                          {si.items.map((item, i) => (
                            <tr key={i} className="text-cage-300">
                              <td className="py-2 pr-4">{item.productName}</td>
                              <td className="py-2 pr-4 text-right font-mono">{item.cases}</td>
                              <td className="py-2 pr-4 text-right font-mono">{item.boxes}</td>
                              <td className="py-2 text-right font-mono">{item.packs}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
