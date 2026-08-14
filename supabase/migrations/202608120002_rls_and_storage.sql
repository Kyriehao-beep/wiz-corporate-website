-- 202608120002_rls_and_storage.sql
-- Deny-by-default RLS + storage separation (Plan 2 / Task 1 / Step 4)

-- ── Enable RLS on every application table (deny by default) ──
alter table public.profiles                 enable row level security;
alter table public.products                 enable row level security;
alter table public.product_translations     enable row level security;
alter table public.product_media            enable row level security;
alter table public.applications             enable row level security;
alter table public.application_translations enable row level security;
alter table public.application_media        enable row level security;
alter table public.product_applications     enable row level security;
alter table public.inquiries                enable row level security;
alter table public.inquiry_items            enable row level security;
alter table public.inquiry_activities       enable row level security;
alter table public.upload_drafts            enable row level security;
alter table public.rfq_rate_limits          enable row level security;
alter table public.notification_queue       enable row level security;
alter table public.notification_deliveries  enable row level security;
alter table public.audit_log                enable row level security;

-- ── Table-level grants (RLS policies control WHICH rows; grants control IF you can query) ──
-- Public catalog: anon + authenticated can read; authenticated can write.
grant select on public.products               to anon, authenticated;
grant select on public.product_translations   to anon, authenticated;
grant select on public.product_media          to anon, authenticated;
grant select on public.applications           to anon, authenticated;
grant select on public.application_translations to anon, authenticated;
grant select on public.application_media      to anon, authenticated;
grant select on public.product_applications  to anon, authenticated;
grant insert, update on public.products                to authenticated;
grant insert, update on public.product_translations    to authenticated;
grant insert, update on public.product_media           to authenticated;
grant insert, update on public.applications             to authenticated;
grant insert, update on public.application_translations to authenticated;
grant insert, update on public.application_media        to authenticated;
grant insert, update on public.product_applications     to authenticated;

-- Member-only tables: authenticated only (anon has zero access).
grant select, insert, update on public.profiles          to authenticated;
grant select, insert, update on public.inquiries         to authenticated;
grant select, insert, update on public.inquiry_items      to authenticated;
grant select, insert, update on public.inquiry_activities to authenticated;
grant select, insert, update on public.upload_drafts     to authenticated;

-- Service-role-only tables: no client grants at all (service role is superuser).

-- ── profiles (unified WIZ account) ──
create policy "profiles_self_read" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_admin_read" on public.profiles
  for select using (public.is_admin());
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- ── products: public read of published only; WIZ members full ──
create policy "products_published_read" on public.products
  for select using (status = 'published');
create policy "products_member_all" on public.products
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());

-- ── product_translations: public read only via published parent ──
create policy "product_translations_published_read" on public.product_translations
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
  );
create policy "product_translations_member_all" on public.product_translations
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());

-- ── product_media: same visibility rule ──
create policy "product_media_published_read" on public.product_media
  for select using (
    exists (select 1 from public.products p where p.id = product_id and p.status = 'published')
  );
create policy "product_media_member_all" on public.product_media
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());

-- ── applications: public read; members write ──
create policy "applications_public_read" on public.applications
  for select using (true);
create policy "applications_member_all" on public.applications
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());
create policy "application_translations_public_read" on public.application_translations
  for select using (true);
create policy "application_translations_member_all" on public.application_translations
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());
create policy "application_media_public_read" on public.application_media
  for select using (true);
create policy "application_media_member_all" on public.application_media
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());
create policy "product_applications_public_read" on public.product_applications
  for select using (true);
create policy "product_applications_member_all" on public.product_applications
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());

-- ── inquiries + items + activities: WIZ members only (anon denied by default) ──
create policy "inquiries_member_all" on public.inquiries
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());
create policy "inquiry_items_member_all" on public.inquiry_items
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());
create policy "inquiry_activities_member_all" on public.inquiry_activities
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());

-- ── upload_drafts: members only ──
create policy "upload_drafts_member_all" on public.upload_drafts
  for all using (public.is_wiz_member()) with check (public.is_wiz_member());

-- rfq_rate_limits / notification_queue / notification_deliveries / audit_log:
-- intentionally left with NO client policies → only the service role can access.

-- ── Storage buckets ──
insert into storage.buckets (id, name, public) values ('product-media', 'product-media', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('rfq-private', 'rfq-private', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('quote-private', 'quote-private', false)
  on conflict (id) do nothing;

-- ── Storage policies ──
-- product-media: public read, members write
create policy "product_media_public_read" on storage.objects
  for select using (bucket_id = 'product-media');
create policy "product_media_member_write" on storage.objects
  for insert with check (bucket_id = 'product-media' and public.is_wiz_member());
create policy "product_media_member_update" on storage.objects
  for update using (bucket_id = 'product-media' and public.is_wiz_member());

-- rfq-private / quote-private: members read; writes happen via service role only
-- (no client insert/update/delete policies → direct client writes denied)
create policy "private_member_read" on storage.objects
  for select using (bucket_id in ('rfq-private', 'quote-private') and public.is_wiz_member());
