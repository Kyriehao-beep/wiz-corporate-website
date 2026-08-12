# WIZ Production Launch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the private GitHub repository before development, then replace review content with approved WIZ assets and company information, provision production services, connect the custom domain, and prove the complete site works anonymously and securely.

**Architecture:** Treat content approval, source control, preview infrastructure, and production infrastructure as separate gates. Generate and process owned assets reproducibly, provision preview before production, keep secrets in provider configuration, and finish with clean-browser and mainland-admin observations rather than deployment-status claims alone.

**Tech Stack:** GitHub and GitHub Actions, Next.js/Vercel, Supabase, Resend, Cloudflare Turnstile, Browser skill, ImageGen skill, Playwright, pnpm.

## Global Constraints

- Keep all retained source assets, generated assets, manifests, documents, and handoff files under `/Users/haozhisheng/Desktop/wiz网站定制`.
- Use `browser:control-in-app-browser` to inspect and acquire approved WIZ Alibaba assets; do not use same-name search results as evidence.
- Use `imagegen` for outdoor and non-documentary factory raster imagery; do not use generated imagery as proof of the real WIZ facility.
- Use real WIZ product images from Alibaba only after WIZ confirms ownership and reuse permission.
- Remove or obscure unauthorized customer logos and identifying order information.
- Keep the GitHub repository private and never commit credentials, customer uploads, signed URLs, or production data.
- Do not mark launch complete without build, tests, routes, assets, console, responsive, private-access, email, and anonymous external-access evidence.
- Missing approved legal/company data, domain access, sender-domain access, or image rights blocks public production launch but does not invalidate a verified preview.

---

## File map

- `assets/source/alibaba/`: original approved WIZ product images and acquisition manifest.
- `assets/source/company/`: WIZ-supplied legal/contact and real-company materials.
- `assets/generated/scenes/`: original ImageGen outputs and prompts manifest.
- `assets/brand/`: final WIZ SVG marks, PNG exports, palette, and usage sheet.
- `public/media/products/`: optimized anonymous product imagery.
- `public/media/scenes/`: optimized generated application/factory visualizations.
- `src/config/company.ts`: approved public company/contact values.
- `src/i18n/messages/`: final reviewed language copy.
- `docs/content/asset-register.md`: ownership, source, edit, permission, generated status, and destination.
- `docs/operations/`: environment, deployment, backup/restore, notification retry, and launch runbooks.
- `.github/workflows/ci.yml`: deterministic pull-request and main-branch checks.
- `e2e/production-smoke.spec.ts`: production-safe read and submission checks.

### Task 1: Private GitHub repository and continuous integration

**Execution timing:** Run this task immediately after the implementation plans are approved and committed, before task 1 of the public-website plan. After it passes, return to the public-website plan. Resume this production-launch plan at task 2 only after the RFQ/admin plan passes.

**Files:**
- Create: `.github/workflows/ci.yml`
- Create: `.github/pull_request_template.md`
- Create: `docs/operations/repository.md`

**Interfaces:**
- Consumes: clean local Git `main` branch and authenticated GitHub account.
- Produces: private `wiz-corporate-website` remote, `origin`, CI checks, documented branch workflow.

- [ ] **Step 1: Invoke the GitHub publishing skill and inspect identity**

Invoke `github:yeet`. Run:

```bash
git status --short --branch
gh auth status
gh api user --jq '.login'
git log --oneline --decorate -5
```

Expected: clean branch, authenticated intended GitHub owner, and no existing unrelated remote. If the account is not the intended owner, stop before repository creation.

- [ ] **Step 2: Write the CI workflow before creating the remote**

```yaml
name: CI
on:
  pull_request:
  push:
    branches: [main]
jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test:unit
      - run: pnpm build
```

- [ ] **Step 3: Verify CI syntax and local parity**

Run:

```bash
pnpm install --frozen-lockfile
pnpm lint && pnpm typecheck && pnpm test:unit && pnpm build
git diff --check
```

Expected: all commands exit `0`.

- [ ] **Step 4: Create and push the private repository**

Run:

```bash
git add .github docs/operations/repository.md
git commit -m "ci: verify WIZ website changes"
gh repo create wiz-corporate-website --private --source=. --remote=origin --push
gh repo view --json nameWithOwner,visibility,url,defaultBranchRef
```

Expected: visibility is `PRIVATE`, default branch is `main`, and `origin` points to the returned repository.

- [ ] **Step 5: Verify remote state**

