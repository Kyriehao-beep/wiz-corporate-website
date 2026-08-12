import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AboutPage, CapabilitiesPage, ContactPage, ProcessPage, RfqPage } from '@/components/site/support-pages'

describe('supporting trust pages', () => {
  it('presents the process and approved capability claims', () => {
    render(<ProcessPage locale="en" />)
    expect(screen.getByRole('heading', { name: /artwork review/i })).toBeInTheDocument()
    render(<CapabilitiesPage locale="en" />)
    expect(screen.getAllByText(/AI-assisted color matching/i).length).toBeGreaterThan(0)
  })
  it('does not invent company contact values', () => {
    render(<ContactPage locale="en" />)
    expect(screen.getByText(/awaiting approved company details/i)).toBeInTheDocument()
    render(<AboutPage locale="en" />)
    expect(screen.getByText(/owned mainland factory/i)).toBeInTheDocument()
  })
  it('renders a front-end RFQ briefing form', () => {
    render(<RfqPage locale="en" searchParams={{ product: 'custom-pvc-rubber-patches' }} />)
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument()
    expect(screen.getByDisplayValue('custom-pvc-rubber-patches')).toBeInTheDocument()
    expect(screen.getAllByText(/backend connection follows/i).length).toBeGreaterThan(0)
  })
})
