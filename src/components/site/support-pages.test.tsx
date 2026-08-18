import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { AboutPage, CapabilitiesPage, ContactPage, ProcessPage } from '@/components/site/support-pages'

describe('supporting trust pages', () => {
  it('presents the process and approved capability claims', () => {
    render(<ProcessPage locale="en" />)
    expect(screen.getByRole('heading', { name: /artwork review/i })).toBeInTheDocument()
    render(<CapabilitiesPage locale="en" />)
    expect(screen.getAllByText(/AI-assisted color matching/i).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('img')).toHaveLength(4)
    expect(screen.getByRole('img', { name: /owned mainland factory/i })).toHaveAttribute(
      'src',
      expect.stringContaining('capability-owned-factory.png'),
    )
    expect(screen.getByRole('img', { name: /eight years of rubber patch experience/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /automatic color matching equipment/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /sampling and repeat production/i })).toBeInTheDocument()
    expect(screen.queryByText(/AI DRAFT/i)).not.toBeInTheDocument()
  })
  it('shows approved company contact and profile values', () => {
    render(<ContactPage locale="en" />)
    expect(screen.getAllByText('hao3832385@163.com').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/\+86 18566182299/).length).toBeGreaterThan(0)
    expect(screen.getByText(/wizrubberpatch\.en\.alibaba\.com/i)).toBeInTheDocument()
    render(<AboutPage locale="en" />)
    expect(screen.getAllByText(/Dongguan WIZ Electronic Gift Co\., Limited/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/owned Dongguan factory/i)).toBeInTheDocument()
  })
})
