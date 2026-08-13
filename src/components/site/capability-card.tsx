import Image from 'next/image'

import { ArrowRight } from 'lucide-react'

import type { CapabilityMedia } from '@/components/site/capability-media'

export function CapabilityCard({ capability }: { capability: CapabilityMedia }) {
  const Icon = capability.icon

  return (
    <article className="capability-card" data-capability-card>
      <Image
        alt={capability.alt}
        className="capability-card__image"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        src={capability.src}
        style={{ objectPosition: capability.objectPosition }}
      />
      <div className="capability-card__scrim" />
      <div className="capability-card__topline">
        <Icon aria-hidden="true" />
        <span>{capability.index}</span>
      </div>
      <div className="capability-card__copy">
        <h2>{capability.title}</h2>
        <p>{capability.description}</p>
        <p className="capability-card__detail">{capability.detail}</p>
        <a className="capability-card__hint" href="#capabilities">
          <span>了解更多</span>
          <ArrowRight aria-hidden="true" />
        </a>
      </div>
    </article>
  )
}
