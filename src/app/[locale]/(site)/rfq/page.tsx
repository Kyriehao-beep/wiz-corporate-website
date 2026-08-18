import { notFound } from 'next/navigation'
import { RfqWizard } from '@/components/rfq/rfq-wizard'
import { Container } from '@/components/ui/container'
import { isLocale } from '@/i18n/locales'
import { metadataForStaticPage } from '@/lib/seo'

export const generateMetadata = ({ params }: { params: Promise<{ locale: string }> }) =>
  metadataForStaticPage(params, '/rfq', 'Start Your Custom Patch')

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  return (
    <main id="main-content">
      <section className="content-section">
        <Container>
          <RfqWizard locale={locale} />
        </Container>
      </section>
    </main>
  )
}
