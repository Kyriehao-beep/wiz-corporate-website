import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { expect, it } from 'vitest'

import { SiteHeader } from '@/components/site/site-header'
import messages from '@/i18n/messages/en.json'

it('offers accessible primary navigation, language control, and an RFQ entry', () => {
  render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SiteHeader locale="en" />
    </NextIntlClientProvider>,
  )

  expect(screen.getByRole('navigation', { name: /primary/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /start your custom patch/i })).toHaveAttribute(
    'href',
    '/en/rfq',
  )
  expect(screen.getByRole('button', { name: /change language/i })).toBeInTheDocument()
})
