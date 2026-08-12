# WIZ PRD Coverage Matrix

This matrix is the implementation-plan self-review required by the writing-plans workflow. It maps every material PRD section to an executable task and verification gate.

| PRD requirement | Implementing plan and task | Primary evidence |
| --- | --- | --- |
| Positioning, slogan, Quiet Premium visual direction | Public website tasks 3, 5, 7; production tasks 3, 5 | component tests, visual browser review, WIZ brand approval |
| English, Japanese, Simplified Chinese; English fallback | Public website tasks 2, 8; RFQ/admin tasks 3–5; production task 6 | locale tests, metadata tests, three-language E2E |
| South America retention and North America/Australia/New Zealand expansion | Public website tasks 4–7; production task 6 | approved localized copy and application hierarchy |
| Four core product pages plus Specialty Products | Public website tasks 4–6 | repository tests, route tests, link integrity |
| Nine applications with three priority applications | Public website tasks 4–6 | fixture/repository tests and contextual-RFQ E2E |
| Honest surf/board distinction | Public website task 6 | detail-page assertion and content review |
| AI color-matching capability | Public website tasks 5, 7; production task 3 | claim tests, approved visual/content review |
| Alibaba product images, anonymous customer treatment | Production tasks 2, 4 | rights/checksum manifest, redaction review, asset tests |
| Generated outdoor/factory visualization honesty | Production task 3 | generated manifest, image review, explicit asset label |
| Logo modernization | Production task 5 | three-option comparison, explicit WIZ approval, favicon/header E2E |
| Guided five-step RFQ and exact required/optional fields | RFQ/admin task 5 | Zod tests, wizard tests, buyer E2E |
| JPG/PNG/PDF/AI/EPS/SVG; 5 files; 20 MB each; 100 MB total | RFQ/admin task 6 | descriptor, signature, count, and aggregate-size tests |
| Idempotency, Turnstile, rate limiting, honeypot | RFQ/admin task 7 | unit tests, database atomicity tests, E2E denial/retry cases |
| Localized customer confirmation without fixed response promise | RFQ/admin task 8 | React Email tests and preview delivery evidence |
| Internal sales alert without private attachments | RFQ/admin task 8 | adapter tests and preview email inspection |
| Two to five separate equal-permission users | RFQ/admin tasks 1–2 | RLS/SSR-auth tests and named preview accounts |
| Product CRUD, translations, fallback warning, publish states | RFQ/admin tasks 3–4 | publication tests, database tests, admin E2E |
| Inquiry lifecycle New/Contacted/Quoted/Won/Closed | RFQ/admin task 9 | lifecycle unit tests and audited transition E2E |
| Owner, notes, contact record, quote, follow-up | RFQ/admin tasks 9–10 | action tests and buyer-to-sales E2E |
| Search/filter/sort/CSV export | RFQ/admin tasks 9–10 | query tests, CSV privacy/formula-injection tests |
| Immutable submission snapshot and archived-product history | RFQ/admin tasks 1, 7, 9 | database integration tests |
| Private RFQ/quote files and signed access | RFQ/admin tasks 1, 6, 10–11 | RLS tests, expired/unsigned-link E2E |
| Audit events | RFQ/admin tasks 1, 4, 7, 9–11 | append-only database tests and admin audit review |
| Failure handling: upload, email, duplicate, fallback, outages | RFQ/admin tasks 5–8, 11 | recovery unit tests and end-to-end failure suite |
| SEO metadata, sitemap, robots, language alternates | Public website task 8 | metadata tests, route inspection, production smoke |
| Accessibility, responsive layouts, three browser engines | Public website tasks 3, 8; production tasks 8, 10 | keyboard/mobile tests, Chromium/WebKit/Firefox runs |
| Private GitHub repository and review workflow | Production task 1, executed before feature code | GitHub visibility query, remote SHA, CI run |
| Preview and production environment separation | Production tasks 7–9 | environment runbooks, separate project identifiers, preview acceptance |
| Domain, DNS, SSL, sender authentication | Production task 9 | active provider states and live-domain tests |
| Mainland admin observation and overseas public observation | Production task 10 | dated launch-verification evidence |
| Anonymous external access and no platform login | Production task 10 | clean-browser production verification |
| Backup/restore, notification retry, admin handoff | Production task 10 | rehearsal records and operations documents |
| All retained project files under the desktop WIZ directory | all plans, global constraint | repository/file inventory and final handoff archive |
| Release-one non-goals | global constraints in all plans | dependency/diff review and PRD scope review |

## Self-review result

- Scope is deliberately divided into public experience, secured RFQ/admin, and launch operations; each has an independent completion command.
- The GitHub bootstrap task is explicitly executed before feature code despite living in the launch plan.
- Interfaces used by later plans are defined in earlier tasks: locale and catalog contracts, Supabase types, RFQ schema, inquiry lifecycle, notification records, and company configuration.
- No numerical commercial promise, certification, customer logo, real-factory photo claim, or invented company contact field is required to implement the preview.
- Final production remains blocked until WIZ supplies and approves the launch content pack listed in the PRD.
