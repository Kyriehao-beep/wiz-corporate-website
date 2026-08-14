-- seed.sql
-- Deterministic review catalog for WIZ (Plan 2 / Task 1).
-- Applied by `supabase db reset` (runs migrations, then this seed).
--
-- ACCOUNTS: WIZ team accounts are created through Supabase Auth (dashboard or
-- CLI), then promoted with:
--   update public.profiles set role = 'admin' where email = 'you@wiz.example';
-- The on_auth_user_created trigger provisions the profiles row automatically.
--
-- NOTE: the catalog editorial fields added by migration 202608130001 are
-- populated here so a fresh `supabase db reset` yields a RICH catalog (not the
-- defaulted/thin content) and the schema extension can be validated end-to-end.
--
-- NOTE on id columns: both translation tables use a surrogate uuid PK ('id')
-- added by migration 202608130001. Every INSERT below includes an explicit
-- gen_random_uuid() for this column because Supabase's seed runner requires it.

-- ── Applications ────────────────────────────────────────
insert into public.applications (id, slug, display_order, tone, priority) values
  ('11111111-1111-4111-8111-111111111111', 'apparel', 1, 'forest', true),
  ('22222222-2222-4222-8222-222222222222', 'outdoor', 2, 'ocean', false),
  ('33333333-3333-4333-8333-333333333333', 'automotive', 3, 'stone', false)
on conflict (id) do nothing;

insert into public.application_translations (
  id, application_id, locale, title, summary,
  buyer_problem, attachment_considerations, visual_direction
) values
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111','en','Apparel','Patches for clothing and uniforms','Branding must flex with garments while retaining color and tactile identity.','Choose sewing or heat transfer after fabric and finishing tests.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111','ja','アパレル','衣料・ユニフォーム向けワッペン','衣料に追従しながら色と立体感を維持する必要があります。','生地と仕上げテスト後に縫製または熱転写を選定します。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), '11111111-1111-4111-8111-111111111111','zh-CN','服装','服装与制服用补丁','标识需随服装弯曲，同时保持色彩和立体识别。','根据面料及后整理测试选择车缝或热转印。','AI 草图展示使用环境，不指向任何具体客户。'),
  (gen_random_uuid(), '22222222-2222-4222-8222-222222222222','en','Outdoor','Rugged emblems for outdoor brands','Water, salt, UV, and repeated handling call for clear branding built around the actual substrate.','Direct board attachment depends on substrate and adhesive testing. These rubber patches are not EVA traction pads.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), '22222222-2222-4222-8222-222222222222','ja','アウトドア','アウトドアブランド向けエンブレム','水、塩分、紫外線、繰り返し使用に合わせた素材別設計が必要です。','ボードへの直接貼付は基材と接着テスト次第です。本製品はEVAデッキパッドではありません。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), '22222222-2222-4222-8222-222222222222','zh-CN','户外','户外品牌用耐用徽章','面对水、盐分、紫外线和反复使用，需要围绕实际基材设计标识。','直接贴附冲浪板取决于基材和胶粘测试；本产品并非 EVA 防滑垫。','AI 草图展示使用环境，不指向任何具体客户。'),
  (gen_random_uuid(), '33333333-3333-4333-8333-333333333333','en','Automotive','Badges and trims for automotive','Automotive badges need durable, weather-stable identity.','Confirm the mounting surface and temperature range before selection.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), '33333333-3333-4333-8333-333333333333','ja','自動車','自動車向けバッジとトリム','自動車向けバッジには耐久性と耐候性のある識別が必要です。','選定前に取り付け面と温度範囲をご確認ください。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), '33333333-3333-4333-8333-333333333333','zh-CN','汽车','汽车用徽标与饰条','汽车徽标需要耐用、耐候性稳定的识别。','选择前请确认安装面与温度范围。','AI 草图展示使用环境，不指向任何具体客户。')
on conflict (id) do nothing;

-- ── Products ───────────────────────────────────────────
insert into public.products (id, slug, status, display_order, tone) values
  ('aaaaaaaa-1111-4111-8111-111111111111', 'custom-pvc-rubber-patches', 'published', 1, 'lime'),
  ('bbbbbbbb-2222-4222-8222-222222222222', 'embroidered-patches', 'published', 2, 'sand'),
  ('cccccccc-3333-4333-8333-333333333333', 'woven-labels', 'published', 3, 'stone')
