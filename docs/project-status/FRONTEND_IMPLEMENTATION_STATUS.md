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

Verification after Task 5 implementation:

- Focused homepage component test: passed.
- `tsc --noEmit`: passed.
- The complete lint/build/browser gate remains scheduled after Task 8.

## Remaining Frontend Tasks

### Task 6 — Detail routes

### Task 7 — Supporting trust pages

### Task 8 — SEO and final release gate
- Complete Firefox and WebKit verification when their Playwright browser downloads become available.
- Perform final integration choice after the last commit: merge locally, open a pull request, or preserve the branch.

## Resume Checklist

1. Read this file, the approved PRD, and the public website implementation plan.
2. Run `git status --short` and inspect the latest commits before editing.
3. Continue from the first incomplete task above using TDD.
4. Update this file with new decisions, commit hashes, verification results, and remaining gaps before ending work.
5. Never call the public frontend complete without fresh verification evidence.
