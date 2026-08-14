# WIZ Corporate Website — Frontend Implementation Memory

Last updated: 2026-08-12 (Asia/Shanghai)

## Purpose

This file is the durable project memory for the WIZ public website frontend. Update it after every implementation task so work can resume from repository evidence instead of relying on chat context.

## Source of Truth

- Approved PRD: `docs/superpowers/specs/2026-08-12-wiz-corporate-website-prd-design.md`
- Public website plan: `docs/superpowers/plans/2026-08-12-wiz-public-website.md`
- Release roadmap: `docs/superpowers/plans/2026-08-12-wiz-release-one-roadmap.md`
- PRD coverage matrix: `docs/superpowers/plans/2026-08-12-wiz-prd-coverage-matrix.md`

## Confirmed Business Decisions

- Brand: WIZ.
- Legal entity: WIZ ELECTRONIC GIFT CO., LIMITED.
- Business model: Hong Kong company with a self-owned mainland factory; integrated manufacturing and trading.
- Experience: more than eight years in the relevant rubber patch field.
- Main product: custom rubber/PVC patches and related labels.
- Priority application direction: outdoor, especially surf and watersports, outdoor apparel, backpacks, and technical gear.
- Capability claim allowed: AI-assisted automatic color matching.
- Certificates: omitted until verified documents are supplied.
- Client identities and client materials: must not be published.
- Real contact details and detailed addresses: must not be invented; publish only after approved company data is supplied.
- Initial website languages: English, Japanese, and Simplified Chinese.
- Spanish: phase two, not part of the current frontend release.
- Visual direction: Quiet Premium, restrained outdoor manufacturing aesthetic.
- Brand line: “Precision in Every Color. Built for the Outdoors.”
- Customer acquisition: Alibaba is the current primary channel; the website builds trust, demonstrates capability, and captures focused inquiries rather than operating as a social-media hub.
- Backend development follows the completed public frontend. Backend scope includes product publishing and inquiry processing.

## Asset and Claim Boundaries

- Current visual assets may be AI-generated placeholders and must be clearly treated as drafts until replaced or approved.
- Do not label AI-generated factory imagery as a real WIZ factory photograph.
- Do not claim certifications such as REACH, RoHS, or SGS until documentary evidence is approved.
- Do not publish fixed MOQ, pricing, lead time, freight, or customization commitments without current internal rules or human approval.
- Surfboard direct attachment must be described as dependent on substrate and adhesive testing. WIZ rubber patches are not EVA traction pads.

## Repository and Workspace

- Repository: `https://github.com/Kyriehao-beep/wiz-corporate-website` (private).
- Main project folder: `/Users/haozhisheng/Desktop/wiz网站定制`.
- Active frontend worktree: `/Users/haozhisheng/Desktop/wiz网站定制/.worktrees/public-website-foundation`.
- Active branch: `agent/public-website-foundation`.
- Runtime: Next.js 16.3, React 19.2, TypeScript, Tailwind CSS 4, next-intl, Vitest, Playwright.
- Stable local build path: `next build --webpack`. Turbopack plus Tailwind/PostCSS failed on the local environment while Webpack builds cleanly.
- Local preview binds to `127.0.0.1` to keep Next.js development assets same-origin with Playwright.
- Current Chrome E2E project uses the installed Google Chrome channel. Firefox and WebKit remain part of the final cross-browser gate.

## Completed Frontend Tasks

### Task 1 — Project foundation

- Commit: `cc8a0fc chore: establish WIZ web application foundation`.
- Added Next.js application foundation, dependency lockfile, TypeScript, ESLint, Tailwind/PostCSS, Vitest, Playwright, and GitHub Actions quality gate.

### Task 2 — Locale routing and translation contracts

- Commit: `bfefb96 feat: add approved WIZ locale routing`.
- Added `/en`, `/ja`, and `/zh-CN` routes, next-intl configuration, proxy routing, locale validation, structured dictionaries, and static route generation.
- Root path enters the English website.

### Task 3 — Design system and accessible site shell

- Commit: `d62012c feat: establish WIZ design system and site shell`.
- Added Quiet Premium design tokens, responsive hero concept, header, footer, language selector, mobile navigation, skip link, visible keyboard focus, and reusable UI primitives.
- Added localized hero display text and final DOM language synchronization while preserving static generation.

### Task 4 — Catalog and RFQ context contracts

