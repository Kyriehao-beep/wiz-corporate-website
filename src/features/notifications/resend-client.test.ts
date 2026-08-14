import { describe, it, expect } from 'vitest'

import { buildResendPayload } from './resend-client'

describe('buildResendPayload', () => {
  it('applies the default From when none provided', () => {
    const p = buildResendPayload({ to: 'a@b.com', subject: 'S', text: 'T' }, 'Default <x@y.com>')
    expect(p.from).toBe('Default <x@y.com>')
    expect(p.to).toBe('a@b.com')
    expect(p.subject).toBe('S')
    expect(p.text).toBe('T')
  })

  it('honors an explicit From override', () => {
    const p = buildResendPayload(
      { to: 'a@b.com', subject: 'S', text: 'T', from: 'Override <o@y.com>' },
      'Default <x@y.com>',
    )
    expect(p.from).toBe('Override <o@y.com>')
  })

  it('only includes html and reply_to when present', () => {
    const p = buildResendPayload(
      { to: 'a@b.com', subject: 'S', text: 'T', html: '<p>hi</p>', replyTo: 'r@y.com' },
      'Default <x@y.com>',
    )
    expect(p.html).toBe('<p>hi</p>')
    expect(p.reply_to).toBe('r@y.com')
  })

  it('omits html/reply_to when absent', () => {
    const p = buildResendPayload({ to: 'a@b.com', subject: 'S', text: 'T' }, 'Default <x@y.com>')
    expect('html' in p).toBe(false)
    expect('reply_to' in p).toBe(false)
  })
})
