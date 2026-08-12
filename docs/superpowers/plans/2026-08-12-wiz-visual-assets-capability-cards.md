# WIZ Visual Assets & Capability Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace public AI-origin labels and placeholder scene blocks with a complete nine-image application system and four premium image-led manufacturing capability cards.

**Architecture:** Keep media selection behind typed project-local configuration modules. `ApplicationCard` consumes a slug-to-image configuration, while `CapabilitiesPage` consumes localized capability visual entries. Generated files remain in `public/media/drafts/`, and their provenance stays in the private project register rather than the public UI.

**Tech Stack:** Next.js 16.3, React 19.2, TypeScript 5.9, `next/image`, Vitest, Testing Library, Playwright, ImageGen.

## Global Constraints

- Work only in `/Users/haozhisheng/Desktop/wiz网站定制/.worktrees/public-website-foundation` on `agent/public-website-foundation`.
- Invoke `superpowers:executing-plans`, `superpowers:test-driven-development`, `imagegen`, `vercel-react-best-practices`, `web-design-guidelines`, and `superpowers:verification-before-completion` at their applicable gates.
- Remove public-facing `AI DRAFT`, `AI DRAFT VISUAL`, and AI-generation references from image alt text.
- Keep generation provenance and prompts in `public/media/drafts/README.md`.
- Do not claim generated media depicts WIZ’s actual facility, equipment, staff, customers, or customer work.
- Do not redesign product-card visuals or start backend media administration.
- Do not push or create a GitHub pull request in this plan.

---

## File map

- `src/features/catalog/application-media.ts`: typed mapping from all nine application slugs to image source, localized alt text, and focal position.
- `src/features/catalog/application-media.test.ts`: completeness and public-copy constraints for application media.
- `src/features/catalog/application-card.tsx`: image-based application card renderer.
- `src/components/site/capability-media.ts`: four localized capability visual entries.
- `src/components/site/capability-media.test.ts`: visual completeness and localization contracts.
- `src/components/site/capability-card.tsx`: focused full-bleed capability card component.
- `src/components/site/support-pages.tsx`: composes `CapabilityCard` entries on the capability page.
- `src/components/site/hero.tsx`: removes visible draft-origin badge and neutralizes alt text.
- `src/styles/globals.css`: image crop, overlays, contrast, and responsive card behavior.
- `public/media/drafts/*.png`: thirteen generated application/capability visual assets.
- `public/media/drafts/README.md`: prompt and provenance register.
- `e2e/public-site.spec.ts`: production visual-system smoke coverage.
- `docs/project-status/FRONTEND_IMPLEMENTATION_STATUS.md`: durable execution and verification record.

### Task 1: Application media contract and public label removal

**Files:**
- Create: `src/features/catalog/application-media.ts`
- Create: `src/features/catalog/application-media.test.ts`
- Modify: `src/features/catalog/application-card.tsx`
- Modify: `src/components/site/hero.tsx`

**Interfaces:**
- Produces: `ApplicationMedia` and `getApplicationMedia(slug: string, locale: Locale): { src: string; alt: string; objectPosition: string }`.
- Consumes: nine slugs already defined in `applicationFixtures` and locales `en`, `ja`, `zh-CN`.

- [ ] **Step 1: Write the failing application media test**

```ts
import { applicationFixtures } from '@/features/catalog/fixtures'
import { getApplicationMedia } from '@/features/catalog/application-media'

it('provides public-safe media for every application', () => {
  for (const application of applicationFixtures) {
    const media = getApplicationMedia(application.slug, 'en')
    expect(media.src).toMatch(/^\/media\/drafts\/application-/)
    expect(media.alt).not.toMatch(/AI|draft/i)
    expect(media.objectPosition).toBeTruthy()
  }
})
```

- [ ] **Step 2: Run the test and verify the missing module failure**

Run: `./node_modules/.bin/vitest run src/features/catalog/application-media.test.ts`

Expected: FAIL because `application-media.ts` does not exist.

- [ ] **Step 3: Implement the typed nine-entry media map**

