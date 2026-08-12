import { applicationFixtures, localizeApplication, localizeProduct, productFixtures } from '@/features/catalog/fixtures'
import type { CatalogRepository } from '@/features/catalog/types'

export const fixtureCatalogRepository: CatalogRepository = {
  async listProducts(locale) { return productFixtures.map((item) => localizeProduct(item, locale)) },
  async getProductBySlug(locale, slug) { const item = productFixtures.find((entry) => entry.slug === slug); return item ? localizeProduct(item, locale) : null },
  async listApplications(locale) { return applicationFixtures.map((item) => localizeApplication(item, locale)) },
  async getApplicationBySlug(locale, slug) { const item = applicationFixtures.find((entry) => entry.slug === slug); return item ? localizeApplication(item, locale) : null },
}
