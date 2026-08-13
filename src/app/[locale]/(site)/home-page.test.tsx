import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import { HomePage } from '@/components/site/home-page'
import messages from '@/i18n/messages/en.json'

it('presents the priority application, manufacturing capability, and inquiry path', async () => {
  render(await HomePage({ locale: 'en', messages }))

  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/precision/i)
  expect(screen.getAllByRole('link', { name: /start your custom patch/i }).length).toBeGreaterThan(0)
  expect(screen.getByText('Surf & Watersports')).toBeInTheDocument()
  expect(screen.getAllByText(/AI-assisted color matching/i).length).toBeGreaterThan(0)
})
