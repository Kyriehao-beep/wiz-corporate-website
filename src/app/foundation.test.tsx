import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import RootPage from '@/app/page'

it('directs visitors to the English site entry', () => {
  render(<RootPage />)

  expect(screen.getByRole('link', { name: /continue to wiz/i })).toHaveAttribute('href', '/en')
})