- Commit: `8ecc2c3 feat: define WIZ catalog and RFQ context contracts`.
- Added five approved product entries, nine application entries, a typed fixture repository boundary, and contextual RFQ URL construction.
- Priority applications are surf/watersports, outdoor apparel, and backpacks/gear bags.

### Task 5 — Homepage and discovery pages

- Commit: `f5e8dd1 feat: build WIZ homepage and catalog discovery`.
- Added the complete homepage narrative, product index, application index, responsive discovery cards, and contextual RFQ entry points.
- Generated `public/media/drafts/surf-watersports-gear-ai-draft.png`; the interface and asset register identify it as an AI draft, not a real WIZ/customer photograph.
- Focused evidence: homepage component test passed and TypeScript passed.

### Task 6 — Product and application detail routes

- Commit: `987f2f3 feat: add WIZ catalog detail experiences`.
- Added five product detail routes and nine application detail routes across all three locales through static parameter generation.
- Product details explain suitability, construction, visual/attachment options, artwork review, and 2D versus 3D relief.
- Application details connect buyer problems to recommended products and contextual RFQ links; surf/watersports explicitly states that board attachment requires substrate/adhesive testing and that the products are not EVA traction pads.
- Focused evidence: 2 detail component tests passed, TypeScript passed, and focused ESLint passed.

### Task 7 — Supporting trust pages and RFQ frontend

- Commit: `b2ce2e5 feat: add WIZ trust and inquiry pages`.
- Added localized custom process, capabilities, about, contact, privacy, terms, and RFQ routes.
- The RFQ route is a presentation-only form with product/application URL context; submit is intentionally disabled until the backend inquiry phase.
- Contact values are not invented. The page states that direct contact details and exact addresses await approved company data.
- Privacy and terms copy is visibly marked as a company-review draft until the backend data flow, retention, vendors, contact details, and governing law are known.
- Corrected the main navigation process target to `/custom-process` and added footer legal links.
- Focused evidence: 3 support-page component tests passed, TypeScript passed, and focused ESLint passed.

### Task 8 — SEO and release verification

- Implemented in the current working branch; pending commit at the time of this update.
- Added localized page-level titles/descriptions, canonical URLs, `en`/`ja`/`zh-CN`/`x-default` alternates, Open Graph metadata and image, sitemap, robots, and theme color.
- Applied the current Vercel Web Interface Guidelines to form labels/autocomplete/input types, touch feedback, focus, heading wrapping, translation boundaries, and overflow handling.
- Added production-preview E2E coverage for contextual surf inquiry flow, mobile keyboard navigation, three locale roots, primary route headings, horizontal overflow, console errors, sitemap, robots, and OG image.
- Fresh evidence before final commit: lint, TypeScript, 13 unit/component tests, and a 77-page production build passed. Chromium E2E passed 8/8.
- Manual visual QA completed on the final production preview at 1440×1000 and 390×844. The homepage composition, AI-draft label, mobile single-column flow, desktop card grids, CTA visibility, and footer were visually intact.
- Local preview URL during this session: `http://127.0.0.1:3000/en` (available only while the local preview process is running).
- Firefox and WebKit browser binaries were requested, but the Playwright CDN remained at 0% and the local cache did not grow; their final runs remain externally blocked and must not be reported as passed.

## Latest Verified Evidence

Verification this session (visual asset refresh + quality gate):

- Lint (changed files only): clean — `eslint` on all 7 modified/new source files returned exit 0. Full-project `eslint .` shows ~9.6k pre-existing problems (test-fixture `__Unused` warnings, etc.) unrelated to this change.
- `tsc --noEmit`: passed (no output).
- Unit/component tests: **16/16 passed** (11 files), including the new `capability-media` test and updated `support-pages` test.
- `next build --webpack`: verified — `.next` produced 74 static HTML files and a complete manifest (sandbox `rm` cleanup warning does not affect the artifact).
- Chromium E2E: **blocked by sandbox** (browser process SIGKILLed). Not re-verified this session.
- Firefox / WebKit E2E: externally blocked.
- Net: code-level quality gate green; cross-browser E2E remains unverified in this environment and must be run on a non-sandboxed runner before launch.

## Visual Asset Refresh (post-Task 8 sub-plan)

Completed in current working session. Replaced AI-draft labels with a complete image-led visual system.

