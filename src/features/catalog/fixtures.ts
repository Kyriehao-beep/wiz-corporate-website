import type { ApplicationDetail, LocalizedText, ProductDetail } from '@/features/catalog/types'
import type { Locale } from '@/i18n/locales'

const t = (en: string, ja: string, zhCN: string): LocalizedText => ({ en, ja, 'zh-CN': zhCN })

type ProductFixture = Omit<ProductDetail, 'name' | 'eyebrow' | 'description' | 'suitability' | 'construction' | 'visualOptions' | 'attachmentOptions' | 'artworkGuidance'> & {
  name: LocalizedText; eyebrow: LocalizedText; description: LocalizedText; suitability: LocalizedText[]; construction: LocalizedText[]; visualOptions: LocalizedText[]; attachmentOptions: LocalizedText[]; artworkGuidance: LocalizedText
}
type ApplicationFixture = Omit<ApplicationDetail, 'name' | 'description' | 'buyerProblem' | 'attachmentConsiderations' | 'visualDirection'> & {
  name: LocalizedText; description: LocalizedText; buyerProblem: LocalizedText; attachmentConsiderations: LocalizedText; visualDirection: LocalizedText
}

// Shared, scene-aligned editorial arrays. The Hong Kong AliExpress optimization
// doc (产品优化.xlsx) sets the vocabulary: Custom / 3D / Embossed / Silicone /
// PVC Rubber, with Yoga Wear, Swimwear, Sportswear, Outdoor as the headline
// scenes. Compliance red lines are preserved: Hook and Loop (not Velcro),
// no Military / Airforce / brand names / Factory Price.
const commonSuitability = [
  t('Outdoor apparel and equipment', 'アウトドアウェアと装備', '户外服装与装备'),
  t('Yoga wear, swimwear, and sportswear', 'ヨガウェア、水着、スポーツウェア', '瑜伽服、泳衣与运动服'),
  t('Branding that needs tactile depth', '立体感が必要なブランド表現', '需要立体触感的品牌标识'),
]
const commonConstruction = [
  t('Flexible molded PVC/rubber or silicone construction', '柔軟な成形PVC・ラバー／シリコン構造', '柔韧模压 PVC/橡胶或硅胶结构'),
  t('Custom size, shape, and color layout', 'サイズ・形状・配色をカスタム', '尺寸、形状和配色均可定制'),
]
const commonVisuals = [
  t('2D or dimensional 3D relief', '2Dまたは立体的な3D表現', '2D 或立体 3D 浮雕'),
  t('Matte, tonal, or high-contrast color systems', 'マット、同系色、高コントラスト配色', '哑光、同色系或高对比配色'),
]
const commonAttachments = [
  t('Sew channels or sew-on edges', '縫製溝または縫い付け仕様', '车缝槽或车缝边'),
  t('Hook-and-loop backing', '面ファスナー仕様', '魔术贴背面'),
  t('Application-specific adhesive after testing', '用途別テスト後の粘着仕様', '经过应用测试的背胶方案'),
]

