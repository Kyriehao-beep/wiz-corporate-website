import type { RfqInput } from '@/features/rfq/schema'

/** Slug → human label for products referenced by RFQ submissions. */
export const PRODUCT_DISPLAY: Record<string, string> = {
  'custom-pvc-rubber-patches': 'Custom PVC Rubber Patches',
  'embroidered-patches': 'Embroidered Patches',
  'woven-labels': 'Woven Labels',
}

/** Slug → human label for applications referenced by RFQ submissions. */
export const APPLICATION_DISPLAY: Record<string, string> = {
  apparel: 'Apparel',
  outdoor: 'Outdoor',
  automotive: 'Automotive',
}

function titleCase(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(' ')
}

export function productDisplayName(slug: string): string {
  return PRODUCT_DISPLAY[slug] ?? titleCase(slug)
}

export function applicationDisplayName(slug: string): string {
  return APPLICATION_DISPLAY[slug] ?? titleCase(slug)
}

const BACKING_LABEL: Record<RfqInput['backing'], string> = {
  'sew-on': 'Sew-on',
  'heat-transfer': 'Heat-transfer',
  'hook-and-loop': 'Hook & loop',
  adhesive: 'Adhesive',
  none: 'No backing',
  'need-advice': 'Backing TBD',
}

/**
 * Compact, human-readable specification summary embedded into notification emails.
 * Pure + fully unit-testable.
 */
export function buildSpecSummary(rfq: RfqInput): string {
  const parts: string[] = [`Qty ${rfq.estimatedQuantity}`]
  parts.push(rfq.dimension === '2d' ? '2D' : rfq.dimension === '3d' ? '3D' : 'Dimensions TBD')
  if (rfq.size.kind === 'known') {
    parts.push(`${rfq.size.widthMm}×${rfq.size.heightMm} mm`)
  }
  parts.push(BACKING_LABEL[rfq.backing] ?? rfq.backing)
  return parts.join(' · ')
}
