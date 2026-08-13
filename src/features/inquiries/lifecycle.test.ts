import { describe, expect, it } from 'vitest'
import { canTransition, validateTransition, type InquiryStatus } from './lifecycle'

describe('inquiry lifecycle', () => {
  it.each([
    ['new', 'contacted'],
    ['contacted', 'quoted'],
    ['quoted', 'won'],
    ['quoted', 'closed'],
    ['won', 'contacted'],
    ['closed', 'contacted'],
  ] as const)('allows %s -> %s through an explicit action', (from, to) => {
    expect(canTransition(from as InquiryStatus, to as InquiryStatus)).toBe(true)
  })

  it('requires a closure reason', () => {
    expect(validateTransition({ from: 'quoted', to: 'closed', reason: '' }).success).toBe(false)
  })

  it('rejects a disallowed transition', () => {
    expect(canTransition('new', 'won')).toBe(false)
    expect(validateTransition({ from: 'new', to: 'won' }).success).toBe(false)
  })

  it('accepts a closure with a reason and a reopen with a reason', () => {
    expect(validateTransition({ from: 'quoted', to: 'closed', reason: 'No response after 3 attempts' }).success).toBe(true)
    expect(validateTransition({ from: 'closed', to: 'contacted', reason: 'Re-engaging via new campaign' }).success).toBe(true)
  })
})
