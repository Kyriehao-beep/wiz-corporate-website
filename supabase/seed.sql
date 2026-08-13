-- seed.sql
-- Deterministic review catalog for WIZ (Plan 2 / Task 1).
-- Applied by `supabase db reset` (runs migrations, then this seed).
--
-- ACCOUNTS: WIZ team accounts are created through Supabase Auth (dashboard or
-- CLI), then promoted with:
--   update public.profiles set role = 'admin' where email = 'you@wiz.example';
-- The on_auth_user_created trigger provisions the profiles row automatically.

-- ── Applications ────────────────────────────────────────
insert into public.applications (id, slug, display_order) values
  ('11111111-1111-4111-8111-111111111111', 'apparel', 1),
  ('22222222-2222-4222-8222-222222222222', 'outdoor', 2),
  ('33333333-3333-4333-8333-333333333333', 'automotive', 3)
on conflict (id) do nothing;

insert into public.application_translations (application_id, locale, title, summary) values
  ('11111111-1111-4111-8111-111111111111','en','Apparel','Patches for clothing and uniforms'),
  ('11111111-1111-4111-8111-111111111111','ja','アパレル','衣料・ユニフォーム向けワッペン'),
  ('11111111-1111-4111-8111-111111111111','zh-CN','服装','服装与制服用补丁'),
  ('22222222-2222-4222-8222-222222222222','en','Outdoor','Rugged emblems for outdoor brands'),
  ('22222222-2222-4222-8222-222222222222','ja','アウトドア','アウトドアブランド向けエンブレム'),
  ('22222222-2222-4222-8222-222222222222','zh-CN','户外','户外品牌用耐用徽章'),
  ('33333333-3333-4333-8333-333333333333','en','Automotive','Badges and trims for automotive'),
  ('33333333-3333-4333-8333-333333333333','ja','自動車','自動車向けバッジとトリム'),
  ('33333333-3333-4333-8333-333333333333','zh-CN','汽车','汽车用徽标与饰条')
on conflict do nothing;

-- ── Products ───────────────────────────────────────────
insert into public.products (id, slug, status, display_order) values
  ('aaaaaaaa-1111-4111-8111-111111111111', 'custom-pvc-rubber-patches', 'published', 1),
  ('bbbbbbbb-2222-4222-8222-222222222222', 'embroidered-patches', 'published', 2),
  ('cccccccc-3333-4333-8333-333333333333', 'woven-labels', 'published', 3)
on conflict (id) do nothing;

insert into public.product_translations (
  product_id, locale, title, summary, body, seo_title, seo_description, approved
) values
  ('aaaaaaaa-1111-4111-8111-111111111111','en','Custom PVC Rubber Patches','Durable, dimensional rubber patches for brands.','Soft PVC rubber patches with 2D/3D depth.','Custom PVC Rubber Patches | WIZ','Order custom PVC rubber patches from WIZ.','t'),
  ('aaaaaaaa-1111-4111-8111-111111111111','ja','カスタムPVCラバーパッチ','ブランド向けの耐久性に優れた立体ラバーパッチ。','2D/3Dの立体感があるソフトPVCパッチ。','カスタムPVCラバーパッチ | WIZ','WIZでカスタムPVCラバーパッチを注文。','t'),
  ('aaaaaaaa-1111-4111-8111-111111111111','zh-CN','定制 PVC 橡胶补丁','为品牌打造耐用、立体的橡胶补丁。','柔软 PVC 橡胶补丁,支持 2D/3D 立体效果。','定制 PVC 橡胶补丁 | WIZ','在 WIZ 订购定制 PVC 橡胶补丁。','t'),
  ('bbbbbbbb-2222-4222-8222-222222222222','en','Embroidered Patches','Classic stitched patches for apparel.','High-density embroidery on twill.','Embroidered Patches | WIZ','Order embroidered patches from WIZ.','t'),
  ('bbbbbbbb-2222-4222-8222-222222222222','ja','刺繍パッチ','アパレル向けの定番刺繍パッチ。','ツイル地に高密度刺繍。','刺繍パッチ | WIZ','WIZで刺繍パッチを注文。','t'),
  ('bbbbbbbb-2222-4222-8222-222222222222','zh-CN','刺绣补丁','服装经典刺绣补丁。','斜纹布上的高密刺绣。','刺绣补丁 | WIZ','在 WIZ 订购刺绣补丁。','t'),
  ('cccccccc-3333-4333-8333-333333333333','en','Woven Labels','Damask woven labels for garments.','Soft-edge woven brand labels.','Woven Labels | WIZ','Order woven labels from WIZ.','t'),
  ('cccccccc-3333-4333-8333-333333333333','ja','織ネーム','衣料向けダマスク織ネーム。','ソフトエッジの織ネーム。','織ネーム | WIZ','WIZで織ネームを注文。','t'),
  ('cccccccc-3333-4333-8333-333333333333','zh-CN','织标','服装用提花织标。','柔软包边织标。','织标 | WIZ','在 WIZ 订购织标。','t')
on conflict do nothing;

-- ── Product ↔ Application links ────────────────────────
insert into public.product_applications (product_id, application_id) values
  ('aaaaaaaa-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222'),
  ('bbbbbbbb-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111'),
  ('cccccccc-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111')
on conflict do nothing;
