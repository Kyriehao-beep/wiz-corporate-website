import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ApplicationDetailPage } from '@/features/catalog/application-detail-page'
import { ProductDetailPage } from '@/features/catalog/product-detail-page'
import { fixtureCatalogRepository } from '@/features/catalog/fixture-catalog-repository'

describe('catalog detail pages', () => {
  it('explains 2D and 3D choices and carries product context into RFQ', async () => {
    const product = await fixtureCatalogRepository.getProductBySlug('en', 'custom-pvc-rubber-patches')
    render(<ProductDetailPage locale="en" product={product!} />)
    expect(screen.getByRole('heading', { name: /2D or 3D/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /start your custom patch/i })).toHaveAttribute('href', expect.stringContaining('product=custom-pvc-rubber-patches'))
  })

  it('states the surfboard attachment boundary and carries application context', async () => {
    const application = await fixtureCatalogRepository.getApplicationBySlug('en', 'surf-watersports')
    render(<ApplicationDetailPage application={application!} locale="en" products={[]} />)
    expect(screen.getAllByText(/not EVA traction pads/i).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /start your custom patch/i })[0]).toHaveAttribute('href', expect.stringContaining('application=surf-watersports'))
  })
})
