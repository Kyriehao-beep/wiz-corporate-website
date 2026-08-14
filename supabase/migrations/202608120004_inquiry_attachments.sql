-- 202608120004_inquiry_attachments.sql
-- Attachment records for RFQ private artwork (Plan 2 / Tasks 6 & 10).
-- Each row links an inquiry to a private storage object; the object itself lives
-- in the rfq-private / quote-private buckets under an inquiry-scoped prefix.
-- Signed downloads are served by an admin API route that checks auth + record
-- ownership before issuing a short-lived redirect (see Task 10).

create table public.inquiry_attachments (
  id            uuid primary key default gen_random_uuid(),
  inquiry_id    uuid not null references public.inquiries(id) on delete cascade,
  storage_key   text not null,
  display_name  text not null,
  content_type  text not null default '',
  size_bytes    integer not null default 0,
  created_at    timestamptz not null default now()
);

create index on public.inquiry_attachments (inquiry_id);

alter table public.inquiry_attachments enable row level security;

-- WIZ members (admin/sales/staff) may read attachment records through the
-- authenticated server client. Anon and the public web never get a policy, so
-- private objects stay unreachable without a valid session. The service role
-- remains the only writer (moves draft refs into inquiry ownership).
create policy "inquiry_attachments_member_all" on public.inquiry_attachments
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());
