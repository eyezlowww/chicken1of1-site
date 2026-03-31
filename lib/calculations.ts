// Payout calculation logic for Chicken1of1 streamer portal
// Mirrors the exact formula from the Google Sheet

export interface FeeConfig {
  platformFeeRate: number // e.g. 0.101 (10.1%)
  productFeeRate: number // e.g. 0.02 (2%)
  perOrderFee: number // e.g. 0.30 ($0.30 per order)
  supportFeeRate: number // e.g. 0.20 (20%) — per streamer
}

export interface StreamCalculation {
  totalCogs: number
  platformFee: number
  productFee: number
  orderAmountCost: number
  grossProfit: number
  supportFee: number
  breakerPayout: number
  chickenPayout: number
}

export function calculateStreamPayout(
  streamSales: number,
  orderCount: number,
  productsSold: Array<{ costPerUnit: number; amountSold: number }>,
  fees: FeeConfig
): StreamCalculation {
  // Total COGS = sum of (cost per unit * amount sold) for each product
  const totalCogs = productsSold.reduce((sum, p) => sum + p.costPerUnit * p.amountSold, 0)

  // Fee calculations against total stream sales
  const platformFee = streamSales * fees.platformFeeRate
  const productFee = streamSales * fees.productFeeRate
  const orderAmountCost = orderCount * fees.perOrderFee

  // Gross profit = sales - COGS - platform fee - product fee - order cost
  const grossProfit = streamSales - totalCogs - platformFee - productFee - orderAmountCost

  // Support fee is taken from GROSS PROFIT (not total sales)
  // If gross profit is negative, no support fee is charged
  const supportFee = grossProfit < 0 ? 0 : grossProfit * fees.supportFeeRate

  // Breaker payout = gross profit minus support fee
  // When negative, breaker absorbs the full loss (no support fee deducted)
  const breakerPayout = grossProfit - supportFee

  // Chicken payout = product fee + support fee (supportFee is 0 when gross profit is negative)
  const chickenPayout = productFee + supportFee

  return {
    totalCogs: round2(totalCogs),
    platformFee: round2(platformFee),
    productFee: round2(productFee),
    orderAmountCost: round2(orderAmountCost),
    grossProfit: round2(grossProfit),
    supportFee: round2(supportFee),
    breakerPayout: round2(breakerPayout),
    chickenPayout: round2(chickenPayout),
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
