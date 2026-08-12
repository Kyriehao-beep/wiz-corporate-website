# WIZ RFQ and Administration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace public fixtures with secured Supabase catalog data and deliver the complete guided RFQ, private file handling, notifications, Chinese administration, quotation, follow-up, and audit workflow.

**Architecture:** Keep database access behind repositories and server-side services. Public catalog queries read only approved published fields; admin operations require Supabase SSR authentication and row-level security; RFQ submission uses a server route that validates Turnstile, files, idempotency, and database state before scheduling notifications.

**Tech Stack:** Next.js 16, TypeScript, Zod, React Hook Form, Supabase PostgreSQL/Auth/Storage/SSR, Resend, React Email, Cloudflare Turnstile, Vitest, pgTAP/Supabase CLI, Playwright.

## Global Constraints

- Work only under `/Users/haozhisheng/Desktop/wiz网站定制`.
- Invoke `superpowers:test-driven-development` before each behavior task and `vercel-react-best-practices` for React/Next.js changes.
- Invoke `security-best-practices` for the explicit security review task because this plan handles authentication, private files, personal data, and server endpoints.
- Public users may read only published catalog fields; authenticated WIZ users have equal release-one admin permissions.
- Private files are never attached to email or rendered inline.
- RFQ state must survive recoverable upload errors and repeated submit must be idempotent.
- Use schema migrations and committed seed data; never edit production schema manually.
- Use `en`, `ja`, and `zh-CN`; customer email follows submission locale; admin UI is Simplified Chinese.
- Use non-production Supabase, Resend, and Turnstile credentials for implementation and review.

---

## File map

- `supabase/config.toml`: local Supabase configuration.
- `supabase/migrations/`: ordered schema, RLS, storage, function, and audit migrations.
- `supabase/tests/`: pgTAP tests for data and storage authorization.
- `supabase/seed.sql`: deterministic review catalog and admin profile fixtures.
- `src/lib/supabase/`: browser/server/admin clients and generated database types.
- `src/features/auth/`: login, logout, password reset, and admin guards.
- `src/features/catalog/supabase-catalog-repository.ts`: public catalog adapter.
- `src/features/admin-products/`: Chinese product editing and translation completeness.
- `src/features/rfq/`: schemas, wizard, upload, submission, idempotency, and source attribution.
- `src/features/notifications/`: localized React Email templates, Resend adapter, delivery updates.
- `src/features/inquiries/`: query filters, detail, activities, lifecycle, quote, follow-up, and export.
- `src/app/api/`: RFQ, signed-file, Resend webhook, and CSV endpoints.
- `src/app/[locale]/admin/`: authenticated Chinese administration routes.
- `e2e/rfq-admin.spec.ts`: complete buyer-to-sales workflow.

### Task 1: Supabase schema, row-level security, and deterministic seed

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/202608120001_core_schema.sql`
- Create: `supabase/migrations/202608120002_rls_and_storage.sql`
- Create: `supabase/migrations/202608120003_audit.sql`
- Create: `supabase/tests/000_test_helpers.sql`
- Create: `supabase/tests/rls.test.sql`
- Create: `supabase/seed.sql`
- Modify: `package.json`

**Interfaces:**
- Consumes: PRD entities and inquiry lifecycle.
- Produces: database enums/tables, `public.is_admin()`, `public.transition_inquiry(...)`, RLS policies, buckets `product-media`, `rfq-private`, `quote-private`, and script `test:db`.

- [ ] **Step 1: Write failing pgTAP authorization tests**

`supabase/tests/000_test_helpers.sql` defines `tests.create_supabase_user(email text, user_id uuid)` and `tests.authenticate_as(user_id uuid)` by setting `request.jwt.claim.sub` and `request.jwt.claim.role` locally. The seed creates fixed UUIDs for `wiz_admin` and an anonymous test context; tests never depend on hidden Supabase template helpers.

```sql
begin;
select plan(4);

select tests.authenticate_as(null);
select is_empty($$ select id from public.inquiries $$, 'anon cannot read inquiries');

select tests.authenticate_as('00000000-0000-4000-8000-000000000001'::uuid);
select isnt_empty($$ select id from public.inquiries $$, 'admin can read inquiries');