// Product families, ordered by business priority from the optimization doc:
// 热熔胶 → 胶章 → 魔术贴 → 耳机孔 → 钥匙扣.
export const productFixtures: ProductFixture[] = [
  {
    slug: 'heat-transfer-rubber-patches', index: '01', tone: 'lime',
    name: t('Heat Transfer Silicone Labels', '熱転写シリコンラベル', '定制热转印硅胶标'),
    eyebrow: t('Core product', 'コア製品', '核心产品'),
    description: t(
      'A clean, low-profile heat-transfer direction built around soft 3D silicone relief — made for yoga wear, swimwear, and performance sportswear.',
      'やわらかな3Dシリコン浮雕を核とした薄型熱転写。ヨガウェア、水着、スポーツウェアに最適。',
      '以柔软 3D 硅胶浮雕为核心的轻薄热转印方案，专为瑜伽服、泳衣与运动服打造。',
    ),
    suitability: commonSuitability, construction: commonConstruction, visualOptions: commonVisuals,
    attachmentOptions: [t('Heat transfer to approved materials after testing', 'テスト済み素材への熱転写', '测试确认后热转印至适用面料')],
    artworkGuidance: t(
      'Share fabric composition and finishing details so transfer parameters can be evaluated.',
      '生地組成と仕上げ情報をご共有ください。',
      '请提供面料成分和后整理信息，以评估转印参数。',
    ),
    applicationSlugs: ['outdoor-apparel', 'yoga-wear', 'backpacks-gear-bags', 'footwear'],
  },
  {
    slug: 'custom-pvc-rubber-patches', index: '02', tone: 'sand',
    name: t('Custom PVC Rubber Patches', 'カスタムPVCラバーパッチ', '定制 PVC 橡胶标牌'),
    eyebrow: t('Core product', 'コア製品', '核心产品'),
    description: t(
      'Molded brand patches with precise color separation, fine relief, and attachment options for demanding use.',
      '精密な色分けと立体表現、用途別の取り付け仕様に対応する成形ブランドパッチ。',
      '通过精准分色、细腻浮雕和多种安装方式，满足严苛使用环境。',
    ),
    suitability: commonSuitability, construction: commonConstruction, visualOptions: commonVisuals, attachmentOptions: commonAttachments,
    artworkGuidance: t(
      'Vector artwork is preferred. We review line weight, relief depth, color separation, and production feasibility before sampling.',
      'ベクターデータを推奨。サンプル前に線幅、深さ、色分け、量産性を確認します。',
      '建议提供矢量文件。打样前会审核线宽、浮雕深度、分色和量产可行性。',
    ),
    applicationSlugs: ['outdoor-apparel', 'yoga-wear', 'backpacks-gear-bags', 'tactical-uniforms', 'promotional-merchandise'],
  },
  {
    slug: 'hook-and-loop-rubber-patches', index: '03', tone: 'forest',
    name: t('Hook-and-Loop Rubber Patches', '面ファスナーラバーパッチ', '魔术贴橡胶标牌'),
    eyebrow: t('Interchangeable identity', '交換可能な表示', '可替换标识'),
    description: t(
      'Removable rubber patches for uniforms, tactical gear, packs, and modular equipment.',
      'ユニフォーム、タクティカルギア、バッグ、モジュール装備向けの交換式パッチ。',
      '适用于制服、战术装备、背包和模块化设备的可拆卸标牌。',
    ),
    suitability: commonSuitability, construction: commonConstruction, visualOptions: commonVisuals,
    attachmentOptions: [t('Hook backing with matched loop panel options', 'フック裏面と対応ループ面', '勾面背衬及配套毛面方案')],
    artworkGuidance: t(
      'Confirm the mating loop system and finished patch dimensions.',
      '対応ループ面と仕上がり寸法をご確認ください。',
      '请确认配套毛面系统和成品尺寸。',
    ),
    applicationSlugs: ['tactical-uniforms', 'backpacks-gear-bags', 'outdoor-apparel', 'clubs-events'],
  },
  {
    slug: 'earphone-hole-patches', index: '04', tone: 'stone',
    name: t('Earphone Hole Patches', 'イヤホン穴パッチ', '耳机孔标牌'),
    eyebrow: t('Cable routing detail', 'ケーブル通し穴', '线缆过孔细节'),
    description: t(
      'PVC/TPU earphone-hole patches that route and protect cables on backpacks and sports bags.',
      'バッグやスポーツバッグのケーブルを通し、保護するPVC/TPU製イヤホン穴パッチ。',
      'PVC/TPU 材质的耳机孔标牌，用于背包与运动包的线缆过孔与保护。',
    ),
    suitability: commonSuitability, construction: commonConstruction, visualOptions: commonVisuals,
    attachmentOptions: [t('Sew-on cable port', '縫い付けケーブル穴', '车缝式线缆过孔'), t('Adhesive cable grommet', '粘着ケーブルガスケット', '背胶穿线孔')],
    artworkGuidance: t(
      'Share the bag substrate and target cable diameter so the port size and attachment can be confirmed.',
      'バッグの基材とケーブル径をご共有ください。',
      '请提供箱包基材与目标线径，以便确认过孔尺寸与安装方式。',
    ),
    applicationSlugs: ['backpacks-gear-bags', 'footwear'],
  },
  {
    slug: 'keychains', index: '05', tone: 'signal',
    name: t('Custom PVC Keychains', 'カスタムPVCキーホルダー', '定制 PVC 钥匙扣'),
    eyebrow: t('Promotional item', 'プロモーション品', '促销礼品'),
    description: t(
      'Soft PVC or rubber 3D-relief keychains as promotional gifts and souvenirs, finished with a metal chain.',
      '販促品やノベルティ向けのソフトPVC/ラバー製3D浮雕キーホルダー。メタルチェーン仕様。',
      '软 PVC/橡胶 3D 浮雕钥匙扣，可作促销礼品与纪念品，配金属链。',
    ),
    suitability: commonSuitability, construction: commonConstruction, visualOptions: commonVisuals, attachmentOptions: commonAttachments,
    artworkGuidance: t(
      'Send the intended use, dimensions, and substrate for feasibility review.',
      '用途、寸法、基材をご共有ください。',
      '请提供功能、尺寸与基材，以便评估可行性。',
    ),
    applicationSlugs: ['promotional-merchandise', 'clubs-events'],
  },
]