```bash
git remote -v
git ls-remote --heads origin main
gh run list --limit 3
```

Expected: remote `main` resolves to the local commit and the CI run exists. Record repository URL and rules in `docs/operations/repository.md` without credentials.

### Task 2: Approved Alibaba product-asset acquisition and register

**Files:**
- Create: `assets/source/alibaba/manifest.json`
- Create: `docs/content/asset-register.md`
- Create: `scripts/media/verify-asset-register.mjs`
- Create: `scripts/media/verify-asset-register.test.mjs`

**Interfaces:**
- Consumes: WIZ's explicit image-reuse approval and verified storefront `https://wizrubberpatch.en.alibaba.com/`.
- Produces: original owned images, checksums, source URLs, redaction decisions, and destination mapping.

- [ ] **Step 1: Write manifest validation test**

```js
test('every retained asset has source, rights, checksum, and destination', () => {
  for (const asset of manifest.assets) {
    assert.match(asset.sourceUrl, /^https:\/\//)
    assert.equal(asset.rights, 'wiz-owned-reuse-approved')
    assert.match(asset.sha256, /^[a-f0-9]{64}$/)
    assert.match(asset.destination, /^public\/media\/products\//)
  }
})
```

- [ ] **Step 2: Run validation and verify empty manifest fails**

Run: `node --test scripts/media/verify-asset-register.test.mjs`

Expected: FAIL because no approved asset entries exist.

- [ ] **Step 3: Invoke Browser skill and acquire verified source assets**

Open the exact storefront, confirm final URL, page title, company name, product name, and product detail URL. Use the Browser page-assets capability to save approved product media into `assets/source/alibaba/`. Do not download customer documents, messages, private account data, or unrelated assets.

- [ ] **Step 4: Register and anonymize each asset**

For each image record source URL, product URL, visible product category, original filename, SHA-256, permission state, customer-logo review, required crop/redaction, and final destination. Exclude any image whose ownership or customer-logo permission is unclear.

- [ ] **Step 5: Verify and commit originals/register**

```bash
node --test scripts/media/verify-asset-register.test.mjs
node scripts/media/verify-asset-register.mjs
git add assets/source/alibaba docs/content/asset-register.md scripts/media
git commit -m "assets: register approved WIZ product imagery"
```

### Task 3: Outdoor and non-documentary factory scene generation

**Files:**
- Create: `assets/generated/scenes/prompts.json`
- Create: `assets/generated/scenes/manifest.json`
- Create: `public/media/scenes/README.md`
- Modify: `docs/content/asset-register.md`

**Interfaces:**
- Consumes: Quiet Premium art direction and approved application hierarchy.
- Produces: coordinated hero/application/capability raster images labeled as generated visualizations.

- [ ] **Step 1: Define the exact scene set and prompt contract**

The manifest contains these deliverables: `home-outdoor-hero`, `surf-watersports`, `outdoor-apparel`, `backpacks-gear-bags`, `color-matching-lab`, and `factory-capability-visualization`. Each entry records aspect ratio, intended crop, visual exclusions, prompt, generated status, and public destination.

- [ ] **Step 2: Invoke the ImageGen skill**

Use `imagegen` to generate Quiet Premium scenes with warm neutral grading, restrained technical styling, realistic material surfaces, globally inclusive people only where helpful, and no readable third-party logos. For `factory-capability-visualization`, exclude signage, certificate marks, invented employee counts, and distinctive claims that imply a specific WIZ site.

- [ ] **Step 3: Review generated images against the honesty boundary**

Reject images with malformed products, fake logos, implausible patch placement, counterfeit equipment branding, or a documentary-photo implication. Regenerate rejected entries rather than repairing them with code.

- [ ] **Step 4: Save originals and update the asset register**

Store original outputs under `assets/generated/scenes/`, optimized derivatives under `public/media/scenes/`, and an explicit statement in `public/media/scenes/README.md` that these images are generated brand/application visualizations, not evidence of WIZ's physical factory.

- [ ] **Step 5: Verify and commit**

```bash
node scripts/media/verify-asset-register.mjs
git add assets/generated/scenes public/media/scenes docs/content/asset-register.md
git commit -m "assets: add WIZ outdoor brand visualizations"
```

### Task 4: Product image optimization and responsive delivery

**Files:**
- Create: `scripts/media/build-product-assets.mjs`
- Create: `scripts/media/build-product-assets.test.mjs`
- Create: `public/media/products/`
- Modify: `src/features/catalog` media references.

