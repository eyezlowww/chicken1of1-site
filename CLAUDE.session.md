# Current Session Context — April 8, 2026

## Active Work: Fanatics Monthly Report Generator
**Branch:** `feature/fanatics-report`
**Status:** Backend + Frontend built, needs testing

### What was built this session:
- FC Pro CSV parser (`lib/fanatics/csv-parser.ts`)
- Fuzzy product matching (`lib/fanatics/product-match.ts`)
- Import API (`app/api/streamdata/fanatics/import/route.ts`)
- Report generation API (`app/api/streamdata/fanatics/generate/route.ts`)
- SKU listing API (`app/api/streamdata/fanatics/skus/route.ts`)
- Full report generator page (`app/(portal)/streamdata/tools/fanatics-report/page.tsx`)
- Database table `fc_pro_orders` created in Supabase

### What needs testing:
1. Upload the FC Pro CSV at `/streamdata/tools/fanatics-report` (file: `2026-04-08_orders_export.csv`)
2. Select a month with orders (try December 2025 or January 2026 since those have data)
3. Verify the report generates with correct weekly breakdowns
4. Test the copy-to-clipboard and CSV export
5. Compare output against the Airtable form fields

### Known considerations:
- Product name matching between FC Pro and stream submissions is fuzzy (Jaccard similarity)
- Can't test with March 2026 — no product releases that month for Chicken
- Distributor section is for THIRD-PARTY purchases (Dave & Adams, Dealernet), NOT Fanatics orders
- The Airtable form Product dropdown includes a date tag like `[MAR24]` — our export should match

### Airtable Form Field Reference:
- Product Types: Hobby, Jumbo, Breakers Delight, Sapphire, Hat Trick, Mega, Qualifying Lap, Compact, Mania, Super Jumbo, Ginter X, FDI
- Break Types: Pick Your Player, Pick Your Team, Random, Mixers, Serial Number, Personal, Other
- Break Platforms: Fanatics Live, Whatnot, Tiktok, Ebay Live, Loupe, Youtube, Facebook, Other, District
- Week definition: Week 1 = days 1-7 of month, Week 2 = 8-14, Week 3 = 15-21, Week 4 = 22-end

## Other branches:
- `master` — production, deployed on Vercel at chicken1of1.com
- `feature/smart-inventory` — merged into master already

## Key project info:
- DATABASE_URL has `$` in password — needs `\$` escape in .env.local
- Resend is verified and working for emails
- Admin login: admin@chicken1of1.com
- Portal URL: chicken1of1.com/streamdata/login
- The product is being renamed from "StreamData" to "BreakerOS"
- Full SaaS plan at `claudedocs/multi-tenant-saas-plan.md`
