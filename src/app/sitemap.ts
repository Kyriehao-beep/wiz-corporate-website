import type { MetadataRoute } from 'next'
import { applicationFixtures, productFixtures } from '@/features/catalog/fixtures'
import { locales } from '@/i18n/locales'
import { siteUrl } from '@/lib/seo'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ['', '/products', '/applications', '/custom-process', '/capabilities', '/about', '/contact', '/privacy', '/terms', '/rfq']
  const productPaths = productFixtures.map(({ slug }) => `/products/${slug}`)
  const applicationPaths = applicationFixtures.map(({ slug }) => `/applications/${slug}`)
  return locales.flatMap((locale) => [...staticPaths, ...productPaths, ...applicationPaths].map((path) => ({ url: `${siteUrl}/${locale}${path}`, changeFrequency: path === '' ? 'weekly' as const : 'monthly' as const, priority: path === '' ? 1 : path === '/rfq' ? .9 : .7 })))
}