select tests.authenticate_as(null);
select is_empty($$ select internal_notes from public.inquiry_admin_view $$, 'anon cannot read internal notes');
select throws_ok($$ insert into public.products (slug, status) values ('blocked', 'published') $$, '42501');
rollback;
```

- [ ] **Step 2: Initialize Supabase and verify the policy tests fail**

Run:

```bash
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add -D supabase
pnpm exec supabase init
pnpm exec supabase start
pnpm exec supabase test db
```

Expected: FAIL because the application tables and policies do not exist.

- [ ] **Step 3: Implement the core relational schema**

```sql
create extension if not exists citext with schema extensions;

create type public.content_status as enum ('draft', 'published', 'archived');
create type public.inquiry_status as enum ('new', 'contacted', 'quoted', 'won', 'closed');

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status public.content_status not null default 'draft',
  display_order integer not null default 0,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  inquiry_number text unique not null,
  idempotency_key uuid unique not null,
  status public.inquiry_status not null default 'new',
  owner_id uuid references auth.users(id),
  locale text not null check (locale in ('en', 'ja', 'zh-CN')),
  company_name text not null,
  contact_name text not null,
  work_email extensions.citext not null,
  country_region text not null,
  project_description text not null,
  source text not null,
  submission_snapshot jsonb not null,
  next_follow_up_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

Complete the remaining PRD tables with foreign keys, `on delete` behavior, timestamps, and checks. Store internal notes as inquiry activities with `activity_type = 'internal_note'`; do not add an unstructured public note column.

- [ ] **Step 4: Implement deny-by-default RLS and storage separation**

Enable RLS on every application table. Public select policies require `products.status = 'published'` and join only published translations/media. Authenticated admin policies call `public.is_admin()`. Storage policies allow anonymous reads only from `product-media`; `rfq-private` and `quote-private` require an authenticated admin and use inquiry-scoped object prefixes.

- [ ] **Step 5: Reset, test, generate types, and commit**

```bash
pnpm exec supabase db reset
pnpm exec supabase test db
pnpm exec supabase gen types typescript --local > src/lib/supabase/database.types.ts
git add package.json pnpm-lock.yaml supabase src/lib/supabase/database.types.ts
git commit -m "feat: add secured WIZ database schema"
```

Expected: pgTAP passes and generated types contain every core table and enum.

### Task 2: Supabase SSR authentication and protected Chinese admin shell

**Files:**
- Create: `src/lib/supabase/browser.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/service.ts`
- Create: `src/features/auth/require-admin.ts`
- Create: `src/features/auth/actions.ts`
- Create: `src/app/[locale]/admin/login/page.tsx`
- Create: `src/app/[locale]/admin/(protected)/layout.tsx`
- Create: `src/app/[locale]/admin/(protected)/page.tsx`
- Create: `src/features/auth/require-admin.test.ts`
- Modify: `src/proxy.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: Supabase project URL, publishable key, secret service key, `profiles` table.
- Produces: `createBrowserClient()`, `createServerClient()`, `createServiceClient()`, `requireAdmin()`, login/logout/reset actions.

- [ ] **Step 1: Write the admin guard tests**

```ts
it('redirects an anonymous request to the localized login route', async () => {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
  await expect(requireAdmin('zh-CN')).rejects.toMatchObject({ digest: expect.stringContaining('/zh-CN/admin/login') })
})

