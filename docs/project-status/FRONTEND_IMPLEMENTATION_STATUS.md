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

## Latest Verified Evidence

Verification after Task 3:

- `pnpm lint`: passed.
- `pnpm typecheck`: passed.
- `pnpm test:unit`: 3/3 tests passed.
- `pnpm build`: passed with Webpack; `/en`, `/ja`, and `/zh-CN` generated as static pages.
- Chrome E2E: 5/5 tests passed, including root redirect, locale routes, document language attributes, mobile navigation, and keyboard skip link.
- Manual visual QA completed at 1440×1000 and 390×844.
- No browser console errors were observed during the visual check.

## Remaining Frontend Tasks

### Task 4 — Catalog and RFQ context contracts

- Implemented in the current working branch; pending commit at the time of this update.
- Added five approved product entries and nine application entries.
- Priority applications are surf/watersports, outdoor apparel, and backpacks/gear bags.
- Added a typed repository boundary and contextual RFQ URL builder.
- Test evidence: 3 catalog/RFQ tests passed; TypeScript passed.

### Task 5 — Homepage and discovery pages

- Complete the homepage section sequence.
- Build product and application index pages.
- Use approved AI draft imagery where visual assets materially improve the page.

### Task 6 — Detail routes

- Build five product detail routes and nine application detail routes for every locale.
- Add missing-slug 404 behavior and contextual RFQ entry points.

### Task 7 — Supporting trust pages

- Build custom process, capabilities, about, contact, privacy, and terms pages.
- Keep contact values and legal copy explicitly in draft/awaiting-approval state where required.

### Task 8 — SEO and final release gate

- Add localized metadata, canonical links, language alternates, sitemap, robots, and Open Graph image.
- Complete responsive, route integrity, accessibility, console, and cross-browser verification.
- Perform code review and resolve accepted findings before starting the RFQ/admin plan.

## Resume Checklist

1. Read this file, the approved PRD, and the public website implementation plan.
2. Run `git status --short` and inspect the latest commits before editing.
3. Continue from the first incomplete task above using TDD.
4. Update this file with new decisions, commit hashes, verification results, and remaining gaps before ending work.
5. Never call the public frontend complete without fresh verification evidence.
