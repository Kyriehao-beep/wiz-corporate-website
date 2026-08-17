import type { Locale } from '@/i18n/locales'

/** 可本地化的纯文本字段 */
export type Localized = Record<Locale, string>

/**
 * 公司联系方式（语言无关，全站三语共用同一组真实值）。
 * 来源：用户填写的《公司信息收集表》（output.docx）。
 */
export const companyContact = {
  /** 公司邮箱 / 销售邮箱 / 询盘接收邮箱（均为同一地址） */
  email: 'hao3832385@163.com',
  salesEmail: 'hao3832385@163.com',
  inquiryEmail: 'hao3832385@163.com',
  /** 电话 / WhatsApp / 微信（均为同一号码） */
  phone: '+86 18566182299',
  whatsapp: '+86 18566182299',
  wechat: '+86 18566182299',
  /** 香港注册地址 */
  hkAddress: 'Unit B32, 11/F., Wong King Industrial Building, No.2 Tai Yau Street, Kowloon, HK, 999077',
  /** 东莞工厂地址 */
  dgAddress: '广东省东莞市东坑镇角祥路151号1号楼602室',
  /** 阿里巴巴国际站 */
  alibaba: 'https://wizrubberpatch.en.alibaba.com',
} as const

/** 公司基本资料（含三语） */
export const companyProfile: {
  legalName: Localized
  brand: string
  foundedYear: string
  foundedDate: string
  nature: Localized
  hq: Localized
  factory: Localized
  tagline: Localized
  advantages: Localized[]
} = {
  legalName: {
    'zh-CN': '东莞市汇智礼品有限公司',
    en: 'Dongguan WIZ Electronic Gift Co., Limited',
    ja: '東莞匯智礼品有限公司',
  },
  brand: '汇智 / WIZ',
  foundedYear: '2018',
  foundedDate: '2018-11-12',
  nature: {
    'zh-CN': '香港公司 + 自有内地工厂',
    en: 'Hong Kong company with its own mainland China factory',
    ja: '香港法人と自社の中国工場',
  },
  hq: { 'zh-CN': '东莞', en: 'Dongguan', ja: '東莞' },
  factory: { 'zh-CN': '东莞', en: 'Dongguan', ja: '東莞' },
  tagline: {
    'zh-CN': '专业定制生产 PVC 软胶章、硅胶商标、橡胶标牌、服饰箱包滴胶配件等各类软胶礼品辅料。',
    en: 'Custom manufacturer of PVC soft-rubber patches, silicone labels, rubber badges, and garment & bag drip-molded accessories.',
    ja: 'PVCソフトラバーパッチ、シリコンラベル、ラバーバッジ、アパレル・バッグ用樹脂パーツなどのOEMメーカー。',
  },
  advantages: [
    {
      'zh-CN': '自有东莞生产工厂，从开模、打样到大货生产一站式服务，交期可控。',
      en: 'Own Dongguan factory offering one-stop service from tooling and sampling to mass production, with controllable lead times.',
      ja: '東莞自社工場により、金型・サンプルから量産まで一貫対応し、納期をコントロール可能。',
    },
    {
      'zh-CN': '10 余年软胶胶章定制经验，支持复杂 logo、多色立体浮雕效果，工艺成熟。',
      en: 'Over 10 years of soft-rubber patch customization, supporting complex logos and multi-color 3D embossed effects with mature craftsmanship.',
      ja: 'ソフトラバーパッチOEMで10年以上の実績があり、複雑なロゴや多色立体エンボスにも対応する成熟した技術。',
    },
    {
      'zh-CN': '可提供欧标环保材质，产品满足出口欧美检测标准，适配外贸订单。',
      en: 'Eco-friendly materials meeting European standards; products comply with EU/US export testing for overseas orders.',
      ja: '欧州基準の環境配慮素材を提供、製品は欧米輸出検査基準を満たし、輸出案件に対応。',
    },
    {
      'zh-CN': '香港 + 内地双运营主体，外贸接单便捷，可提供灵活的跨境结算服务。',
      en: 'Dual operating entities in Hong Kong and mainland China enable convenient export ordering and flexible cross-border settlement.',
      ja: '香港・中国本土の双拠点により、輸出受注が容易で柔軟なクロスボーダー決済が可能。',
    },
  ],
}