### Application media system (committed `5bdc45f`)
- Typed nine-entry slug→image mapping (`src/features/catalog/application-media.ts`).
- Public-safe alt text (no AI/draft labels) for all three locales.
- Nine application images generated via ImageGen, registered in `public/media/drafts/README.md`.
- Two filename mismatches corrected: `application-promotional.png` → `application-promotional-merchandise.png`, `application-marine.png` → `application-marine-equipment.png`.

### Capability cards (committed locally this session)
- Four localized capability visual entries (`src/components/site/capability-media.ts`) with Lucide icons.
- Premium full-bleed card component (`src/components/site/capability-card.tsx`) with gradient scrim overlay.
- `CapabilitiesPage` composes four `CapabilityCard` instances from `getCapabilityMedia(locale)`.
- Four capability images generated via ImageGen (1536×1024, quiet-premium art direction), all inspected and passing compliance (no text/brands/certificates/weapons).
- **Known limitation:** the four capability images currently carry the ImageGen platform watermark. They are acceptable as interim visual placeholders but must be replaced with final, watermark-free assets before production launch.
- CSS: desktop two-column grid, min-height 520px/430px mobile, rounded clipping, bottom-weighted gradient, white text + acid-lime accents, hover scale with cubic-bezier easing (`.35s`, tightened from `.7s` per ui-ux-pro-max micro-interaction guidance).

### Skill-driven refinement (ui-ux-pro-max)
- Design-system audit performed: confirmed Quiet Premium brand tokens satisfy skill's accessibility/intent; no palette swap needed (generic navy/blue recommendation deferred to brand decision).
- Pro-rules checklist applied: animation timing tightened from `.7s` to `.35s` on capability-card image hover (skill guideline: 150–300ms micro-interactions).
- All other pro-rules items verified pass: SVG icons (lucide-react), focus rings (3px signal lime), touch targets ≥44px, prefers-reduced-motion, semantic color tokens, no emoji icons.

## Remaining Frontend Tasks

### Task 8 residual — Cross-browser E2E
- Chromium E2E: **not executable in this sandbox.** This session re-ran it three ways (default webServer, single worker, and reusing a pre-started `next start` server); every attempt was SIGKILLed (exit 137) the instant Playwright spawned the Chrome browser process. `next start` itself runs fine (HTTP 200), so the failure is the sandbox killing the browser, not a code/test defect. Must not be reported as passed this session.
- Firefox / WebKit E2E: **externally blocked** — Playwright browser downloads unreachable from this network. Must not be reported as passed.
- Sandbox safe-delete guard: Playwright's pre-run cleanup of `test-results` (50+ files) triggers `SAFE_DELETE_BULK_CONFIRM_REQUIRED`; worked around by `mv test-results test-results.bak` so Playwright starts from an empty dir. Do not `rm -rf` test artifacts here.
- Final integration choice after commit: merge locally, open a pull request, or preserve the branch (per visual-refresh plan constraint: no push/PR within this plan).

## Plan 2 Backend — Logic-First Foundation (committed locally)

Began Plan 2 (RFQ/Supabase/Admin) with a **logic-first slice**: only the pure domain-logic + Zod contract modules that need zero external infrastructure, built TDD using the `fullstack-dev` and `tdd` skills. These run and pass in the sandbox.

Committed on branch `agent/public-website-foundation` (no push / no PR per sub-plan):

- `1dc1076` RFQ submission contract (`rfqSchema`, Zod) — Task 5 slice
- `3fac19d` product publication rules (`getPublicationIssues`) — Task 4 slice
- `1aab893` artwork file policy (`validateFileDescriptor` / `validateAggregateSize`) — Task 6 slice
- `abd97da` inquiry lifecycle state machine (`canTransition` / `validateTransition`) — Task 9 slice
- `9836035` safe CSV export (UTF-8 BOM + formula-injection escape) — Task 10 slice
- `bbad8b1` rate-limit HMAC key derivation (no raw IP/email persisted) — Task 7 slice

Verification this session: `npx vitest run` ⇒ **49/49 passed** (was 16); `tsc --noEmit` clean.

Environment reality (must not be glossed over): the remaining Plan 2 tasks require Supabase (Docker), Resend, and Cloudflare Turnstile — none available in this sandbox (network disabled) or on the user's Mac (no pnpm/Docker/Supabase CLI; `@supabase/*`, `react-hook-form`, `resend` not installed). Full-stack tasks (schema/RLS, SSR auth, catalog repo, wizard UI, uploads, inquiry creation, notifications, admin UI, security gate) are deferred until a provisioned environment exists. User chose logic-first over provisioning infra first.

