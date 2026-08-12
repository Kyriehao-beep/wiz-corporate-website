import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { ButtonLink } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import type { Locale } from '@/i18n/locales'
import type { Messages } from '@/i18n/messages'
export function Hero({ locale, messages }: { locale: Locale; messages: Messages }) { return <section className="hero"><Container className="hero__grid"><div className="hero__copy"><p className="eyebrow">{messages.home.eyebrow}</p><h1>{messages.home.titleLead}<span>{messages.home.titleAccent}</span></h1><p className="hero__description">{messages.home.description}</p><div className="hero__actions"><ButtonLink href={`/${locale}/rfq`}>{messages.rfq.cta}<ArrowRight aria-hidden="true" size={16}/></ButtonLink><ButtonLink href={`/${locale}/applications`} variant="secondary">{messages.home.secondaryCta}</ButtonLink></div></div><div className="hero__visual hero__visual--photo"><Image alt="Custom rubber patch on technical watersports gear beside a surfboard" fill loading="eager" priority sizes="(max-width: 800px) 100vw, 50vw" src="/media/drafts/surf-watersports-gear-ai-draft.png"/></div></Container></section> }
