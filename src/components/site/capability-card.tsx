import Image from 'next/image'

import type { CapabilityMedia } from '@/components/site/capability-media'

export function CapabilityCard({ capability }: { capability: CapabilityMedia }) {
  const Icon = capability.icon

  return (
    <article className="capability-card">
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
      </div>
    </article>
  )
}
