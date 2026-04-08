// Fuzzy product name matching between FC Pro orders and BreakerOS stream products
// FC Pro uses names like "UFC-CHROME 2025 Hobby Breaker-CSE"
// Stream products use names like "2025 Topps Chrome UFC Hobby Box"
// This extracts key tokens and scores matches by overlap.

/**
 * Normalize and tokenize a product name for matching.
 * Strips suffixes like -CSE, -BX, lowercases, and returns meaningful tokens.
 */
function tokenize(name: string): Set<string> {
  const cleaned = name
    .toLowerCase()
    .replace(/-cse$/i, '')
    .replace(/-bx$/i, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()

  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'of', 'in', 'for',
    'box', 'case', 'breaker', 'topps', 'panini', 'fanatics',
  ])

  return new Set(
    cleaned
      .split(/\s+/)
      .filter((t) => t.length > 1 && !stopWords.has(t))
  )
}

/**
 * Score how well two product names match (0 to 1).
 * Uses Jaccard similarity on meaningful tokens.
 */
export function productMatchScore(fcProName: string, streamProductName: string): number {
  const tokensA = tokenize(fcProName)
  const tokensB = tokenize(streamProductName)

  if (tokensA.size === 0 || tokensB.size === 0) return 0

  let intersection = 0
  Array.from(tokensA).forEach((t) => {
    if (tokensB.has(t)) intersection++
  })

  const combined = new Set(Array.from(tokensA).concat(Array.from(tokensB)))
  const union = combined.size
  return union === 0 ? 0 : intersection / union
}

/**
 * Find the best matching stream product for an FC Pro product name.
 * Returns the match if score >= threshold (default 0.3), otherwise null.
 */
export function findBestMatch<T extends { name: string }>(
  fcProName: string,
  streamProducts: T[],
  threshold = 0.3
): { product: T; score: number } | null {
  let best: { product: T; score: number } | null = null

  for (const sp of streamProducts) {
    const score = productMatchScore(fcProName, sp.name)
    if (score >= threshold && (!best || score > best.score)) {
      best = { product: sp, score }
    }
  }

  return best
}

/**
 * Infer the product type (Hobby, Breakers Delight, etc.) from an FC Pro product name.
 */
export function inferProductType(productName: string): string | null {
  const lower = productName.toLowerCase()

  if (/breaker['s]*\s*delight/i.test(lower)) return 'Breakers Delight'
  if (lower.includes('sapphire')) return 'Sapphire'
  if (lower.includes('jumbo')) return 'Jumbo'
  if (lower.includes('mega')) return 'Mega'
  if (lower.includes('hobby')) return 'Hobby'

  return null
}