**Interfaces:**
- Consumes: approved source manifest.
- Produces: AVIF/WebP responsive derivatives, width/height metadata, neutral crops, redacted customer identifiers.

- [ ] **Step 1: Write derivative-policy tests**

```js
test('product output has responsive formats and intrinsic dimensions', () => {
  const entry = outputManifest.assets[0]
  assert.deepEqual(entry.formats.sort(), ['avif', 'webp'])
  assert.ok(entry.width > 0 && entry.height > 0)
  assert.equal(entry.customerIdentifiers, 'none-visible')
})
```

- [ ] **Step 2: Run tests and verify derivative manifest is absent**

Run: `node --test scripts/media/build-product-assets.test.mjs`

Expected: FAIL because no optimized output exists.

- [ ] **Step 3: Implement deterministic media processing**

Use Sharp through a Node script. Preserve product geometry and color; allow crop, rotation, exposure normalization, background cleanup, and authorized logo redaction. Generate widths `640`, `960`, and `1440` where the source supports them; never upscale beyond source width.

- [ ] **Step 4: Build and visually inspect derivatives**

```bash
pnpm add -D sharp
node scripts/media/build-product-assets.mjs
node --test scripts/media/build-product-assets.test.mjs
```

Open contact sheets and representative product pages with Browser skill. Compare molded edges, color regions, attachment details, and redactions against sources.

- [ ] **Step 5: Commit**

```bash
git add scripts/media public/media/products src/features/catalog docs/content/asset-register.md package.json pnpm-lock.yaml
git commit -m "assets: optimize authentic WIZ product media"
```

### Task 5: WIZ logo modernization and local brand pack

**Files:**
- Create: `assets/brand/wiz-mark.svg`
- Create: `assets/brand/wiz-wordmark.svg`
- Create: `assets/brand/wiz-lockup.svg`
- Create: `assets/brand/wiz-brand-sheet.md`
- Create: `public/brand/favicon.svg`
- Create: `public/brand/wiz-wordmark.svg`
- Modify: site header, footer, metadata, and Open Graph composition.

**Interfaces:**
- Consumes: approved WIZ name, Alibaba logo continuity, Quiet Premium direction.
- Produces: accessible, scalable, light/dark-ready vector identity and favicon.

- [ ] **Step 1: Create three reviewable vector directions**

Use SVG-native construction rather than generated raster logos. Every direction must remain recognizable as WIZ, work at 16px, avoid outdoor clichés, include a single-color variant, and use only original geometry/type treatment.

- [ ] **Step 2: Render comparison sheets locally**

Create a browser-viewable comparison showing header, favicon, product card, quotation header, dark background, and monochrome use. Keep all comparison artifacts under `assets/brand/review/`.

- [ ] **Step 3: Obtain WIZ approval before selecting a direction**

Record the approved direction and requested revisions in `assets/brand/wiz-brand-sheet.md`. Do not ship a direction merely because it was technically complete.

- [ ] **Step 4: Export and integrate the approved vectors**

Add descriptive SVG titles where used as images, hide decorative marks from assistive technology, and keep visible brand text in the DOM. Update header, footer, favicon, and Open Graph image.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:e2e -- --project=chromium -g "brand"
git add assets/brand public/brand src
git commit -m "brand: modernize the WIZ identity"
```

### Task 6: Approved company configuration, translations, and policies

**Files:**
- Create: `src/config/company.ts`
- Create: `src/config/company.test.ts`
- Create: `assets/source/company/company-content.json`
- Modify: `src/i18n/messages/en.json`
- Modify: `src/i18n/messages/ja.json`
- Modify: `src/i18n/messages/zh-CN.json`
- Modify: contact, about, footer, privacy, terms, and email templates.

**Interfaces:**
- Consumes: WIZ-approved legal names, addresses, contact routes, hours, entity wording, privacy/terms text, and three-language copy.
- Produces: validated company config and final public content.

- [ ] **Step 1: Write launch-config validation tests**

```ts
it('requires approved launch contact and legal fields', () => {
  expect(() => parseCompanyConfig({ ...validCompany, publicEmail: '' })).toThrow(/publicEmail/)
  expect(parseCompanyConfig(validCompany).legalEntityEnglish).toBe('WIZ ELECTRONIC GIFT CO., LIMITED')
})
```

- [ ] **Step 2: Run test and verify config module is absent**

Run: `pnpm test:unit -- src/config/company.test.ts`

Expected: FAIL because `parseCompanyConfig` does not exist.

- [ ] **Step 3: Implement a strict non-secret company schema**

Required launch fields: Hong Kong Chinese/English legal names and registered address, mainland Chinese/English factory names and address, approved entity relationship text, public email, internal notification email environment-key mapping, public phone/WhatsApp publication choices, public contact name/department, business hours, and timezone.

- [ ] **Step 4: Replace draft content only after WIZ approval**

Have native-level Japanese and Chinese reviewers approve marketing copy. Ensure all claims remain inside the PRD evidence boundary. Legal policy wording must be explicitly approved by WIZ or qualified counsel before production.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/config/company.test.ts && pnpm test:e2e -- --project=chromium -g "company content"
git add assets/source/company src/config src/i18n src/app src/features/notifications
git commit -m "content: publish approved WIZ company information"
```

