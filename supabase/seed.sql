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
--
-- Catalog reflects 产品优化.xlsx: product families prioritized as
-- 热熔胶 / 胶章 / 魔术贴 / 耳机孔 / 钥匙扣, and applications led by Outdoor
-- with Yoga & Activewear as the new #2 scene. Compliance red lines preserved
-- (Hook and Loop, no Military / Airforce / brand names / Factory Price).

-- ── Applications ────────────────────────────────────────
-- Order: Outdoor (1) → Yoga & Activewear (2) → the rest.
insert into public.applications (id, slug, display_order, tone, priority) values
  ('c1111111-1111-4111-8111-111111111111', 'outdoor-apparel', 1, 'ocean', true),
  ('c2222222-2222-4222-8222-222222222222', 'yoga-wear', 2, 'forest', true),
  ('c3333333-3333-4333-8333-333333333333', 'surf-watersports', 3, 'stone', true),
  ('c4444444-4444-4444-8444-444444444444', 'backpacks-gear-bags', 4, 'sand', false),
  ('c5555555-5555-4555-8555-555555555555', 'tactical-uniforms', 5, 'lime', false),
  ('c6666666-6666-4666-8666-666666666666', 'footwear', 6, 'signal', false),
  ('c7777777-7777-4777-8777-777777777777', 'workwear', 7, 'forest', false),
  ('c8888888-8888-4888-8888-888888888888', 'clubs-events', 8, 'stone', false),
  ('c9999999-9999-4999-8999-999999999999', 'promotional-merchandise', 9, 'sand', false),
  ('caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'marine-equipment', 10, 'ocean', false)
on conflict (id) do nothing;

insert into public.application_translations (
  id, application_id, locale, title, summary,
  buyer_problem, attachment_considerations, visual_direction
) values
  -- outdoor-apparel
  (gen_random_uuid(), 'c1111111-1111-4111-8111-111111111111','en','Outdoor Apparel','Outdoor apparel and equipment branding','Branding must flex with garments while retaining color and tactile identity.','Choose sewing, heat transfer, or hook-and-loop after fabric and finishing tests.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), 'c1111111-1111-4111-8111-111111111111','ja','アウトドアウェア','アウトドアウェアと装備のブランディング','衣料に追従しながら色と立体感を維持する必要があります。','生地と仕上げテスト後に縫製、熱転写、面ファスナーを選定します。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), 'c1111111-1111-4111-8111-111111111111','zh-CN','户外服装','户外服装与装备的品牌标识','标识需随服装弯曲，同时保持色彩和立体识别。','根据面料及后整理测试选择车缝、热转印或魔术贴。','AI 草图展示使用环境，不指向任何具体客户。'),
  -- yoga-wear
  (gen_random_uuid(), 'c2222222-2222-4222-8222-222222222222','en','Yoga & Activewear','Yoga and activewear branding','Soft, low-profile branding that moves with the body and survives repeated wash and stretch.','Heat transfer and side-seam labels suit stretch fabrics; validate before sampling.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), 'c2222222-2222-4222-8222-222222222222','ja','ヨガ＆アクティブウェア','ヨガ＆アクティブウェアのブランディング','体の動きに追従し、繰り返す洗濯と伸縮に耐えるやわらかな薄型表現。','熱転写と側縫いラベルが伸縮素材に適し、サンプル前に検証します。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), 'c2222222-2222-4222-8222-222222222222','zh-CN','瑜伽运动','瑜伽与运动服的品牌标识','柔软轻薄的标识随身体伸展，并耐受反复洗涤与拉伸。','热转印与侧缝标适配弹力面料，打样前需验证。','AI 草图展示使用环境，不指向任何具体客户。'),
  -- surf-watersports
  (gen_random_uuid(), 'c3333333-3333-4333-8333-333333333333','en','Surf & Watersports','Surf and watersports branding','Water, salt, UV, and repeated handling call for clear branding built around the actual substrate.','Direct board attachment depends on substrate and adhesive testing. These rubber patches are not EVA traction pads.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), 'c3333333-3333-4333-8333-333333333333','ja','サーフ＆ウォータースポーツ','サーフ＆ウォータースポーツのブランディング','水、塩分、紫外線、繰り返し使用に合わせた素材別設計。','ボードへの直接貼付は基材と接着テスト次第です。本製品はEVAデッキパッドではありません。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), 'c3333333-3333-4333-8333-333333333333','zh-CN','冲浪与水上运动','冲浪与水上运动的品牌标识','面对水、盐分、紫外线和反复使用，需要围绕实际基材设计标识。','直接贴附冲浪板取决于基材和胶粘测试；本产品并非 EVA 防滑垫。','AI 草图展示使用环境，不指向任何具体客户。'),
  -- backpacks-gear-bags
  (gen_random_uuid(), 'c4444444-4444-4444-8444-444444444444','en','Backpacks & Gear Bags','Backpacks and gear bags branding','High-touch gear needs robust identity elements that integrate with layered construction.','Sew-on and hook-and-loop options suit different bag constructions; earphone-hole patches route cables cleanly.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), 'c4444444-4444-4444-8444-444444444444','ja','バックパック＆ギアバッグ','バックパック＆ギアバッグのブランディング','使用頻度の高いギアには多層構造に合う堅牢な表示が必要です。','バッグ構造に応じて縫製と面ファスナーを選択。イヤホン穴パッチでケーブルを整えます。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), 'c4444444-4444-4444-8444-444444444444','zh-CN','背包与装备包','背包与装备包的品牌标识','高频使用装备需要能融入多层结构的耐用标识。','不同箱包结构可选择车缝或魔术贴；耳机孔标牌让线缆走线更整洁。','AI 草图展示使用环境，不指向任何具体客户。'),
  -- tactical-uniforms
  (gen_random_uuid(), 'c5555555-5555-4555-8555-555555555555','en','Tactical & Uniforms','Tactical and uniform branding','Fast identification and interchangeable markings need disciplined dimensions and contrast.','Confirm the receiving loop field and uniform rules.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), 'c5555555-5555-4555-8555-555555555555','ja','タクティカル＆ユニフォーム','タクティカル＆ユニフォームのブランディング','迅速な識別と交換表示には寸法とコントラスト管理が必要です。','受け側ループ面とユニフォーム規定をご確認ください。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), 'c5555555-5555-4555-8555-555555555555','zh-CN','战术装备与制服','战术装备与制服的品牌标识','快速识别和可替换标识需要严格控制尺寸与对比度。','请确认配套毛面区域和制服规范。','AI 草图展示使用环境，不指向任何具体客户。'),
  -- footwear
  (gen_random_uuid(), 'c6666666-6666-4666-8666-666666666666','en','Footwear','Footwear branding','Curved, flexing components require controlled thickness and attachment validation.','Attachment depends on upper material and flex zone.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), 'c6666666-6666-4666-8666-666666666666','ja','フットウェア','フットウェアのブランディング','曲面と屈曲には厚み管理と取り付け検証が必要です。','アッパー素材と屈曲位置に合わせて選定します。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), 'c6666666-6666-4666-8666-666666666666','zh-CN','鞋履','鞋履的品牌标识','曲面和弯折部位需要控制厚度并验证安装方式。','安装方式取决于鞋面材料和弯折区域。','AI 草图展示使用环境，不指向任何具体客户。'),
  -- workwear
  (gen_random_uuid(), 'c7777777-7777-4777-8777-777777777777','en','Workwear','Workwear branding','Daily wear needs legible, repeatable identity and reliable garment integration.','Review wash conditions and fabric treatment.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), 'c7777777-7777-4777-8777-777777777777','ja','ワークウェア','ワークウェアのブランディング','日常使用に耐える視認性と安定した衣料組み込みが必要です。','洗濯条件と生地加工をご共有ください。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), 'c7777777-7777-4777-8777-777777777777','zh-CN','工装','工装的品牌标识','日常穿着需要清晰、稳定且可靠融入服装的标识。','需评估洗涤条件和面料处理方式。','AI 草图展示使用环境，不指向任何具体客户。'),
  -- clubs-events
  (gen_random_uuid(), 'c8888888-8888-4888-8888-888888888888','en','Clubs & Events','Clubs and events branding','Distinctive limited programs need clear artwork and practical production choices.','Select attachment by how recipients will use the patch.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), 'c8888888-8888-4888-8888-888888888888','ja','クラブ＆イベント','クラブ＆イベントのブランディング','限定企画には明確なデザインと現実的な生産選択が必要です。','受け手の使用方法に合わせて仕様を選びます。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), 'c8888888-8888-4888-8888-888888888888','zh-CN','俱乐部与活动','俱乐部与活动的品牌标识','限量项目需要清晰设计和切实可行的生产选择。','根据领取者的使用方式选择安装方案。','AI 草图展示使用环境，不指向任何具体客户。'),
  -- promotional-merchandise
  (gen_random_uuid(), 'c9999999-9999-4999-8999-999999999999','en','Promotional Merchandise','Promotional merchandise branding','Campaign pieces need recognisable brand detail without overcomplicated construction.','Match format to distribution, handling, and packaging.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), 'c9999999-9999-4999-8999-999999999999','ja','プロモーショングッズ','プロモーショングッズのブランディング','キャンペーン品には過度に複雑でない明確なブランド表現が必要です。','配布、使用、包装方法に合わせて形式を選びます。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), 'c9999999-9999-4999-8999-999999999999','zh-CN','促销周边','促销周边的品牌标识','活动周边需要清晰的品牌细节，同时避免过度复杂的结构。','根据发放、使用和包装方式选择形式。','AI 草图展示使用环境，不指向任何具体客户。'),
  -- marine-equipment
  (gen_random_uuid(), 'caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','en','Marine Equipment','Marine equipment branding','Wet, exposed equipment demands substrate-specific evaluation and conservative claims.','Validate attachment and exposure conditions on the actual equipment.','AI draft imagery shows the use environment without implying a named customer.'),
  (gen_random_uuid(), 'caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','ja','マリン装備','マリン装備のブランディング','湿潤・露出環境では基材別評価と慎重な表現が必要です。','実機で取り付けと暴露条件を検証してください。','AIドラフト画像は特定顧客を示さず使用環境を表現します。'),
  (gen_random_uuid(), 'caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','zh-CN','海事装备','海事装备的品牌标识','潮湿暴露环境需要针对基材评估，并保持审慎承诺。','需在实际装备上验证安装方式和暴露条件。','AI 草图展示使用环境，不指向任何具体客户。')
