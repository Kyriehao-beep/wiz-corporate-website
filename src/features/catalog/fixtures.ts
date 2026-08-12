import type { ApplicationDetail, LocalizedText, ProductDetail } from '@/features/catalog/types'
import type { Locale } from '@/i18n/locales'

const t = (en: string, ja: string, zhCN: string): LocalizedText => ({ en, ja, 'zh-CN': zhCN })

type ProductFixture = Omit<ProductDetail, 'name' | 'eyebrow' | 'description' | 'suitability' | 'construction' | 'visualOptions' | 'attachmentOptions' | 'artworkGuidance'> & {
  name: LocalizedText; eyebrow: LocalizedText; description: LocalizedText; suitability: LocalizedText[]; construction: LocalizedText[]; visualOptions: LocalizedText[]; attachmentOptions: LocalizedText[]; artworkGuidance: LocalizedText
}
type ApplicationFixture = Omit<ApplicationDetail, 'name' | 'description' | 'buyerProblem' | 'attachmentConsiderations' | 'visualDirection'> & {
  name: LocalizedText; description: LocalizedText; buyerProblem: LocalizedText; attachmentConsiderations: LocalizedText; visualDirection: LocalizedText
}

const commonSuitability = [t('Outdoor apparel and equipment', 'アウトドアウェアと装備', '户外服装与装备'), t('Branding that needs tactile depth', '立体感が必要なブランド表現', '需要立体触感的品牌标识')]
const commonConstruction = [t('Flexible molded PVC/rubber construction', '柔軟な成形PVC・ラバー構造', '柔韧模压 PVC/橡胶结构'), t('Custom size, shape, and color layout', 'サイズ・形状・配色をカスタム', '尺寸、形状和配色均可定制')]
const commonVisuals = [t('2D or dimensional 3D relief', '2Dまたは立体的な3D表現', '2D 或立体 3D 浮雕'), t('Matte, tonal, or high-contrast color systems', 'マット、同系色、高コントラスト配色', '哑光、同色系或高对比配色')]
const commonAttachments = [t('Sew channels or sew-on edges', '縫製溝または縫い付け仕様', '车缝槽或车缝边'), t('Hook-and-loop backing', '面ファスナー仕様', '魔术贴背面'), t('Application-specific adhesive after testing', '用途別テスト後の粘着仕様', '经过应用测试的背胶方案')]

