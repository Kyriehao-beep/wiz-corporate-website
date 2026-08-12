# WIZ Public Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fixture-backed, fully navigable, responsive three-language WIZ public website that accurately expresses the approved brand, catalog, applications, process, capability, and contact experience.

**Architecture:** Use Next.js App Router with locale-prefixed server-rendered routes. Keep domain data behind typed catalog interfaces so plan 2 can replace fixtures with Supabase without rewriting pages. Keep page composition, domain queries, and visual primitives in separate focused modules.

**Tech Stack:** Node.js 22, pnpm, Next.js 16.3, React 19.2, TypeScript 5, Tailwind CSS 4, next-intl, Zod, Vitest, Testing Library, Playwright, ESLint.

## Global Constraints

- Work only under `/Users/haozhisheng/Desktop/wiz网站定制`.
- Before code changes, invoke `superpowers:using-git-worktrees`, then `superpowers:test-driven-development`; invoke `vercel-react-best-practices` for React/Next.js tasks.
- Use `en`, `ja`, and `zh-CN`; English is the fallback.
- Use Quiet Premium styling with restrained rugged-technical cues.
- Use fixture media clearly stored under `public/media/drafts/`; do not claim those images document the real WIZ facility.
- Use the single primary CTA label `Start Your Custom Patch` in English and reviewed equivalents in Japanese and Chinese.
- Do not add backend persistence, authentication, email, live uploads, pricing, ecommerce, or editorial publishing in this plan.
- Every task ends in a focused commit and an independent verification result.

---

## File map

- `package.json`, `pnpm-lock.yaml`: pinned toolchain and scripts.
- `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`: framework and quality configuration.
- `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`: unit/component and browser test harnesses.
- `src/app/[locale]/`: localized public routes.
- `src/components/ui/`: reusable accessible primitives with no WIZ domain knowledge.
- `src/components/site/`: site header, footer, locale switcher, and page sections.
- `src/features/catalog/`: product/application contracts, fixture repository, cards, and detail compositions.
- `src/features/rfq-link/`: CTA URL builder that carries product, application, and source context.
- `src/i18n/`: locale routing, request configuration, dictionaries, and typed helpers.
- `src/styles/`: design tokens and global styles.
- `public/media/drafts/`: review-only generated or temporary imagery.
- `e2e/public-site.spec.ts`: release-one public navigation and responsive smoke tests.

### Task 1: Project foundation and executable quality gate

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `eslint.config.mjs`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/foundation.test.tsx`

**Interfaces:**
- Consumes: approved repository root and PRD.
- Produces: scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test:unit`, `test:e2e`; alias `@/*`; Node 22 engine constraint.

- [ ] **Step 1: Write the foundation test**

```tsx
import { render, screen } from '@testing-library/react'
import RootPage from '@/app/page'

it('redirects visitors toward the English site entry', () => {
  render(<RootPage />)
  expect(screen.getByRole('link', { name: /continue to wiz/i })).toHaveAttribute('href', '/en')
})
```

- [ ] **Step 2: Create the pinned project manifest and install dependencies**