it('returns a named admin profile for an authenticated user', async () => {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  await expect(requireAdmin('zh-CN')).resolves.toMatchObject({ id: 'user-1', displayName: '测试业务员' })
})
```

- [ ] **Step 2: Run the tests and verify missing clients fail**

Run: `pnpm test:unit -- src/features/auth/require-admin.test.ts`

Expected: FAIL because `requireAdmin` and server client do not exist.

- [ ] **Step 3: Implement server-verified authentication**

```ts
export async function requireAdmin(locale: Locale): Promise<AdminProfile> {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/admin/login`)
  const { data, error } = await supabase.from('profiles').select('id, display_name').eq('id', user.id).single()
  if (error || !data) redirect(`/${locale}/admin/login?reason=profile`)
  return { id: data.id, displayName: data.display_name }
}
```

Keep `createServiceClient()` in server-only code and throw at module initialization if its secret is absent outside tests. The public browser bundle receives only the Supabase URL and publishable key.

- [ ] **Step 4: Implement login, logout, reset, and admin shell**

Use server actions with Zod validation, generic invalid-credential messages, secure cookie-based sessions, and Chinese UI. The protected layout calls `requireAdmin` before rendering navigation links for 产品管理, 询盘管理, and 退出登录.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/auth/require-admin.test.ts
git add .env.example src/lib/supabase src/features/auth 'src/app/[locale]/admin' src/proxy.ts
git commit -m "feat: protect the WIZ administration"
```

### Task 3: Supabase catalog repository and public fixture replacement

**Files:**
- Create: `src/features/catalog/supabase-catalog-repository.ts`
- Create: `src/features/catalog/supabase-catalog-repository.test.ts`
- Create: `src/features/catalog/get-catalog-repository.ts`
- Modify: public catalog routes from plan 1.

**Interfaces:**
- Consumes: `CatalogRepository`, generated database types, public Supabase client.
- Produces: a database-backed repository with English fallback and published-only queries.

- [ ] **Step 1: Write translation fallback and publication tests**

```ts
it('returns requested Japanese content when published', async () => {
  const product = await repository.getProductBySlug('ja', 'custom-pvc-rubber-patches')
  expect(product?.locale).toBe('ja')
})

it('falls back to English without exposing a draft translation', async () => {
  const product = await repository.getProductBySlug('zh-CN', 'hook-and-loop-rubber-patches')
  expect(product?.locale).toBe('en')
  expect(product?.usedFallback).toBe(true)
})
```

- [ ] **Step 2: Run tests to verify adapter is missing**

Run: `pnpm test:unit -- src/features/catalog/supabase-catalog-repository.test.ts`

Expected: FAIL because the Supabase adapter does not exist.

- [ ] **Step 3: Implement the adapter**

Map database rows into the existing `ProductDetail` and `ApplicationDetail` contracts. Query requested and English translations in one bounded request; never select admin-only columns. Return `null` for non-published products.

- [ ] **Step 4: Switch page composition through one factory**

```ts
export function getCatalogRepository(): CatalogRepository {
  return process.env.CATALOG_SOURCE === 'fixture'
    ? new FixtureCatalogRepository()
    : new SupabaseCatalogRepository()
}
```

Keep fixture mode only for isolated unit tests and local visual recovery. Preview and production use Supabase.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/catalog && pnpm build
git add src/features/catalog src/app
git commit -m "feat: serve published WIZ catalog from Supabase"
```

### Task 4: Product and translation administration

**Files:**
- Create: `src/features/admin-products/product-form-schema.ts`
- Create: `src/features/admin-products/actions.ts`
- Create: `src/features/admin-products/product-form.tsx`
- Create: `src/features/admin-products/translation-tabs.tsx`
- Create: `src/features/admin-products/publication-check.ts`
- Create: `src/features/admin-products/publication-check.test.ts`
- Create: `src/app/[locale]/admin/(protected)/products/page.tsx`
- Create: `src/app/[locale]/admin/(protected)/products/[id]/page.tsx`

**Interfaces:**
- Consumes: authenticated admin, products/translations/media/applications tables.
- Produces: `ProductFormInput`, `saveProduct(input, actorId)`, `publishProduct(id, actorId)`, `getPublicationIssues(product)`.

- [ ] **Step 1: Write publication rule tests**

```ts
it('blocks publication when English content is absent', () => {
  expect(getPublicationIssues(productWithoutEnglish)).toContain('English title and summary are required')
})

it('allows explicit English fallback for Japanese and Chinese', () => {
  expect(getPublicationIssues(productWithEnglishAndFallbackFlags)).toEqual([])
})
```

- [ ] **Step 2: Run tests and verify rules are missing**

Run: `pnpm test:unit -- src/features/admin-products/publication-check.test.ts`

Expected: FAIL because the publication checker does not exist.

- [ ] **Step 3: Implement schema and server actions**

```ts
export const productTranslationSchema = z.object({
  locale: z.enum(['en', 'ja', 'zh-CN']),
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().min(1).max(320),
  body: z.string().trim().min(1).max(12000),
  seoTitle: z.string().trim().min(1).max(70),
  seoDescription: z.string().trim().min(1).max(170),
  approved: z.boolean(),
})
```

Every save and publish action calls `requireAdmin`, validates input, writes `updated_by`, and records an audit event. Copying English creates an unapproved translation draft.

- [ ] **Step 4: Implement Chinese list/editor screens**

Support create, edit, preview, publish, unpublish, archive, reorder, application linking, media ordering, and visible translation-completeness warnings. Do not add rich-text HTML input; use sanitized structured text blocks or Markdown rendered with an allowlist.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/admin-products && pnpm test:db
git add src/features/admin-products 'src/app/[locale]/admin'
git commit -m "feat: add multilingual WIZ product administration"
```

### Task 5: Guided RFQ schema and recoverable wizard state

**Files:**
- Create: `src/features/rfq/schema.ts`
- Create: `src/features/rfq/schema.test.ts`
- Create: `src/features/rfq/rfq-wizard.tsx`
- Create: `src/features/rfq/rfq-context.tsx`
- Create: `src/features/rfq/steps/application-product-step.tsx`
- Create: `src/features/rfq/steps/specification-step.tsx`
- Create: `src/features/rfq/steps/artwork-step.tsx`
- Create: `src/features/rfq/steps/contact-step.tsx`
- Create: `src/features/rfq/steps/review-step.tsx`
- Create: `src/app/[locale]/rfq/page.tsx`

**Interfaces:**
- Consumes: public catalog repository and URL context.
- Produces: `RfqInput`, `rfqSchema`, five-step wizard, session-scoped draft persistence.

- [ ] **Step 1: Write RFQ validation tests**

```ts
it('accepts undecided size and advice options', () => {
  expect(rfqSchema.safeParse(validInput({ size: { kind: 'undecided' }, dimension: 'need-advice', backing: 'need-advice' })).success).toBe(true)
})

it('rejects personal-email shaped omissions and invalid quantities', () => {
  const result = rfqSchema.safeParse(validInput({ estimatedQuantity: 0, workEmail: 'invalid' }))
  expect(result.success).toBe(false)
})
```

- [ ] **Step 2: Run tests and verify schema is missing**

Run: `pnpm test:unit -- src/features/rfq/schema.test.ts`

Expected: FAIL because `rfqSchema` does not exist.

- [ ] **Step 3: Implement the exact RFQ contract**

```ts
export const rfqSchema = z.object({
  locale: z.enum(['en', 'ja', 'zh-CN']),
  productSlug: z.string().min(1),
  applicationSlug: z.string().min(1),
  estimatedQuantity: z.number().int().positive().max(10_000_000),
  size: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('undecided') }),
    z.object({ kind: z.literal('known'), widthMm: z.number().positive(), heightMm: z.number().positive() }),
  ]),
  dimension: z.enum(['2d', '3d', 'need-advice']),
  backing: z.enum(['sew-on', 'heat-transfer', 'hook-and-loop', 'adhesive', 'none', 'need-advice']),
  companyName: z.string().trim().min(1).max(160),
  contactName: z.string().trim().min(1).max(120),
  workEmail: z.string().trim().email().max(254),
  countryRegion: z.string().trim().min(2).max(120),
  projectDescription: z.string().trim().min(20).max(8000),
  privacyAccepted: z.literal(true),
})
```

- [ ] **Step 4: Implement accessible staged interaction**

Use React Hook Form with one form provider, client-side convenience validation, server-authoritative revalidation, per-step error summary, preserved values on back/next, sessionStorage keyed by a non-sensitive draft ID, and a final review screen. Do not store file bytes or secrets in sessionStorage.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/rfq
git add src/features/rfq 'src/app/[locale]/rfq'
git commit -m "feat: add guided WIZ RFQ experience"
```

