-- 202608140001_inquiry_quotes.sql
-- Quotes attached to an inquiry (Plan 2 / Task 10: quote record + PDF quotation).

create table public.inquiry_quotes (
  id              uuid primary key default gen_random_uuid(),
  inquiry_id      uuid not null references public.inquiries(id) on delete cascade,
  amount          numeric(14,2) not null check (amount >= 0),
  currency        char(3) not null check (currency ~ '^[A-Z]{3}$'),
  quote_date      date not null,
  pdf_storage_key text,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

create index if not exists inquiry_quotes_inquiry_id_idx
  on public.inquiry_quotes (inquiry_id);

-- ── RLS: deny by default; members read, writes via service role only ──
alter table public.inquiry_quotes enable row level security;

create policy "inquiry_quotes_member_read" on public.inquiry_quotes
  for select using (public.is_wiz_member());

grant select on public.inquiry_quotes to authenticated;
