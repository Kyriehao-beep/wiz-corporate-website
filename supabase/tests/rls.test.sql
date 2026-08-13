-- rls.test.sql
-- Row-level security authorization tests (Plan 2 / Task 1).
-- Run via `supabase test db` (requires Docker + local Supabase).

begin;
select plan(5);

-- Provision a fixed admin identity for the test session.
select tests.create_supabase_user('admin@wiz.test', '00000000-0000-4000-8000-000000000001'::uuid);

-- Anonymous users cannot read internal inquiries.
select tests.authenticate_as(null);
select is_empty(
  $$ select id from public.inquiries $$,
  'anon cannot read inquiries'
);

-- The seeded admin is recognized as admin + WIZ member.
select tests.authenticate_as('00000000-0000-4000-8000-000000000001'::uuid);
select is(public.is_admin(), true, 'seeded admin is admin');
select is(public.is_wiz_member(), true, 'seeded admin is a wiz member');

-- Anonymous inserts are denied by default-deny RLS (SQLSTATE 42501).
select tests.authenticate_as(null);
select throws_ok(
  $$ insert into public.products (slug, status) values ('blocked', 'published') $$,
  '42501',
  'anon cannot insert products'
);

-- An authenticated WIZ member may insert a draft product.
select tests.authenticate_as('00000000-0000-4000-8000-000000000001'::uuid);
select lives_ok(
  $$ insert into public.products (slug, status) values ('test-product', 'draft') $$,
  'member can insert draft product'
);

rollback;