// Applications, ordered so Outdoor leads and Yoga Wear follows as the new #2
// scene. Yoga Wear is a sub-scenario of Sportswear but is presented as its own
// headline domain per the optimization doc.
export const applicationFixtures: ApplicationFixture[] = [
  ['outdoor-apparel', 'Outdoor Apparel', 'アウトドアウェア', '户外服装', true, 'Branding must flex with garments while retaining color and tactile identity.', '衣料に追従しながら色と立体感を維持する必要があります。', '标识需随服装弯曲，同时保持色彩和立体识别。', ['custom-pvc-rubber-patches', 'heat-transfer-rubber-patches', 'hook-and-loop-rubber-patches'], 'Choose sewing, heat transfer, or hook-and-loop after fabric and finishing tests.', '生地と仕上げテスト後に縫製、熱転写、面ファスナーを選定します。', '根据面料及后整理测试选择车缝、热转印或魔术贴。'],
  ['yoga-wear', 'Yoga & Activewear', 'ヨガ＆アクティブウェア', '瑜伽运动', true, 'Soft, low-profile branding that moves with the body and survives repeated wash and stretch.', '体の動きに追従し、繰り返す洗濯と伸縮に耐えるやわらかな薄型表現。', '柔软轻薄的标识随身体伸展，并耐受反复洗涤与拉伸。', ['heat-transfer-rubber-patches', 'custom-pvc-rubber-patches'], 'Heat transfer and side-seam labels suit stretch fabrics; validate before sampling.', '熱転写と側縫いラベルが伸縮素材に適し、サンプル前に検証します。', '热转印与侧缝标适配弹力面料，打样前需验证。'],
  ['surf-watersports', 'Surf & Watersports', 'サーフ＆ウォータースポーツ', '冲浪与水上运动', true, 'Water, salt, UV, and repeated handling call for clear branding built around the actual substrate.', '水、塩分、紫外線、繰り返し使用に合わせた素材別設計。', '面对水、盐分、紫外线和反复使用，需要围绕实际基材设计标识。', ['custom-pvc-rubber-patches'], 'Direct board attachment depends on substrate and adhesive testing. These rubber patches are not EVA traction pads.', 'ボードへの直接貼付は基材と接着テスト次第です。本製品はEVAデッキパッドではありません。', '直接贴附冲浪板取决于基材和胶粘测试；本产品并非 EVA 防滑垫。'],
  ['backpacks-gear-bags', 'Backpacks & Gear Bags', 'バックパック＆ギアバッグ', '背包与装备包', false, 'High-touch gear needs robust identity elements that integrate with layered construction.', '使用頻度の高いギアには多層構造に合う堅牢な表示が必要です。', '高频使用装备需要能融入多层结构的耐用标识。', ['custom-pvc-rubber-patches', 'hook-and-loop-rubber-patches', 'earphone-hole-patches', 'keychains'], 'Sew-on and hook-and-loop options suit different bag constructions; earphone-hole patches route cables cleanly.', 'バッグ構造に応じて縫製と面ファスナーを選択。イヤホン穴パッチでケーブルを整えます。', '不同箱包结构可选择车缝或魔术贴；耳机孔标牌让线缆走线更整洁。'],
  ['tactical-uniforms', 'Tactical & Uniforms', 'タクティカル＆ユニフォーム', '战术装备与制服', false, 'Fast identification and interchangeable markings need disciplined dimensions and contrast.', '迅速な識別と交換表示には寸法とコントラスト管理が必要です。', '快速识别和可替换标识需要严格控制尺寸与对比度。', ['hook-and-loop-rubber-patches', 'custom-pvc-rubber-patches'], 'Confirm the receiving loop field and uniform rules.', '受け側ループ面とユニフォーム規定をご確認ください。', '请确认配套毛面区域和制服规范。'],
  ['footwear', 'Footwear', 'フットウェア', '鞋履', false, 'Curved, flexing components require controlled thickness and attachment validation.', '曲面と屈曲には厚み管理と取り付け検証が必要です。', '曲面和弯折部位需要控制厚度并验证安装方式。', ['heat-transfer-rubber-patches', 'earphone-hole-patches'], 'Attachment depends on upper material and flex zone.', 'アッパー素材と屈曲位置に合わせて選定します。', '安装方式取决于鞋面材料和弯折区域。'],
  ['workwear', 'Workwear', 'ワークウェア', '工装', false, 'Daily wear needs legible, repeatable identity and reliable garment integration.', '日常使用に耐える視認性と安定した衣料組み込みが必要です。', '日常穿着需要清晰、稳定且可靠融入服装的标识。', ['custom-pvc-rubber-patches', 'heat-transfer-rubber-patches'], 'Review wash conditions and fabric treatment.', '洗濯条件と生地加工をご共有ください。', '需评估洗涤条件和面料处理方式。'],
  ['clubs-events', 'Clubs & Events', 'クラブ＆イベント', '俱乐部与活动', false, 'Distinctive limited programs need clear artwork and practical production choices.', '限定企画には明確なデザインと現実的な生産選択が必要です。', '限量项目需要清晰设计和切实可行的生产选择。', ['custom-pvc-rubber-patches', 'hook-and-loop-rubber-patches', 'keychains'], 'Select attachment by how recipients will use the patch.', '受け手の使用方法に合わせて仕様を選びます。', '根据领取者的使用方式选择安装方案。'],
  ['promotional-merchandise', 'Promotional Merchandise', 'プロモーショングッズ', '促销周边', false, 'Campaign pieces need recognisable brand detail without overcomplicated construction.', 'キャンペーン品には過度に複雑でない明確なブランド表現が必要です。', '活动周边需要清晰的品牌细节，同时避免过度复杂的结构。', ['keychains', 'custom-pvc-rubber-patches'], 'Match format to distribution, handling, and packaging.', '配布、使用、包装方法に合わせて形式を選びます。', '根据发放、使用和包装方式选择形式。'],
  ['marine-equipment', 'Marine Equipment', 'マリン装備', '海事装备', false, 'Wet, exposed equipment demands substrate-specific evaluation and conservative claims.', '湿潤・露出環境では基材別評価と慎重な表現が必要です。', '潮湿暴露环境需要针对基材评估，并保持审慎承诺。', ['custom-pvc-rubber-patches'], 'Validate attachment and exposure conditions on the actual equipment.', '実機で取り付けと暴露条件を検証してください。', '需在实际装备上验证安装方式和暴露条件。'],
].map(([slug, en, ja, zh, priority, problemEn, problemJa, problemZh, products, attachEn, attachJa, attachZh], index) => ({
  slug: slug as string, name: t(en as string, ja as string, zh as string), description: t(problemEn as string, problemJa as string, problemZh as string), priority: priority as boolean, index: String(index + 1).padStart(2, '0'), tone: ['ocean', 'forest', 'stone', 'sand', 'lime', 'signal', 'forest', 'stone', 'sand', 'ocean'][index % 10], buyerProblem: t(problemEn as string, problemJa as string, problemZh as string), recommendedProductSlugs: products as string[], attachmentConsiderations: t(attachEn as string, attachJa as string, attachZh as string), visualDirection: t('AI draft imagery shows the use environment without implying a named customer.', 'AIドラフト画像は特定顧客を示さず使用環境を表現します。', 'AI 草图展示使用环境，不指向任何具体客户。'),
}))

export function localizeProduct(product: ProductFixture, locale: Locale): ProductDetail {
  return { ...product, name: product.name[locale], eyebrow: product.eyebrow[locale], description: product.description[locale], suitability: product.suitability.map((item) => item[locale]), construction: product.construction.map((item) => item[locale]), visualOptions: product.visualOptions.map((item) => item[locale]), attachmentOptions: product.attachmentOptions.map((item) => item[locale]), artworkGuidance: product.artworkGuidance[locale] }
}
export function localizeApplication(item: ApplicationFixture, locale: Locale): ApplicationDetail {
  return { ...item, name: item.name[locale], description: item.description[locale], buyerProblem: item.buyerProblem[locale], attachmentConsiderations: item.attachmentConsiderations[locale], visualDirection: item.visualDirection[locale] }
}
