import { expect, it } from 'vitest'

import { fixtureCatalogRepository } from '@/features/catalog/fixture-catalog-repository'

it('exposes the approved product and application catalog', async () => {
  const [products, applications] = await Promise.all([
    fixtureCatalogRepository.listProducts('en'),
    fixtureCatalogRepository.listApplications('en'),
  ])

  expect(products.map((item) => item.slug)).toEqual([
    'heat-transfer-rubber-patches',
    'custom-pvc-rubber-patches',
    'hook-and-loop-rubber-patches',
    'earphone-hole-patches',
    'keychains',
  ])
  expect(applications).toHaveLength(10)
  expect(applications.filter((item) => item.priority).map((item) => item.slug)).toEqual([
    'outdoor-apparel',
    'yoga-wear',
    'surf-watersports',
  ])
})

it('returns null for an unknown catalog slug', async () => {
  await expect(fixtureCatalogRepository.getProductBySlug('en', 'unknown')).resolves.toBeNull()
  await expect(fixtureCatalogRepository.getApplicationBySlug('en', 'unknown')).resolves.toBeNull()
})
