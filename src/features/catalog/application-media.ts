import type { Locale } from '@/i18n/locales'

type ApplicationMediaEntry = {
  src: string
  alt: Record<Locale, string>
  objectPosition: string
}

const mediaBySlug = {
  // ── Media keyed by application slug (matches fixtures.ts + seed.sql) ──
  'surf-watersports': {
    src: '/media/drafts/application-surf-watersports.jpg',
    alt: { en: 'Surfboard with custom rubber patch resting on a tropical beach at golden hour, surrounded by watersports gear', ja: 'ゴールデンアワーに熱帯のビーチに置かれたカスタムラバーパッチ付きのサーフボードとウォータースポーツギア', 'zh-CN': '带定制橡胶补丁的冲浪板在黄金时刻的热带沙滩上，周围环绕水上运动装备' },
    objectPosition: '50% 45%',
  },
  'outdoor-apparel': {
    src: '/media/drafts/application-outdoor-apparel.jpg',
    alt: { en: 'Hiker wearing outdoor jacket and cap adorned with custom PVC rubber patches against a mountain vista', ja: '山並みを背景にカスタムPVCラバーパッチをあしらったアウトドアジャケットとキャップを着用するハイカー', 'zh-CN': '身着带定制 PVC 橡胶补丁的户外夹克与帽子的徒步者，背景是壮丽山景' },
    objectPosition: '50% 45%',
  },
  'yoga-wear': {
    src: '/media/drafts/application-yoga-wear.jpg',
    alt: { en: 'Woman in olive green activewear practicing cobra pose on a yoga mat, with WIZ-branded water bottle and cork blocks nearby', ja: 'オリーブグリーンのアクティブウェアを着た女性がヨガマットの上でコブラポーズ、WIZブランドのウォーターボトルとコルクブロックが近くに', 'zh-CN': '身着橄榄绿运动服的女性在瑜伽垫上练习眼镜蛇式，身旁有 WIZ 品牌水壶与软木瑜伽砖' },
    objectPosition: '50% 45%',
  },
  'backpacks-gear-bags': {
    src: '/media/drafts/application-backpacks-gear-bags.png',
    alt: { en: 'Technical backpacks and gear bags prepared at a quiet trailhead', ja: '静かな登山口に準備されたテクニカルバックパックとギアバッグ', 'zh-CN': '安静登山口旁准备就绪的技术背包与装备包' },
    objectPosition: '50% 50%',
  },
  'tactical-uniforms': {
    src: '/media/drafts/application-tactical-uniforms.jpg',
    alt: { en: 'Tactical operator in full uniform with custom rubber patches on vest and sleeve, showcasing professional branding', ja: 'ベストと袖にカスタムラバーパッチをあしらったフルユニフォームの戦術オペレーター、プロフェッショナルなブランディングを披露', 'zh-CN': '身着全套制服的战术人员，背心与袖口佩戴定制橡胶补丁，展现专业品牌形象' },
    objectPosition: '50% 40%',
  },
  footwear: {
    src: '/media/drafts/application-footwear.png',
    alt: { en: 'Technical outdoor footwear showing flexible uppers and layered materials', ja: '柔軟なアッパーと積層素材を見せるテクニカルアウトドアシューズ', 'zh-CN': '展现柔性鞋面和多层材料的户外技术鞋履' },
    objectPosition: '50% 55%',
  },
  workwear: {
    src: '/media/drafts/application-workwear.jpg',
    alt: { en: 'Craftsman in rugged work jacket with custom rubber patch on the sleeve, set against a mountain ranch backdrop', ja: '山間の牧場を背景に、袖にカスタムラバーパッチをあしらったタフなワークジャケットを着用する職人', 'zh-CN': '身着带定制橡胶补丁的粗犷工装夹克的工匠，背景是山间牧场' },
    objectPosition: '50% 40%',
  },
  'clubs-events': {
    src: '/media/drafts/application-clubs-events.png',
    alt: { en: 'Unbranded outdoor club equipment arranged for a small gathering', ja: '小規模な集まりに向けて整えられた無地のアウトドアクラブ装備', 'zh-CN': '为小型聚会布置的无品牌户外俱乐部装备' },
    objectPosition: '50% 50%',
  },
  'promotional-merchandise': {
    src: '/media/drafts/application-promotional-merchandise.png',
    alt: { en: 'Refined collection of unbranded promotional accessories and packaging', ja: '洗練された無地のプロモーション小物とパッケージ', 'zh-CN': '精致陈列的无品牌促销配件与包装' },
    objectPosition: '50% 50%',
  },
  'marine-equipment': {
    src: '/media/drafts/application-marine-equipment.jpg',
    alt: { en: 'Angler in fishing vest with custom rubber patches, holding a rod on the open water with marine gear nearby', ja: 'カスタムラバーパッチ付きのフィッシングベストを着用し、水面でロッドを持つアングラー、周囲にマリンギア', 'zh-CN': '身着带定制橡胶补丁钓鱼背心的垂钓者在开阔水面上持竿，周围有海事装备' },
    objectPosition: '50% 40%',
  },
} satisfies Record<string, ApplicationMediaEntry>

/** Safe fallback when a slug has no dedicated media entry yet (e.g. stale DB). */
const FALLBACK_MEDIA: ApplicationMediaEntry = {
  src: '/media/drafts/application-placeholder.png',
  alt: {
    en: 'Application imagery coming soon',
    ja: 'Applications imagery coming soon',
    'zh-CN': 'Application imagery coming soon',
  },
  objectPosition: '50% 50%',
}

export function getApplicationMedia(slug: string, locale: Locale): ApplicationMediaEntry {
  return mediaBySlug[slug as keyof typeof mediaBySlug] ?? FALLBACK_MEDIA
}
