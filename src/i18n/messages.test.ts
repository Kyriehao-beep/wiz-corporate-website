import { expect, it } from 'vitest'

import { loadMessages } from '@/i18n/messages'
import { locales } from '@/i18n/locales'

it('loads a complete navigation and homepage dictionary for every approved locale', async () => {
  for (const locale of locales) {
    const messages = await loadMessages(locale)

    expect(messages.navigation.home).toBeTruthy()
    expect(messages.navigation.products).toBeTruthy()
    expect(messages.home.eyebrow).toBeTruthy()
    expect(messages.home.title).toContain('WIZ')
    expect(messages.home.titleLead).toContain('WIZ')
    expect(messages.home.titleAccent).toBeTruthy()
    expect(messages.rfq.cta).toBeTruthy()
  }
})