### Task 7: Preview infrastructure and service configuration

**Files:**
- Create: `docs/operations/environments.md`
- Create: `docs/operations/database.md`
- Create: `docs/operations/email.md`
- Create: `docs/operations/bot-protection.md`
- Modify: `.env.example`

**Interfaces:**
- Consumes: authenticated Vercel, Supabase, Resend, Cloudflare, and GitHub access.
- Produces: preview project, preview database/storage/auth, verified preview email sender, Turnstile preview widget, environment-variable inventory.

- [ ] **Step 1: Provision separate preview resources**

Create a Supabase preview project in the selected Asia region, run committed migrations, configure auth redirect URLs, create private/public buckets through migrations, and create named WIZ admin accounts. Do not copy real customer data.

- [ ] **Step 2: Configure preview email and bot protection**

Create a Resend sending subdomain and verify SPF/DKIM; configure preview recipient allowlisting if available. Create a Turnstile preview widget restricted to preview hostnames and configure server-side secret separately from the site key.

- [ ] **Step 3: Create and link the Vercel preview project**

```bash
pnpm exec vercel link
pnpm exec vercel env pull .env.preview.local --environment=preview
pnpm exec vercel deploy
```

Store secrets only in provider environment settings. Record variable names and ownership in `docs/operations/environments.md`, never values.

- [ ] **Step 4: Apply migrations and seed review data**

```bash
pnpm exec supabase link --project-ref "$SUPABASE_PREVIEW_PROJECT_REF"
pnpm exec supabase db push --include-seed
pnpm lint && pnpm typecheck && pnpm test:unit && pnpm build
```

Expected: preview build connects to preview services and contains only approved review data.

- [ ] **Step 5: Commit non-secret runbooks**

```bash
git add docs/operations .env.example
git commit -m "docs: define WIZ preview operations"
```

### Task 8: Preview acceptance and production provisioning

**Files:**
- Create: `e2e/preview-acceptance.spec.ts`
- Create: `docs/operations/preview-acceptance.md`
- Modify: defects found during acceptance.

**Interfaces:**
- Consumes: live preview URL and preview credentials supplied through environment variables.
- Produces: WIZ-approved preview and evidence required before production provisioning.

- [ ] **Step 1: Write preview acceptance tests**

Cover all three locale homes, five product pages, nine application pages, RFQ with artwork, customer confirmation, internal alert, admin login, product publish/unpublish, inquiry assignment/contact/quote/follow-up/outcome, CSV export, private-file denial, and 404 behavior.

- [ ] **Step 2: Run automated preview checks**

```bash
PLAYWRIGHT_BASE_URL="$WIZ_PREVIEW_URL" pnpm test:e2e -- e2e/preview-acceptance.spec.ts
```

Expected: Chromium, WebKit, and Firefox pass; test data is clearly prefixed `ACCEPTANCE-` and removed after the run.

- [ ] **Step 3: Invoke Browser skill for visual and console QA**

Inspect desktop and mobile routes, navigation, language switching, typography, form errors, uploads, admin tables, console errors, and failed network requests. Record exact route/device evidence in `docs/operations/preview-acceptance.md`.

- [ ] **Step 4: Obtain WIZ preview approval**

WIZ approves the logo, images, English/Japanese/Chinese copy, company details, policies, primary RFQ flow, and admin workflow. Any requested material change returns to the relevant earlier task and reruns its verification.