### Task 6: Private artwork upload validation

**Files:**
- Create: `src/features/rfq/file-policy.ts`
- Create: `src/features/rfq/file-policy.test.ts`
- Create: `src/features/rfq/upload-service.ts`
- Create: `src/app/api/rfq/uploads/route.ts`
- Modify: `src/features/rfq/steps/artwork-step.tsx`

**Interfaces:**
- Consumes: authenticated upload draft token, `rfq-private` bucket.
- Produces: `validateRfqFile(file)`, `createRfqUpload(input)`, `UploadedArtworkRef` with storage key and safe display name.

- [ ] **Step 1: Write file-policy tests**

```ts
it.each(['jpg', 'jpeg', 'png', 'pdf', 'ai', 'eps', 'svg'])('accepts .%s', (extension) => {
  expect(validateFileDescriptor(fileDescriptor(extension, 1024))).toEqual({ ok: true })
})

it('rejects a renamed executable and aggregate size over 100 MB', () => {
  expect(validateFileDescriptor(fileDescriptor('jpg', 1024, 'application/x-msdownload')).ok).toBe(false)
  expect(validateAggregateSize([60 * MB, 41 * MB]).ok).toBe(false)
})
```

- [ ] **Step 2: Run tests and verify policy is missing**

Run: `pnpm test:unit -- src/features/rfq/file-policy.test.ts`

