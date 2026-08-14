-- 202608130001_catalog_editorial_fields.sql
-- Plan 2 (Task 3) — add rich editorial fields to catalog translation tables
-- and give them surrogate uuid primary keys (required by Supabase seed runner).
--
-- Base-table columns (products.tone, applications.tone, applications.priority)
-- are defined directly in 202608120001_core_schema.sql so they always exist.
-- This migration only touches the *_translations tables.

-- ── product_translations: editorial fields + surrogate PK ──────
alter table public.product_translations
  add column id uuid not null default gen_random_uuid(),
  add column eyebrow text not null default '',
  add column suitability text[] not null default '{}',
  add column construction text[] not null default '{}',
  add column visual_options text[] not null default '{}',
  add column attachment_options text[] not null default '{}',
  add column artwork_guidance text not null default '';

alter table public.product_translations
  drop constraint if exists product_translations_pkey,
  add primary key (id),
  add constraint product_translations_locale_unique unique (product_id, locale);

-- ── application_translations: editorial fields + surrogate PK ──
alter table public.application_translations
  add column id uuid not null default gen_random_uuid(),
  add column buyer_problem text not null default '',
  add column attachment_considerations text not null default '',
  add column visual_direction text not null default '';

alter table public.application_translations
  drop constraint if exists application_translations_pkey,
  add primary key (id),
  add constraint application_translations_locale_unique unique (application_id, locale);

-- ── Down migration ───────────────────────────────────────────
alter table public.application_translations
  drop constraint if exists application_translations_locale_unique,
  drop constraint if exists application_translations_pkey,
  drop column visual_direction,
  drop column attachment_considerations,
  drop column buyer_problem,
  drop column id;
alter table public.application_translations
  add primary key (application_id, locale);
alter table public.product_translations
  drop constraint if exists product_translations_locale_unique,
  drop constraint if exists product_translations_pkey,
  drop column artwork_guidance,
  drop column attachment_options,
  drop column visual_options,
  drop column construction,
  drop column suitability,
  drop column eyebrow,
  drop column id;
alter table public.product_translations
  add primary key (product_id, locale);
