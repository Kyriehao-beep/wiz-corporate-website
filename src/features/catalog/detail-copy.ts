import type { Locale } from '@/i18n/locales'

const copy = {
  en: {
    productLabel: 'Product detail', suitable: 'Where it fits', construction: 'Construction direction', visual: 'Visual options', attachment: 'Attachment options', artwork: 'Artwork guidance', choice: '2D or 3D — choose the depth that serves the artwork.', flat: '2D', flatText: 'Clear stepped color areas for crisp icons, lettering, and efficient production.', relief: '3D', reliefText: 'Sculpted relief for softer transitions and more dimensional brand character.', start: 'Start your custom patch', related: 'Related use environments', applicationLabel: 'Application detail', problem: 'The buyer problem', consideration: 'Attachment considerations', recommended: 'Recommended starting products', caveat: 'Application note', back: 'View all applications', products: 'View all products',
  },
  ja: {
    productLabel: '製品詳細', suitable: '適した用途', construction: '構造の方向性', visual: '表現オプション', attachment: '取り付け方法', artwork: '入稿ガイド', choice: '2Dか3Dか — デザインに必要な奥行きを選ぶ。', flat: '2D', flatText: '明確な段差と色面で、アイコンや文字をシャープに表現。', relief: '3D', reliefText: 'なめらかなレリーフで、より立体的なブランド表現を実現。', start: 'カスタムパッチを相談する', related: '関連する使用環境', applicationLabel: '用途詳細', problem: 'バイヤーの課題', consideration: '取り付けの検討事項', recommended: '推奨する製品', caveat: '用途上の注意', back: '用途一覧を見る', products: '製品一覧を見る',
  },
  'zh-CN': {
    productLabel: '产品详情', suitable: '适用场景', construction: '结构方向', visual: '视觉选项', attachment: '安装方式', artwork: '设计稿指引', choice: '2D 还是 3D —— 让立体深度服务于设计。', flat: '2D', flatText: '以清晰的分层色块呈现图标与文字，利于稳定生产。', relief: '3D', reliefText: '通过柔和的立体浮雕，塑造更有层次的品牌特征。', start: '开始定制橡胶标牌', related: '相关使用场景', applicationLabel: '场景详情', problem: '采购方问题', consideration: '安装注意事项', recommended: '建议起步产品', caveat: '应用说明', back: '查看全部场景', products: '查看全部产品',
  },
} as const

export function detailCopy(locale: Locale) { return copy[locale] }
