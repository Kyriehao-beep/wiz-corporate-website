-- 202608120001_core_schema.sql
-- WIZ core relational schema (Plan 2 / Task 1)
-- Deterministic, reversible schema. Run via `supabase db reset` / `supabase migration up`.

create extension if not exists citext with schema extensions;

-- ── Enums ───────────────────────────────────────────────
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.inquiry_status as enum ('new', 'contacted', 'quoted', 'won', 'closed');
create type public.profile_role as enum ('admin', 'sales', 'staff');
create type public.activity_type as enum (
  'created', 'status_change', 'assignment', 'email_contact',
  'phone_contact', 'internal_note', 'quote_added', 'follow_up'
);
create type public.notification_channel as enum ('email');
create type public.notification_status as enum ('pending', 'sent', 'failed', 'retry');

-- ── Profiles: unified WIZ account system, role-based ────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       extensions.citext unique not null,
  display_name text not null default '',
  role        public.profile_role not null default 'staff',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Products (catalog) ──────────────────────────────────
create table public.products (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  status       public.content_status not null default 'draft',
  display_order integer not null default 0,
  created_by   uuid references auth.users(id),
  updated_by   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table public.product_translations (
  product_id   uuid not null references public.products(id) on delete cascade,
  locale       text not null check (locale in ('en', 'ja', 'zh-CN')),
  title        text not null,
  summary      text not null,
  body         text not null default '',
  seo_title    text not null default '',
  seo_description text not null default '',
  approved     boolean not null default false,
  fallback_to_en boolean not null default false,
  primary key (product_id, locale)
);

create table public.product_media (
  id           uuid primary key default gen_random_uuid(),
  product_id   uuid not null references public.products(id) on delete cascade,
  storage_key  text not null,
  alt_text     text not null default '',
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now()
);

-- ── Applications (catalog grouping) ─────────────────────
create table public.applications (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  display_order integer not null default 0,
  created_at   timestamptz not null default now()
);

create table public.application_translations (
  application_id uuid not null references public.applications(id) on delete cascade,
  locale       text not null check (locale in ('en', 'ja', 'zh-CN')),
  title        text not null,
  summary      text not null default '',
  body         text not null default '',
  seo_title    text not null default '',
  seo_description text not null default '',
  primary key (application_id, locale)
);

create table public.application_media (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  storage_key    text not null,
  alt_text       text not null default '',
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now()
);

create table public.product_applications (
  product_id     uuid not null references public.products(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  primary key (product_id, application_id)
);

-- ── Inquiries (sales pipeline; lifecycle in app layer) ─
create table public.inquiries (
  id                 uuid primary key default gen_random_uuid(),
  inquiry_number     text unique not null,
  idempotency_key    uuid unique not null,
  status             public.inquiry_status not null default 'new',
  owner_id           uuid references auth.users(id),
  locale             text not null check (locale in ('en', 'ja', 'zh-CN')),
  company_name       text not null,
  contact_name       text not null,
  work_email         extensions.citext not null,
  country_region     text not null,
  project_description text not null,
  source             text not null,
  submission_snapshot jsonb not null,
  next_follow_up_at  timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.inquiry_items (
  id               uuid primary key default gen_random_uuid(),
  inquiry_id       uuid not null references public.inquiries(id) on delete cascade,
  product_slug     text not null,
  application_slug text not null,
  estimated_quantity integer not null check (estimated_quantity > 0),
  spec             jsonb not null default '{}'::jsonb,
  sort_order       integer not null default 0
);

create table public.inquiry_activities (
  id             uuid primary key default gen_random_uuid(),
  inquiry_id     uuid not null references public.inquiries(id) on delete cascade,
  activity_type  public.activity_type not null,
  actor_id       uuid references auth.users(id),
  payload        jsonb not null default '{}'::jsonb,
  internal_note  text,
  created_at     timestamptz not null default now()
);

-- ── Upload drafts (Task 6) ──────────────────────────────
create table public.upload_drafts (
  id               uuid primary key default gen_random_uuid(),
  public_token_hash text unique not null,
  aggregate_bytes  integer not null default 0,
  file_count       integer not null default 0,
  expires_at       timestamptz not null,
  created_at       timestamptz not null default now()
);

-- ── Rate limits (Task 7; HMAC-keyed) ───────────────────
create table public.rfq_rate_limits (
  key_hash     text not null,
  bucket       text not null,
  hits         integer not null default 1,
  window_start timestamptz not null default now(),
  primary key (key_hash, bucket)
);

-- ── Notifications (Task 8) ─────────────────────────────
create table public.notification_queue (
  id               uuid primary key default gen_random_uuid(),
  inquiry_id       uuid references public.inquiries(id) on delete cascade,
  recipient_type   text not null check (recipient_type in ('customer', 'internal')),
  channel          public.notification_channel not null default 'email',
  locale           text not null check (locale in ('en', 'ja', 'zh-CN')),
  status           public.notification_status not null default 'pending',
  provider_message_id text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.notification_deliveries (
  id               uuid primary key default gen_random_uuid(),
  notification_id  uuid not null references public.notification_queue(id) on delete cascade,
  event            text not null,
  status           text not null,
  payload          jsonb not null default '{}'::jsonb,
  received_at      timestamptz not null default now()
);

-- ── Audit log (Task 1) ─────────────────────────────────
create table public.audit_log (
  id         bigserial primary key,
  actor_id   uuid references auth.users(id),
  action     text not null,
  entity     text not null,
  entity_id  uuid,
  detail     jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ── Indexes ────────────────────────────────────────────
create index on public.products (status);
create index on public.product_translations (product_id);
create index on public.product_applications (application_id);
create index on public.inquiries (status);
create index on public.inquiries (owner_id);
create index on public.inquiry_items (inquiry_id);
create index on public.inquiry_activities (inquiry_id);
create index on public.notification_queue (status);

-- ── Helper functions ───────────────────────────────────
-- Current user is an admin?
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Current user is any WIZ internal member (admin/sales/staff)?
create or replace function public.is_wiz_member() returns boolean
language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'sales', 'staff')
  );
$$;

-- Auto-create a profile row when an auth user is created.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'display_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Defensive lifecycle transition (canonical rules live in the app layer).
-- Enforces the closure-reason requirement; the app layer owns full validation.
create or replace function public.transition_inquiry(
  p_inquiry_id uuid,
  p_to public.inquiry_status,
  p_reason text default ''
) returns public.inquiries
language plpgsql security definer set search_path = public as $$
declare
  v_from public.inquiry_status;
  v_row  public.inquiries;
begin
  select status into v_from from public.inquiries where id = p_inquiry_id for update;
  if not found then raise exception 'inquiry_not_found'; end if;
  if p_to = 'closed' and coalesce(p_reason, '') = '' then
    raise exception 'closure_reason_required';
  end if;
  update public.inquiries set status = p_to, updated_at = now() where id = p_inquiry_id;
  insert into public.inquiry_activities (inquiry_id, activity_type, actor_id, payload)
  values (p_inquiry_id, 'status_change', auth.uid(),
          jsonb_build_object('from', v_from, 'to', p_to, 'reason', p_reason));
  select * into v_row from public.inquiries where id = p_inquiry_id;
  return v_row;
end;
$$;
