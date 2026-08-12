# WIZ Website Visual Asset & Capability Card Refresh

Date: 2026-08-12  
Status: Approved visual direction; awaiting written-spec confirmation

## Objective

Improve the public frontend’s visual credibility and consistency without changing the product catalog model or starting backend work. The refresh removes visible AI-origin labels, gives every application a relevant scene image, and turns the manufacturing capability page from text-only cards into a premium editorial visual experience.

## Confirmed Scope

### 1. Public-facing asset labels

- Remove every visible `AI DRAFT`, `AI DRAFT VISUAL`, or equivalent origin label from the website interface.
- Do not mention AI generation in public image alternative text or presentation copy.
- Keep asset provenance, generation prompts, dates, and replacement status in the private project asset register.
- Continue avoiding claims that a generated scene documents the real WIZ factory, equipment, staff, customers, or completed customer projects.

### 2. Application imagery

Create and connect one distinct landscape image for each existing application:

1. Surf & Watersports
2. Outdoor Apparel
3. Backpacks & Gear Bags
4. Tactical & Uniforms
5. Footwear
6. Workwear
7. Clubs & Events
8. Promotional Merchandise
9. Marine Equipment

Each image must communicate its use environment immediately. The visual system uses restrained editorial photography, soft natural or studio light, tactile technical materials, muted forest green, stone, sand, charcoal, and occasional acid-lime accents. Images must not contain client brands, readable text, watermarks, certificates, or identifiable customer projects.

Application cards use the image as their primary visual surface. Titles and descriptive copy remain in the card body for clarity and accessibility. Images use localized, factual alternative text describing the scene, not the generation method.

### 3. Manufacturing capability cards

Replace the plain white capability cards with four image-led cards:

- **Owned mainland factory:** a clean, modern, compact manufacturing floor with molded-rubber production cues, disciplined organization, controlled lighting, and no attempt to pass it off as a documentary photo of WIZ.
- **8+ years related experience:** a close editorial composition of tooling, molds, material samples, or an experienced technical review environment that communicates accumulated craft without showing unverifiable awards or certificates.
- **AI-assisted color matching:** a premium close-up of automatic color-matching equipment, swatches, measured pigments, and controlled formulation work. The copy continues to describe AI-assisted equipment as an approved company capability.
- **Sampling to repeat production:** a refined sequence of artwork review, mold/sample comparison, inspection, and orderly repeat-production preparation.

Cards use full-bleed imagery, a restrained dark gradient for text contrast, a small icon/index, large localized heading, and concise supporting copy. The effect should feel calm, precise, and Apple-like rather than industrially noisy or promotional.

## Visual Direction

- Quiet Premium remains the governing website style.
- Photography should feel believable, understated, material-focused, and professionally art-directed.
- Avoid excessive lens flare, dramatic neon lighting, crowded factory scenes, generic corporate handshakes, floating UI graphics, fake labels, and futuristic machinery.
- Maintain harmony with the current serif display typography, forest-green surfaces, warm off-white background, rounded cards, and acid-lime signal color.
- Desktop capability layout remains a balanced two-column grid. Mobile becomes a single-column editorial stack with useful image focal points preserved.

## Asset Handling

- Store generated website images under `public/media/drafts/` with descriptive stable filenames.
- Update `public/media/drafts/README.md` with the final prompt, generation date, intended route/component, and replacement status for every image.
- Internal filename or documentation may identify an asset as generated; public UI and public alternative text may not.
- Optimize assets for web delivery where possible without visibly degrading material detail.
- Product-card visuals are explicitly excluded from this refresh because product media will later be managed through the backend.

## Component Changes

- `Hero`: remove the visible draft-origin badge and use neutral scene alt text.
- `ApplicationCard`: map every application slug to its dedicated image and remove generated-origin badges.
- Application detail pages may reuse the matching application image when it improves the composition, but no new page structure is required.
- `CapabilitiesPage`: add a typed capability visual configuration and render image-led cards with localized text.
- CSS: add consistent image cropping, overlays, contrast protection, responsive focal points, and reduced-motion-safe hover behavior.

## Accessibility & Performance

- Every meaningful image has concise localized alt text; decorative image layers use empty alt text where card text already communicates the same information.
- Text overlays must retain readable contrast across all image crops.
- Cards and links remain keyboard accessible with visible focus states and minimum 44 px targets.
- Above-the-fold imagery loads eagerly only when justified; below-fold application and capability images load lazily through `next/image`.
- No horizontal overflow at 390 px, and no information may depend on hover alone.

## Test & Acceptance Criteria

- A component test fails if a public page contains `AI DRAFT` or `AI DRAFT VISUAL`.
- Application-card tests verify all nine slugs resolve to image assets and no numbered placeholder remains.
- Capability-page tests verify all four approved capability cards have visual media and localized headings.
- ESLint, TypeScript, unit/component tests, and the production build pass.
- Chromium E2E verifies the application index and capability page at desktop and mobile widths, including no horizontal overflow or console errors.
- Manual visual QA confirms consistent crop quality, legible overlays, coherent color grading, and a harmonious relationship with the existing homepage.

## Explicit Non-goals

- No product-image redesign or backend media administration.
- No claim that generated factory or equipment imagery depicts the real WIZ facility.
- No customer logos, customer identities, certificates, prices, MOQ, lead-time, or freight claims.
- No GitHub push or pull request until the user resumes that integration step.