```ts
type ApplicationMediaEntry = {
  src: string
  alt: Record<Locale, string>
  objectPosition: string
}

const mediaBySlug: Record<string, ApplicationMediaEntry> = {
  'surf-watersports': {
    src: '/media/drafts/application-surf-watersports.png',
    alt: { en: 'Technical watersports gear beside a surfboard on a rugged shore', ja: '岩場の海岸に置かれたサーフボードとテクニカルギア', 'zh-CN': '礁石海岸旁的冲浪板与水上运动装备' },
    objectPosition: '50% 50%',
  },
  // Define the remaining eight approved slugs with equally factual localized alt text.
}
```

The completed implementation must explicitly list all nine slugs; it must not derive filenames from arbitrary input.

- [ ] **Step 4: Render media for every application and remove origin badges**

Change `ApplicationCard` to always render:

```tsx
const media = getApplicationMedia(application.slug, locale)
<Image alt={media.alt} fill sizes="(max-width: 800px) 100vw, 33vw" src={media.src} style={{ objectPosition: media.objectPosition }} />
```

Remove the numbered placeholder and `<small>` origin badge. Remove the homepage hero `.draft-label` element and change hero alt text to `Custom rubber patch on technical watersports gear beside a surfboard`.

- [ ] **Step 5: Verify and commit the contract**

Run:

```bash
./node_modules/.bin/vitest run src/features/catalog/application-media.test.ts src/app/[locale]/home-page.test.tsx
./node_modules/.bin/tsc --noEmit
```

Commit: `feat: define complete WIZ application media system`

### Task 2: Generate and register nine application images

**Files:**
- Create: `public/media/drafts/application-surf-watersports.png`
- Create: `public/media/drafts/application-outdoor-apparel.png`
- Create: `public/media/drafts/application-backpacks-gear-bags.png`
- Create: `public/media/drafts/application-tactical-uniforms.png`
- Create: `public/media/drafts/application-footwear.png`
- Create: `public/media/drafts/application-workwear.png`
- Create: `public/media/drafts/application-clubs-events.png`
- Create: `public/media/drafts/application-promotional-merchandise.png`
- Create: `public/media/drafts/application-marine-equipment.png`
- Modify: `public/media/drafts/README.md`

**Interfaces:**
- Consumes: exact filenames from `application-media.ts`.
- Produces: 1536×1024 landscape raster assets suitable for `next/image`.

- [ ] **Step 1: Generate each application asset with ImageGen**

Use one built-in ImageGen call per application. Apply this common art direction to all nine prompts:

`Premium photorealistic editorial B2B website photography, quiet Apple-like art direction, tactile technical materials, muted forest green, charcoal, stone and sand palette with restrained acid-lime accents, soft controlled natural or studio light, clean composition with negative space, no words, no logos, no watermarks, no certificates, no identifiable customer project, no visible brand names, no exaggerated cinematic effects.`

Add these distinct subject clauses:

- Surf: technical watersports gear bag beside a surfboard on a quiet rugged shore; patch attached to the bag, not the board; no EVA traction pad.
- Outdoor apparel: premium waterproof shell and layered outdoor textiles on a rock ledge in misty forest light.
- Backpacks: technical backpack and gear bag at a restrained trailhead equipment setup.
- Tactical: modular field pack and uniform fabric arranged in a clean controlled studio/field transition; no weapons.
- Footwear: close editorial composition of technical outdoor shoes showing flexible uppers and material layers.
- Workwear: durable work jacket and organized workshop environment; no unsafe activity.
- Clubs/events: tasteful outdoor club gathering setup with blank equipment tags and no identifiable faces.
- Promotional merchandise: refined flat-lay of unbranded accessories, packaging, and tactile rubber pieces.
- Marine: technical marine equipment, rope, dry bag, and hardware on a clean boat-deck environment.

- [ ] **Step 2: Copy each selected output into the exact project path**

Use explicit copy commands from the ImageGen output paths to the nine filenames above. Do not overwrite the existing surf source until the newly generated surf asset has been visually inspected.