export const productFixtures: ProductFixture[] = [
  {
    slug: 'custom-pvc-rubber-patches', index: '01', tone: 'lime',
    name: t('Custom PVC Rubber Patches', 'カスタムPVCラバーパッチ', '定制 PVC 橡胶标牌'),
    eyebrow: t('Core product', 'コア製品', '核心产品'),
    description: t('Molded brand patches with precise color separation, fine relief, and attachment options for demanding use.', '精密な色分けと立体表現、用途別の取り付け仕様に対応する成形ブランドパッチ。', '通过精准分色、细腻浮雕和多种安装方式，满足严苛使用环境。'),
    suitability: commonSuitability, construction: commonConstruction, visualOptions: commonVisuals, attachmentOptions: commonAttachments,
    artworkGuidance: t('Vector artwork is preferred. We review line weight, relief depth, color separation, and production feasibility before sampling.', 'ベクターデータを推奨。サンプル前に線幅、深さ、色分け、量産性を確認します。', '建议提供矢量文件。打样前会审核线宽、浮雕深度、分色和量产可行性。'),
    applicationSlugs: ['surf-watersports', 'outdoor-apparel', 'backpacks-gear-bags', 'tactical-uniforms'],
  },
  {
    slug: 'heat-transfer-rubber-patches', index: '02', tone: 'sand',
    name: t('Heat Transfer Rubber Patches', '熱転写ラバーパッチ', '热转印橡胶标牌'), eyebrow: t('Low-profile application', '薄型仕様', '轻薄应用'),
    description: t('A clean, low-profile patch direction for compatible textiles and controlled heat-transfer workflows.', '対応素材と管理された熱転写工程向けの、すっきりした薄型パッチ。', '适用于兼容面料和受控热转印流程的轻薄标牌方案。'),
    suitability: commonSuitability, construction: commonConstruction, visualOptions: commonVisuals, attachmentOptions: [t('Heat transfer to approved materials after testing', 'テスト済み素材への熱転写', '测试确认后热转印至适用面料')], artworkGuidance: t('Share fabric composition and finishing details so transfer parameters can be evaluated.', '生地組成と仕上げ情報をご共有ください。', '请提供面料成分和后整理信息，以评估转印参数。'), applicationSlugs: ['outdoor-apparel', 'footwear', 'workwear'],
  },
  {
    slug: 'sew-on-rubber-patches-labels', index: '03', tone: 'stone',
    name: t('Sew-On Rubber Patches & Labels', '縫い付けラバーパッチ＆ラベル', '车缝橡胶标牌与标签'), eyebrow: t('Reliable construction', '安定した縫製仕様', '可靠结构'),
    description: t('Designed with sewing channels and edge geometry for dependable integration into garments and bags.', '衣料やバッグに安定して組み込める縫製溝とエッジ形状。', '通过车缝槽和边缘结构，可靠应用于服装与箱包。'),
    suitability: commonSuitability, construction: commonConstruction, visualOptions: commonVisuals, attachmentOptions: [t('Perimeter sew channel', '外周縫製溝', '周边车缝槽'), t('Concealed sew points', '隠し縫製ポイント', '隐藏车缝点')], artworkGuidance: t('Allow sufficient edge width for sewing and communicate the target stitch method.', '縫製幅を確保し、予定のステッチ方法をご指定ください。', '需预留足够车缝边宽，并说明计划采用的针法。'), applicationSlugs: ['outdoor-apparel', 'backpacks-gear-bags', 'workwear'],
  },
  {
    slug: 'hook-and-loop-rubber-patches', index: '04', tone: 'forest',
    name: t('Hook-and-Loop Rubber Patches', '面ファスナーラバーパッチ', '魔术贴橡胶标牌'), eyebrow: t('Interchangeable identity', '交換可能な表示', '可替换标识'),
    description: t('Removable rubber patches for uniforms, tactical gear, packs, and modular equipment.', 'ユニフォーム、タクティカルギア、バッグ、モジュール装備向けの交換式パッチ。', '适用于制服、战术装备、背包和模块化设备的可拆卸标牌。'),
    suitability: commonSuitability, construction: commonConstruction, visualOptions: commonVisuals, attachmentOptions: [t('Hook backing with matched loop panel options', 'フック裏面と対応ループ面', '勾面背衬及配套毛面方案')], artworkGuidance: t('Confirm the mating loop system and finished patch dimensions.', '対応ループ面と仕上がり寸法をご確認ください。', '请确认配套毛面系统和成品尺寸。'), applicationSlugs: ['tactical-uniforms', 'backpacks-gear-bags', 'clubs-events'],
  },
  {
    slug: 'specialty-products', index: '05', tone: 'signal',
    name: t('Specialty Rubber Products', '特殊ラバー製品', '特色橡胶制品'), eyebrow: t('Beyond the standard patch', '標準パッチを超えて', '超越标准标牌'),
    description: t('Flexible development for zipper pulls, molded labels, key accessories, and brand-specific rubber components.', 'ジッパープル、成形ラベル、キーパーツなどブランド専用部品の柔軟な開発。', '灵活开发拉链头、模压标签、钥匙配件和品牌专属橡胶部件。'),
    suitability: commonSuitability, construction: commonConstruction, visualOptions: commonVisuals, attachmentOptions: commonAttachments, artworkGuidance: t('Send the intended function, dimensions, substrate, and use environment for feasibility review.', '用途、寸法、基材、使用環境をご共有ください。', '请提供功能、尺寸、基材和使用环境，以便评估可行性。'), applicationSlugs: ['backpacks-gear-bags', 'footwear', 'promotional-merchandise'],
  },
]

