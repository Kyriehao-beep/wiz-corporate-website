import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { isLocale } from '@/i18n/locales'
import { loadMessages } from '@/i18n/messages'
import { ArrowRight, Waves } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

type LocalePageProps = {
  params: Promise<{ locale: string }>
}

export default async function LocalePage({ params }: LocalePageProps) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = await loadMessages(locale)

  return (
    <main id="main-content" tabIndex={-1}>
      <section className="hero">
        <Container className="hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">{messages.home.eyebrow}</p>
            <h1>
              {messages.home.titleLead}
              <span>{messages.home.titleAccent}</span>
            </h1>
            <p className="hero__description">{messages.home.description}</p>
            <div className="hero__actions">
              <ButtonLink href={`/${locale}/rfq`}>
                {messages.rfq.cta}
                <ArrowRight aria-hidden="true" size={16} />
              </ButtonLink>
              <ButtonLink href={`/${locale}/applications`} variant="secondary">
                {messages.home.secondaryCta}
              </ButtonLink>
            </div>
          </div>
          <div aria-label="Outdoor rubber patch concept" className="hero__visual" role="img">
            <div className="hero__field">
              <div className="patch-object">
                <strong>WIZ</strong>
                <span>BUILT OUTSIDE</span>
              </div>
            </div>
            <div className="hero__note">
              <strong><Waves aria-hidden="true" size={16} /> Surf & watersports</strong>
              <span>Draft visual direction · AI product and factory imagery will be added in the next content stage.</span>
            </div>
          </div>
        </Container>
      </section>
    </main>
  )
}
