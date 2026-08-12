# WIZ Corporate Website PRD and Design Specification

- Status: Approved design; awaiting written-spec review
- Version: 1.0
- Date: 2026-08-12
- Product owner: WIZ
- Delivery scope: multilingual corporate website, custom RFQ, lightweight product and inquiry administration

## 1. Executive summary

WIZ needs an independent corporate website that strengthens trust after a buyer discovers the company through Alibaba or encounters the URL in quotations, email signatures, business cards, and packaging. The website must explain WIZ's custom rubber-patch capabilities, present outdoor applications with a premium visual language, collect production-relevant RFQs, and give a small sales team a lightweight workspace for products and inquiries.

The first release is not an ecommerce store, a social-media acquisition engine, a production system, or a full CRM. Its primary job is to improve the quality and handling of buyer inquiries while establishing a credible independent brand presence.

## 2. Confirmed business context

### 2.1 Brand and company

- Customer-facing master brand: `WIZ`.
- Legal company name used on formal surfaces: `WIZ ELECTRONIC GIFT CO., LIMITED`.
- WIZ describes itself as an integrated trading and manufacturing business with a Hong Kong company and a self-owned mainland China factory.
- Confirmed experience claim: more than eight years in the relevant product category.
- Confirmed differentiation: AI-assisted automatic color matching that accelerates formula generation, supports Pantone or physical-sample matching, and improves batch-to-batch color consistency.
- Company contact details and legal addresses are intentionally excluded from the approved content until WIZ supplies them. They are launch blockers, not implementation blockers.

### 2.2 Markets

- Existing core market: South America, representing approximately 50% of current Alibaba business according to WIZ's confirmation.
- Existing secondary markets: Western and Southern Europe.
- First expansion markets: North America, Australia, and New Zealand.
- Japan is a deliberate language-market investment in release one.
- Release-one languages: English, Japanese, and Simplified Chinese.
- Default public language: English.
- Spanish is the highest-priority release-two language because of the existing South American customer base.

### 2.3 Acquisition role

The website supports, rather than replaces, Alibaba acquisition. Its URL will be used in Alibaba communications, quotations, email signatures, business cards, and packaging. Long-term direct search traffic is desirable but is not a release-one dependency. Social media, paid social campaigns, and an editorial content program are outside release-one scope.

## 3. Product vision and positioning

### 3.1 Positioning

WIZ is the precise, responsive custom rubber-patch partner for outdoor brands that care about color, finish, and dependable execution.

### 3.2 Primary value proposition

`Precision in Every Color. Built for the Outdoors.`

The Japanese and Chinese versions must preserve both meanings—color accuracy and outdoor durability—using native marketing language rather than literal word-for-word translation. Each translation is maintained and approved separately in the admin before publication.

### 3.3 Brand character

- Primary visual direction: Quiet Premium.
- Supporting visual influence: restrained rugged/technical outdoor cues.
- Desired impression: exacting craft, premium manufacturing, calm confidence, and a small responsive team.
- Avoid: bargain-factory styling, excessive tactical camouflage, generic beach tourism, loud gradients, fabricated scale claims, and unverified superlatives.

### 3.4 Visual system direction

- Warm gray, off-white, charcoal, and black form the core palette.
- Product colors provide controlled accents; the interface does not compete with product imagery.
- Typography is spacious, editorial, and highly legible across Latin, Japanese, and Simplified Chinese scripts.
- Photography favors material texture, molded depth, clean edges, color surfaces, water, technical apparel, bags, and outdoor equipment.
- Motion is subtle and functional, with reduced-motion support.

## 4. Goals, measurements, and non-goals

### 4.1 Product goals

1. Help Alibaba and referral buyers verify WIZ's identity, specialization, and manufacturing capability.
2. Increase the proportion of inquiries containing enough information for product assessment and quotation.
3. Reduce manual chasing for basic specifications through a guided RFQ.
4. Ensure every website inquiry has an owner, status, follow-up date, and audit trail.
5. Give WIZ staff a maintainable three-language product catalog without developer involvement.

### 4.2 Measurement plan

The product records the following without requiring external analytics:

- RFQs submitted by source, market, language, product, and application.
- RFQ specification completeness at submission.
- Time from submission to first owner assignment.
- Time from submission to first recorded contact.
- Time from submission to quotation.
- Inquiry outcome: won or closed.
- Notification delivery and retry status.

The first 30 live days establish an operating baseline. WIZ sets numerical growth and response targets only after that baseline exists; this PRD does not invent unsupported conversion targets.

### 4.3 Acceptance measurements

