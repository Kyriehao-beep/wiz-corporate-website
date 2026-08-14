-- 202608130001_catalog_editorial_fields.sql
-- Plan 2 (Task 3) — model the rich editorial catalog fields that were
-- previously fixture-only, so the Supabase-backed repository returns full
-- product/application detail instead of defaulted (thin) content.
--
-- Design rule:
--   * Per-language editorial content  -> the *_translations tables.
--   * Language-neutral presentation      -> the base products / applications tables.
--     (tone = visual design token, priority = ordering flag; both are the same
--      across locales, matching fixtures where application tone is a single value.)
--
-- Reversible: every added column is dropped in the down section.

-- ── products: language-neutral visual token ──────────────
alter table public.products
  add column tone text not null default 'forest';

-- ── product_translations: per-language editorial fields ─
alter table public.product_translations
  add column eyebrow text not null default '',
  add column suitability text[] not null default '{}',
  add column construction text[] not null default '{}',
  add column visual_options text[] not null default '{}',
  add column attachment_options text[] not null default '{}',
  add column artwork_guidance text not null default '';

-- ── applications: language-neutral tone + priority ───────
alter table public.applications
  add column tone text not null default 'forest',
  add column priority boolean not null default false;

-- ── application_translations: per-language editorial fields
alter table public.application_translations
  add column buyer_problem text not null default '',
  add column attachment_considerations text not null default '',
  add column visual_direction text not null default '';

-- ── Down migration ───────────────────────────────────────
-- alter table public.application_translations
--   drop column visual_direction,
--   drop column attachment_considerations,
--   drop column buyer_problem;
-- alter table public.applications
--   drop column priority,
--   drop column tone;
-- alter table public.product_translations
--   drop column artwork_guidance,
--   drop column attachment_options,
--   drop column visual_options,
--   drop column construction,
--   drop column suitability,
--   drop column eyebrow;
-- alter table public.products
--   drop column tone;