Expected: FAIL because file-policy functions do not exist.

- [ ] **Step 3: Implement extension, MIME, size, and signature rules**

Allow at most five files, 20 MB each, 100 MB aggregate. Sanitize the displayed filename, generate a UUID storage path, compare extension with an allowlisted MIME/signature policy, force private download disposition for SVG/AI/EPS/PDF, and reject zero-byte files.

- [ ] **Step 4: Implement staged upload and cleanup**

Create an `upload_drafts` record containing a random public token hash, expiry, aggregate bytes, and file count. The server issues a one-file signed upload URL to `rfq-private/quarantine/{draftId}/{uuid}` only after validating the descriptor and draft limits. The browser never receives a service key. After inquiry creation, the server copies accepted objects to `rfq-private/inquiries/{inquiryId}/{uuid}`, inserts attachment records, and deletes quarantine objects. A scheduled cleanup function deletes expired unattached objects. Storage policies deny inline public reads from both prefixes.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/rfq/file-policy.test.ts && pnpm test:db
git add src/features/rfq src/app/api/rfq supabase
git commit -m "feat: secure WIZ RFQ artwork uploads"
```

### Task 7: Idempotent inquiry creation and Turnstile verification

**Files:**
- Create: `src/lib/security/turnstile.ts`
- Create: `src/lib/security/rate-limit.ts`
- Create: `supabase/migrations/202608120005_rfq_rate_limits.sql`
- Create: `src/features/rfq/create-inquiry.ts`
- Create: `src/features/rfq/create-inquiry.test.ts`
- Create: `src/app/api/rfq/route.ts`
- Create: `supabase/migrations/202608120004_create_inquiry_function.sql`

**Interfaces:**
- Consumes: `RfqInput`, uploaded artwork refs, Turnstile token, idempotency UUID, request source.
- Produces: `createInquiry(command): Promise<{ inquiryId; inquiryNumber; duplicate }>` and `POST /api/rfq`.

- [ ] **Step 1: Write duplicate and failure-order tests**

```ts
it('returns the original inquiry for the same idempotency key', async () => {
  const first = await createInquiry(command)
  const second = await createInquiry(command)
  expect(second.inquiryId).toBe(first.inquiryId)
  expect(second.duplicate).toBe(true)
})

it('does not report success when database creation fails', async () => {
  dbCreate.mockRejectedValue(new Error('database unavailable'))
  await expect(createInquiry(command)).rejects.toThrow('inquiry_create_failed')
})
```

- [ ] **Step 2: Run tests and verify service is missing**

Run: `pnpm test:unit -- src/features/rfq/create-inquiry.test.ts`

Expected: FAIL because `createInquiry` does not exist.

- [ ] **Step 3: Implement mandatory server-side security checks**

Verify Turnstile through Siteverify, reject expired/reused tokens, validate the honeypot is empty, parse the server schema, and verify uploaded refs belong to the active draft. Enforce durable sliding-window limits in `rfq_rate_limits` using keyed HMAC-SHA256 hashes of normalized IP and email—never raw IPs—and an atomic PostgreSQL function. Default limits are 5 submissions per email per hour and 20 per IP hash per hour; make both values server environment settings. Use separate Turnstile keys for local/test and production.

- [ ] **Step 4: Implement one database transaction boundary**

The SQL function creates or returns an inquiry by idempotency key, creates inquiry items and attachment rows, moves draft storage refs into inquiry ownership, writes the immutable submission snapshot, creates the first audit event, and queues two notification records. Generate numbers as `WIZ-{UTC YYYYMMDD}-{six-digit sequence}`.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/rfq/create-inquiry.test.ts && pnpm test:db
git add src/lib/security src/features/rfq src/app/api/rfq supabase
git commit -m "feat: create secure idempotent WIZ inquiries"
```

### Task 8: Localized confirmations, internal alerts, and delivery webhooks

**Files:**
- Create: `src/features/notifications/types.ts`
- Create: `src/features/notifications/resend-client.ts`
- Create: `src/features/notifications/send-notification.ts`
- Create: `src/features/notifications/templates/customer-confirmation.tsx`
- Create: `src/features/notifications/templates/internal-alert.tsx`
- Create: `src/features/notifications/send-notification.test.ts`
- Create: `src/app/api/webhooks/resend/route.ts`