- [ ] **Step 3: Inspect every image**

Use `view_image` for all nine assets. Reject any image containing text, client brands, certificates, visible AI labels, weapons, unsafe work, a rubber patch attached directly to a surfboard, or inconsistent futuristic styling. Regenerate only the rejected asset with one targeted correction.

- [ ] **Step 4: Record provenance**

For every asset, append its generation date, exact final prompt, intended application slug, public-use status, and future replacement note to `public/media/drafts/README.md`. Change the existing surf register from “visibly labelled in the interface” to “provenance retained internally; no public origin badge.”

- [ ] **Step 5: Verify asset completeness and commit**

Run:

```bash
for f in public/media/drafts/application-*.png; do test -s "$f"; done
./node_modules/.bin/vitest run src/features/catalog/application-media.test.ts
```

Commit: `assets: add complete WIZ application imagery`

### Task 3: Capability media contract and premium cards

**Files:**
- Create: `src/components/site/capability-media.ts`
- Create: `src/components/site/capability-media.test.ts`
- Create: `src/components/site/capability-card.tsx`
- Modify: `src/components/site/support-pages.tsx`
- Modify: `src/components/site/support-pages.test.tsx`
- Modify: `src/styles/globals.css`

**Interfaces:**
- Produces: `CapabilityMedia`, `getCapabilityMedia(locale: Locale): CapabilityMedia[]`, and `CapabilityCard({ capability }: { capability: CapabilityMedia })`.
- Consumes: icons from `lucide-react`, `next/image`, and the four approved company capability claims.

- [ ] **Step 1: Write failing capability visual tests**

```ts
it('provides four localized image-led capabilities', () => {
  const capabilities = getCapabilityMedia('zh-CN')
  expect(capabilities).toHaveLength(4)
  expect(capabilities.map((item) => item.title)).toEqual([
    '自有内地工厂', '八年以上相关经验', 'AI 辅助自动调色', '打样与量产衔接',
  ])
  for (const item of capabilities) expect(item.src).toMatch(/^\/media\/drafts\/capability-/)
})
```

Update `support-pages.test.tsx` to assert that four card images are rendered and none expose `AI DRAFT` text.

- [ ] **Step 2: Run the tests and verify they fail for missing visual configuration**

Run: `./node_modules/.bin/vitest run src/components/site/capability-media.test.ts src/components/site/support-pages.test.tsx`

Expected: FAIL because the configuration and image-led cards do not exist.

- [ ] **Step 3: Implement the localized capability configuration**

```ts
export type CapabilityMedia = {
  id: 'factory' | 'experience' | 'color' | 'production'
  index: string
  title: string
  description: string
  src: string
  alt: string
  objectPosition: string
  icon: LucideIcon
}
```

Return four entries per locale with filenames:

- `/media/drafts/capability-owned-factory.png`
- `/media/drafts/capability-eight-years-experience.png`
- `/media/drafts/capability-color-matching.png`
- `/media/drafts/capability-sampling-production.png`

- [ ] **Step 4: Implement the premium card renderer**

Render a semantic `<article>` containing a full-bleed lazy `Image`, a non-interactive gradient overlay, an icon/index row, heading, and paragraph. Decorative media uses `alt=""` because the adjacent localized heading describes the card.

- [ ] **Step 5: Replace the inline card array and implement CSS**

`CapabilitiesPage` calls `getCapabilityMedia(locale)` and maps `CapabilityCard`. CSS requirements:

- desktop two-column grid;
- minimum 520 px card height;
- rounded clipping and full-bleed image;
- bottom-weighted multi-stop gradient;
- white text and acid-lime icon/index accents;
- 1.01 image scale on hover/focus-within using only `transform`;
- no motion when `prefers-reduced-motion: reduce`;
- mobile single column with minimum 430 px height and readable overlay copy.

- [ ] **Step 6: Verify and commit**

Run:

```bash
./node_modules/.bin/vitest run src/components/site/capability-media.test.ts src/components/site/support-pages.test.tsx
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/eslint src/components/site
```