on conflict (id) do nothing;

-- ── Products ───────────────────────────────────────────
-- Prioritized families from 产品优化.xlsx: heat-transfer / pvc rubber /
-- hook-and-loop / earphone-hole / keychains.
insert into public.products (id, slug, status, display_order, tone) values
  ('b1111111-1111-4111-8111-111111111111', 'heat-transfer-rubber-patches', 'published', 1, 'lime'),
  ('b2222222-2222-4222-8222-222222222222', 'custom-pvc-rubber-patches', 'published', 2, 'sand'),
  ('b3333333-3333-4333-8333-333333333333', 'hook-and-loop-rubber-patches', 'published', 3, 'forest'),
  ('b4444444-4444-4444-8444-444444444444', 'earphone-hole-patches', 'published', 4, 'stone'),
  ('b5555555-5555-4555-8555-555555555555', 'keychains', 'published', 5, 'signal')
on conflict (id) do nothing;

insert into public.product_translations (
  id, product_id, locale, title, summary, body, seo_title, seo_description, approved,
  eyebrow, suitability, construction, visual_options, attachment_options, artwork_guidance
) values
  -- heat-transfer-rubber-patches (热熔胶)
  (gen_random_uuid(), 'b1111111-1111-4111-8111-111111111111','en','Heat Transfer Silicone Labels','A clean, low-profile heat-transfer direction built around soft 3D silicone relief — made for yoga wear, swimwear, and performance sportswear.','Soft silicone heat-transfer labels applied to approved textiles through controlled heat.','Heat Transfer Silicone Labels | WIZ','Order custom heat transfer silicone labels from WIZ.','t','Core product','{"Outdoor apparel and equipment","Yoga wear, swimwear, and sportswear","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber or silicone construction","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Heat transfer to approved materials after testing"}','Share fabric composition and finishing details so transfer parameters can be evaluated.'),
  (gen_random_uuid(), 'b1111111-1111-4111-8111-111111111111','ja','熱転写シリコンラベル','やわらかな3Dシリコン浮雕を核とした薄型熱転写。ヨガウェア、水着、スポーツウェアに最適。','管理された熱転写で承認済み生地に貼り付けるソフトシリコンラベル。','熱転写シリコンラベル | WIZ','WIZで熱転写シリコンラベルを注文。','t','コア製品','{"アウトドアウェアと装備","ヨガウェア、水着、スポーツウェア","立体感が必要なブランド表現"}','{"柔軟な成形PVC・ラバー／シリコン構造","サイズ・形状・配色をカスタム"}','{"2Dまたは立体的な3D表現","マット、同系色、高コントラスト配色"}','{"テスト済み素材への熱転写"}','生地組成と仕上げ情報をご共有ください。'),
  (gen_random_uuid(), 'b1111111-1111-4111-8111-111111111111','zh-CN','定制热转印硅胶标','以柔软 3D 硅胶浮雕为核心的轻薄热转印方案，专为瑜伽服、泳衣与运动服打造。','通过受控热转印贴合到适用面料的柔软硅胶标牌。','定制热转印硅胶标 | WIZ','在 WIZ 订购定制热转印硅胶标。','t','核心产品','{"户外服装与装备","瑜伽服、泳衣与运动服","需要立体触感的品牌标识"}','{"柔韧模压 PVC/橡胶或硅胶结构","尺寸、形状和配色均可定制"}','{"2D 或立体 3D 浮雕","哑光、同色系或高对比配色"}','{"测试确认后热转印至适用面料"}','请提供面料成分和后整理信息，以评估转印参数。'),
  -- custom-pvc-rubber-patches (胶章)
  (gen_random_uuid(), 'b2222222-2222-4222-8222-222222222222','en','Custom PVC Rubber Patches','Molded brand patches with precise color separation, fine relief, and attachment options for demanding use.','Soft PVC rubber patches with 2D/3D depth and dependable attachment.','Custom PVC Rubber Patches | WIZ','Order custom PVC rubber patches from WIZ.','t','Core product','{"Outdoor apparel and equipment","Yoga wear, swimwear, and sportswear","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber or silicone construction","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Sew channels or sew-on edges","Hook-and-loop backing","Application-specific adhesive after testing"}','Vector artwork is preferred. We review line weight, relief depth, color separation, and production feasibility before sampling.'),
  (gen_random_uuid(), 'b2222222-2222-4222-8222-222222222222','ja','カスタムPVCラバーパッチ','精密な色分けと立体表現、用途別の取り付け仕様に対応する成形ブランドパッチ。','2D/3Dの立体感があるソフトPVCパッチ。','カスタムPVCラバーパッチ | WIZ','WIZでカスタムPVCラバーパッチを注文。','t','コア製品','{"アウトドアウェアと装備","ヨガウェア、水着、スポーツウェア","立体感が必要なブランド表現"}','{"柔軟な成形PVC・ラバー／シリコン構造","サイズ・形状・配色をカスタム"}','{"2Dまたは立体的な3D表現","マット、同系色、高コントラスト配色"}','{"縫製溝または縫い付け仕様","面ファスナー仕様","用途別テスト後の粘着仕様"}','ベクターデータを推奨。サンプル前に線幅、深さ、色分け、量産性を確認します。'),
  (gen_random_uuid(), 'b2222222-2222-4222-8222-222222222222','zh-CN','定制 PVC 橡胶标牌','通过精准分色、细腻浮雕和多种安装方式，满足严苛使用环境。','柔软 PVC 橡胶标牌，支持 2D/3D 立体效果。','定制 PVC 橡胶标牌 | WIZ','在 WIZ 订购定制 PVC 橡胶标牌。','t','核心产品','{"户外服装与装备","瑜伽服、泳衣与运动服","需要立体触感的品牌标识"}','{"柔韧模压 PVC/橡胶或硅胶结构","尺寸、形状和配色均可定制"}','{"2D 或立体 3D 浮雕","哑光、同色系或高对比配色"}','{"车缝槽或车缝边","魔术贴背面","经过应用测试的背胶方案"}','建议提供矢量文件。打样前会审核线宽、浮雕深度、分色和量产可行性。'),
  -- hook-and-loop-rubber-patches (魔术贴)
  (gen_random_uuid(), 'b3333333-3333-4333-8333-333333333333','en','Hook-and-Loop Rubber Patches','Removable rubber patches for uniforms, tactical gear, packs, and modular equipment.','Detachable rubber patches with hook backing for modular gear.','Hook-and-Loop Rubber Patches | WIZ','Order hook-and-loop rubber patches from WIZ.','t','Interchangeable identity','{"Outdoor apparel and equipment","Yoga wear, swimwear, and sportswear","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber or silicone construction","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Hook backing with matched loop panel options"}','Confirm the mating loop system and finished patch dimensions.'),
  (gen_random_uuid(), 'b3333333-3333-4333-8333-333333333333','ja','面ファスナーラバーパッチ','ユニフォーム、タクティカルギア、バッグ、モジュール装備向けの交換式パッチ。','モジュール装備向けのフック裏面付き着脱式ラバーパッチ。','面ファスナーラバーパッチ | WIZ','WIZで面ファスナーラバーパッチを注文。','t','交換可能な表示','{"アウトドアウェアと装備","ヨガウェア、水着、スポーツウェア","立体感が必要なブランド表現"}','{"柔軟な成形PVC・ラバー／シリコン構造","サイズ・形状・配色をカスタム"}','{"2Dまたは立体的な3D表現","マット、同系色、高コントラスト配色"}','{"フック裏面と対応ループ面"}','対応ループ面と仕上がり寸法をご確認ください。'),
  (gen_random_uuid(), 'b3333333-3333-4333-8333-333333333333','zh-CN','魔术贴橡胶标牌','适用于制服、战术装备、背包和模块化设备的可拆卸标牌。','带勾面背衬、可用于模块化装备的可拆卸橡胶标牌。','魔术贴橡胶标牌 | WIZ','在 WIZ 订购魔术贴橡胶标牌。','t','可替换标识','{"户外服装与装备","瑜伽服、泳衣与运动服","需要立体触感的品牌标识"}','{"柔韧模压 PVC/橡胶或硅胶结构","尺寸、形状和配色均可定制"}','{"2D 或立体 3D 浮雕","哑光、同色系或高对比配色"}','{"勾面背衬及配套毛面方案"}','请确认配套毛面系统和成品尺寸。'),
  -- earphone-hole-patches (耳机孔)
  (gen_random_uuid(), 'b4444444-4444-4444-8444-444444444444','en','Earphone Hole Patches','PVC/TPU earphone-hole patches that route and protect cables on backpacks and sports bags.','Cable-routing rubber patches for bags and sports gear.','Earphone Hole Patches | WIZ','Order earphone hole patches from WIZ.','t','Cable routing detail','{"Outdoor apparel and equipment","Yoga wear, swimwear, and sportswear","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber or silicone construction","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Sew-on cable port","Adhesive cable grommet"}','Share the bag substrate and target cable diameter so the port size and attachment can be confirmed.'),
  (gen_random_uuid(), 'b4444444-4444-4444-8444-444444444444','ja','イヤホン穴パッチ','バッグやスポーツバッグのケーブルを通し、保護するPVC/TPU製イヤホン穴パッチ。','バッグやスポーツギア向けのケーブルルーティングラバーパッチ。','イヤホン穴パッチ | WIZ','WIZでイヤホン穴パッチを注文。','t','ケーブル通し穴','{"アウトドアウェアと装備","ヨガウェア、水着、スポーツウェア","立体感が必要なブランド表現"}','{"柔軟な成形PVC・ラバー／シリコン構造","サイズ・形状・配色をカスタム"}','{"2Dまたは立体的な3D表現","マット、同系色、高コントラスト配色"}','{"縫い付けケーブル穴","粘着ケーブルガスケット"}','バッグの基材とケーブル径をご共有ください。'),
  (gen_random_uuid(), 'b4444444-4444-4444-8444-444444444444','zh-CN','耳机孔标牌','PVC/TPU 材质的耳机孔标牌，用于背包与运动包的线缆过孔与保护。','用于箱包与运动装备的线缆走线橡胶标牌。','耳机孔标牌 | WIZ','在 WIZ 订购耳机孔标牌。','t','线缆过孔细节','{"户外服装与装备","瑜伽服、泳衣与运动服","需要立体触感的品牌标识"}','{"柔韧模压 PVC/橡胶或硅胶结构","尺寸、形状和配色均可定制"}','{"2D 或立体 3D 浮雕","哑光、同色系或高对比配色"}','{"车缝式线缆过孔","背胶穿线孔"}','请提供箱包基材与目标线径，以便确认过孔尺寸与安装方式。'),
  -- keychains (钥匙扣)
  (gen_random_uuid(), 'b5555555-5555-4555-8555-555555555555','en','Custom PVC Keychains','Soft PVC or rubber 3D-relief keychains as promotional gifts and souvenirs, finished with a metal chain.','Molded PVC keychains with 3D relief and a metal chain.','Custom PVC Keychains | WIZ','Order custom PVC keychains from WIZ.','t','Promotional item','{"Outdoor apparel and equipment","Yoga wear, swimwear, and sportswear","Branding that needs tactile depth"}','{"Flexible molded PVC/rubber or silicone construction","Custom size, shape, and color layout"}','{"2D or dimensional 3D relief","Matte, tonal, or high-contrast color systems"}','{"Sew channels or sew-on edges","Hook-and-loop backing","Application-specific adhesive after testing"}','Send the intended use, dimensions, and substrate for feasibility review.'),
  (gen_random_uuid(), 'b5555555-5555-4555-8555-555555555555','ja','カスタムPVCキーホルダー','販促品やノベルティ向けのソフトPVC/ラバー製3D浮雕キーホルダー。メタルチェーン仕様。','3D浮雕とメタルチェーンの成形PVCキーホルダー。','カスタムPVCキーホルダー | WIZ','WIZでカスタムPVCキーホルダーを注文。','t','プロモーション品','{"アウトドアウェアと装備","ヨガウェア、水着、スポーツウェア","立体感が必要なブランド表現"}','{"柔軟な成形PVC・ラバー／シリコン構造","サイズ・形状・配色をカスタム"}','{"2Dまたは立体的な3D表現","マット、同系色、高コントラスト配色"}','{"縫製溝または縫い付け仕様","面ファスナー仕様","用途別テスト後の粘着仕様"}','用途、寸法、基材をご共有ください。'),
  (gen_random_uuid(), 'b5555555-5555-4555-8555-555555555555','zh-CN','定制 PVC 钥匙扣','软 PVC/橡胶 3D 浮雕钥匙扣，可作促销礼品与纪念品，配金属链。','模具 PVC 钥匙扣，3D 浮雕配金属链。','定制 PVC 钥匙扣 | WIZ','在 WIZ 订购定制 PVC 钥匙扣。','t','促销礼品','{"户外服装与装备","瑜伽服、泳衣与运动服","需要立体触感的品牌标识"}','{"柔韧模压 PVC/橡胶或硅胶结构","尺寸、形状和配色均可定制"}','{"2D 或立体 3D 浮雕","哑光、同色系或高对比配色"}','{"车缝槽或车缝边","魔术贴背面","经过应用测试的背胶方案"}','请提供功能、尺寸与基材，以便评估可行性。')
