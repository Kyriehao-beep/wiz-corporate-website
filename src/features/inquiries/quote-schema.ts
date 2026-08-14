import { z } from 'zod'

/**
 * Pure validation for admin quote and follow-up operations (Plan Task 10).
 * No I/O — fully unit-tested so the server actions can trust the parsed shape.
 */

/** ISO 4217 currency code: three uppercase letters. */
const currencySchema = z
  .string()
  .trim()
  .regex(/^[A-Z]{3}$/, 'Currency must be a valid ISO 4217 code (e.g. USD, EUR, JPY)')

/**
 * A quote needs a non-negative amount in a valid currency, a quote date, and
 * either a positive amount or a validated PDF quotation stored on the private
 * bucket. Amount may be 0 only when a PDF is attached.
 */
export const quoteSchema = z
  .object({
    inquiryId: z.string().uuid('Inquiry id is required'),
    amount: z.number().nonnegative('Amount cannot be negative'),
    currency: currencySchema,
    quoteDate: z.string().datetime({ message: 'Quote date must be an ISO 8601 timestamp' }),
    pdfStorageKey: z.string().min(1).optional(),
  })
  .refine((q) => q.amount > 0 || Boolean(q.pdfStorageKey), {
    message: 'A quote needs either a positive amount or an uploaded PDF quotation',
    path: ['amount'],
  })

export type QuoteInput = z.infer<typeof quoteSchema>

/**
 * Follow-up accepts a future ISO 8601 timestamp, or the literal 'clear' to
 * remove the scheduled follow-up. The future check guards against stale dates.
 */
export const followUpSchema = z
  .object({
    inquiryId: z.string().uuid('Inquiry id is required'),
    followUpAt: z.union([z.literal('clear'), z.string().datetime()]),
  })
  .refine(
    (f) => f.followUpAt === 'clear' || new Date(f.followUpAt).getTime() > Date.now(),
    { message: 'Follow-up must be a future timestamp', path: ['followUpAt'] },
  )

export type FollowUpInput = z.infer<typeof followUpSchema>
