import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { isLocale } from '@/i18n/locales'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { metadataForStaticPage } from '@/lib/seo'
import { requireAdmin } from '@/features/auth/require-admin'
import { SupabaseCatalogRepository } from '@/features/catalog/supabase-catalog-repository'
import {
  emptyTranslation,
  type ProductEditModel,
} from '@/features/catalog/admin-catalog-repository'
import { ProductForm } from '@/components/admin/product-form'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return metadataForStaticPage(params, '/admin/products/new', 'WIZ Console — New Product')
}

export default async function NewProductPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  await requireAdmin(locale)
  const t = await getTranslations('admin')

  const apps = await new SupabaseCatalogRepository().listApplications(locale)

  const initial: ProductEditModel = {
    slug: '',
    status: 'draft',
    tone: 'forest',
    displayOrder: 0,
    translations: {
      en: emptyTranslation(),
      ja: emptyTranslation(),
      'zh-CN': emptyTranslation(),
    },
    applicationSlugs: [],
  }

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h2 className="admin-page__title">{t('prodNewTitle')}</h2>
        <Link href={`/${locale}/admin/products`} className="admin-back">
          ← {t('prodBackToList')}
        </Link>
      </header>
      <ProductForm
        locale={locale}
        mode="create"
        initial={initial}
        applications={apps.map((a) => ({ slug: a.slug, name: a.name }))}
      />
    </div>
  )
}
