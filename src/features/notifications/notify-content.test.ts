import { describe, expect, it } from 'vitest'

import {
  buildCustomerConfirmation,
  buildInternalAlert,
  type CustomerConfirmationInput,
  type InternalAlertInput,
} from './notify-content'

const baseInquiry: CustomerConfirmationInput = {
  inquiryNumber: 'RFQ-20260813-A1B2C3',
  locale: 'en',
  companyName: 'Outdoor Co',
  contactName: 'Jane Doe',
  productName: 'Custom PVC Rubber Patches',
  applicationName: 'Surf & Watersports',
  specSummary: '2D, sew-on, 100×80 mm, qty 500',
  source: 'rfq_wizard',
}

describe('buildCustomerConfirmation', () => {
  it('includes the inquiry number, product, and company in the submission locale', () => {
    const email = buildCustomerConfirmation(baseInquiry)
    expect(email.subject).toContain('RFQ-20260813-A1B2C3')
    expect(email.bodyLines.join('\n')).toContain('Custom PVC Rubber Patches')
    expect(email.bodyLines.join('\n')).toContain('Outdoor Co')
    expect(email.bodyLines.join('\n')).toContain('Surf & Watersports')
  })

  it('does not attach any private file link', () => {
    const email = buildCustomerConfirmation(baseInquiry)
    const blob = JSON.stringify(email)
    expect(blob).not.toContain('signedUrl')
    expect(blob).not.toContain('rfq-private')
    expect(blob).not.toContain('quote-private')
  })

  it('switches template language to Japanese when locale is ja', () => {
    const email = buildCustomerConfirmation({
      ...baseInquiry,
      locale: 'ja',
      productName: 'カスタムPVCラバーパッチ',
      applicationName: 'サーフ＆ウォータースポーツ',
    })
    const blob = email.bodyLines.join('\n')
    expect(email.subject).toContain('WIZ')
    // Japanese scaffolding, not the English fallback phrasing.
    expect(blob).toContain('お問い合わせ')
    expect(blob).not.toContain('Thank you for your inquiry')
  })

  it('switches template language to Simplified Chinese when locale is zh-CN', () => {
    const email = buildCustomerConfirmation({
      ...baseInquiry,
      locale: 'zh-CN',
      productName: '定制 PVC 橡胶标牌',
      applicationName: '冲浪与水上运动',
    })
    const blob = email.bodyLines.join('\n')
    expect(blob).toContain('我们已收到 Outdoor Co 的询价')
    expect(blob).not.toContain('Thank you for your inquiry')
  })
})

describe('buildInternalAlert', () => {
  const alertInput: InternalAlertInput = {
    ...baseInquiry,
    locale: 'zh-CN',
    countryRegion: 'Australia',
    adminUrl: 'https://admin.wiz.example/zh-CN/admin/inquiries/abc-123',
  }

  it('summarizes the inquiry for sales staff without leaking private files', () => {
    const alert = buildInternalAlert(alertInput)
    const blob = JSON.stringify(alert)
    expect(alert.subject).toContain('RFQ-20260813-A1B2C3')
    expect(blob).toContain('Outdoor Co')
    expect(blob).toContain('Australia')
    expect(blob).toContain('https://admin.wiz.example/zh-CN/admin/inquiries/abc-123')
    expect(blob).not.toContain('signedUrl')
    expect(blob).not.toContain('rfq-private')
    expect(blob).not.toContain('quote-private')
  })

  it('renders the alert in English when a non-zh locale is requested', () => {
    const alert = buildInternalAlert({ ...alertInput, locale: 'en' })
    expect(alert.bodyLines.join('\n')).toContain('New inquiry')
    expect(alert.bodyLines.join('\n')).not.toContain('新询价')
  })
})