- All required RFQ fields persist in every successful end-to-end acceptance test.
- All accepted attachments remain private and are retrievable by an authenticated user through an expiring link.
- A successful RFQ produces exactly one inquiry record and one customer confirmation attempt, including under repeated submission.
- Every published product contains approved English, Japanese, and Chinese content or follows the explicit English fallback rule.
- Anonymous users cannot read admin data, private attachments, quotes, or internal notes.

### 4.4 Non-goals for release one

- Online prices, SKU inventory, cart, checkout, or payments.
- Production, sampling, shipping, or order fulfillment management.
- Full customer account histories or a general-purpose CRM.
- Complex role-based permissions.
- Blog, Insights, or editorial publishing.
- Social-media management or paid advertising.
- Automatic translation published without human review.
- Fixed public promises for price, MOQ, sample fees, production time, or freight.
- Public compliance badges or certificate claims before document verification.

## 5. Users and key jobs

### 5.1 Overseas buyer

The buyer represents an outdoor, watersports, apparel, bag, headwear, team, tactical, promotional, or accessories business. They need to understand whether WIZ can realize their design, select a suitable patch and attachment method, verify credibility, and submit enough detail for a useful response.

### 5.2 WIZ sales user

One of two to five staff members logs into a Chinese-language admin, reviews a new inquiry, assigns ownership, records contact and quotation activity, sets a follow-up date, and moves the inquiry to a final outcome.

### 5.3 WIZ catalog editor

The same authenticated user maintains separately reviewed English, Japanese, and Chinese product content; links products to applications; and controls draft and published states.

## 6. Public information architecture

### 6.1 Global navigation

- Home
- Products
- Applications
- Custom Process
- Capabilities / Factory
- About WIZ
- Contact
- Primary CTA: Start Your Custom Patch
- Language selector: EN / 日本語 / 简体中文

### 6.2 Product structure

Four core product detail pages:

1. Custom PVC / Rubber Patches, including a clear 2D-versus-3D comparison.
2. Heat Transfer Rubber Patches.
3. Sew-on Rubber Patches & Labels.
4. Hook-and-loop Rubber Patches.

One Specialty Products collection page:

- Adhesive Rubber Patches.
- Soft PVC Labels.
- Earphone Hole Patches.
- Rubber Keychains and accessories.

Products support structured attributes: product type, 2D/3D option, material, size guidance, color guidance, backing or attachment method, editable MOQ guidance, customization notes, applications, gallery, display order, SEO fields, and publication state.

### 6.3 Application structure

Nine application themes are included:

- Surf & Watersports.
- Outdoor Apparel.
- Backpacks & Gear Bags.
- Hats & Headwear.
- Tactical & Team Gear.
- Sportswear & Clubs.
- Fashion Labels.
- Promotional Gifts.
- Pet Accessories.

Surf & Watersports, Outdoor Apparel, and Backpacks & Gear Bags receive the strongest homepage and navigation emphasis. Surf imagery may include boards, but PVC/rubber patch claims must distinguish verified patch applications from EVA deck or traction pads. Direct-to-board attachment is presented only as subject to substrate and adhesive testing.

### 6.4 Page responsibilities

- Home: position WIZ, show priority applications and core products, demonstrate color capability and process, and drive the RFQ.
- Product page: answer suitability, construction, attachment, artwork, and customization questions before the CTA.
- Application page: help buyers identify products by real-world use rather than factory terminology.
- Custom Process: show inquiry, design review, specification confirmation, sampling, production, QC, and delivery without fixed timing promises.
- Capabilities / Factory: explain integrated trade and manufacturing, AI-assisted color matching, molding, production, sampling, and QC.
- About: describe WIZ's focused team, Hong Kong company, mainland factory, experience, and market orientation.
- Contact: provide formal company and contact data after WIZ supplies the approved content pack.
- Policies: provide privacy and terms appropriate to inquiry collection and international file transfer.

## 7. Content and asset policy

### 7.1 Product imagery

- Use WIZ's real Alibaba product images only after WIZ confirms ownership and reuse permission.
- Optimize crops, backgrounds, color consistency, and file size without materially changing the manufactured product.
- Remove or obscure customer logos, brand names, order numbers, and identifying information unless WIZ provides written publication authorization.
- Do not describe anonymous imagery as a named customer case.

### 7.2 Generated imagery

- AI-generated outdoor and factory imagery is permitted in release one as brand or application visualization.
- Generated factory images must not be labeled as documentary photographs of WIZ's real facility.
- Generated imagery cannot substantiate equipment ownership, workforce size, certifications, clients, output, or QC results.
- The CMS preserves clear replacement slots for future real factory photography.

