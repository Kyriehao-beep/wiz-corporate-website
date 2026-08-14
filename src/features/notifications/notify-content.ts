import type { Locale } from '@/i18n/locales'

/**
 * Pure, infrastructure-free assembly of localized email content for the RFQ
 * workflow. The Resend adapter and React Email templates (Task 8) consume this
 * output; keeping the copy here means it is fully unit-testable without a mail
 * provider, a database, or a server context.
 *
 * Security contract: neither builder ever emits private file links
 * (`signedUrl`, `rfq-private`, `quote-private`). Attachments are delivered
 * through the admin console, never by email.
 */

export interface CustomerConfirmationInput {
  inquiryNumber: string
  /** Submission locale — the customer email follows this. */
  locale: Locale
  companyName: string
  contactName: string
  /** Localized product display name. */
  productName: string
  /** Localized application display name. */
  applicationName: string
  /** Human-readable specification summary built by the caller. */
  specSummary: string
  source: string
}

export interface InternalAlertInput {
  inquiryNumber: string
  /** Staff-facing locale. Admin UI is Simplified Chinese; defaults to 'zh-CN'. */
  locale: Locale
  companyName: string
  contactName: string
  countryRegion: string
  productName: string
  applicationName: string
  source: string
  /** Protected admin URL — the only external link allowed in the alert. */
  adminUrl: string
}

export interface EmailContent {
  subject: string
  preheader: string
  bodyLines: string[]
}

const CUSTOMER_SUBJECT: Record<Locale, (n: string) => string> = {
  en: (n) => `WIZ RFQ received — ${n}`,
  ja: (n) => `WIZ お問い合わせを受け付けました — ${n}`,
  'zh-CN': (n) => `WIZ 已收到您的询价 — ${n}`,
}

const CUSTOMER_PREHEADER: Record<Locale, (c: string) => string> = {
  en: (c) => `Thank you, ${c}. We received your request.`,
  ja: (c) => `${c} 様、お問い合わせありがとうございます。`,
  'zh-CN': (c) => `感谢您的咨询，${c}。`,
}

const CUSTOMER_BODY: Record<
  Locale,
  (i: CustomerConfirmationInput) => string[]
> = {
  en: (i) => [
    `Hi ${i.contactName},`,
    `Thank you for your inquiry, ${i.companyName} (${i.inquiryNumber}). Our team will review your ${i.productName} request for ${i.applicationName} and respond shortly.`,
    `Submitted specification: ${i.specSummary}`,
    `This is an automated confirmation. We do not attach files to this email; a WIZ specialist will follow up using the contact details you provided.`,
  ],
  ja: (i) => [
    `${i.contactName} 様`,
    `${i.companyName} 様のお問い合わせ（${i.inquiryNumber}）を受け付けました。${i.productName}（${i.applicationName}）のご依頼を確認し、追ってご返信いたします。`,
    `ご指定いただいた仕様：${i.specSummary}`,
    `本メールは自動送信です。ファイルは添付しておりません。担当者よりご登録いただいた連絡先へご案内します。`,
  ],
  'zh-CN': (i) => [
    `${i.contactName} 您好，`,
    `我们已收到 ${i.companyName} 的询价（${i.inquiryNumber}）。我们将尽快审核您关于${i.productName}（${i.applicationName}）的需求并与您联系。`,
    `已提交的规格：${i.specSummary}`,
    `本邮件为系统自动发送，不附带任何文件。WIZ 专员将通过您提供的联系方式与您跟进。`,
  ],
}

const ALERT_SUBJECT: Record<Locale, (n: string, c: string) => string> = {
  en: (n, c) => `New inquiry ${n} · ${c}`,
  ja: (n, c) => `新規お問い合わせ ${n} · ${c}`,
  'zh-CN': (n, c) => `新询价 ${n} · ${c}`,
}

const ALERT_PREHEADER: Record<Locale, (country: string, product: string) => string> = {
  en: (country, product) => `${country} · ${product}`,
  ja: (country, product) => `${country} · ${product}`,
  'zh-CN': (country, product) => `${country} · ${product}`,
}

const ALERT_BODY: Record<Locale, (i: InternalAlertInput) => string[]> = {
  en: (i) => [
    'New inquiry',
    `Inquiry number: ${i.inquiryNumber}`,
    `Company: ${i.companyName} (${i.countryRegion})`,
    `Contact: ${i.contactName}`,
    `Product: ${i.productName} (${i.applicationName})`,
    `Source: ${i.source}`,
    `Review in console: ${i.adminUrl}`,
    'Note: this message contains no private file links.',
  ],
  ja: (i) => [
    '新規お問い合わせ',
    `問い合わせ番号：${i.inquiryNumber}`,
    `会社：${i.companyName}（${i.countryRegion}）`,
    `担当者：${i.contactName}`,
    `製品：${i.productName}（${i.applicationName}）`,
    `流入元：${i.source}`,
    `コンソールで確認：${i.adminUrl}`,
    '本メールにファイルのリンクは含まれません。',
  ],
  'zh-CN': (i) => [
    '新询价',
    `询价编号：${i.inquiryNumber}`,
    `公司：${i.companyName}（${i.countryRegion}）`,
    `联系人：${i.contactName}`,
    `产品：${i.productName}（${i.applicationName}）`,
    `来源：${i.source}`,
    `后台查看：${i.adminUrl}`,
    '注意：本邮件不含任何私密文件链接。',
  ],
}

export function buildCustomerConfirmation(
  input: CustomerConfirmationInput,
): EmailContent {
  return {
    subject: CUSTOMER_SUBJECT[input.locale](input.inquiryNumber),
    preheader: CUSTOMER_PREHEADER[input.locale](input.companyName),
    bodyLines: CUSTOMER_BODY[input.locale](input),
  }
}

export function buildInternalAlert(input: InternalAlertInput): EmailContent {
  return {
    subject: ALERT_SUBJECT[input.locale](input.inquiryNumber, input.companyName),
    preheader: ALERT_PREHEADER[input.locale](
      input.countryRegion,
      input.productName,
    ),
    bodyLines: ALERT_BODY[input.locale](input),
  }
}
