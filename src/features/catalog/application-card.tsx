import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import type { ApplicationSummary } from '@/features/catalog/types'
import type { Locale } from '@/i18n/locales'
import { getApplicationMedia } from '@/features/catalog/application-media'
export function ApplicationCard({ application, locale, featured = false }: { application: ApplicationSummary; locale: Locale; featured?: boolean }) { const media = getApplicationMedia(application.slug, locale); return <article className={`application-card ${featured ? 'application-card--featured' : ''}`}><div className={`application-card__media application-card__media--${application.tone}`}><Image alt={media.alt[locale]} fill sizes="(max-width: 800px) 100vw, 33vw" src={media.src} style={{ objectPosition: media.objectPosition }}/></div><div className="application-card__body"><span>{application.index}</span><h3><a href={`/${locale}/applications/${application.slug}`}>{application.name}<ArrowUpRight aria-hidden="true" size={18}/></a></h3><p>{application.description}</p></div></article> }
