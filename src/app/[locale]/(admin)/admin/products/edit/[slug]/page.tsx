import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { isLocale } from '@/i18n/locales'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { metadataForStaticPage } from '@/lib/seo'
import { requireAdmin } from '@/features/auth/require-admin'
import { SupabaseCatalogRepository } from '@/features/catalog/supabase-catalog-repository'
import { SupabaseAdminCatalogRepository } from '@/features/catalog/admin-catalog-repository'
import { ProductForm } from '@/components/admin/product-form'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  return metadataForStaticPage(params, '/admin/products/edit', 'WIZ Console — Edit Product')
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  await requireAdmin(locale)
  const t = await getTranslations('admin')

  const repo = new SupabaseAdminCatalogRepository()
  const model = await repo.getProductForEdit(slug)
  if (!model) notFound()

  const apps = await new SupabaseCatalogRepository().listApplications(locale)

  return (
    <div className="admin-page">
      <header className="admin-page__head">
        <h2 className="admin-page__title">{t('prodEditTitle')}</h2>
        <Link href={`/${locale}/admin/products`} className="admin-back">
          ← {t('prodBackToList')}
        </Link>
      </header>
      <ProductForm
        locale={locale}
        mode="edit"
        originalSlug={slug}
        initial={model}
        applications={apps.map((a) => ({ slug: a.slug, name: a.name }))}
      />
    </div>
  )
}