### 7.3 Logo modernization

- Retain the WIZ name and recognizable continuity with the Alibaba logo.
- Develop a modernized mark, responsive wordmark, favicon/app icon, color rules, typography, clear-space guidance, and light/dark variants.
- No redesigned logo becomes final until WIZ approves the visual proposal.

### 7.4 Claims

Approved claims include more than eight years of relevant experience, integrated trade and manufacturing, self-owned Hong Kong and mainland entities as stated by WIZ, AI-assisted color matching, 2D/3D products, supported attachment methods, sampling, and QC.

Certificate names, compliance logos, waterproof test results, weather-resistance metrics, abrasion results, client logos, fixed lead times, prices, and MOQ values remain unpublished until evidence or current operating rules are supplied and verified.

## 8. RFQ experience

### 8.1 Entry points

The same guided RFQ is launched from the homepage, product pages, application pages, and persistent navigation CTA. The launch context preselects product and application when known. Alibaba, quotation, email-signature, business-card, packaging, referral, organic, campaign, and direct source values can be recorded through explicit URL parameters, referrer data, or buyer selection.

### 8.2 Steps

1. Application and product.
2. Specifications and attachment method.
3. Artwork upload.
4. Company and contact details.
5. Review, privacy consent, and submit.

### 8.3 Required fields

- Product type.
- Application.
- Estimated quantity.
- Size or `Not decided`.
- 2D / 3D or `Need advice`.
- Backing or attachment method or `Need advice`.
- Contact name.
- Company name.
- Work email.
- Country or region.
- Project description.
- Privacy acknowledgement.

### 8.4 Optional fields

- Colors or Pantone references.
- Desired delivery date.
- Phone.
- Artwork attachments.
- Additional notes.

### 8.5 File rules

- Accepted extensions: JPG, JPEG, PNG, PDF, AI, EPS, SVG.
- Maximum five files.
- Maximum 20 MB per file and 100 MB total.
- Files are stored privately under non-guessable paths.
- Validation checks extension, reported MIME, detected type or file signature where supported, individual size, aggregate size, and dangerous active content.
- Oversized-file errors preserve other form data and tell the buyer that sales can arrange a separate transfer after contact.

### 8.6 Submission behavior

- Server-side validation is authoritative.
- An idempotency key prevents duplicate inquiries from repeated clicks or retries.
- Success creates a human-readable inquiry number and immutable submission snapshot.
- The customer receives a confirmation email in the current site language with the inquiry number and a safe summary. The email does not promise a fixed response time.
- Internal recipients receive an alert with a secure admin link; private files are not attached to email.

## 9. Administration

### 9.1 Authentication and users

- Two to five named users have separate accounts.
- Release one gives authenticated users the same functional permissions.
- Shared admin credentials are not supported.
- Password reset and session expiration are supported.
- The interface language is Simplified Chinese.

### 9.2 Product administration

- Create, edit, preview, publish, unpublish, archive, and reorder products.
- Maintain English, Japanese, and Chinese fields separately.
- Copy English content as an unpublished translation draft; never auto-publish it.
- Link products and applications many-to-many.
- Validate translation completeness before publishing.
- Preserve historical inquiry snapshots when products change.

### 9.3 Inquiry list and detail

- Search by inquiry number, company, contact, email, and project text.
- Filter by status, owner, source, country, language, product, application, and date.
- Sort by newest, oldest, last activity, and next follow-up.
- View submitted fields and private attachments.
- Assign one current owner.
- Record internal notes and contact activities.
- Record quote currency, amount, quote date, and private quotation file.
- Set and clear a next-follow-up date.
- Export filtered inquiry metadata to CSV; attachments are excluded.

### 9.4 Inquiry lifecycle

- `New`: created automatically on successful submission.
- `Contacted`: a user records the first outbound contact activity.
- `Quoted`: a user records a quote amount or uploads a quotation file and confirms the transition.
- `Won`: sales confirms the opportunity converted; production remains outside this system.
- `Closed`: sales records a required closure reason.

Every transition stores actor, timestamp, previous state, new state, and optional note. A won or closed inquiry can be reopened only through an explicit audited action.

### 9.5 Audit record

Audit events include login-related security events available from the authentication provider, product publication changes, inquiry owner changes, lifecycle transitions, quote changes, and private-file access-link generation. Audit events are append-only to normal admin users.

## 10. Data model boundaries

Core entities:

- `users` and `profiles`.
- `products`.
- `product_translations`.
- `applications`.
- `application_translations`.
- `product_applications`.
- `product_media`.
- `inquiries`.
- `inquiry_items`.
- `inquiry_attachments`.
- `inquiry_activities`.
- `quotes`.
- `audit_events`.
- `notification_deliveries`.

