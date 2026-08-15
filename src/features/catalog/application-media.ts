import type { Locale } from '@/i18n/locales'

type ApplicationMediaEntry = {
  src: string
  alt: Record<Locale, string>
  objectPosition: string
}

const mediaBySlug = {
  // ── Media keyed by application slug (matches fixtures.ts + seed.sql) ──
  'surf-watersports': {
    src: '/media/drafts/application-surf-watersports.png',
    alt: { en: 'Technical watersports gear beside a surfboard on a rugged shore', ja: '岩場の海岸に置かれたサーフボードとウォータースポーツギア', 'zh-CN': '礁石海岸旁的冲浪板与水上运动装备' },
    objectPosition: '50% 50%',
  },
  'outdoor-apparel': {
    src: '/media/drafts/application-outdoor-apparel.png',
    alt: { en: 'Layered technical outdoor apparel arranged in a misty forest setting', ja: '霧の森に置かれたレイヤード仕様のアウトドアウェア', 'zh-CN': '薄雾森林环境中的多层户外技术服装' },
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
    src: '/media/drafts/application-tactical-uniforms.png',
    alt: { en: 'Modular field pack and uniform textiles in a controlled equipment setting', ja: '整然とした装備環境に置かれたモジュール式パックとユニフォーム生地', 'zh-CN': '整洁装备环境中的模块化背包与制服面料' },
    objectPosition: '50% 48%',
  },
  footwear: {
    src: '/media/drafts/application-footwear.png',
    alt: { en: 'Technical outdoor footwear showing flexible uppers and layered materials', ja: '柔軟なアッパーと積層素材を見せるテクニカルアウトドアシューズ', 'zh-CN': '展现柔性鞋面和多层材料的户外技术鞋履' },
    objectPosition: '50% 55%',
  },
  workwear: {
    src: '/media/drafts/application-workwear.png',
    alt: { en: 'Durable work jacket in a clean and organized workshop environment', ja: '清潔で整頓された作業環境に置かれた耐久ワークジャケット', 'zh-CN': '整洁有序工作环境中的耐用工装夹克' },
    objectPosition: '50% 45%',
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
    src: '/media/drafts/application-marine-equipment.png',
    alt: { en: 'Marine dry bag, rope, and technical hardware on a clean boat deck', ja: '清潔なボートデッキに置かれたマリンドライバッグ、ロープ、金具', 'zh-CN': '整洁船面上的海事防水包、绳索与技术五金' },
    objectPosition: '50% 52%',
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