on conflict (id) do nothing;

insert into public.product_translations (
  id, product_id, locale, title, summary, body, seo_title, seo_description, approved,
  eyebrow, suitability, construction, visual_options, attachment_options, artwork_guidance
) values
  (gen_random_uuid(), 'aaaaaaaa-1111-4111-8111-111111111111','en','Custom PVC Rubber Patches','Durable, dimensional rubber patches for brands.','Soft PVC rubber patches with 2D/3D depth.','Custom PVC Rubber Patches | WIZ','Order custom PVC rubber patches from WIZ.','t','Core product','{"Outdoor apparel and equipment"}','{"Flexible molded PVC/rubber"}','{"2D or dimensional 3D relief"}','{"Sew channels or sew-on edges"}','Vector artwork preferred. We review line weight, relief depth, color separation, and production feasibility before sampling.'),
  (gen_random_uuid(), 'aaaaaaaa-1111-4111-8111-111111111111','ja','カスタムPVCラバーパッチ','ブランド向けの耐久性に優れた立体ラバーパッチ。','2D/3Dの立体感があるソフトPVCパッチ。','カスタムPVCラバーパッチ | WIZ','WIZでカスタムPVCラバーパッチを注文。','t','コア製品','{"アウトドアウェアと装備"}','{"柔軟な成形PVC・ラバー"}','{"2Dまたは立体的な3D表現"}','{"縫製溝または縫い付け仕様"}','ベクターデータを推奨。サンプル前に線幅、深さ、色分け、量産性を確認します。'),
  (gen_random_uuid(), 'aaaaaaaa-1111-4111-8111-111111111111','zh-CN','定制 PVC 橡胶补丁','为品牌打造耐用、立体的橡胶补丁。','柔软 PVC 橡胶补丁,支持 2D/3D 立体效果。','定制 PVC 橡胶补丁 | WIZ','在 WIZ 订购定制 PVC 橡胶补丁。','t','核心产品','{"户外服装与装备"}','{"柔韧模压 PVC/橡胶"}','{"2D 或立体 3D 浮雕"}','{"车缝槽或车缝边"}','建议提供矢量文件。打样前会审核线宽、浮雕深度、分色和量产可行性。'),
  (gen_random_uuid(), 'bbbbbbbb-2222-4222-8222-222222222222','en','Embroidered Patches','Classic stitched patches for apparel.','High-density embroidery on twill.','Embroidered Patches | WIZ','Order embroidered patches from WIZ.','t','Timeless finish','{"Apparel and uniforms"}','{"High-density embroidery on twill"}','{"Raised or flat stitch"}','{"Sew-on only"}','Provide clean vector or high-resolution artwork. We confirm stitch density and minimum text size.'),
  (gen_random_uuid(), 'bbbbbbbb-2222-4222-8222-222222222222','ja','刺繍パッチ','アパレル向けの定番刺繍パッチ。','ツイル地に高密度刺繍。','刺繍パッチ | WIZ','WIZで刺繍パッチを注文。','t','定番仕上げ','{"アパレルとユニフォーム"}','{"ツイル地に高密度刺繍"}','{"立体またはフラットステッチ"}','{"縫い付けのみ"}','清書ベクタまたは高解像度データをご提供。ステッチ密度と最小文字サイズを確認します。'),
  (gen_random_uuid(), 'bbbbbbbb-2222-4222-8222-222222222222','zh-CN','刺绣补丁','服装经典刺绣补丁。','斜纹布上的高密刺绣。','刺绣补丁 | WIZ','在 WIZ 订购刺绣补丁。','t','经典工艺','{"服装与制服"}','{"斜纹布高密刺绣"}','{"立体或平面刺绣"}','{"仅车缝"}','请提供清晰的矢量或高清图稿，确认针迹密度与最小字号。'),
  (gen_random_uuid(), 'cccccccc-3333-4333-8333-333333333333','en','Woven Labels','Damask woven labels for garments.','Soft-edge woven brand labels.','Woven Labels | WIZ','Order woven labels from WIZ.','t','Subtle branding','{"Garment branding"}','{"Damask woven edge"}','{"Flat or satin weave"}','{"Sew-on only"}','Send vector artwork. We check logo legibility at small label sizes and confirm weave type.'),
  (gen_random_uuid(), 'cccccccc-3333-4333-8333-333333333333','ja','織ネーム','衣料向けダマスク織ネーム。','ソフトエッジの織ネーム。','織ネーム | WIZ','WIZで織ネームを注文。','t','さりげないブランディング','{"衣料ブランディング"}','{"ダマスク織の縁処理"}','{"フラットまたはサテン織"}','{"縫い付けのみ"}','ベクターデータを送付。小さいネームでのロゴ視認性と織り方を確認します。'),
  (gen_random_uuid(), 'cccccccc-3333-4333-8333-333333333333','zh-CN','织标','服装用提花织标。','柔软包边织标。','织标 | WIZ','在 WIZ 订购织标。','t','低调品牌标识','{"服装品牌标识"}','{"提花织标包边"}','{"平面或缎面织法"}','{"仅车缝"}','请发送矢量图稿，确认小尺寸下 logo 清晰度与织法。')