/** 产能与商务条款 */
export const companyProduction = {
  moq: '50 PCS',
  sampling: { 'zh-CN': '5 天', en: '5 days', ja: '5日' } as Localized,
  mass: { 'zh-CN': '7 天', en: '7 days', ja: '7日' } as Localized,
  markets: { 'zh-CN': '全球', en: 'Worldwide', ja: '全世界' } as Localized,
  paymentMethods: ['T/T', 'PayPal'],
  currencies: ['USD', 'CNY'],
}

/** 联系页文案（三语） */
export const contactIntro: {
  title: Localized
  lead: Localized
  labels: Record<Locale, {
    email: string
    sales: string
    phone: string
    whatsapp: string
    wechat: string
    hk: string
    dg: string
    alibaba: string
    cta: string
  }>
} = {
  title: { 'zh-CN': '联系我们', en: 'Contact us', ja: 'お問い合わせ' },
  lead: {
    'zh-CN': '可提供 PVC 软胶章、硅胶商标、橡胶标牌等定制开发支持，欢迎来函或来电咨询。',
    en: 'Custom PVC patches, silicone labels, and rubber badges — reach out by email or phone.',
    ja: 'PVCパッチ、シリコンラベル、ラバーバッジのOEM開発について、メール・お電話でお気軽に。',
  },
  labels: {
    'zh-CN': {
      email: '公司邮箱', sales: '销售邮箱', phone: '电话', whatsapp: 'WhatsApp',
      wechat: '微信', hk: '香港地址', dg: '东莞工厂地址', alibaba: '阿里巴巴国际站', cta: '填写询盘需求',
    },
    en: {
      email: 'Email', sales: 'Sales email', phone: 'Phone', whatsapp: 'WhatsApp',
      wechat: 'WeChat', hk: 'Hong Kong address', dg: 'Dongguan factory', alibaba: 'Alibaba', cta: 'Build your inquiry',
    },
    ja: {
      email: 'メール', sales: '営業メール', phone: '電話', whatsapp: 'WhatsApp',
      wechat: 'WeChat', hk: '香港住所', dg: '東莞工場住所', alibaba: 'Alibaba', cta: '問い合わせを作成',
    },
  },
}

/** 关于页文案（三语） */
export const aboutCopy: {
  heading: Localized
  body: Localized
} = {
  heading: {
    'zh-CN': '香港公司与自有内地工厂协同。',
    en: 'A Hong Kong company with its own mainland factory.',
    ja: '香港法人と自社の中国工場が連携。',
  },
  body: {
    'zh-CN': '东莞市汇智礼品有限公司（品牌：汇智 / WIZ）成立于 2018 年，是一家集研发、开模、打样与量产于一体的软胶礼品辅料制造企业。我们以自有东莞工厂为依托，为品牌与制造客户提供 PVC 软胶章、硅胶商标、橡胶标牌等定制开发支持。',
    en: 'Dongguan WIZ Electronic Gift Co., Limited (brand: 汇智 / WIZ), established in 2018, is a soft-rubber gift accessory manufacturer integrating R&D, tooling, sampling, and mass production. Backed by our owned Dongguan factory, we support brands and manufacturers with custom PVC patches, silicone labels, and rubber badges.',
    ja: '東莞匯智礼品有限公司（ブランド：匯智 / WIZ）は2018年設立、金型・サンプル・量産を一貫するソフトラバー雑貨メーカーです。自社の東莞工場を基盤に、ブランド・製造業向けにPVCパッチ、シリコンラベル、ラバーバッジのOEM開発を支援します。',
  },
}
