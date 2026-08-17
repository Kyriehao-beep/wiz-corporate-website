import { ArrowRight, Check } from 'lucide-react'

import { CapabilityCard } from '@/components/site/capability-card'
import { getCapabilityMedia } from '@/components/site/capability-media'
import { ColorMatchingStory } from '@/components/site/color-matching-story'
import { Button, ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import type { Locale } from '@/i18n/locales'
import { RfqWizard } from '@/components/rfq/rfq-wizard'
import {
  aboutCopy,
  companyContact,
  companyProfile,
  contactIntro,
} from '@/features/company/company-info'

const text = {
  en: { process: 'From artwork to a production-ready patch.', processLead: 'A focused workflow that resolves construction risks before repeat production.', steps: ['Artwork review', 'Structure & attachment proposal', 'Color matching', 'Sampling & confirmation', 'Controlled production'], capabilities: 'Small and focused. Built to solve detailed patch work.', rfq: 'Brief your custom patch.', draft: 'Front-end preview only — backend connection follows in the inquiry phase.', legal: 'Draft for company review before publication.', privacy: 'Privacy notice', terms: 'Website terms', submit: 'Save inquiry draft', fields: ['Name', 'Company', 'Work email', 'Target market', 'Product interest', 'Application', 'Estimated quantity', 'Project details'] },
  ja: { process: 'デザインから量産可能なパッチへ。', processLead: '量産前に構造上のリスクを整理する、明確な工程です。', steps: ['デザイン確認', '構造・取り付け提案', '色合わせ', 'サンプル確認', '管理された量産'], capabilities: '小規模で専門的。細かなパッチ開発に集中。', rfq: 'カスタムパッチの要件を共有。', draft: 'フロントエンドのプレビューです。問い合わせバックエンドは次段階で接続します。', legal: '公開前の会社確認用ドラフトです。', privacy: 'プライバシー通知', terms: 'サイト利用規約', submit: '問い合わせ下書きを保存', fields: ['氏名', '会社名', '業務用メール', '対象市場', '製品', '用途', '予定数量', 'プロジェクト詳細'] },
  'zh-CN': { process: '从设计稿到可量产的橡胶标牌。', processLead: '在重复生产前解决结构风险的清晰流程。', steps: ['设计稿审核', '结构与安装建议', '自动辅助调色', '打样确认', '受控量产'], capabilities: '小而精，专注解决细节型橡胶标牌项目。', rfq: '说明您的橡胶标牌需求。', draft: '当前为前端预览，询盘后端将在下一阶段连接。', legal: '当前为企业发布前审核草稿。', privacy: '隐私说明', terms: '网站条款', submit: '保存询盘草稿', fields: ['姓名', '公司', '工作邮箱', '目标市场', '产品意向', '应用场景', '预计数量', '项目详情'] },
} as const

function PageHero({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) { return <section className="support-hero"><Container><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{lead ? <p className="page-lead">{lead}</p> : null}</Container></section> }

export function ProcessPage({ locale }: { locale: Locale }) { const t = text[locale]; return <main id="main-content"><PageHero eyebrow="WIZ / 01—05" title={t.process} lead={t.processLead}/><section className="content-section"><Container><ol className="process-list">{t.steps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, '0')}</span><h2>{step}</h2><Check aria-hidden="true"/></li>)}</ol></Container></section><ColorMatchingStory/></main> }

export function CapabilitiesPage({ locale }: { locale: Locale }) { const t = text[locale]; return <main id="main-content"><PageHero eyebrow="Capabilities" title={t.capabilities}/><section id="capabilities" className="content-section"><Container className="capability-cards">{getCapabilityMedia(locale).map((capability) => <CapabilityCard capability={capability} key={capability.id}/>)}</Container></section></main> }

export function AboutPage({ locale }: { locale: Locale }) {
  const p = companyProfile
  return (
    <main id="main-content">
      <PageHero eyebrow={p.legalName[locale]} title={p.tagline[locale]} />
      <section className="content-section">
        <Container className="editorial-grid">
          <p className="eyebrow">{p.hq[locale]} · {p.factory[locale]} · Est. {p.foundedYear}</p>
          <div>
            <h2>{aboutCopy.heading[locale]}</h2>
            <p>{aboutCopy.body[locale]}</p>
            <ul className="advantage-list">
              {p.advantages.map((advantage, index) => <li key={index}>{advantage[locale]}</li>)}
            </ul>
          </div>
        </Container>
      </section>
    </main>
  )
}

export function ContactPage({ locale }: { locale: Locale }) {
  const c = companyContact
  const intro = contactIntro
  const labels = intro.labels[locale]
  const telHref = `tel:${c.phone.replace(/\s+/g, '')}`
  const waHref = `https://wa.me/${c.whatsapp.replace(/\D/g, '')}`
  return (
    <main id="main-content">
      <PageHero eyebrow="Contact" title={intro.title[locale]} lead={intro.lead[locale]} />
      <section className="content-section">
        <Container className="contact-panel">
          <dl className="contact-grid">
            <div><dt>{labels.email}</dt><dd><a href={`mailto:${c.email}`}>{c.email}</a></dd></div>
            <div><dt>{labels.sales}</dt><dd><a href={`mailto:${c.salesEmail}`}>{c.salesEmail}</a></dd></div>
            <div><dt>{labels.phone}</dt><dd><a href={telHref}>{c.phone}</a></dd></div>
            <div><dt>{labels.whatsapp}</dt><dd><a href={waHref} target="_blank" rel="noopener noreferrer">{c.whatsapp}</a></dd></div>
            <div><dt>{labels.wechat}</dt><dd>{c.wechat}</dd></div>
            <div><dt>{labels.hk}</dt><dd>{c.hkAddress}</dd></div>
            <div><dt>{labels.dg}</dt><dd>{c.dgAddress}</dd></div>
            <div><dt>{labels.alibaba}</dt><dd><a href={c.alibaba} target="_blank" rel="noopener noreferrer">{c.alibaba}</a></dd></div>
          </dl>
          <ButtonLink href={`/${locale}/rfq`}>{labels.cta}<ArrowRight aria-hidden="true" size={16} /></ButtonLink>
        </Container>
      </section>
    </main>
  )
}

export function LegalPage({ locale, kind }: { locale: Locale; kind: 'privacy' | 'terms' }) { const t = text[locale]; const title = t[kind]; return <main id="main-content"><PageHero eyebrow="Draft · Company review required" title={title} lead={t.legal}/><section className="content-section"><Container className="legal-copy"><h2>{locale === 'zh-CN' ? '发布前待确认' : locale === 'ja' ? '公開前の確認事項' : 'Before publication'}</h2><p>{locale === 'zh-CN' ? '需在后端、表单数据流、保留期限、服务商、联系方式和适用法律确定后，由企业审核正式文本。' : locale === 'ja' ? 'バックエンド、フォームのデータフロー、保存期間、サービス提供者、連絡先、準拠法の確定後に正式文面を企業が確認します。' : 'Final copy requires company review after the backend, form data flow, retention period, service providers, contact details, and governing law are confirmed.'}</p></Container></section></main> }

export function RfqPage({ locale }: { locale: Locale }) { const t = text[locale]; return <main id="main-content"><PageHero eyebrow="RFQ / Project brief" title={t.rfq} /><section className="content-section"><Container><RfqWizard locale={locale} /></Container></section></main> }
