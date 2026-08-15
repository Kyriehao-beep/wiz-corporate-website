import type { Locale } from '@/i18n/locales'

export type LocalizedText = Record<Locale, string>

export interface ProductSummary {
  slug: string
  name: string
  eyebrow: string
  description: string
  index: string
  tone: string
  image?: ProductMedia
}

export interface ProductMedia {
  src: string
  alt: Record<Locale, string>
  objectPosition: string
}

export interface ProductDetail extends ProductSummary {
  suitability: string[]
  construction: string[]
  visualOptions: string[]
  attachmentOptions: string[]
  artworkGuidance: string
  applicationSlugs: string[]
  image?: ProductMedia
}

export interface ApplicationSummary {
  slug: string
  name: string
  description: string
  priority: boolean
  index: string
  tone: string
}

export interface ApplicationDetail extends ApplicationSummary {
  buyerProblem: string
  recommendedProductSlugs: string[]
  attachmentConsiderations: string
  visualDirection: string
}

export interface CatalogRepository {
  listProducts(locale: Locale): Promise<ProductSummary[]>
  getProductBySlug(locale: Locale, slug: string): Promise<ProductDetail | null>
  listApplications(locale: Locale): Promise<ApplicationSummary[]>
  getApplicationBySlug(locale: Locale, slug: string): Promise<ApplicationDetail | null>
}
