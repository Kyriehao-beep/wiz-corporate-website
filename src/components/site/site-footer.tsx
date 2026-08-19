import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/ui/container'
import type { Locale } from '@/i18n/locales'
import type { Messages } from '@/i18n/messages'
import { companyContact } from '@/features/company/company-info'

export function SiteFooter({ locale, messages }: { locale: Locale; messages: Messages }) {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <Container>
        <div className="site-footer__lead">
          <div>
            <p className="eyebrow">WIZ ELECTRONIC GIFT CO., LIMITED</p>
            <p className="site-footer__statement">{messages.common.footerTagline}</p>
          </div>
          <Link className="footer-contact" href={`/${locale}/contact`}>
            {messages.navigation.contact}
            <ArrowUpRight aria-hidden="true" size={18} />
          </Link>
        </div>
        <div className="site-footer__base">
          <span>© {year} WIZ. {messages.common.rights}</span>
          <span className="footer-links">
            <a href={`mailto:${companyContact.email}`}>{companyContact.email}</a>
            <a href={`tel:${companyContact.phone.replace(/\s+/g, '')}`}>{companyContact.phone}</a>
            <span>Hong Kong · Dongguan</span>
            <Link href={`/${locale}/privacy`}>Privacy</Link>
            <Link href={`/${locale}/terms`}>Terms</Link>
          </span>
        </div>
      </Container>
    </footer>
  )
}
