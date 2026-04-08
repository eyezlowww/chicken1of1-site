// FC Pro CSV Parser
// Parses Fanatics Collecting Pro order export CSVs into typed objects.
// Handles quoted fields with commas, date format conversion, and money parsing.

export interface FcProOrder {
  orderNumber: string
  orderDate: string // YYYY-MM-DD
  productName: string
  productType: string | null
  caseQuantity: number
  subtotal: number | null
  shipping: number | null
  discounts: number | null
  totalPrice: number | null
  paymentMethod: string | null
}

/**
 * Parse a money string like "5,180.00" or "0.00" into a float.
 * Returns null for empty/unparseable values.
 */
function parseMoney(raw: string): number | null {
  const cleaned = raw.replace(/,/g, '').trim()
  if (cleaned === '' || cleaned === '-') return null
  const val = parseFloat(cleaned)
  return isNaN(val) ? null : val
}

/**
 * Parse FC Pro date format "April 8, 2026" into "2026-04-08".
 * Returns null if the date cannot be parsed.
 */
function parseOrderDate(raw: string): string | null {
  const trimmed = raw.replace(/"/g, '').trim()
  if (!trimmed) return null

  const parsed = new Date(trimmed)
  if (isNaN(parsed.getTime())) return null

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Split a CSV line respecting quoted fields.
 * Handles commas inside quoted strings (e.g. "5,180.00").
 */
function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      // Handle escaped quotes ("") inside quoted fields
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"'
        i++ // skip next quote
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }

  // Push last field
  fields.push(current.trim())
  return fields
}

/**
 * Parse FC Pro CSV export content into an array of typed orders.
 *
 * Expected CSV columns (in order):
 * Order Number, Order Date, Product Name, Product Type, Case Quantity,
 * Subtotal, Shipping, Discounts, Total Price, Payment Method, Brand, Last Four, Charged On
 *
 * The last 3 columns (Brand, Last Four, Charged On) are ignored as they are often empty.
 */
export function parseFcProCsv(csvContent: string): FcProOrder[] {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length < 2) {
    return [] // Need at least header + 1 data row
  }

  // Validate header row has expected columns
  const header = splitCsvLine(lines[0])
  const expectedFirst = header[0]?.toLowerCase().replace(/\s+/g, '')
  if (expectedFirst !== 'ordernumber') {
    throw new Error(
      `Unexpected CSV format: first column header is "${header[0]}", expected "Order Number"`
    )
  }

  const orders: FcProOrder[] = []
  const errors: string[] = []

  for (let i = 1; i < lines.length; i++) {
    const fields = splitCsvLine(lines[i])

    // Need at least 10 fields (the core columns)
    if (fields.length < 10) {
      errors.push(`Row ${i + 1}: expected at least 10 columns, got ${fields.length}`)
      continue
    }

    const orderNumber = fields[0]
    if (!orderNumber) {
      errors.push(`Row ${i + 1}: missing order number`)
      continue
    }

    const orderDate = parseOrderDate(fields[1])
    if (!orderDate) {
      errors.push(`Row ${i + 1}: invalid date "${fields[1]}"`)
      continue
    }

    const productName = fields[2].replace(/^"|"$/g, '').trim()
    if (!productName) {
      errors.push(`Row ${i + 1}: missing product name`)
      continue
    }

    const productType = fields[3]?.trim() || null
    const caseQuantity = parseInt(fields[4], 10)

    orders.push({
      orderNumber,
      orderDate,
      productName,
      productType: productType || null,
      caseQuantity: isNaN(caseQuantity) ? 0 : caseQuantity,
      subtotal: parseMoney(fields[5]),
      shipping: parseMoney(fields[6]),
      discounts: parseMoney(fields[7]),
      totalPrice: parseMoney(fields[8]),
      paymentMethod: fields[9]?.trim() || null,
    })
  }

  if (errors.length > 0 && orders.length === 0) {
    throw new Error(`CSV parsing failed:\n${errors.join('\n')}`)
  }

  return orders
}