on conflict (id) do nothing;

-- ── Product ↔ Application links ────────────────────────
-- Kept in sync with src/features/catalog/fixtures.ts: the single join table
-- (read by supabase-catalog-repository for BOTH applicationSlugs and
-- recommendedProductSlugs) must equal the UNION of fixtures' two direction
-- graphs so the Supabase-backed catalog and the fixture catalog agree.
insert into public.product_applications (product_id, application_id) values
  -- heat-transfer-rubber-patches
  ('b1111111-1111-4111-8111-111111111111','c1111111-1111-4111-8111-111111111111'), -- outdoor-apparel
  ('b1111111-1111-4111-8111-111111111111','c2222222-2222-4222-8222-222222222222'), -- yoga-wear
  ('b1111111-1111-4111-8111-111111111111','c4444444-4444-4444-8444-444444444444'), -- backpacks-gear-bags
  ('b1111111-1111-4111-8111-111111111111','c6666666-6666-4666-8666-666666666666'), -- footwear
  ('b1111111-1111-4111-8111-111111111111','c7777777-7777-4777-8777-777777777777'), -- workwear
  -- custom-pvc-rubber-patches
  ('b2222222-2222-4222-8222-222222222222','c1111111-1111-4111-8111-111111111111'), -- outdoor-apparel
  ('b2222222-2222-4222-8222-222222222222','c2222222-2222-4222-8222-222222222222'), -- yoga-wear
  ('b2222222-2222-4222-8222-222222222222','c3333333-3333-4333-8333-333333333333'), -- surf-watersports
  ('b2222222-2222-4222-8222-222222222222','c4444444-4444-4444-8444-444444444444'), -- backpacks-gear-bags
  ('b2222222-2222-4222-8222-222222222222','c5555555-5555-4555-8555-555555555555'), -- tactical-uniforms
  ('b2222222-2222-4222-8222-222222222222','c7777777-7777-4777-8777-777777777777'), -- workwear
  ('b2222222-2222-4222-8222-222222222222','c8888888-8888-4888-8888-888888888888'), -- clubs-events
  ('b2222222-2222-4222-8222-222222222222','c9999999-9999-4999-8999-999999999999'), -- promotional-merchandise
  ('b2222222-2222-4222-8222-222222222222','caaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'), -- marine-equipment
  -- hook-and-loop-rubber-patches
  ('b3333333-3333-4333-8333-333333333333','c1111111-1111-4111-8111-111111111111'), -- outdoor-apparel
  ('b3333333-3333-4333-8333-333333333333','c4444444-4444-4444-8444-444444444444'), -- backpacks-gear-bags
  ('b3333333-3333-4333-8333-333333333333','c5555555-5555-4555-8555-555555555555'), -- tactical-uniforms
  ('b3333333-3333-4333-8333-333333333333','c8888888-8888-4888-8888-888888888888'), -- clubs-events
  -- earphone-hole-patches
  ('b4444444-4444-4444-8444-444444444444','c4444444-4444-4444-8444-444444444444'), -- backpacks-gear-bags
  ('b4444444-4444-4444-8444-444444444444','c6666666-6666-4666-8666-666666666666'), -- footwear
  -- keychains
  ('b5555555-5555-4555-8555-555555555555','c4444444-4444-4444-8444-444444444444'), -- backpacks-gear-bags
  ('b5555555-5555-4555-8555-555555555555','c8888888-8888-4888-8888-888888888888'), -- clubs-events
  ('b5555555-5555-4555-8555-555555555555','c9999999-9999-4999-8999-999999999999')  -- promotional-merchandise
on conflict do nothing;
