import type { Metadata } from 'next'
import type { Locale } from '@/i18n/locales'
import { locales } from '@/i18n/locales'

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.wizrubberpatch.com'

export function buildLocaleAlternates(locale: Locale, path = ''): NonNullable<Metadata['alternates']> {
  const normalized = path ? (path.startsWith('/') ? path : `/${path}`) : ''
  const url = (target: Locale) => `${siteUrl}/${target}${normalized}`
  return { canonical: url(locale), languages: { ...Object.fromEntries(locales.map((target) => [target, url(target)])), 'x-default': url('en') } }
}

const titles = { en: 'WIZ Custom Rubber Patches', ja: 'WIZ カスタムラバーパッチ', 'zh-CN': 'WIZ 定制橡胶标牌' }
const descriptions = { en: 'Custom molded rubber patches for surf, watersports, outdoor apparel, bags, and technical gear.', ja: 'サーフ、ウォータースポーツ、アウトドアウェア、バッグ、テクニカルギア向けカスタムラバーパッチ。', 'zh-CN': '面向冲浪、水上运动、户外服装、箱包与技术装备的定制模压橡胶标牌。' }

export function buildMetadata(locale: Locale, path = '', title?: string, description?: string): Metadata {
  const resolvedTitle = title ? `${title} | WIZ` : titles[locale]
  const resolvedDescription = description ?? descriptions[locale]
  return {
    title: resolvedTitle,
    description: resolvedDescription,
    alternates: buildLocaleAlternates(locale, path),
    openGraph: {
      title: resolvedTitle,
      description: resolvedDescription,
      url: `${siteUrl}/${locale}${path}`,
      siteName: 'WIZ',
      locale,
      type: 'website',
      images: [{ url: `${siteUrl}/og-image.svg`, width: 1200, height: 630, alt: 'WIZ custom rubber patches' }],
    },
  }
}

export async function metadataForStaticPage(params: Promise<{ locale: string }>, path: string, title: string): Promise<Metadata> {
  const { locale } = await params
  return locales.includes(locale as Locale) ? buildMetadata(locale as Locale, path, title) : {}
}