An inquiry contains an immutable submitted-data snapshot in addition to normalized searchable fields. This prevents later catalog edits from rewriting historical buyer intent.

Release one does not create general customer, opportunity, order, production, shipment, or invoice entities. Those require a separate CRM or operations design cycle.

## 11. Technical architecture

### 11.1 Selected approach

- GitHub private repository: source control and review history.
- Next.js with TypeScript: public website, admin application, and server-side routes.
- Vercel: preview and production deployment.
- Supabase PostgreSQL: relational data.
- Supabase Auth: admin authentication.
- Supabase Storage: public product media and private RFQ/quotation assets in separate buckets.
- Resend: customer confirmations and internal alerts, using a dedicated WIZ sending subdomain with SPF and DKIM authentication and webhook-backed delivery status.
- Cloudflare Turnstile: low-friction RFQ bot protection, with server-side token validation; it does not require the site itself to use Cloudflare hosting.

### 11.2 Rendering and localization

- Locale-prefixed routes are used consistently.
- English is the source fallback when an approved translation is unavailable.
- Admin publication checks warn about missing translations before fallback is allowed.
- Public catalog content is server-rendered or statically regenerated for performance and discoverability.
- Admin and RFQ submission paths are dynamic and authenticated or server-validated as applicable.

### 11.3 Environment separation

- Local, preview, and production environments use separate configuration.
- Production customer files and inquiry data never populate preview environments.
- Secrets are stored in platform environment configuration and never committed.
- Database migrations are version-controlled and applied through a documented workflow.

## 12. Security and privacy requirements

- Database row-level security denies anonymous access to all internal tables and private storage metadata.
- Public catalog reads use explicitly public views or policies containing no internal fields.
- Service credentials are server-only.
- Admin routes verify authentication on the server, not only in the browser UI.
- RFQ uses server-side schema validation, per-source rate limiting, a honeypot field, and Cloudflare Turnstile verified again on the server. A client-side Turnstile result alone is never trusted.
- Private files use short-lived signed URLs and are never indexed.
- Uploaded filenames are sanitized for display and are not used as storage paths.
- SVG and document uploads are served as downloads from a separate private origin or with safe content-disposition headers; they are not rendered inline in the admin.
- Logs redact secrets, signed URLs, complete file contents, and unnecessary personal data.
- Privacy and terms pages explain inquiry purpose, file processing, retention, international hosting, and contact rights using WIZ-approved legal wording.
- Retention policy: closed or won inquiries and their files remain retained until WIZ adopts a written retention schedule; the admin must support deletion in a later privacy operation. Production launch requires WIZ to approve the initial retention wording.
- Database backups and restore procedure are configured and tested before launch.

## 13. Failure handling

- RFQ form state survives field and upload errors during the active browser session.
- Partial uploads are cleaned up if the inquiry is not created.
- Database success is not rolled back because an email provider fails.
- Failed notifications are recorded with sanitized error detail and support retry.
- The UI never reports success before the inquiry record exists.
- Duplicate submissions with the same idempotency key return the original result.
- Missing localized content falls back to English and creates an admin-visible warning.
- Archived products remain resolvable inside historical inquiry snapshots.
- Admin errors show an actionable message and correlation identifier without exposing internals.
- Third-party outages produce a degraded but honest state; no fake email, upload, or deployment success is shown.

## 14. Testing and quality gates

### 14.1 Automated tests

- Unit tests: validation, inquiry numbers, lifecycle rules, localization fallback, file rules, and source attribution.
- Integration tests: database policies, storage policies, product publication, inquiry creation, notification records, quote workflow, and audit writes.
- End-to-end tests: three-language navigation, product-to-RFQ context, successful RFQ, validation errors, upload rejection, duplicate prevention, admin login, product publication, inquiry processing, and private-file access denial.
- Build and type checks run in continuous integration.

### 14.2 Visual and interaction QA

- Desktop, tablet, and mobile breakpoints.
- Current stable Chromium, Safari/WebKit, and Firefox engines.
- Keyboard navigation, visible focus, labels, error association, contrast, reduced motion, and meaningful alternative text.
- Japanese and Chinese line breaking, typography, and text expansion.
- No horizontal overflow or clipped RFQ controls.

### 14.3 Release gates

Production is not complete until all applicable gates pass:

