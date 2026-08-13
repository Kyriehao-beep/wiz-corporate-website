import { z } from 'zod'

/**
 * WIZ guided RFQ submission contract (Plan 2 / Task 5).
 * Server-authoritative: the wizard performs client-side convenience checks,
 * but this schema is the single source of truth evaluated before persistence.
 */
export const rfqSchema = z.object({
  locale: z.enum(['en', 'ja', 'zh-CN']),
  productSlug: z.string().min(1),
  applicationSlug: z.string().min(1),
  estimatedQuantity: z.number().int().positive().max(10_000_000),
  size: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('undecided') }),
    z.object({
      kind: z.literal('known'),
      widthMm: z.number().positive(),
      heightMm: z.number().positive(),
    }),
  ]),
  dimension: z.enum(['2d', '3d', 'need-advice']),
  backing: z.enum(['sew-on', 'heat-transfer', 'hook-and-loop', 'adhesive', 'none', 'need-advice']),
  companyName: z.string().trim().min(1).max(160),
  contactName: z.string().trim().min(1).max(120),
  workEmail: z.email().trim().max(254),
  countryRegion: z.string().trim().min(2).max(120),
  projectDescription: z.string().trim().min(20).max(8000),
  privacyAccepted: z.literal(true),
})

export type RfqInput = z.infer<typeof rfqSchema>
