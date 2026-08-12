import { ArrowUpRight } from 'lucide-react'

import { Container } from '@/components/ui/container'
import type { Locale } from '@/i18n/locales'
import type { Messages } from '@/i18n/messages'

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
          <a className="footer-contact" href={`/${locale}/contact`}>
            {messages.navigation.contact}
            <ArrowUpRight aria-hidden="true" size={18} />
          </a>
        </div>
        <div className="site-footer__base">
          <span>© {year} WIZ. {messages.common.rights}</span>
          <span className="footer-links"><span>Hong Kong · Dongguan</span><a href={`/${locale}/privacy`}>Privacy</a><a href={`/${locale}/terms`}>Terms</a></span>
        </div>
      </Container>
    </footer>
  )
}