**Interfaces:**
- Consumes: queued notification record, inquiry safe summary, Resend API key/webhook secret.
- Produces: customer confirmation and internal alert sends, delivery-state updates, retryable failure classification.

- [ ] **Step 1: Write notification behavior tests**

```ts
it('sends the customer locale and never includes private file URLs', async () => {
  await sendNotification(customerJobJa)
  expect(resend.emails.send).toHaveBeenCalledWith(expect.objectContaining({
    subject: expect.stringContaining('WIZ'),
    react: expect.anything(),
  }))
  expect(JSON.stringify(resend.emails.send.mock.calls)).not.toContain('signedUrl')
})

it('records provider failure without deleting the inquiry', async () => {
  resend.emails.send.mockResolvedValue({ data: null, error: { message: 'rate limited' } })
  await expect(sendNotification(job)).rejects.toThrow('notification_retryable')
  expect(markDeliveryFailed).toHaveBeenCalled()
})
```

- [ ] **Step 2: Run tests and verify adapter is missing**

Run: `pnpm test:unit -- src/features/notifications/send-notification.test.ts`

Expected: FAIL because notification service/templates do not exist.

- [ ] **Step 3: Implement localized React Email templates**

Customer email includes inquiry number, product/application, submitted specification summary, contact details, and a statement that the team will review the request; it includes no fixed response promise. Internal email includes inquiry number, company, country, product, source, and a protected admin URL; it does not attach files.

- [ ] **Step 4: Implement Resend adapter and verified webhook**

Send with the authenticated WIZ subdomain, store provider message ID, verify webhook signatures before accepting events, map `sent`, `delivered`, `bounced`, `complained`, and failure events into `notification_deliveries`, and return `2xx` only after durable processing.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/notifications
git add src/features/notifications src/app/api/webhooks
git commit -m "feat: notify WIZ buyers and sales staff"
```

### Task 9: Inquiry list, assignment, lifecycle, and activity log

**Files:**
- Create: `src/features/inquiries/types.ts`
- Create: `src/features/inquiries/query-inquiries.ts`
- Create: `src/features/inquiries/actions.ts`
- Create: `src/features/inquiries/lifecycle.ts`
- Create: `src/features/inquiries/lifecycle.test.ts`
- Create: `src/features/inquiries/inquiry-list.tsx`
- Create: `src/features/inquiries/inquiry-detail.tsx`
- Create: `src/app/[locale]/admin/(protected)/inquiries/page.tsx`
- Create: `src/app/[locale]/admin/(protected)/inquiries/[id]/page.tsx`

**Interfaces:**
- Consumes: admin profile, inquiry database views and transition function.
- Produces: typed filters, assignment action, contact/note actions, audited lifecycle transitions.

- [ ] **Step 1: Write lifecycle tests**

```ts
it.each([
  ['new', 'contacted'], ['contacted', 'quoted'], ['quoted', 'won'], ['quoted', 'closed'], ['won', 'contacted'], ['closed', 'contacted'],
])('allows %s -> %s through an explicit action', (from, to) => {
  expect(canTransition(from as InquiryStatus, to as InquiryStatus)).toBe(true)
})

it('requires a closure reason', () => {
  expect(validateTransition({ from: 'quoted', to: 'closed', reason: '' }).success).toBe(false)
})
```

- [ ] **Step 2: Run tests and verify lifecycle module is missing**

Run: `pnpm test:unit -- src/features/inquiries/lifecycle.test.ts`

Expected: FAIL because lifecycle validation does not exist.

- [ ] **Step 3: Implement typed filters and server actions**

Filters: inquiry number, company, contact, email, project text, status, owner, source, country, language, product, application, and date. Actions: assign owner, add internal note, record email/phone contact, transition state, and reopen with required note. Every action validates auth and writes audit data.

- [ ] **Step 4: Implement Chinese list and detail UI**

Display status, age, owner, next follow-up, source, market, product, and notification warning. Detail separates buyer submission, private files, activity timeline, quote, follow-up, and audit summary. Signed-file links expire after five minutes and open as downloads.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/inquiries/lifecycle.test.ts && pnpm test:db
git add src/features/inquiries 'src/app/[locale]/admin'
git commit -m "feat: add WIZ inquiry ownership and lifecycle"
```

### Task 10: Quotes, follow-up, CSV export, and audit visibility