```json
{
  "name": "wiz-corporate-website",
  "private": true,
  "engines": { "node": "22.x" },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

Run:

```bash
pnpm add next@16.3 react@19.2 react-dom@19.2 next-intl zod clsx tailwind-merge lucide-react
pnpm add -D typescript @types/node @types/react @types/react-dom tailwindcss @tailwindcss/postcss eslint eslint-config-next vitest jsdom @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @playwright/test
pnpm exec playwright install chromium webkit firefox
```

Expected: `pnpm-lock.yaml` is created and the resolved versions are pinned there.

- [ ] **Step 3: Run the test and confirm the missing implementation fails**

Run: `pnpm test:unit -- src/app/foundation.test.tsx`

Expected: FAIL because `src/app/page.tsx` or its English entry link does not exist.

- [ ] **Step 4: Add the minimal root page and configuration**

```tsx
export default function RootPage() {
  return <a href="/en">Continue to WIZ</a>
}
```

Configure `@/*` to resolve to `src/*`, enable strict TypeScript, use Tailwind through PostCSS, use `jsdom` for Vitest, import `@testing-library/jest-dom/vitest` in `vitest.setup.ts`, and configure Playwright's `webServer` as `pnpm dev` on port `3000`.

- [ ] **Step 5: Verify and commit**

Run:

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/app/foundation.test.tsx && pnpm build
git add package.json pnpm-lock.yaml tsconfig.json next.config.ts eslint.config.mjs postcss.config.mjs vitest.config.ts vitest.setup.ts playwright.config.ts .env.example src/app
git commit -m "chore: establish WIZ web application foundation"
```

Expected: all commands exit `0` and the root page is part of the production build.

### Task 2: Locale routing and translation contracts

**Files:**
- Create: `src/i18n/locales.ts`
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `src/i18n/messages/en.json`
- Create: `src/i18n/messages/ja.json`
- Create: `src/i18n/messages/zh-CN.json`
- Create: `src/i18n/locales.test.ts`
- Create: `src/proxy.ts`
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/page.tsx`
- Modify: `next.config.ts`

**Interfaces:**
- Consumes: `@/*` alias and Next.js App Router.
- Produces: `Locale = 'en' | 'ja' | 'zh-CN'`, `locales`, `defaultLocale`, locale-aware navigation helpers, and validated dictionary loading.

- [ ] **Step 1: Write locale contract tests**

```ts
import { defaultLocale, isLocale, locales } from '@/i18n/locales'

it('defines exactly the approved locales', () => {
  expect(locales).toEqual(['en', 'ja', 'zh-CN'])
  expect(defaultLocale).toBe('en')
  expect(isLocale('ja')).toBe(true)
  expect(isLocale('es')).toBe(false)
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:unit -- src/i18n/locales.test.ts`

Expected: FAIL because `@/i18n/locales` does not exist.

- [ ] **Step 3: Implement the locale contract**

```ts
export const locales = ['en', 'ja', 'zh-CN'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}
```

Add next-intl request configuration, locale routing, `src/proxy.ts`, and a locale layout that rejects invalid locale params with `notFound()`. Dictionaries must contain the same top-level keys: `navigation`, `home`, `products`, `applications`, `process`, `capabilities`, `about`, `contact`, `rfq`, and `common`.

- [ ] **Step 4: Add locale route browser coverage**

```ts
import { expect, test } from '@playwright/test'

for (const locale of ['en', 'ja', 'zh-CN']) {
  test(`${locale} route renders the WIZ heading`, async ({ page }) => {
    await page.goto(`/${locale}`)
    await expect(page.getByRole('heading', { level: 1 })).toContainText('WIZ')
  })
}
```

Run: `pnpm test:e2e -- --project=chromium -g "route renders"`

Expected: PASS for all three locale routes.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/i18n/locales.test.ts && pnpm test:e2e -- --project=chromium -g "route renders"
git add next.config.ts src/i18n src/proxy.ts 'src/app/[locale]' e2e
git commit -m "feat: add approved WIZ locale routing"
```

### Task 3: Design tokens and accessible site shell

**Files:**
- Create: `src/styles/globals.css`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/container.tsx`
- Create: `src/components/ui/skip-link.tsx`
- Create: `src/components/site/site-header.tsx`
- Create: `src/components/site/site-footer.tsx`
- Create: `src/components/site/locale-switcher.tsx`
- Create: `src/components/site/site-shell.test.tsx`
- Modify: `src/app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `Locale`, next-intl navigation, Tailwind.
- Produces: `Button`, `Container`, `SiteHeader`, `SiteFooter`, `LocaleSwitcher`; CSS tokens `--surface`, `--ink`, `--muted`, `--accent`, `--border`, `--radius-*`.

- [ ] **Step 1: Write shell accessibility tests**

```tsx
render(<SiteHeader locale="en" />)
expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
expect(screen.getByRole('link', { name: /start your custom patch/i })).toHaveAttribute('href', '/en/rfq')
expect(screen.getByRole('button', { name: /change language/i })).toBeInTheDocument()
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `pnpm test:unit -- src/components/site/site-shell.test.tsx`

Expected: FAIL because `SiteHeader` does not exist.

- [ ] **Step 3: Implement the Quiet Premium token system and shell**

```css
:root {
  --surface: #f3f1ec;
  --surface-strong: #e5e1d9;
  --ink: #171817;
  --muted: #666a66;
  --accent: #465247;
  --border: #cbc7bf;
  --radius-sm: 0.5rem;
  --radius-lg: 1.25rem;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: 0.01ms !important; }
}
```

Implement semantic header/footer landmarks, a visible-on-focus skip link, keyboard-operable mobile navigation, locale switcher preserving the current pathname, and minimum 44px interactive targets.

- [ ] **Step 4: Add mobile and keyboard browser checks**

```ts
test('mobile navigation and skip link are keyboard usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en')
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused()
  await page.getByRole('button', { name: /open menu/i }).click()
  await expect(page.getByRole('navigation', { name: /mobile/i })).toBeVisible()
})
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/components/site/site-shell.test.tsx && pnpm test:e2e -- --project=chromium -g "mobile navigation"
git add src/styles src/components 'src/app/[locale]/layout.tsx' e2e
git commit -m "feat: establish WIZ design system and site shell"
```

### Task 4: Typed catalog boundary and approved fixture data

**Files:**
- Create: `src/features/catalog/types.ts`
- Create: `src/features/catalog/catalog-repository.ts`
- Create: `src/features/catalog/fixture-catalog-repository.ts`
- Create: `src/features/catalog/fixtures.ts`
- Create: `src/features/catalog/fixture-catalog-repository.test.ts`
- Create: `src/features/rfq-link/build-rfq-url.ts`
- Create: `src/features/rfq-link/build-rfq-url.test.ts`

**Interfaces:**
- Consumes: `Locale`.
- Produces: `CatalogRepository`, `ProductSummary`, `ProductDetail`, `ApplicationSummary`, `ApplicationDetail`, `getProductBySlug(locale, slug)`, `getApplicationBySlug(locale, slug)`, and `buildRfqUrl(context)`.

- [ ] **Step 1: Write repository and RFQ URL tests**

```ts
it('returns the four core products and specialty collection', async () => {
  const products = await repository.listProducts('en')
  expect(products.map((item) => item.slug)).toEqual([
    'custom-pvc-rubber-patches',
    'heat-transfer-rubber-patches',
    'sew-on-rubber-patches-labels',
    'hook-and-loop-rubber-patches',
    'specialty-products',
  ])
})

it('carries product and application into the RFQ URL', () => {
  expect(buildRfqUrl({ locale: 'en', product: 'custom-pvc-rubber-patches', application: 'surf-watersports' }))
    .toBe('/en/rfq?product=custom-pvc-rubber-patches&application=surf-watersports')
})
```

- [ ] **Step 2: Run tests to verify missing contracts fail**

Run: `pnpm test:unit -- src/features/catalog src/features/rfq-link`

Expected: FAIL because repository contracts and URL builder do not exist.

- [ ] **Step 3: Implement focused types and repository interface**

```ts
export interface CatalogRepository {
  listProducts(locale: Locale): Promise<ProductSummary[]>
  getProductBySlug(locale: Locale, slug: string): Promise<ProductDetail | null>
  listApplications(locale: Locale): Promise<ApplicationSummary[]>
  getApplicationBySlug(locale: Locale, slug: string): Promise<ApplicationDetail | null>
}
```

Fixture content must include the five approved product entries and nine approved applications, with `surf-watersports`, `outdoor-apparel`, and `backpacks-gear-bags` marked as priority applications. Use conservative capability copy and no fixed commercial promises.

- [ ] **Step 4: Implement URL context serialization**

```ts
export function buildRfqUrl(input: RfqLinkContext): string {
  const query = new URLSearchParams()
  if (input.product) query.set('product', input.product)
  if (input.application) query.set('application', input.application)
  if (input.source) query.set('source', input.source)
  const suffix = query.size ? `?${query.toString()}` : ''
  return `/${input.locale}/rfq${suffix}`
}
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/catalog src/features/rfq-link
git add src/features/catalog src/features/rfq-link
git commit -m "feat: define WIZ catalog and RFQ context contracts"
```

### Task 5: Homepage and product/application discovery

**Files:**
- Create: `src/components/site/hero.tsx`
- Create: `src/components/site/capability-strip.tsx`
- Create: `src/features/catalog/product-card.tsx`
- Create: `src/features/catalog/application-card.tsx`
- Create: `src/features/catalog/product-grid.tsx`
- Create: `src/features/catalog/application-grid.tsx`
- Create: `src/app/[locale]/products/page.tsx`
- Create: `src/app/[locale]/applications/page.tsx`
- Create: `src/app/[locale]/home-page.test.tsx`
- Modify: `src/app/[locale]/page.tsx`

**Interfaces:**
- Consumes: `CatalogRepository`, `buildRfqUrl`, localized messages, site shell.
- Produces: fixture-backed home, product index, and application index routes.

- [ ] **Step 1: Write homepage composition tests**

```tsx
expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Precision in Every Color')
expect(screen.getAllByRole('link', { name: /start your custom patch/i }).length).toBeGreaterThan(0)
expect(screen.getByText('Surf & Watersports')).toBeInTheDocument()
expect(screen.getByText('AI-assisted color matching')).toBeInTheDocument()
```

- [ ] **Step 2: Run the tests to verify the page is incomplete**

Run: `pnpm test:unit -- src/app/[locale]/home-page.test.tsx`

Expected: FAIL because the approved sections are absent.

- [ ] **Step 3: Implement the page compositions**

Order the homepage sections as hero, trust/capability strip, priority applications, core products, AI color-matching story, custom process summary, focused-team statement, and final RFQ CTA. Product and application cards must use semantic headings, descriptive links, responsive images, and visible focus states.

- [ ] **Step 4: Add discovery browser checks**

```ts
test('buyer moves from surf application to a contextual RFQ', async ({ page }) => {
  await page.goto('/en/applications')
  await page.getByRole('link', { name: /surf & watersports/i }).click()
  await page.getByRole('link', { name: /start your custom patch/i }).click()
  await expect(page).toHaveURL(/\/en\/rfq\?.*application=surf-watersports/)
})
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/app/[locale]/home-page.test.tsx && pnpm test:e2e -- --project=chromium -g "contextual RFQ"
git add src/components/site src/features/catalog 'src/app/[locale]' e2e
git commit -m "feat: build WIZ homepage and discovery pages"
```

### Task 6: Product and application detail routes

**Files:**
- Create: `src/features/catalog/product-detail-page.tsx`
- Create: `src/features/catalog/application-detail-page.tsx`
- Create: `src/features/catalog/detail-pages.test.tsx`
- Create: `src/app/[locale]/products/[slug]/page.tsx`
- Create: `src/app/[locale]/applications/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getProductBySlug`, `getApplicationBySlug`, `buildRfqUrl`.
- Produces: five product detail routes and nine application detail routes per locale, with `notFound()` for unknown slugs.

- [ ] **Step 1: Write detail behavior tests**

```tsx
it('compares 2D and 3D on the core custom patch page', async () => {
  render(await ProductDetailPage({ locale: 'en', slug: 'custom-pvc-rubber-patches' }))
  expect(screen.getByRole('heading', { name: '2D vs. 3D' })).toBeInTheDocument()
  expect(screen.getByText(/need advice/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm test:unit -- src/features/catalog/detail-pages.test.tsx`

Expected: FAIL because detail page compositions do not exist.

- [ ] **Step 3: Implement detail compositions**

Product detail sections: suitability, construction, visual options, attachment options, artwork guidance, linked applications, process summary, and contextual RFQ. Application detail sections: buyer problem, recommended products, attachment considerations, visual examples, and contextual RFQ. The surf page explicitly states that direct board attachment depends on substrate and adhesive testing and does not describe WIZ patches as EVA traction pads.

- [ ] **Step 4: Verify route generation and missing-slug behavior**

```ts
test('unknown product returns 404', async ({ page }) => {
  const response = await page.goto('/en/products/not-a-product')
  expect(response?.status()).toBe(404)
})
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/features/catalog/detail-pages.test.tsx && pnpm test:e2e -- --project=chromium -g "unknown product"
git add src/features/catalog 'src/app/[locale]/products' 'src/app/[locale]/applications' e2e
git commit -m "feat: add WIZ product and application detail routes"
```

### Task 7: Trust, process, company, contact, and policy pages

**Files:**
- Create: `src/app/[locale]/custom-process/page.tsx`
- Create: `src/app/[locale]/capabilities/page.tsx`
- Create: `src/app/[locale]/about/page.tsx`
- Create: `src/app/[locale]/contact/page.tsx`
- Create: `src/app/[locale]/privacy/page.tsx`
- Create: `src/app/[locale]/terms/page.tsx`
- Create: `src/components/site/process-steps.tsx`
- Create: `src/components/site/color-matching-story.tsx`
- Create: `src/app/[locale]/trust-pages.test.tsx`

**Interfaces:**
- Consumes: site shell, dictionaries, `buildRfqUrl`.
- Produces: all approved supporting routes with conservative content rules.

- [ ] **Step 1: Write trust-page claim tests**

```tsx
expect(screen.getByText(/more than eight years/i)).toBeInTheDocument()
expect(screen.getByText(/AI-assisted color matching/i)).toBeInTheDocument()
expect(screen.queryByText(/REACH|RoHS|SGS/)).not.toBeInTheDocument()
expect(screen.queryByText(/our factory photo/i)).not.toBeInTheDocument()
```

- [ ] **Step 2: Run the tests to verify missing pages fail**

Run: `pnpm test:unit -- src/app/[locale]/trust-pages.test.tsx`

Expected: FAIL because the supporting pages do not exist.

- [ ] **Step 3: Implement approved content boundaries**

The process page has seven steps: inquiry, artwork review, specification confirmation, sampling, production, QC, and delivery. The contact page explicitly says contact details will be published only from the approved company content configuration introduced in plan 3; it must not display invented values. Policy pages use clearly marked draft legal copy and are excluded from production approval until WIZ approves the wording.

- [ ] **Step 4: Add link-integrity browser coverage**

```ts
test('all primary navigation and footer links resolve', async ({ page }) => {
  await page.goto('/en')
  for (const href of ['/en/products', '/en/applications', '/en/custom-process', '/en/capabilities', '/en/about', '/en/contact', '/en/privacy', '/en/terms']) {
    const response = await page.request.get(href)
    expect(response.ok(), href).toBeTruthy()
  }
})
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit -- src/app/[locale]/trust-pages.test.tsx && pnpm test:e2e -- --project=chromium -g "navigation and footer"
git add 'src/app/[locale]' src/components/site e2e
git commit -m "feat: add WIZ trust and policy pages"
```

### Task 8: SEO, responsive QA, and public-site completion gate

**Files:**
- Create: `src/lib/seo/metadata.ts`
- Create: `src/lib/seo/metadata.test.ts`
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`
- Create: `src/app/[locale]/opengraph-image.tsx`
- Create: `e2e/public-site.spec.ts`
- Modify: localized page modules to export metadata.

**Interfaces:**
- Consumes: catalog slugs, locales, production URL environment contract.
- Produces: canonical URLs, language alternates, sitemap, robots, Open Graph image, public release suite.

- [ ] **Step 1: Write metadata tests**

```ts
it('emits canonical and all locale alternates', () => {
  const metadata = buildLocalizedMetadata({ locale: 'ja', pathname: '/products/custom-pvc-rubber-patches', title: 'WIZ' })
  expect(metadata.alternates?.languages).toMatchObject({ en: expect.any(String), ja: expect.any(String), 'zh-CN': expect.any(String) })
  expect(metadata.alternates?.canonical).toContain('/ja/products/custom-pvc-rubber-patches')
})
```

- [ ] **Step 2: Run the metadata test and verify it fails**

Run: `pnpm test:unit -- src/lib/seo/metadata.test.ts`

Expected: FAIL because `buildLocalizedMetadata` does not exist.

- [ ] **Step 3: Implement SEO routes and metadata helpers**

Use `SITE_URL` for absolute production URLs; default local tests to `http://localhost:3000`. Include only published public routes. Policy and admin routes are not marketing sitemap priorities; admin routes are disallowed in robots.

- [ ] **Step 4: Execute responsive and three-engine release checks**

```ts
test('homepage has no horizontal overflow', async ({ page }) => {
  await page.goto('/en')
  const widths = await page.evaluate(() => ({ body: document.body.scrollWidth, viewport: document.documentElement.clientWidth }))
  expect(widths.body).toBeLessThanOrEqual(widths.viewport)
})
```

Run: `pnpm test:e2e -- e2e/public-site.spec.ts`

Expected: PASS on configured Chromium, WebKit, and Firefox projects.

- [ ] **Step 5: Run the plan completion gate and commit**

```bash
pnpm lint && pnpm typecheck && pnpm test:unit && pnpm test:e2e -- e2e/public-site.spec.ts && pnpm build
git add src e2e
git commit -m "feat: complete verified WIZ public website"
```

Expected: all commands exit `0`; then invoke `superpowers:requesting-code-review` and resolve all accepted findings before starting the RFQ/admin plan.
