import { ApplicationCard } from '@/features/catalog/application-card'
import type { ApplicationSummary } from '@/features/catalog/types'
import type { Locale } from '@/i18n/locales'
export function ApplicationGrid({ applications, locale }: { applications: ApplicationSummary[]; locale: Locale }) { return <div className="application-grid">{applications.map((application, index) => <ApplicationCard application={application} featured={index === 0} key={application.slug} locale={locale}/>)}</div> }