1. Dependency installation and production build.
2. Automated tests and critical browser flows.
3. Public routes, localized metadata, sitemap, robots, canonical and language-alternate links.
4. Product assets, links, and downloads.
5. Browser console and network error inspection.
6. Mobile and desktop responsive review.
7. Anonymous denial of admin and private-file access.
8. Live RFQ, storage, customer email, internal alert, and retry test.
9. Production database policies and user access verification.
10. Custom domain, DNS, SSL, sender-domain authentication, and email delivery verification.
11. Anonymous external access test from a clean browser context.
12. Mainland China admin-access observation and overseas public-site performance observation; material access failures block launch or trigger a hosting adjustment.

## 15. Repository and delivery workflow

- Default repository name: `wiz-corporate-website`.
- Visibility: private.
- Default branch: `main`.
- PRD/design specification is the first committed project artifact.
- Implementation follows a written plan after WIZ reviews this specification.
- Functional work uses intentionally scoped branches and reviewable commits.
- Preview deployments are used for WIZ review before production.
- `.env` files, customer files, generated private links, and service credentials are ignored and never committed.
- The visual-companion workspace under `.superpowers/` is not a production artifact and is ignored.

## 16. Dependencies and launch blockers

### 16.1 Required from WIZ before final public launch

- Hong Kong legal Chinese and English company names.
- Hong Kong registered address.
- Mainland factory legal Chinese and English names.
- Mainland factory address.
- Public website email.
- Internal RFQ notification email.
- Public phone and WhatsApp decision.
- Public contact name or department.
- Business hours and timezone.
- Approval of the Hong Kong company / mainland factory relationship wording.
- Approval that selected Alibaba images are owned by WIZ and may be reused.
- Final three-language content review.
- Approved privacy and terms wording.
- Domain selection and DNS access.
- Transactional-email sender domain access.
- Resend account access and permission to create the authenticated sending subdomain.
- Cloudflare account access for separate Turnstile development and production widgets.

### 16.2 Required before claims or assets are added

- Customer authorization before publishing identifiable logos or cases.
- Certificate documents before publishing compliance logos or named certifications.
- Test reports before publishing measured durability, weather, abrasion, or safety claims.
- Real factory photography before describing an image as the WIZ facility.

## 17. Release-two candidates

- Full Spanish localization.
- Insights/editorial publishing for SEO.
- Role-based access for administrators, editors, and sales users.
- Approved certificates and downloadable compliance material.
- Real factory photo and video library.
- Customer case studies with written permission.
- Deeper CRM or order-system integration through a separate design cycle.
- Additional notification channels only after operating need is demonstrated.

## 18. Decision record

- Primary audience: overseas outdoor equipment and apparel brands.
- Priority application: surf and watersports, balanced with apparel and gear.
- Market strategy: defend South America; expand North America and Australia/New Zealand.
- Languages: English, Japanese, Simplified Chinese; Spanish in release two.
- Primary CTA: complete guided custom RFQ with artwork upload.
- Inquiry notification: admin record plus sales email; customer receives localized acknowledgement without a fixed response promise.
- Inquiry states: New, Contacted, Quoted, Won, Closed.
- Admin users: two to five named users with equal release-one permissions.
- Product content: separately maintained and reviewed in all three languages.
- Visual direction: Quiet Premium with restrained rugged-technical cues.
- Hosting approach: managed full-stack using Vercel and Supabase.
- Product pages: four core pages plus one Specialty Products collection.
- Product imagery: real WIZ Alibaba assets; generated factory and application imagery used only as non-documentary visualization.
- Editorial content: excluded from release one.

## 19. Source and verification register

- WIZ Alibaba storefront: <https://wizrubberpatch.en.alibaba.com/>
  - Directly inspected during discovery for current storefront identity, categories, product listings, and company-profile content.
- WIZ owner statements in the approved requirements dialogue:
  - Authoritative for business goals, entity relationship, market distribution, capability availability, languages, and scope decisions.
  - Legal details, addresses, certifications, customer permissions, and quantitative claims still require documents or approved content before public launch.
- Competitor and adjacent-market research informed information architecture only; competitor claims are not treated as WIZ facts.
- Resend domain authentication: <https://resend.com/docs/dashboard/domains/introduction>
- Cloudflare Turnstile server validation: <https://developers.cloudflare.com/turnstile/get-started/server-side-validation/>
- Supabase Storage access controls: <https://supabase.com/docs/guides/storage>

## 20. Approval boundary

This document defines the approved product and system design. Written-spec approval authorizes creation of an implementation plan, not immediate production deployment, domain purchase, public claims, or use of private customer assets. Any material expansion—ecommerce, CRM, production management, automatic translation, new language, or certificate publication—requires an explicit scope update.
