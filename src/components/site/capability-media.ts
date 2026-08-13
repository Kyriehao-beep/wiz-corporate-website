import { Factory, Palette, ScanLine, ShieldCheck, type LucideIcon } from 'lucide-react'

import type { Locale } from '@/i18n/locales'

type CapabilityId = 'factory' | 'experience' | 'color' | 'production'

export type CapabilityMedia = {
  id: CapabilityId
  index: string
  title: string
  description: string
  detail: string
  src: string
  alt: string
  objectPosition: string
  icon: LucideIcon
}

const copy = {
  en: {
    factory: ['Owned mainland factory', 'Direct manufacturing coordination keeps development decisions close to the production floor.', 'A clean, focused owned mainland factory for custom rubber patch production.', '7,000㎡ owned plant · lead time under control'],
    experience: ['8+ years related experience', 'Practical material and construction judgment built through more than eight years of related work.', 'Precision tooling and material samples representing more than eight years of rubber patch experience.', '8+ years deep in rubber patch craft'],
    color: ['AI-assisted color matching', 'Automatic color formulation supports experienced operators in refining repeatable color targets.', 'Automatic color matching equipment with pigments, optical measurement and material swatches.', 'Auto color match within ΔE < 1'],
    production: ['Sampling to repeat production', 'Sampling, confirmation and controlled handoff help preserve approved details in repeat production.', 'An organized inspection sequence connecting approved sampling and repeat production.', 'Sampling → mass production, consistency kept'],
  },
  ja: {
    factory: ['自社の中国工場', '開発判断を製造現場に近づけ、工場との調整を直接行います。', 'カスタムラバーパッチを生産する、清潔で専門的な自社中国工場。', '自社工場 7,000㎡・納期をコントロール'],
    experience: ['8年以上の関連経験', '8年以上の関連業務で培った、素材と構造に対する実践的な判断力。', '8年以上のラバーパッチ経験を表す精密金型と素材サンプル。', 'ラバーパッチ 8年以上の実績'],
    color: ['AI支援の自動色合わせ', '自動配色システムと熟練担当者の判断で、再現性のある色目標を調整します。', '顔料、光学測定、素材見本を備えた自動色合わせ設備。', '自動調色 ΔE < 1 の再現性'],
    production: ['サンプルから量産へ', '試作、確認、管理された引き継ぎにより、承認された細部を量産へつなげます。', '承認サンプルから継続生産へつなぐ、整理された検査工程。', '試作から量産、そのままの一致性'],
  },
  'zh-CN': {
    factory: ['自有内地工厂', '研发判断贴近生产现场，工厂协调更直接，项目响应更清晰。', '用于定制橡胶标牌生产的整洁、自有内地工厂。', '7,000㎡ 自有厂区 · 交期可控'],
    experience: ['八年以上相关经验', '以八年以上相关实践，判断材料、结构与应用环境之间的适配关系。', '体现八年以上橡胶标牌经验的精密模具与材料样品。', '八年以上橡胶标牌深耕'],
    color: ['AI 辅助自动调色', '自动配色系统配合熟练人员判断，帮助校准可重复的颜色目标。', '配有颜料、光学测量与材料色样的自动调色设备。', '自动调色 ΔE < 1 色差控制'],
    production: ['打样与量产衔接', '通过打样、确认与受控交接，让获批细节稳定进入重复生产。', '连接获批样品与重复生产的有序检验流程。', '打样到量产，一致性延续'],
  },
} as const

const definitions: Array<{ id: CapabilityId; src: string; objectPosition: string; icon: LucideIcon }> = [
  { id: 'factory', src: '/media/drafts/capability-owned-factory.png', objectPosition: '50% 50%', icon: Factory },
  { id: 'experience', src: '/media/drafts/capability-eight-years-experience.png', objectPosition: '50% 50%', icon: ShieldCheck },
  { id: 'color', src: '/media/drafts/capability-color-matching.png', objectPosition: '50% 50%', icon: Palette },
  { id: 'production', src: '/media/drafts/capability-sampling-production.png', objectPosition: '50% 50%', icon: ScanLine },
]

export function getCapabilityMedia(locale: Locale): CapabilityMedia[] {
  return definitions.map((definition, position) => {
    const [title, description, alt, detail] = copy[locale][definition.id]
    return { ...definition, index: String(position + 1).padStart(2, '0'), title, description, detail, alt }
  })
}
