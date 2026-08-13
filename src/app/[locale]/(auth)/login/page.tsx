import { setRequestLocale } from 'next-intl/server'
import { getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft } from 'lucide-react'

import { isLocale } from '@/i18n/locales'
import { metadataForStaticPage } from '@/lib/seo'
import { LoginForm } from '@/components/admin/login-form'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return metadataForStaticPage(params, '/login', 'WIZ Console — Sign in')
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  setRequestLocale(locale)
  const t = await getTranslations('auth')
  const homeHref = `/${locale}`

  return (
    <>
      <aside className="auth-aside">
        <div className="auth-aside__brand">
          <span className="auth-aside__mark" aria-hidden="true">W</span>
          <span className="auth-aside__name">WIZ</span>
        </div>
        <div className="auth-aside__body">
          <p className="auth-aside__statement">{t('brandStatement')}</p>
          <p className="auth-aside__note">{t('brandNote')}</p>
        </div>
        <span className="auth-aside__patch" aria-hidden="true" />
      </aside>

      <div className="auth-main">
        <div className="auth-card">
          <p className="eyebrow">{t('subheading')}</p>
          <h1 className="auth-card__title">{t('heading')}</h1>
          <p className="auth-card__desc">{t('description')}</p>
          <LoginForm />
          <a className="auth-back" href={homeHref}>
            <ArrowLeft aria-hidden="true" size={14} />
            {t('backToSite')}
          </a>
        </div>
      </div>
    </>
  )
}