**Files:**
- Create: `src/features/inquiries/quote-schema.ts`
- Create: `src/features/inquiries/quote-actions.ts`
- Create: `src/features/inquiries/follow-up-actions.ts`
- Create: `src/features/inquiries/export-inquiries.ts`
- Create: `src/features/inquiries/export-inquiries.test.ts`
- Create: `src/app/api/admin/inquiries/export/route.ts`
- Create: `src/app/api/admin/files/[attachmentId]/route.ts`
- Modify: inquiry detail and list screens.

**Interfaces:**
- Consumes: authenticated admin, inquiry filters, `quote-private` storage.
- Produces: quote record/upload, follow-up date, filtered CSV, expiring authenticated download redirect.

- [ ] **Step 1: Write CSV privacy tests**

```ts
it('exports filtered metadata without private file paths or notes', async () => {
  const csv = await exportInquiries(filters)
  expect(csv).toContain('inquiry_number,company_name,status,owner,created_at')
  expect(csv).not.toContain('storage_path')
  expect(csv).not.toContain('internal_note')
})
```

- [ ] **Step 2: Run tests and verify export is missing**

Run: `pnpm test:unit -- src/features/inquiries/export-inquiries.test.ts`

Expected: FAIL because `exportInquiries` does not exist.

- [ ] **Step 3: Implement quote and follow-up rules**

Quote requires ISO 4217 currency, non-negative decimal amount, quote date, and either amount or a validated PDF quotation file. Moving to `quoted` calls the lifecycle transition in the same operation. Follow-up accepts a future timestamp or explicit clear action.

- [ ] **Step 4: Implement safe export and downloads**

CSV uses the active list filters, UTF-8 BOM for spreadsheet compatibility, formula-injection escaping for values beginning with `=`, `+`, `-`, or `@`, and no internal notes or storage paths. File route checks auth and record access before returning a five-minute signed redirect.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/inquiries && pnpm test:db
git add src/features/inquiries src/app/api/admin 'src/app/[locale]/admin'
git commit -m "feat: add WIZ quote follow-up and exports"
```

### Task 11: Security review and RFQ/admin completion gate

**Files:**
- Create: `e2e/rfq-admin.spec.ts`
- Create: `docs/operations/security-model.md`
- Modify: security-sensitive files accepted during review.

**Interfaces:**
- Consumes: complete public catalog, RFQ, auth, admin, storage, email, and audit features.
- Produces: documented trust boundaries and release-level end-to-end proof.

- [ ] **Step 1: Invoke the explicit security review skill**

Invoke `security-best-practices` for TypeScript/Next.js and review authentication, authorization, RLS, file upload, webhook verification, rate limiting, secrets, logs, CSV injection, signed URLs, and personal-data exposure. Record concrete architecture and accepted residual risks in `docs/operations/security-model.md`.

- [ ] **Step 2: Write the complete buyer-to-sales browser test**

```ts
test('buyer RFQ reaches the sales workflow exactly once', async ({ page }) => {
  await page.goto('/en/rfq?product=custom-pvc-rubber-patches&application=surf-watersports')
  await completeValidRfq(page)
  await Promise.all([page.getByRole('button', { name: /submit/i }).click(), page.getByRole('button', { name: /submit/i }).click()])
  await expect(page.getByText(/WIZ-\d{8}-\d{6}/)).toBeVisible()
  await loginAsAdmin(page)
  await expect(page.getByText('测试户外品牌')).toHaveCount(1)
})
```

- [ ] **Step 3: Add denial and recovery cases**

Test anonymous admin denial, unsigned private-file denial, expired signed link, invalid/oversized file, failed Turnstile, notification-provider failure after durable inquiry creation, invalid webhook signature, duplicate submit, closure reason, reopen audit, and CSV formula escaping.

- [ ] **Step 4: Run the full non-production gate**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:db && pnpm test:e2e -- e2e/rfq-admin.spec.ts && pnpm build
```

Expected: all commands exit `0`; the test database contains one inquiry for the duplicate-submit case; no private URL appears in test email output.

- [ ] **Step 5: Commit and request review**

```bash
git add src supabase e2e docs/operations package.json pnpm-lock.yaml
git commit -m "feat: complete secured WIZ RFQ and administration"
```

Invoke `superpowers:requesting-code-review`, resolve accepted findings, rerun the full gate, and only then begin the production-launch plan.
