# WIZ Inquiry / RFQ Platform — Security Model

> Scope: Plan 2 (RFQ submission, auth, admin console, quotes, follow-up, CSV
> export, notifications). This document records the trust boundaries, the controls
> that are implemented, and the **accepted residual risks** that must be reviewed
> before a production launch. It is the deliverable for Plan Task 11 (security
> review gate). The `security-best-practices` skill was not installed in this
> environment, so this review was performed manually against the same checklist
> (auth, authz, RLS, upload, webhook, rate-limit, secrets, logs, CSV injection,
> signed URLs, PII).

## 1. Trust boundaries

```
Browser (public)                Edge / Next.js (Node)
┌──────────────┐  HTTPS  ┌────────────────────────────────────────────┐
│ RFQ wizard   │────────▶│ /api/rfq (Turnstile + idempotency + write)  │
│ admin UI     │────────▶│ /api/admin/* (requireApiAdmin)              │
│              │         │ /api/webhooks/resend (Svix HMAC verify)     │
└──────────────┘         └───────────────┬───────────────┬────────────┘
                                          │ service role  │ anon/client
                                          ▼               ▼
                                   ┌──────────────┐  ┌──────────────────┐
                                   │  Postgres +   │  │ Storage buckets   │
                                   │  RLS (deny)   │  │ rfq-private /     │
                                   │               │  │ quote-private     │
                                   └──────────────┘  └──────────────────┘
                                          ▲               ▲
                                   Resend webhook    Signed URLs (5 min)
                                   (events)           via service client
```

- **Public client** never holds the service-role key. It talks to Supabase via the
  **anon** key (RLS-enforced) or through our own API routes.
- **Server routes** use `createServiceClient()` (service role, **bypasses RLS**) and
  must therefore re-establish trust (`requireAdmin` / `requireApiAdmin` /
  `verifyResendWebhook`) before any privileged write.
- **Storage** is never public. Private objects are reachable only through
  short-lived signed URLs issued by an authorized route.

## 2. Authentication & authorization

- **Supabase Auth** is the identity provider. `requireAdmin(locale)` and
  `requireApiAdmin()` both `auth.getUser()` and then confirm a `profiles` row
  exists. **Design assumption (accepted):** existence of a `profiles` row
  *is* the WIZ-membership gate; role (`admin`/`sales`/`staff`) is not yet
  branch-checked in these guards. All admin surfaces share this assumption, so it
  is consistent — but a future requirement to restrict parts of the console to
  `admin` only would need a role check added in both guards.
- `requireAdmin` **redirects** unauthenticated users to `/login`; `requireApiAdmin`
  returns `401/403` for JSON/CSV endpoints.
- **Anon is denied by default**: every application table has RLS enabled with no
  public `USING` policy, so the anon key can read only what a policy explicitly
  allows (the public catalog).

## 3. Row Level Security summary

| Table | Policy | Writes |
| --- | --- | --- |
| `profiles` | members read own | service role |
| `products` / `applications` + translations / media | **public read** (catalog) | members |
| `inquiries` / `inquiry_items` / `inquiry_activities` | `is_wiz_member()` all | service role |
| `inquiry_attachments` | `is_wiz_member()` all | service role |
| `inquiry_quotes` | `is_wiz_member()` **read** | service role |
| `upload_drafts` / `rfq_rate_limits` / `notification_queue` / `notification_deliveries` / `audit_log` | **no client policy** | service role only |

Storage: `product-media` is public-read + member-write; `rfq-private` and
`quote-private` are member-read with **no client write policy** (uploads happen
via the service role only).

## 4. File upload

- Client-side policy (`src/features/rfq/file-policy.ts`) enforces `MAX_FILES`,
  per-file size, aggregate size, and MIME/extension allow-list **before** any
  bytes leave the browser.
- Objects land in `rfq-private` under an inquiry-scoped prefix; references are
  stored in `inquiry_attachments` only after the inquiry row exists (no orphan
  drafts leak to public paths).
- **No public URLs.** Downloads are served exclusively through
  `/api/admin/files/[attachmentId]` and `/api/admin/files/quote/[quoteId]`, which
  verify (a) the caller is a WIZ member and (b) the record exists, then issue a
  **5-minute** signed redirect.

## 5. Webhook verification (Resend → delivery state)

- Resend uses the **Svix** scheme: `svix-id` / `svix-timestamp` / `svix-signature`.
  `verifyResendWebhook()` HMAC-SHA256s `"<id>.<timestamp>.<rawBody>` with the key
  decoded from the `whsec_` secret and compares with a constant-time check, within
  a 5-minute replay window.
- **Production hardening:** if `RESEND_WEBHOOK_SECRET` is unset in production, the
  route returns `503 webhook_not_configured` and refuses to mutate delivery
  state — so an unsigned event cannot forge a bounce/complaint. In dev,
  verification is skipped with a warning only.
- Raw body is consumed once (`req.text()`) and never logged.

## 6. Rate limiting & anti-bot