Commit: `feat: redesign WIZ manufacturing capabilities`

### Task 4: Generate and register four capability images

**Files:**
- Create: `public/media/drafts/capability-owned-factory.png`
- Create: `public/media/drafts/capability-eight-years-experience.png`
- Create: `public/media/drafts/capability-color-matching.png`
- Create: `public/media/drafts/capability-sampling-production.png`
- Modify: `public/media/drafts/README.md`

**Interfaces:**
- Consumes: filenames from `capability-media.ts`.
- Produces: four 1536×1024 full-bleed capability photographs.

- [ ] **Step 1: Generate four capability images with ImageGen**

Use the common quiet-premium art direction from Task 2 plus these subjects:

- Factory: clean compact molded-rubber manufacturing floor, disciplined work cells, warm off-white architecture, graphite machinery, forest-green accents, soft skylight, no people or corporate signs.
- Experience: macro editorial view of precision molds, tooling, tactile rubber samples, and a technical review table communicating accumulated craft; no awards, certificates, calendars, or readable documents.
- Color: close view of automatic color formulation equipment, measured pigments, neutral swatches, optical sensor, and clean laboratory-style controls; no readable UI or unsupported performance claims.
- Production: refined inspection sequence with approved sample, mold, gauge, organized repeat-production trays, and gloved quality-control hands; no worker identity or customer artwork.

- [ ] **Step 2: Copy and inspect all four assets**

Copy outputs into exact filenames and inspect each with `view_image`. Regenerate assets that look futuristic, generic, cluttered, unsafe, or contain readable brands/text.

- [ ] **Step 3: Update the private asset register**

Record exact final prompts, generation date, component use, non-documentary status, and future replacement note for all four files.

- [ ] **Step 4: Verify and commit**

Run:

```bash
for f in public/media/drafts/capability-*.png; do test -s "$f"; done
./node_modules/.bin/vitest run src/components/site/capability-media.test.ts
```

Commit: `assets: add WIZ capability imagery`

### Task 5: Production release gate and durable memory

**Files:**
- Modify: `e2e/public-site.spec.ts`
- Modify: `docs/project-status/FRONTEND_IMPLEMENTATION_STATUS.md`
- Review: `src/features/catalog/application-card.tsx`
- Review: `src/components/site/capability-card.tsx`
- Review: `src/styles/globals.css`

**Interfaces:**
- Consumes: all thirteen assets and the application/capability media contracts.
- Produces: release evidence and a resumable project record.

- [ ] **Step 1: Extend Chromium E2E coverage**

Add checks that `/en/applications` contains nine images, `/zh-CN/capabilities` contains four image-led cards, no public page contains `AI DRAFT`, desktop and 390 px mobile widths have no horizontal overflow, and no console errors occur.

- [ ] **Step 2: Fetch and apply the latest Web Interface Guidelines**

Fetch `https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md`, review the touched UI files, and resolve applicable image, contrast, focus, hover, motion, layout, and localization findings.

- [ ] **Step 3: Run the complete quality gate**

Run:

```bash
./node_modules/.bin/eslint .
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/vitest run
./node_modules/.bin/next build --webpack
./node_modules/.bin/playwright test --project=chromium
```

Expected: all exit `0`. If Firefox/WebKit binaries remain unavailable, retain that existing external limitation without claiming those browsers passed.

- [ ] **Step 4: Complete manual visual QA**

Run the production preview and capture or inspect:

- `/en/applications` at 1440×1000 and 390×844;
- `/zh-CN/capabilities` at 1440×1000 and 390×844;
- `/en` at 1440×1000 to confirm the removed origin badge and visual harmony.

Confirm all thirteen image crops, overlay contrast, mobile flow, footer continuity, and absence of visible generation-origin labels.

- [ ] **Step 5: Update durable project memory and commit**

Record commits, asset filenames, verification counts, visual QA routes/viewports, and remaining non-code limitations in `FRONTEND_IMPLEMENTATION_STATUS.md`.

Commit: `test: verify WIZ visual asset refresh`