export const applicationFixtures: ApplicationFixture[] = [
  ['surf-watersports', 'Surf & Watersports', 'サーフ＆ウォータースポーツ', '冲浪与水上运动', true, 'Water, salt, UV, and repeated handling call for clear branding built around the actual substrate.', '水、塩分、紫外線、繰り返し使用に合わせた素材別設計。', '面对水、盐分、紫外线和反复使用，需要围绕实际基材设计标识。', ['custom-pvc-rubber-patches'], 'Direct board attachment depends on substrate and adhesive testing. These rubber patches are not EVA traction pads.', 'ボードへの直接貼付は基材と接着テスト次第です。本製品はEVAデッキパッドではありません。', '直接贴附冲浪板取决于基材和胶粘测试；本产品并非 EVA 防滑垫。'],
  ['outdoor-apparel', 'Outdoor Apparel', 'アウトドアウェア', '户外服装', true, 'Branding must flex with garments while retaining color and tactile identity.', '衣料に追従しながら色と立体感を維持する必要があります。', '标识需随服装弯曲，同时保持色彩和立体识别。', ['custom-pvc-rubber-patches', 'heat-transfer-rubber-patches', 'sew-on-rubber-patches-labels'], 'Choose sewing or heat transfer after fabric and finishing tests.', '生地と仕上げテスト後に縫製または熱転写を選定します。', '根据面料及后整理测试选择车缝或热转印。'],
  ['backpacks-gear-bags', 'Backpacks & Gear Bags', 'バックパック＆ギアバッグ', '背包与装备包', true, 'High-touch gear needs robust identity elements that integrate with layered construction.', '使用頻度の高いギアには多層構造に合う堅牢な表示が必要です。', '高频使用装备需要能融入多层结构的耐用标识。', ['custom-pvc-rubber-patches', 'sew-on-rubber-patches-labels', 'hook-and-loop-rubber-patches', 'specialty-products'], 'Sew-on and hook-and-loop options suit different bag constructions.', 'バッグ構造に応じて縫製と面ファスナーを選びます。', '不同箱包结构可选择车缝或魔术贴方案。'],
  ['tactical-uniforms', 'Tactical & Uniforms', 'タクティカル＆ユニフォーム', '战术装备与制服', false, 'Fast identification and interchangeable markings need disciplined dimensions and contrast.', '迅速な識別と交換表示には寸法とコントラスト管理が必要です。', '快速识别和可替换标识需要严格控制尺寸与对比度。', ['hook-and-loop-rubber-patches', 'custom-pvc-rubber-patches'], 'Confirm the receiving loop field and uniform rules.', '受け側ループ面とユニフォーム規定をご確認ください。', '请确认配套毛面区域和制服规范。'],
  ['footwear', 'Footwear', 'フットウェア', '鞋履', false, 'Curved, flexing components require controlled thickness and attachment validation.', '曲面と屈曲には厚み管理と取り付け検証が必要です。', '曲面和弯折部位需要控制厚度并验证安装方式。', ['heat-transfer-rubber-patches', 'specialty-products'], 'Attachment depends on upper material and flex zone.', 'アッパー素材と屈曲位置に合わせて選定します。', '安装方式取决于鞋面材料和弯折区域。'],
  ['workwear', 'Workwear', 'ワークウェア', '工装', false, 'Daily wear needs legible, repeatable identity and reliable garment integration.', '日常使用に耐える視認性と安定した衣料組み込みが必要です。', '日常穿着需要清晰、稳定且可靠融入服装的标识。', ['sew-on-rubber-patches-labels', 'heat-transfer-rubber-patches'], 'Review wash conditions and fabric treatment.', '洗濯条件と生地加工をご共有ください。', '需评估洗涤条件和面料处理方式。'],
  ['clubs-events', 'Clubs & Events', 'クラブ＆イベント', '俱乐部与活动', false, 'Distinctive limited programs need clear artwork and practical production choices.', '限定企画には明確なデザインと現実的な生産選択が必要です。', '限量项目需要清晰设计和切实可行的生产选择。', ['custom-pvc-rubber-patches', 'hook-and-loop-rubber-patches'], 'Select attachment by how recipients will use the patch.', '受け手の使用方法に合わせて仕様を選びます。', '根据领取者的使用方式选择安装方案。'],
  ['promotional-merchandise', 'Promotional Merchandise', 'プロモーショングッズ', '促销周边', false, 'Campaign pieces need recognisable brand detail without overcomplicated construction.', 'キャンペーン品には過度に複雑でない明確なブランド表現が必要です。', '活动周边需要清晰的品牌细节，同时避免过度复杂的结构。', ['specialty-products', 'custom-pvc-rubber-patches'], 'Match format to distribution, handling, and packaging.', '配布、使用、包装方法に合わせて形式を選びます。', '根据发放、使用和包装方式选择形式。'],
  ['marine-equipment', 'Marine Equipment', 'マリン装備', '海事装备', false, 'Wet, exposed equipment demands substrate-specific evaluation and conservative claims.', '湿潤・露出環境では基材別評価と慎重な表現が必要です。', '潮湿暴露环境需要针对基材评估，并保持审慎承诺。', ['custom-pvc-rubber-patches', 'specialty-products'], 'Validate attachment and exposure conditions on the actual equipment.', '実機で取り付けと暴露条件を検証してください。', '需在实际装备上验证安装方式和暴露条件。'],
].map(([slug, en, ja, zh, priority, problemEn, problemJa, problemZh, products, attachEn, attachJa, attachZh], index) => ({
  slug: slug as string, name: t(en as string, ja as string, zh as string), description: t(problemEn as string, problemJa as string, problemZh as string), priority: priority as boolean, index: String(index + 1).padStart(2, '0'), tone: ['ocean', 'forest', 'stone', 'sand'][index % 4], buyerProblem: t(problemEn as string, problemJa as string, problemZh as string), recommendedProductSlugs: products as string[], attachmentConsiderations: t(attachEn as string, attachJa as string, attachZh as string), visualDirection: t('AI draft imagery shows the use environment without implying a named customer.', 'AIドラフト画像は特定顧客を示さず使用環境を表現します。', 'AI 草图展示使用环境，不指向任何具体客户。')
}))

export function localizeProduct(product: ProductFixture, locale: Locale): ProductDetail {
  return { ...product, name: product.name[locale], eyebrow: product.eyebrow[locale], description: product.description[locale], suitability: product.suitability.map((item) => item[locale]), construction: product.construction.map((item) => item[locale]), visualOptions: product.visualOptions.map((item) => item[locale]), attachmentOptions: product.attachmentOptions.map((item) => item[locale]), artworkGuidance: product.artworkGuidance[locale] }
}
export function localizeApplication(item: ApplicationFixture, locale: Locale): ApplicationDetail {
  return { ...item, name: item.name[locale], description: item.description[locale], buyerProblem: item.buyerProblem[locale], attachmentConsiderations: item.attachmentConsiderations[locale], visualDirection: item.visualDirection[locale] }
}