- **Cloudflare Turnstile** gates `/api/rfq`: the server verifies the token with
  `TURNSTILE_SECRET_KEY` before processing. Missing/invalid token → rejected.
- **Idempotency:** submissions carry an `idempotency_key`; a duplicate key
  short-circuits to the existing inquiry, so a double-click (or the E2E
  duplicate-submit case) cannot create two inquiries.
- **Rate-limit key derivation** (`src/features/inquiries/rate-limit.ts`) derives an
  HMAC key from `RFQ_RATE_LIMIT_SECRET` (falls back to the service-role key) and
  stores only the derived bucket counts — **no plaintext IP or email** at rest.

## 7. Secrets handling

| Variable | Exposure | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `NEXT_PUBLIC_SITE_URL` | **public** (NEXT_PUBLIC_) | safe to ship to browser |
| `SUPABASE_SERVICE_ROLE_KEY` | server-only | bypasses RLS; `createServiceClient()` throws if missing |
| `RESEND_API_KEY` | server-only | used by `resend-client.ts` |
| `RESEND_WEBHOOK_SECRET` | server-only | `whsec_` prefixed |
| `TURNSTILE_SECRET_KEY` | server-only | |
| `RFQ_RATE_LIMIT_SECRET` | server-only | optional; falls back to service key |

- Secrets are read from env at call time. **No secret value is ever written to a
  log** — the only related logs are "RESEND_WEBHOOK_SECRET unset" notices, which
  leak no value.
- `.env.example` must be extended to include `RESEND_API_KEY`,
  `RESEND_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`, `NEXT_PUBLIC_TURNSTILE_SITE_KEY`,
  and `RFQ_RATE_LIMIT_SECRET` (currently only Supabase vars are listed).

## 8. Logging & PII

- Logs capture status/errors, not payloads. Inquiry PII (names, emails, company,
  project description) lives in `inquiries` / `inquiry_activities.payload` and is
  readable **only** behind `requireAdmin`.
- The CSV export deliberately **omits** `storage_path`, `internal_note`, and all
  contact PII beyond company name (see §10).

## 9. CSV injection

- `export-inquiries.ts` emits a UTF-8 **BOM** for spreadsheet compatibility and
  escapes any cell beginning with `= + - @` by prefixing `'`. Columns are
  restricted to `inquiry_number, company_name, status, owner, created_at` — no
  notes, no storage paths, no emails. Tests assert both the escaping and the
  absence of sensitive columns.

## 10. Signed URLs & private-file access

- Both file routes: verify WIZ membership → verify record exists → issue a
  **300-second** signed URL from the correct bucket (`rfq-private` for
  attachments, `quote-private` for quote PDFs) → `302` redirect with
  `Cache-Control: no-store`. An unknown/invalid attachment or quote returns `404`;
  an unauthenticated caller gets `401`.
- The signed URL is scoped to the single object; there is no directory listing or
  wildcard.

## 11. Personal-data exposure (export & UI)

- Export: company name + status + owner + created_at only.
- Admin UI: full PII is shown only to authenticated members.
- Activity payloads may carry free-text notes; these are internal and never sent
  to customers or exported.

## 12. Accepted residual risks (must review before launch)

1. **Role-based admin scoping not enforced.** `requireAdmin` / `requireApiAdmin`
   gate on profile *existence*, not role. Acceptable for an internal tool with
   trusted staff, but add a `role` check if non-staff should be excluded.
2. **Quote PDF upload UI is not implemented.** `pdfStorageKey` is accepted as a
   free-text reference to `quote-private`; there is **no client upload flow and no
   server-side PDF validation**. Retrieval works (signed link), but the *write*
   path and MIME/PDF validation are pending. Owner must wire the upload
   component before relying on quote PDFs.
3. **Quote insert vs status transition is not transactional.** `recordQuoteAction`
   inserts the quote, then best-effort advances status to `quoted` via
   `validateTransition`. A failure mid-way can leave a quote on a non-`quoted`
   inquiry. Acceptable given the audit trail; could be wrapped in a DB function
   later.
4. **Export has no row cap.** `queryInquiries(..., { all: true })` returns the full
   filtered set. For very large datasets this is a single large response; add a
   server-side cap if the table grows.
5. **Rate-limit secret fallback.** `RFQ_RATE_LIMIT_SECRET` falling back to the
   service-role key is functionally fine but couples the two; prefer a dedicated
   secret in production.
6. **`.env.example` is incomplete** (see §7).

## 13. Pre-deploy gate (from plan Task 11)

- [ ] `pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:db`
- [ ] `pnpm test:e2e -- e2e/rfq-admin.spec.ts` (Playwright — **cannot run in this
      sandbox**; run on a non-sandboxed runner). See `e2e/rfq-admin.spec.ts`.
- [ ] `pnpm build`
- [ ] Confirm all server-only secrets are set in the host and **not** in client
      bundles (none currently are).
- [ ] Confirm `RESEND_WEBHOOK_SECRET` is set in production (else webhook is
      disabled with `503`).
- [ ] Review residual risks §12 with the product owner.