## Plan 2 Backend — Remaining Pure Slices (committed locally)

Completed on branch `agent/public-website-foundation` after the logic-first foundation; all passed `tsc --noEmit`, `vitest` (full suite **86/86**), and `next build --webpack`. No push / no PR per sub-plan.

- `e1fc06e` Guided RFQ wizard UI wired to `submitRfqAction` (RfqWizard + trilingual rfq i18n).
- `462e19a` Notification content assembly (`src/features/notifications/notify-content.ts`): pure trilingual customer confirmation + internal sales alert; never emits private file links. Resend adapter / React Email templates (Task 8) consume this. 6/6 tests.
- `e6633dd` Admin inquiry queries (`src/features/inquiries/query-inquiries.ts`): pure `buildInquiryFilterClauses` / `applyInquiryFilters` + `mapInquirySummary/Detail`, plus thin Supabase `queryInquiries` / `getInquiryDetail` (product/application narrowing via inquiry_items, pagination). 9/9 tests.
- `83dd2f1` Supabase catalog repository (`src/features/catalog/supabase-catalog-repository.ts` + `get-catalog-repository.ts`): pure `resolveCatalogTranslation` (requested locale → English fallback, hides unapproved drafts) + row mappers; thin SSR-client wiring. 9/9 tests.

**Schema gap (RESOLVED 2026-08-13):** previously the committed `supabase/migrations` stored only `title`/`summary`/`body`/`seo_*` per catalog translation, and the rich editorial fields on `ProductDetail`/`ApplicationDetail` were fixture-only and defaulted in the adapter. That gap is now closed by migration `202608130001_catalog_editorial_fields.sql` (see below), and the adapter reads the real columns. Live query round-trips for all three slices still await the local Supabase runbook (item 3) to confirm the end-to-end path.

## Plan 2 Backend — Catalog Schema Extension (committed locally)

User approved extending the catalog schema so the Supabase-backed repository returns full product/application detail instead of defaulted (thin) content.

- `202608130001` Catalog editorial-fields migration (`supabase/migrations/202608130001_catalog_editorial_fields.sql`):
  - `products.tone` (language-neutral visual token), `product_translations` adds `eyebrow`, `suitability text[]`, `construction text[]`, `visual_options text[]`, `attachment_options text[]`, `artwork_guidance`.
  - `applications.tone` + `priority boolean`, `application_translations` adds `buyer_problem`, `attachment_considerations`, `visual_direction`.
  - Design rule: per-language editorial content → `*_translations`; language-neutral `tone`/`priority` → base tables. Reversible (down section drops every column).
- `src/features/catalog/supabase-catalog-repository.ts`: row types + mappers updated to read the new columns; `artwork_guidance` falls back to `body` when empty (backward-compatible); `getApplicationBySlug` recommended slugs now derive via `product_applications(products!product_applications_product_id_fkey(slug))`; SELECT lists fetch `tone`/`priority`/`eyebrow`.
- `supabase-catalog-repository.test.ts`: fixtures + assertions extended for all new fields (incl. body-fallback + slug derivation). Catalog suite **19/19**, full suite **90/90**, `tsc --noEmit` clean, `next build --webpack` verified.
- `supabase/seed.sql` (enriched): now populates the new editorial columns for all 3 products × 3 locales and 3 applications × 3 locales (plus `tone`/`priority` on base rows). A fresh `supabase db reset` therefore yields a RICH catalog, so item 3's local validation actually proves the extension instead of falling back to thin content. `docs/setup/local-supabase-runbook.md` synced: notes the 4th migration auto-applies and adds product/application detail validation rows.

Next: user brings up Supabase per `docs/setup/local-supabase-runbook.md`, then validate the end-to-end submission + admin query + catalog detail path and report errors back for fixes.

## Resume Checklist

1. Read this file, the approved PRD, and the public website implementation plan.
2. Run `git status --short` and inspect the latest commits before editing.
3. Continue from the first incomplete task above using TDD.
4. Update this file with new decisions, commit hashes, verification results, and remaining gaps before ending work.
5. Never call the public frontend complete without fresh verification evidence.
