import { expect, it } from 'vitest'

import { fixtureCatalogRepository } from '@/features/catalog/fixture-catalog-repository'

it('exposes the approved product and application catalog', async () => {
  const [products, applications] = await Promise.all([
    fixtureCatalogRepository.listProducts('en'),
    fixtureCatalogRepository.listApplications('en'),
  ])

  expect(products.map((item) => item.slug)).toEqual([
    'custom-pvc-rubber-patches',
    'heat-transfer-rubber-patches',
    'sew-on-rubber-patches-labels',
    'hook-and-loop-rubber-patches',
    'specialty-products',
  ])
  expect(applications).toHaveLength(9)
  expect(applications.filter((item) => item.priority).map((item) => item.slug)).toEqual([
    'surf-watersports',
    'outdoor-apparel',
    'backpacks-gear-bags',
  ])
})

it('returns null for an unknown catalog slug', async () => {
  await expect(fixtureCatalogRepository.getProductBySlug('en', 'unknown')).resolves.toBeNull()
  await expect(fixtureCatalogRepository.getApplicationBySlug('en', 'unknown')).resolves.toBeNull()
})
