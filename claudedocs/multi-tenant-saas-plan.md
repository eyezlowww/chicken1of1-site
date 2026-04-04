# Multi-Tenant SaaS Conversion Plan: StreamData Portal

**Date**: March 31, 2026  
**Product**: StreamData — Financial Operations Portal for Card Breaking Businesses  
**Current State**: Single-tenant Next.js 14 portal serving Chicken1of1  
**Target State**: Multi-tenant SaaS serving 10-100+ card breaking groups  

---

## Table of Contents

1. [Multi-Tenancy Architecture Options](#1-multi-tenancy-architecture-options)
2. [Data Liability & Legal Considerations](#2-data-liability--legal-considerations)
3. [Data Security Architecture](#3-data-security-architecture)
4. [Billing & Subscription Management](#4-billing--subscription-management)
5. [White-Labeling / Branding](#5-white-labeling--branding)
6. [Onboarding Flow](#6-onboarding-flow)
7. [Go-To-Market Infrastructure](#7-go-to-market-infrastructure)
8. [Cost Analysis](#8-cost-analysis)
9. [Recommended Architecture & Implementation Plan](#9-recommended-architecture--implementation-plan)

---

## 1. Multi-Tenancy Architecture Options

### Current Schema Analysis

The existing schema has 10 tables with no tenant separation. Key observations:
- `portal_users` has no `tenant_id` — all users are in one flat pool
- `products`, `global_fee_config` are shared — no concept of "whose products"
- `stream_entries`, `stream_calculations`, `payout_records` are user-scoped via `user_id` but not org-scoped
- The calculation logic in `calculations.ts` is pure math with no tenant awareness
- Auth is credentials-based with JWT sessions — no tenant context in the token
- Middleware routes everything under `/streamdata/*` — single namespace

Every API route queries by `userId` directly. There is no tenant layer. This means converting to multi-tenancy requires touching every table and every query.

---

### Option A: Shared Database, Tenant Column (RLS)

**How it works**: Add a `tenant_id` column to every table. Use Supabase Row-Level Security (RLS) policies to automatically filter rows. One Supabase project, one deployment.

**Schema changes required**:
```
New table: tenants (id, name, slug, logo_url, primary_color, domain, plan, stripe_customer_id, created_at)

Add tenant_id to:
  - portal_users
  - products
  - global_fee_config
  - streamer_fee_config
  - weekly_periods
  - stream_entries
  - stream_products_sold (via stream_entry cascade)
  - stream_inventory (via stream_entry cascade)
  - stream_calculations (via stream_entry cascade)
  - payout_records
  - invite_tokens
```

**RLS implementation**:
```sql
-- Example: set tenant context on every request
SET app.current_tenant_id = 'tenant-uuid';

-- Policy on every table
CREATE POLICY tenant_isolation ON portal_users
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);
```

**Application changes**:
- Middleware resolves tenant from subdomain/domain, injects `tenant_id` into request context
- DB connection wrapper calls `SET app.current_tenant_id` before each query
- JWT token includes `tenantId` alongside `userId` and `role`
- All existing queries continue to work — RLS handles filtering invisibly

**Pros**:
- Lowest cost: single Supabase project ($25/mo Pro)
- Simplest deployment: single Vercel project
- Easiest to maintain: one schema, one migration pipeline
- Supabase RLS is battle-tested for this exact pattern
- All existing Drizzle queries work with minimal changes
- Cross-tenant analytics possible (for your own admin dashboard)

**Cons**:
- Data isolation is logical, not physical — a bug in RLS could leak data
- Noisy neighbor risk at high scale (one tenant's huge query affects all)
- Backup/restore is all-or-nothing (cannot restore one tenant independently)
- "Shared database" may concern security-conscious customers

**Cost at scale**:
| Tenants | Supabase | Vercel | Total/mo |
|---------|----------|--------|----------|
| 10 | $25 | $20 | $45 |
| 50 | $25-50 | $20 | $45-70 |
| 100 | $50-100 | $20 | $70-120 |

---

### Option B: Separate Database Per Tenant

**How it works**: Each tenant gets their own Supabase project. Your app connects to the right database based on the tenant context.

**Implementation**:
- Tenant registry database (one small Supabase project) maps tenant slug to connection string
- App reads tenant slug from subdomain, looks up connection string, creates per-request DB connection
- Each Supabase project has identical schema but independent data

**Pros**:
- Complete physical data isolation
- Per-tenant backup/restore
- No noisy neighbor problems
- Can upgrade individual tenants to larger plans
- Strong compliance story

**Cons**:
- $25/month PER TENANT (Supabase Pro) — $2,500/mo at 100 tenants
- Connection management nightmare — each request needs a different DB pool
- Schema migrations must run across ALL tenant databases
- Monitoring/debugging across 100 databases is painful
- Supabase does not have a programmatic API for provisioning new projects (you'd use their Management API which is limited)
- Cold connection pool overhead for low-traffic tenants

**Cost at scale**:
| Tenants | Supabase | Vercel | Total/mo |
|---------|----------|--------|----------|
| 10 | $250 | $20 | $270 |
| 50 | $1,250 | $20 | $1,270 |
| 100 | $2,500 | $20 | $2,520 |

**Verdict**: Way too expensive for a bootstrapped operation. Only makes sense if charging $200+/tenant/month AND tenants demand physical isolation.

---

### Option C: Separate Deployment Per Tenant

**How it works**: Each tenant gets their own Vercel project + their own Supabase project. Complete isolation at every layer.

**Pros**:
- Maximum isolation
- Easy white-labeling (each deployment has its own env vars, branding, domain)
- One tenant crashing cannot affect another
- Per-tenant scaling

**Cons**:
- $20/seat/mo Vercel + $25/mo Supabase PER TENANT
- Deploying code changes means deploying to N projects
- 100 tenants = 100 Vercel projects to manage
- Zero economies of scale
- Operational nightmare for a 2-person team

**Cost at scale**:
| Tenants | Supabase | Vercel | Total/mo |
|---------|----------|--------|----------|
| 10 | $250 | $200 | $450 |
| 50 | $1,250 | $1,000 | $2,250 |
| 100 | $2,500 | $2,000 | $4,500 |

**Verdict**: Unviable. This is an enterprise MSP model, not a SaaS model.

---

### Option D: Shared App, Separate PostgreSQL Schemas

**How it works**: One Supabase project, but each tenant gets their own PostgreSQL schema (instead of the default `public` schema). Application switches schemas based on tenant context.

**Implementation**:
```sql
CREATE SCHEMA tenant_chicken1of1;
CREATE SCHEMA tenant_breakerbros;
-- Tables are identical but in different schemas
SET search_path TO tenant_chicken1of1;
```

**Pros**:
- Stronger isolation than RLS (schema-level separation)
- Per-tenant backup via `pg_dump --schema=tenant_xxx`
- One Supabase project (cost-efficient)
- Clear data boundaries

**Cons**:
- Supabase features (Auth, Realtime, Storage) are designed for the `public` schema — fighting the framework
- Drizzle ORM does not natively support dynamic schema switching per-request
- Schema migrations must run N times (once per tenant schema)
- Connection pooling (Supavisor) may have issues with dynamic `search_path`
- PostgreSQL has practical limits around 50-100 schemas before performance degrades
- RLS is actually the Supabase-recommended approach; schemas are fighting upstream

**Cost at scale**:
| Tenants | Supabase | Vercel | Total/mo |
|---------|----------|--------|----------|
| 10 | $25 | $20 | $45 |
| 50 | $25-50 | $20 | $45-70 |
| 100 | $50-100 | $20 | $70-120 |

**Verdict**: Same cost as Option A but significantly more complex, fights Supabase's design philosophy, and Drizzle ORM does not support it well.

---

### Architecture Decision: Option A (Shared DB + RLS)

Option A is the clear winner for this use case:
1. **Cost**: $45-120/mo vs $2,500+ for physical isolation
2. **Complexity**: One schema, one migration, one deployment
3. **Stack alignment**: Supabase RLS + Drizzle + Vercel middleware is the standard pattern
4. **Scale**: Handles 100+ tenants without re-architecture
5. **Risk profile**: Card breaking financial data (revenue numbers, payout amounts) does not warrant physical isolation — this is not health data, PCI cardholder data, or classified information

---

## 2. Data Liability & Legal Considerations

### What Kind of Data Is This?

The portal handles:
- **Stream sales totals** (e.g., "Stream on March 15 did $2,400 in sales")
- **Payout amounts** (e.g., "Breaker X earned $380 this week")
- **Product costs** (COGS data)
- **Fee structures** (platform fees, support fees)
- **User credentials** (email, password hash)

**Is this PII?**
- User emails and names: YES, this is PII
- Revenue numbers, payout amounts, product costs: NO, these are business operational data, not personally identifiable information
- The combination of (email + payout amount) could be considered sensitive because it links a real person to their earnings

**Is this "financial data" in a regulated sense?**
- NO. This is not covered by SOX (public company financial reporting), PCI DSS (credit card numbers), GLBA (banking/insurance), or any financial regulation
- This is internal business accounting data — sales figures and contractor payouts
- The IRS cares about this data for tax purposes, but there is no regulatory framework governing how a third-party tool stores it

### Legal Exposure in a Breach

If someone breached the database and leaked all tenant data, the exposure is:

**What would be exposed**: Business names, user emails, password hashes (bcrypt), sales figures, payout amounts, product costs

**Regulatory risk**: LOW
- No HIPAA (no health data)
- No PCI (no credit card numbers stored)
- GDPR/CCPA applies to emails/names (PII), not to the financial figures
- A breach of emails triggers notification obligations under state breach notification laws (all 50 US states have them)

**Civil risk**: MODERATE
- Tenants could sue for breach of contract (if your ToS promises security)
- Competitors could use leaked sales data against breakers
- Breakers' payout data being public could create tax/legal issues for them

**Realistic assessment**: The data is embarrassing if leaked but not catastrophic. Nobody's health, credit card, or social security number is at risk. The primary harm is competitive (competitors seeing sales volumes) and reputational.

### Minimum Viable Legal Protection

You need three documents:

**1. Terms of Service (ToS)**
Must include:
- Service description (tool provider, not data custodian)
- Data ownership clause: "All data entered remains the property of the customer"
- Limitation of liability: Cap liability at 12 months of fees paid
- Exclusion of consequential damages
- Indemnification: Customer indemnifies you for data they enter
- Right to terminate for breach
- Governing law and dispute resolution
- Acceptable use policy

Key language for liability protection:
> "The Service is provided as a business tool. Provider does not access, audit, or verify Customer Data. Customer is solely responsible for the accuracy, legality, and use of data entered into the Service. Provider's total aggregate liability shall not exceed the fees paid by Customer in the twelve (12) months preceding the claim."

**2. Privacy Policy**
Must include:
- What PII you collect (email, name)
- How you use it (authentication, communication)
- Third-party processors (Supabase, Vercel, Stripe)
- Data retention periods
- User rights (access, deletion)
- CCPA-specific disclosures (if serving CA residents)

**3. Data Processing Agreement (DPA)**
Needed if any tenant is in the EU or handles EU persons' data. Template from Supabase's own DPA can be adapted. Covers:
- You are the Data Processor; tenant is the Data Controller
- Processing is limited to providing the service
- Sub-processors listed (Supabase, Vercel, Stripe)
- Breach notification timeline (72 hours per GDPR)
- Data deletion upon termination

**Estimated cost to get these drafted**:
- DIY with templates (Termly, iubenda): $0-50/mo
- Lawyer review of templates: $500-1,500 one-time
- Custom-drafted by SaaS attorney: $2,000-5,000 one-time

### SOC 2: When Do You Need It?

**At launch (0-20 customers)**: Not needed. No card breaking group is going to ask for a SOC 2 report. These are small businesses, often 2-5 people, running live commerce. They care about "does it work" and "is it cheaper than Google Sheets."

**At 50+ customers**: Still probably not needed for this market segment. SOC 2 is demanded by enterprise buyers — Fortune 500 companies evaluating SaaS vendors. Card breaking groups are not that.

**When you might need it**: If you pivot to serve larger live commerce operations (eBay sellers doing $1M+/year), marketplaces, or if a competitor gets SOC 2 certified and uses it as a differentiator.

**Cost of SOC 2**: $20,000-50,000 for Type I audit, plus $5,000-15,000/year for ongoing Type II. Not worth it at this stage.

**Supabase's compliance**: Supabase is SOC 2 Type 2 compliant and holds its own certifications. This covers the infrastructure layer. You can tell customers "our infrastructure provider is SOC 2 Type 2 certified" without having your own certification.

### Structuring as "Tool Provider"

The owner's goal of not being liable for client data is achievable by structuring the business as a tool provider (data processor) rather than a data custodian:

1. **Never access tenant data in production** — no admin panel that lets you browse other tenants' sales data
2. **ToS explicitly states** you are a tool/processor, not a controller
3. **No analytics on tenant data** — do not aggregate sales figures across tenants for marketing ("our users process $X million in breaks")
4. **Breach notification only** — if there's a breach, you notify tenants, they notify their people
5. **Data deletion on request** — provide a mechanism to export and delete all tenant data
6. **No backups you control** — Supabase handles backups; you don't maintain your own copies

This is the standard SaaS posture. Companies like Notion, Airtable, and Monday.com handle far more sensitive data with the same "we're just the tool" positioning.

---

## 3. Data Security Architecture

### Realistic Threat Assessment

| Threat | Likelihood | Impact | Priority |
|--------|-----------|--------|----------|
| SQL injection leaking tenant data | Low (Drizzle parameterizes) | High | MEDIUM |
| RLS policy bug exposing cross-tenant data | Medium | High | HIGH |
| Admin account compromise | Medium | High | HIGH |
| Supabase infrastructure breach | Very Low | Very High | LOW (their problem) |
| Credential stuffing on login | Medium | Medium | MEDIUM |
| Insider threat (you reading tenant data) | Low | Low | LOW |

### What You Actually Need (Not Overkill)

**Already in place (via Supabase)**:
- Encryption at rest (AES-256 on Supabase storage)
- Encryption in transit (TLS 1.2+ on all connections)
- Automated backups (daily, point-in-time recovery on Pro)
- Network isolation (Supabase projects run in isolated VPCs)

**Must implement**:

1. **Row-Level Security policies on every table**
   - This is the single most important security measure
   - Every table with `tenant_id` gets a policy
   - Test extensively — a missing policy is a data leak

2. **Tenant context injection**
   ```typescript
   // In middleware or API route wrapper
   async function withTenantContext(tenantId: string, fn: () => Promise<T>) {
     await db.execute(sql`SET app.current_tenant_id = ${tenantId}`);
     return fn();
   }
   ```

3. **No super-admin data access panel**
   - Build admin tools for managing tenants (create, suspend, change plan)
   - Do NOT build admin tools for viewing tenant data (their streams, payouts)
   - If you need to debug, use Supabase's SQL editor with explicit tenant context

4. **Audit logging**
   - Log every tenant data access with timestamp, user, action
   - Store audit logs in a separate table (not tenant-scoped)
   - Simple append-only table, not a complex audit system

5. **Rate limiting per tenant**
   - Already have IP-based rate limiting
   - Add tenant-scoped rate limits to prevent abuse

6. **Password security**
   - Already using bcrypt — good
   - Add password complexity requirements
   - Consider adding optional 2FA (TOTP) later

### What You Do NOT Need

- **Per-tenant encryption keys**: Overkill. The data is sales figures, not medical records. Managing N encryption keys adds complexity with no meaningful security benefit for this data type.

- **Zero-knowledge architecture**: Impossible in practice for a SaaS that needs to calculate payouts. You cannot compute `grossProfit = streamSales - totalCogs - platformFee` on encrypted data without homomorphic encryption, which is not practical. The realistic approach is "we can technically access it but contractually promise not to."

- **Client-side encryption**: Would break all server-side calculations, queries, and aggregations. The entire value of the product is server-side computation.

- **HIPAA add-on from Supabase**: Not needed. No health data.

- **SOC 2 certification**: Not needed at this scale or market segment.

### Practical Security Checklist

```
[x] Encryption at rest (Supabase default)
[x] Encryption in transit (TLS, Supabase default)
[x] Password hashing (bcrypt, already implemented)
[x] Rate limiting (already implemented)
[ ] RLS policies on all tenant-scoped tables
[ ] Tenant context in JWT tokens
[ ] Middleware tenant resolution
[ ] Audit logging for data access
[ ] Tenant-scoped rate limits
[ ] Security headers (CSP, HSTS — partially done)
[ ] Regular dependency updates
[ ] Input validation on all API routes (Zod — partially done)
```

---

## 4. Billing & Subscription Management

### Recommended Stack: Stripe Billing

Stripe is the only serious option for this use case. It handles subscriptions, invoicing, payment methods, tax calculation, and customer self-service.

### Pricing Tiers

| Tier | Price/mo | Target | Features |
|------|---------|--------|----------|
| **Free** | $0 | Trial / Lite users | Live Break Tracker only, 1 breaker, no payout calculations |
| **Solo** | $29/mo | Single breaker | Full portal, 1 breaker, 50 streams/mo, basic analytics |
| **Team** | $79/mo | Small groups | Up to 5 breakers, unlimited streams, payout management, export |
| **Pro** | $149/mo | Growing operations | Up to 15 breakers, analytics dashboard, custom fee structures, priority support |
| **Enterprise** | $249/mo | Large operations | Unlimited breakers, API access, custom domain, white-labeling, dedicated support |

### Implementation Architecture

```
lib/
  stripe/
    config.ts          # Stripe client, price IDs, plan definitions
    checkout.ts        # Create checkout sessions
    webhooks.ts        # Handle Stripe webhook events
    billing-helpers.ts # Check plan limits, feature gates
    
app/api/stripe/
  checkout/route.ts    # POST: create checkout session
  webhooks/route.ts    # POST: handle Stripe webhooks
  portal/route.ts      # POST: create customer portal session

Schema additions:
  tenants table: stripe_customer_id, stripe_subscription_id, plan_tier, plan_status
  billing_events table: event audit log
```

### Feature Gating Pattern

```typescript
// lib/stripe/plans.ts
export const PLAN_LIMITS = {
  free:       { breakers: 1,  streams: 10,  analytics: false, export: false, customDomain: false },
  solo:       { breakers: 1,  streams: 50,  analytics: false, export: true,  customDomain: false },
  team:       { breakers: 5,  streams: -1,  analytics: true,  export: true,  customDomain: false },
  pro:        { breakers: 15, streams: -1,  analytics: true,  export: true,  customDomain: false },
  enterprise: { breakers: -1, streams: -1,  analytics: true,  export: true,  customDomain: true  },
} as const;

// Usage in API routes
export async function checkPlanLimit(tenantId: string, feature: keyof PlanLimits) {
  const tenant = await getTenant(tenantId);
  const limits = PLAN_LIMITS[tenant.plan];
  // ... check and enforce
}
```

### Webhook Events to Handle

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Create tenant, set plan |
| `customer.subscription.updated` | Update plan tier |
| `customer.subscription.deleted` | Downgrade to free or suspend |
| `invoice.payment_succeeded` | Update billing status |
| `invoice.payment_failed` | Send warning, grace period |
| `customer.subscription.trial_will_end` | Send trial ending email |

### Trial Strategy

- 14-day free trial on Team plan (most popular)
- No credit card required to start trial
- Credit card required to continue after trial
- Send emails at: day 1 (welcome), day 7 (check-in), day 11 (trial ending), day 14 (expired)

### Stripe Costs

- 2.9% + $0.30 per transaction
- +0.7% for Stripe Billing (subscription management)
- +0.5% for Stripe Tax (if enabled)

At 100 tenants averaging $100/mo: ~$360/mo in Stripe fees

---

## 5. White-Labeling / Branding

### Tenant Branding Model

Each tenant should be able to customize:

| Feature | Solo | Team | Pro | Enterprise |
|---------|------|------|-----|------------|
| Business name | Yes | Yes | Yes | Yes |
| Logo upload | No | Yes | Yes | Yes |
| Custom colors | No | No | Yes | Yes |
| Custom subdomain | Yes | Yes | Yes | Yes |
| Custom domain | No | No | No | Yes |

### Domain Strategy

**Default**: `{slug}.streamdata.app` (e.g., `chicken1of1.streamdata.app`)

The app needs a product domain separate from chicken1of1.com. Register `streamdata.app` or similar.

**Custom domains** (Enterprise tier): `breaks.theirbusiness.com`

### Implementation: Subdomain Routing

```typescript
// middleware.ts — tenant resolution
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Extract tenant slug from subdomain
  // chicken1of1.streamdata.app -> "chicken1of1"
  // breaks.theirbusiness.com -> lookup by custom domain
  
  const slug = extractTenantSlug(hostname);
  if (!slug) return NextResponse.next(); // marketing site
  
  const tenant = await lookupTenant(slug); // cache this
  if (!tenant) return NextResponse.redirect('/404');
  
  // Inject tenant context into headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-id', tenant.id);
  requestHeaders.set('x-tenant-slug', tenant.slug);
  
  return NextResponse.next({ request: { headers: requestHeaders } });
}
```

### Vercel Custom Domain Setup

Vercel supports adding custom domains to a single project programmatically via their API:

```bash
# Add custom domain via Vercel API
curl -X POST "https://api.vercel.com/v10/projects/{projectId}/domains" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -d '{"name": "breaks.theirbusiness.com"}'
```

- Vercel automatically provisions SSL certificates
- Customer adds a CNAME record pointing to `cname.vercel-dns.com`
- No additional cost per domain on Vercel Pro plan
- Wildcard subdomains (*.streamdata.app) configured once in Vercel dashboard

### Branding Implementation

```typescript
// Schema addition
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),
  primaryColor: varchar('primary_color', { length: 7 }), // hex
  secondaryColor: varchar('secondary_color', { length: 7 }),
  customDomain: varchar('custom_domain', { length: 255 }),
  plan: varchar('plan', { length: 20 }).default('free').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Theme provider in layout
function TenantThemeProvider({ tenant, children }) {
  return (
    <div style={{
      '--primary': tenant.primaryColor || '#f97316',
      '--secondary': tenant.secondaryColor || '#1f2937',
    } as React.CSSProperties}>
      {children}
    </div>
  );
}
```

### What NOT to white-label initially

- Keep the dark theme universal (saves significant design/testing work)
- Allow logo and name swaps only at launch
- Add color customization in v2 after validating demand
- Custom CSS injection is a support nightmare — avoid it

---

## 6. Onboarding Flow

### Target: Under 10 Minutes from Signup to First Stream Entry

**Step 1: Sign Up (2 minutes)**
```
1. Land on streamdata.app
2. Click "Start Free Trial"
3. Enter: Business name, email, password
4. Auto-generate slug from business name
5. Create tenant + admin user
6. Redirect to onboarding wizard
```

**Step 2: Business Setup (3 minutes)**
```
1. Upload logo (optional, skip for now)
2. Set fee structure:
   - Platform fee % (pre-fill with Whatnot's 10.1%)
   - Product fee % (suggest 2%)
   - Per-order fee (suggest $0.30)
   - Default support fee % (suggest 20%)
3. Add first product (name, manufacturer, year)
4. "Add more later" button
```

**Step 3: Invite Breakers (2 minutes)**
```
1. Show invite link (already implemented via invite_tokens)
2. Enter breaker emails for direct invites
3. "Skip — I'll add them later" option
```

**Step 4: First Stream (3 minutes)**
```
1. Guided walkthrough of submitting a stream entry
2. Pre-filled example data showing the calculation flow
3. "Got it — take me to my dashboard" button
```

### Onboarding Checklist (persistent sidebar widget)

```
[ ] Set up fee structure
[ ] Add at least one product
[ ] Invite your first breaker
[ ] Submit your first stream entry
[ ] Review your first payout calculation
```

Show completion percentage. Hide when all items complete.

---

## 7. Go-To-Market Infrastructure

### What You Need Before Launch

**1. Product Domain & Marketing Site**
- Register: `streamdata.app` or `streamdataapp.com`
- Simple landing page with:
  - Hero: "Stop using spreadsheets for your breaks"
  - Problem/solution framing
  - Feature list with screenshots
  - Pricing table
  - "Start Free Trial" CTA
  - FAQ section
- Tech: Can be a static route group in the same Next.js app (`app/(marketing)/`)

**2. Demo Environment**
- Pre-populated tenant at `demo.streamdata.app`
- Read-only demo account with sample data
- Login: `demo@streamdata.app` / `demo123`
- Reset data nightly via cron
- This is more convincing than any sales deck

**3. Documentation / Help Center**
- Start with 10-15 help articles covering:
  - Getting started guide
  - Fee structure explanation
  - How payout calculations work
  - How to submit stream entries
  - How to invite breakers
  - How to read analytics
- Options: Notion (free), GitBook (free tier), or `/docs` route in the app
- Recommendation: Start with Notion, it is free and fast to set up

**4. Support System**
- Phase 1: Email only (`support@streamdata.app`) via Resend
- Phase 2: Discord community server (card breaking groups already live on Discord)
- Phase 3: In-app chat (Crisp, already configured in your stack)
- Do NOT build a ticket system. Email + Discord handles 100 customers easily.

**5. SaaS Admin Dashboard**
Build a super-admin panel (accessible only to your team) showing:
- Total tenants, active/churned
- MRR (monthly recurring revenue)
- Tenant health metrics (last login, stream count)
- Subscription status per tenant
- System health (DB size, error rates)

**6. Analytics & Monitoring**
- Vercel Analytics (already available on Pro plan)
- Sentry for error tracking ($0 for 5K events/mo)
- Simple uptime monitoring (BetterUptime free tier)
- Stripe Dashboard for revenue metrics

### What You Do NOT Need at Launch

- Blog (write it when you have customers, not before)
- Case studies (you have zero customers besides yourself)
- Video tutorials (do screen recordings after launch, not before)
- Social media presence for the SaaS brand (use personal networks first)
- Affiliate program (premature)
- Public API documentation (no one is integrating yet)

---

## 8. Cost Analysis

### Monthly Costs at Scale

| Cost Item | 10 Tenants | 50 Tenants | 100 Tenants |
|-----------|-----------|------------|-------------|
| **Supabase Pro** | $25 | $25-50 | $50-100 |
| **Vercel Pro** | $20 | $20 | $20-40 |
| **Domain** (streamdata.app) | $2 | $2 | $2 |
| **Stripe Fees** (3.6% of revenue) | $10 | $53 | $107 |
| **Resend** (email) | $0 | $0 | $20 |
| **Sentry** (errors) | $0 | $0 | $26 |
| **Legal** (amortized) | $42 | $42 | $42 |
| **Total** | **$99** | **$142** | **$357** |

### Monthly Revenue at Scale

| Metric | 10 Tenants | 50 Tenants | 100 Tenants |
|--------|-----------|------------|-------------|
| Avg Revenue Per Tenant | $65 | $80 | $90 |
| **Gross Revenue** | **$650** | **$4,000** | **$9,000** |
| Costs | $99 | $142 | $357 |
| **Net Revenue** | **$551** | **$3,858** | **$8,643** |
| **Gross Margin** | **85%** | **96%** | **96%** |

Revenue assumptions:
- Mix of Solo ($29), Team ($79), Pro ($149) plans
- At 10 tenants: mostly Solo/Team (early adopters, price sensitive)
- At 50+: more Team/Pro as product matures and larger groups adopt
- Free tier users not counted (conversion rate ~10-15%)

### One-Time Costs

| Item | Cost | Notes |
|------|------|-------|
| Domain registration | $15/year | streamdata.app |
| Legal documents (ToS, Privacy, DPA) | $500-1,500 | Lawyer-reviewed templates |
| Stripe setup | $0 | Free to set up |
| Design/branding for SaaS | $0-500 | DIY or Fiverr |
| **Total** | **$515-2,015** | |

### Break-Even Analysis

With ~$100/mo in fixed costs at 10 tenants, you break even at **2 paying customers** on the Team plan ($79 x 2 = $158 > $99 costs). This is an extremely capital-efficient business.

---

## 9. Recommended Architecture & Implementation Plan

### Architecture Decision Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multi-tenancy model | Shared DB + RLS (Option A) | Cost, simplicity, stack alignment |
| Database | Supabase Pro (single project) | Already using, RLS native, $25/mo |
| Hosting | Vercel Pro (single project) | Already using, custom domains included |
| Auth | NextAuth v5 + tenant context | Already implemented, add tenant to JWT |
| Billing | Stripe Billing | Industry standard, subscription management |
| ORM | Drizzle (keep) | Already implemented, add tenant_id to schema |
| Domain | *.streamdata.app + custom domains | Subdomain per tenant, custom for Enterprise |
| Legal | ToS + Privacy + DPA | Lawyer-reviewed templates |
| Support | Email + Discord | Free, appropriate for market |
| Monitoring | Vercel Analytics + Sentry | Minimal cost, good coverage |

### Implementation Phases

---

#### Phase 0: Preparation (1 week)

**Goal**: Separate the portal from the Chicken1of1 marketing site

Tasks:
1. Register SaaS domain (streamdata.app or similar)
2. Move portal code to a standalone Next.js project (or route group)
3. Set up separate Vercel project for the SaaS
4. Set up Stripe account with test mode
5. Draft ToS and Privacy Policy using templates
6. Set up a GitHub repo for the SaaS product

---

#### Phase 1: Tenant Foundation (2-3 weeks)

**Goal**: Multi-tenant data layer working with Chicken1of1 as first tenant

**Week 1: Schema & RLS**

1. Create `tenants` table in schema:
```typescript
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: varchar('slug', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  ownerEmail: varchar('owner_email', { length: 255 }).notNull(),
  logoUrl: varchar('logo_url', { length: 500 }),
  primaryColor: varchar('primary_color', { length: 7 }),
  customDomain: varchar('custom_domain', { length: 255 }),
  plan: varchar('plan', { length: 20 }).default('free').notNull(),
  planStatus: varchar('plan_status', { length: 20 }).default('active').notNull(),
  stripeCustomerId: varchar('stripe_customer_id', { length: 255 }),
  stripeSubscriptionId: varchar('stripe_subscription_id', { length: 255 }),
  trialEndsAt: timestamp('trial_ends_at'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

2. Add `tenant_id` column to all existing tables
3. Create migration that:
   - Creates `tenants` table
   - Inserts Chicken1of1 as first tenant
   - Adds `tenant_id` to all tables with default = Chicken1of1's tenant ID
   - Makes `tenant_id` NOT NULL after backfill
4. Write RLS policies for every table
5. Test RLS policies with explicit SQL to verify isolation

**Week 2: Application Layer**

1. Update middleware to resolve tenant from subdomain/domain:
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const tenantSlug = resolveTenantSlug(hostname);
  
  if (tenantSlug) {
    // Rewrite to include tenant context
    const headers = new Headers(request.headers);
    headers.set('x-tenant-slug', tenantSlug);
    // ... continue with auth middleware
  }
}
```

2. Create `withTenant()` wrapper for all API routes:
```typescript
export async function withTenant(
  request: NextRequest,
  handler: (tenant: Tenant, session: Session) => Promise<NextResponse>
) {
  const tenantSlug = request.headers.get('x-tenant-slug');
  const tenant = await getTenantBySlug(tenantSlug); // cached
  if (!tenant) return NextResponse.json({ error: 'Unknown tenant' }, { status: 404 });
  
  // Set RLS context
  await db.execute(sql`SET app.current_tenant_id = ${tenant.id}`);
  
  const { error, session } = await requireAuth();
  if (error) return error;
  
  return handler(tenant, session!);
}
```

3. Update JWT to include `tenantId`:
```typescript
// auth.config.ts callbacks
async jwt({ token, user }) {
  if (user) {
    token.id = user.id;
    token.role = user.role;
    token.tenantId = user.tenantId; // NEW
  }
  return token;
}
```

4. Update all 22 API routes to use `withTenant()` wrapper
5. Update all page components to pass tenant context

**Week 3: Testing & Migration**

1. Write tests for RLS isolation (create 2 test tenants, verify no cross-access)
2. Test all existing features with tenant context
3. Migrate Chicken1of1 production data (add tenant_id to existing rows)
4. Deploy and verify Chicken1of1 works identically

---

#### Phase 2: Auth & Onboarding (2 weeks)

**Goal**: New tenants can sign up and set up their business

**Week 4:**
1. Build signup flow (tenant creation + admin user)
2. Build onboarding wizard (fee setup, product creation, breaker invite)
3. Build tenant settings page (name, logo, fees)
4. Implement invite flow scoped to tenant

**Week 5:**
1. Build landing/marketing page
2. Set up demo environment
3. Implement plan limits (breaker count, stream count)
4. Add plan upgrade prompts when limits hit

---

#### Phase 3: Billing (1-2 weeks)

**Goal**: Stripe integration for subscriptions

**Week 6:**
1. Set up Stripe products and prices (matching tier table above)
2. Implement checkout flow (signup -> Stripe Checkout -> provision tenant)
3. Implement webhook handler for subscription lifecycle
4. Build billing settings page (current plan, upgrade, cancel)
5. Implement Stripe Customer Portal for self-service billing management
6. Add free trial logic (14 days, no card required)

**Week 7:**
1. Feature gating middleware (check plan before allowing actions)
2. Grace period logic for failed payments
3. Dunning emails for failed payments
4. Test full subscription lifecycle end-to-end

---

#### Phase 4: Polish & Launch (1-2 weeks)

**Goal**: Production-ready for first external customers

**Week 8:**
1. Custom subdomain provisioning on signup
2. Email templates (welcome, trial ending, payment failed, invite)
3. SaaS admin dashboard (tenant list, MRR, health metrics)
4. Documentation (10-15 help articles)
5. Error handling and edge cases
6. Security audit (RLS policies, auth flows, rate limits)

**Week 9:**
1. Beta launch with 3-5 known card breaking groups
2. Gather feedback, fix issues
3. Public launch

---

### Total Timeline: 8-9 weeks of focused development

This is aggressive but realistic for a senior engineer working full-time. If part-time, double it to 16-18 weeks.

### Critical Path

The items that block everything else:
1. **Tenant schema + RLS** (week 1) — everything depends on this
2. **Middleware tenant resolution** (week 2) — all routes need this
3. **Stripe checkout** (week 6) — cannot onboard paying customers without it

Everything else can be parallelized or deferred.

### What to Build LAST (or Not at All)

- Custom domains (Enterprise only, few customers will need it initially)
- Color customization (nice-to-have, not launch-critical)
- API access (no one is asking for it yet)
- Analytics dashboard beyond basic metrics (build when you know what customers want to see)
- Mobile app (the web app works fine on mobile)

### Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| RLS policy bug leaks data | Medium | Extensive testing, automated RLS tests in CI |
| No one buys it | High | Validate with 5 groups BEFORE building Phase 2+ |
| Stripe integration complexity | Low | Use Vercel's subscription starter template |
| Supabase connection limits | Low | Connection pooling via Supavisor, upgrade plan if needed |
| Scope creep | High | Ship Phase 1-3 before adding any features |
| Legal issues | Low | Get ToS reviewed by a lawyer for $500-1,500 |

---

## Appendix: Key Technical Decisions Log

| Decision | Chosen | Rejected | Why |
|----------|--------|----------|-----|
| Tenancy model | Shared DB + RLS | Separate DBs, schemas | Cost ($45 vs $2,500+), complexity, Supabase alignment |
| RLS implementation | `SET app.current_tenant_id` | Application-level filtering | Defense in depth — DB enforces even if app has bugs |
| Domain strategy | Subdomains (*.streamdata.app) | Path-based (/tenant/slug) | Professional appearance, standard SaaS pattern |
| Billing | Stripe Billing | Paddle, LemonSqueezy | Ecosystem, documentation, Next.js templates |
| Legal approach | Template + lawyer review | Full custom legal | Cost-appropriate for bootstrapped startup |
| SOC 2 | Skip for now | Pursue certification | $20K+ cost, zero market demand at this stage |
| Per-tenant encryption | Skip | Implement | Data is sales figures not PII, adds complexity with no real benefit |
| Support | Email + Discord | Intercom, Zendesk | Free, matches market (card breakers already use Discord) |

---

## Sources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase Multi-Tenant RLS Deep Dive](https://dev.to/blackie360/-enforcing-row-level-security-in-supabase-a-deep-dive-into-lockins-multi-tenant-architecture-4hd2)
- [Multi-Tenant Applications with RLS on Supabase](https://www.antstack.com/blog/multi-tenant-applications-with-rls-on-supabase-postgress/)
- [Supabase RLS Best Practices](https://www.leanware.co/insights/supabase-best-practices)
- [Vercel Multi-Tenant Guide](https://vercel.com/guides/nextjs-multi-tenant-application)
- [Vercel Platforms Starter Kit](https://vercel.com/templates/next.js/platforms-starter-kit)
- [Vercel Multi-Tenant SaaS Solutions](https://vercel.com/solutions/multi-tenant-saas)
- [SaaS Agreements Guide (Promise Legal)](https://www.promise.legal/startup-legal-guide/contracts/saas-agreements)
- [SaaS Privacy Compliance 2025](https://secureprivacy.ai/blog/saas-privacy-compliance-requirements-2025-guide)
- [DPA Guide for SaaS](https://secureprivacy.ai/blog/data-processing-agreements-dpas-for-saas)
- [Supabase Pricing](https://supabase.com/pricing)
- [Supabase Pricing Breakdown 2026](https://www.metacto.com/blogs/the-true-cost-of-supabase-a-comprehensive-guide-to-pricing-integration-and-maintenance)
- [Vercel Pricing](https://vercel.com/pricing)
- [Vercel Pro Plan Details](https://vercel.com/docs/plans/pro-plan)
- [Stripe + Next.js Complete Guide](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/)
- [SaaS Stripe Integration](https://designrevision.com/blog/saas-stripe-integration)
- [Vercel Next.js Subscription Payments Template](https://github.com/vercel/nextjs-subscription-payments)
- [SOC 2 for SaaS Companies](https://sprinto.com/blog/why-soc-2-for-saas-companies/)
- [SOC 2 Checklist for Startups](https://trycomp.ai/soc-2-checklist-for-saas-startups)
- [Supabase SOC 2 Compliance](https://supabase.com/docs/guides/security/soc-2-compliance)
- [Supabase Security](https://supabase.com/security)
- [Multi-Tenant Data Isolation Architecture](https://medium.com/@justhamade/architecting-secure-multi-tenant-data-isolation-d8f36cb0d25e)
- [Multi-Tenant Data Isolation Guide (Redis)](https://redis.io/blog/data-isolation-multi-tenant-saas/)
- [PII Data Classification (TrustArc)](https://trustarc.com/resource/pii-data-personally-identifiable-information/)
- [Financial Impact of PII Breaches](https://www.micklerandassociates.com/blog/the-financial-impact-of-pii-breaches-on-small-businesses)