on conflict (id) do nothing;

-- ── Product ↔ Application links ────────────────────────
insert into public.product_applications (product_id, application_id) values
  ('aaaaaaaa-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111'),
  ('aaaaaaaa-1111-4111-8111-111111111111','22222222-2222-4222-8222-222222222222'),
  ('bbbbbbbb-2222-4222-8222-222222222222','11111111-1111-4111-8111-111111111111'),
  ('cccccccc-3333-4333-8333-333333333333','11111111-1111-4111-8111-111111111111')
on conflict do nothing;

-- ── Additional products (expand catalog from 3 → 6) ──
insert into public.products (id, slug, status, display_order, tone) values
  ('dddddddd-4444-4444-8444-444444444444', 'heat-transfer-rubber-patches', 'published', 4, 'sand'),
  ('eeeeeeee-5555-4555-8555-555555555555', 'sew-on-rubber-patches-labels', 'published', 5, 'stone'),
  ('ffffffff-6666-4666-8666-666666666666', 'hook-and-loop-rubber-patches', 'published', 6, 'forest')
on conflict (id) do nothing;

insert into public.product_translations (
  id, product_id, locale, title, summary, body, seo_title, seo_description, approved,
  eyebrow, suitability, construction, visual_options, attachment_options, artwork_guidance
) values
  -- heat-transfer-rubber-patches
  (gen_random_uuid(), 'dddddddd-4444-4444-8444-444444444444','en','Heat Transfer Rubber Patches','A clean, low-profile patch direction for compatible textiles and controlled heat-transfer workflows.','Soft rubber patches applied via heat transfer to approved textiles.','Heat Transfer Rubber Patches | WIZ','Order heat transfer rubber patches from WIZ.','t','Low-profile application','{"Outdoor apparel and equipment","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Heat transfer to approved materials after testing"}','Share fabric composition and finishing details so transfer parameters can be evaluated.'),
  (gen_random_uuid(), 'dddddddd-4444-4444-8444-444444444444','ja','熱転写ラバーパッチ','対応素材と管理された熱転写工程向けの、すっきりした薄型パッチ。','承認済み生地に熱転写で適用するソフトラバーパッチ。','熱転写ラバーパッチ | WIZ','WIZで熱転写ラバーパッチを注文。','t','薄型仕様','{"Outdoor apparel and equipment","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Heat transfer to approved materials after testing"}','生地組成と仕上げ情報をご共有ください。'),
  (gen_random_uuid(), 'dddddddd-4444-4444-8444-444444444444','zh-CN','热转印橡胶标牌','适用于兼容面料和受控热转印流程的轻薄标牌方案。','通过热转印工艺贴合到适用面料的柔软橡胶标牌。','热转印橡胶标牌 | WIZ','在 WIZ 订购热转印橡胶标牌。','t','轻薄应用','{"户外服装与装备","需要立体触感的品牌标识"}','{"柔韧模压 PVC/橡胶","尺寸、形状和配色均可定制"}','{"2D 或立体 3D 浮雕","哑光、同色系或高对比配色"}','{"测试确认后热转印至适用面料"}','请提供面料成分和后整理信息，以评估转印参数。'),
  -- sew-on-rubber-patches-labels
  (gen_random_uuid(), 'eeeeeeee-5555-4555-8555-555555555555','en','Sew-On Rubber Patches & Labels','Designed with sewing channels and edge geometry for dependable integration into garments and bags.','Rubber patches and labels built for sewing into garments and bags.','Sew-On Rubber Patches & Labels | WIZ','Order sew-on rubber patches and labels from WIZ.','t','Reliable construction','{"Outdoor apparel and equipment","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Perimeter sew channel","Concealed sew points"}','Allow sufficient edge width for sewing and communicate the target stitch method.'),
  (gen_random_uuid(), 'eeeeeeee-5555-4555-8555-555555555555','ja','縫い付けラバーパッチ＆ラベル','衣料やバッグに安定して組み込める縫製溝とエッジ形状。','衣料やバッグへの縫い付けに適したラバーパッチとラベル。','縫い付けラバーパッチ＆ラベル | WIZ','WIZで縫い付けラバーパッチ＆ラベルを注文。','t','安定した縫製仕様','{"Outdoor apparel and equipment","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Perimeter sew channel","Concealed sew points"}','縫製幅を確保し、予定のステッチ方法をご指定ください。'),
  (gen_random_uuid(), 'eeeeeeee-5555-4555-8555-555555555555','zh-CN','车缝橡胶标牌与标签','通过车缝槽和边缘结构，可靠应用于服装与箱包。','为车缝进服装与箱包而设计的橡胶标牌与标签。','车缝橡胶标牌与标签 | WIZ','在 WIZ 订购车缝橡胶标牌与标签。','t','可靠结构','{"户外服装与装备","需要立体触感的品牌标识"}','{"柔韧模压 PVC/橡胶","尺寸、形状和配色均可定制"}','{"2D 或立体 3D 浮雕","哑光、同色系或高对比配色"}','{"周边车缝槽","隐藏车缝点"}','需预留足够车缝边宽，并说明计划采用的针法。'),
  -- hook-and-loop-rubber-patches
  (gen_random_uuid(), 'ffffffff-6666-4666-8666-666666666666','en','Hook-and-Loop Rubber Patches','Removable rubber patches for uniforms, tactical gear, packs, and modular equipment.','Detachable rubber patches with hook backing for modular gear.','Hook-and-Loop Rubber Patches | WIZ','Order hook-and-loop rubber patches from WIZ.','t','Interchangeable identity','{"Outdoor apparel and equipment","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Hook backing with matched loop panel options"}','Confirm the mating loop system and finished patch dimensions.'),
  (gen_random_uuid(), 'ffffffff-6666-4666-8666-666666666666','ja','面ファスナーラバーパッチ','ユニフォーム、タクティカルギア、バッグ、モジュール装備向けの交換式パッチ。','モジュール装備向けのフック裏面付き着脱式ラバーパッチ。','面ファスナーラバーパッチ | WIZ','WIZで面ファスナーラバーパッチを注文。','t','交換可能な表示','{"Outdoor apparel and equipment","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Hook backing with matched loop panel options"}','対応ループ面と仕上がり寸法をご確認ください。'),
  (gen_random_uuid(), 'ffffffff-6666-4666-8666-666666666666','zh-CN','魔术贴橡胶标牌','适用于制服、战术装备、背包和模块化设备的可拆卸标牌。','带勾面背衬、可用于模块化装备的可拆卸橡胶标牌。','魔术贴橡胶标牌 | WIZ','在 WIZ 订购魔术贴橡胶标牌。','t','可替换标识','{"户外服装与装备","需要立体触感的品牌标识"}','{"柔韧模压 PVC/橡胶","尺寸、形状和配色均可定制"}','{"2D 或立体 3D 浮雕","哑光、同色系或高对比配色"}','{"勾面背衬及配套毛面方案"}','请确认配套毛面系统和成品尺寸。')
on conflict (id) do nothing;

insert into public.product_applications (product_id, application_id) values
  ('dddddddd-4444-4444-8444-444444444444','11111111-1111-4111-8111-111111111111'),
  ('dddddddd-4444-4444-8444-444444444444','22222222-2222-4222-8222-222222222222'),
  ('eeeeeeee-5555-4555-8555-555555555555','11111111-1111-4111-8111-111111111111'),
  ('eeeeeeee-5555-4555-8555-555555555555','22222222-2222-4222-8222-222222222222'),
  ('ffffffff-6666-4666-8666-666666666666','11111111-1111-4111-8111-111111111111'),
  ('ffffffff-6666-4666-8666-666666666666','22222222-2222-4222-8222-222222222222')
on conflict do nothing;