- [ ] **Step 5: Commit accepted fixes and evidence**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:db && PLAYWRIGHT_BASE_URL="$WIZ_PREVIEW_URL" pnpm test:e2e -- e2e/preview-acceptance.spec.ts && pnpm build
git add src e2e docs/operations public assets
git commit -m "test: approve WIZ preview release"
```

### Task 9: Domain, production services, and live deployment

**Files:**
- Create: `docs/operations/domain-and-dns.md`
- Create: `docs/operations/production-release.md`
- Create: `e2e/production-smoke.spec.ts`

**Interfaces:**
- Consumes: purchased WIZ domain, DNS authority, production Supabase/Resend/Turnstile/Vercel access, approved preview commit.
- Produces: SSL-enabled production domain, authenticated sender, production database/storage/auth, deployed approved commit.

- [ ] **Step 1: Select and purchase the approved domain**

Present available candidates only after live registrar verification, compare brand clarity, spelling, renewal cost, and trademark risk, and obtain WIZ approval before purchase. Record registrar, renewal owner, and DNS owner; do not store payment data or account secrets in the repository.

- [ ] **Step 2: Provision production resources independently**

Create production Supabase, Resend, and Turnstile resources rather than reusing preview. Apply migrations without seed buyer data, create named admin users, configure production redirect URLs, set rate limits, verify sender SPF/DKIM/DMARC decision, and restrict Turnstile to production hostnames.

- [ ] **Step 3: Configure Vercel production environment and domain**

Add production environment variables through Vercel settings, attach apex and `www` according to the approved canonical choice, add DNS records, and wait for SSL/provider status to become active. Record only record names/types/targets that are safe for the runbook.

- [ ] **Step 4: Deploy the approved commit**

```bash
git status --short --branch
git rev-parse HEAD
pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:db && pnpm build
pnpm exec vercel deploy --prod
```

Expected: deployed production reports the same commit SHA, HTTPS is valid, and the canonical domain resolves.

- [ ] **Step 5: Commit deployment runbook**

```bash
git add docs/operations/domain-and-dns.md docs/operations/production-release.md e2e/production-smoke.spec.ts
git commit -m "docs: record WIZ production release process"
git push origin main
```

### Task 10: External verification, operational handoff, and completion

**Files:**
- Create: `docs/operations/launch-verification.md`
- Create: `docs/operations/backup-restore.md`
- Create: `docs/operations/inquiry-notifications.md`
- Create: `docs/operations/admin-handbook.md`
- Create: `outputs/WIZ_Website_Handoff.zip`

**Interfaces:**
- Consumes: live production domain and production admin accounts.
- Produces: verified customer-ready URL, operational procedures, local handoff archive, final evidence.

- [ ] **Step 1: Invoke verification-before-completion**

Invoke `superpowers:verification-before-completion`. Run the full local gate against the exact deployed commit and the production-safe smoke suite against the public domain.

```bash
pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:db && pnpm build
PLAYWRIGHT_BASE_URL="$WIZ_PRODUCTION_URL" pnpm test:e2e -- e2e/production-smoke.spec.ts
```

- [ ] **Step 2: Perform clean anonymous and authorization checks**

Use a clean browser context with no WIZ, Vercel, Supabase, Alibaba, or ChatGPT session. Verify homepage, all required routes, locale switching, sitemap, robots, SSL, RFQ creation, customer email, internal alert, admin denial, and private-file denial. Confirm the customer URL does not require platform login.

- [ ] **Step 3: Perform visual, console, and network checks**

Inspect desktop and mobile at representative widths, browser console, failed requests, image loading, upload progress, Japanese/Chinese wrapping, keyboard operation, and error recovery. Observe admin access from WIZ's normal mainland China network and public performance from at least one overseas route; material failure blocks completion and triggers hosting adjustment.

- [ ] **Step 4: Test operations and package handoff**

Perform one backup/restore rehearsal on non-production restore target, one notification retry, one password reset, one product publish/unpublish, one CSV export, and one inquiry lifecycle. Build `outputs/WIZ_Website_Handoff.zip` from the committed source and documentation while excluding `.git`, `.env*`, `node_modules`, build outputs, customer files, and secrets.

- [ ] **Step 5: Record evidence, verify archive, and finish**

```bash
unzip -t outputs/WIZ_Website_Handoff.zip
git status --short --branch
git log -1 --oneline
gh run list --limit 3
```

Write route/device/test timestamps and results in `docs/operations/launch-verification.md`. Invoke `superpowers:finishing-a-development-branch` for integration choices. Report the exact public URL, repository URL, commit SHA, handoff archive path, verification results, and any non-blocking follow-up items; do not use the word complete if any required check failed.
