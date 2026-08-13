-- 000_test_helpers.sql
-- Shared helpers for pgTAP authorization tests (Plan 2 / Task 1).
-- Requires the pgtap extension; run via `supabase test db` (needs Docker).

create extension if not exists pgtap;

create schema if not exists tests;
grant usage on schema tests to postgres;
grant execute on all functions in schema tests to postgres;

-- Create a Supabase auth user + matching admin profile for tests.
create or replace function tests.create_supabase_user(p_email text, p_user_id uuid)
returns void language plpgsql as $$
begin
  insert into auth.users (instance_id, id, email, raw_user_meta_data)
  values ('00000000-0000-0000-0000-000000000000', p_user_id, p_email, '{}'::jsonb)
  on conflict (id) do nothing;

  insert into public.profiles (id, email, role)
  values (p_user_id, p_email, 'admin')
  on conflict (id) do update set role = 'admin';
end;
$$;

-- Set the JWT subject/role claims so RLS policies evaluate as this user.
create or replace function tests.authenticate_as(p_user_id uuid)
returns void language plpgsql as $$
begin
  if p_user_id is null then
    perform set_config('request.jwt.claim.sub', '', true);
    perform set_config('request.jwt.claim.role', '', true);
  else
    perform set_config('request.jwt.claim.sub', p_user_id::text, true);
    perform set_config('request.jwt.claim.role', 'authenticated', true);
  end if;
end;
$$;
