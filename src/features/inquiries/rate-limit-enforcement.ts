import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Sliding-ish fixed-window rate limiting for RFQ submissions.
 *
 * Raw identifiers (email/IP) are never stored — callers pass an already-hashed
 * `keyHash` (see `src/lib/security/rate-limit.ts`). The table only ever holds
 * keyed digests + hit counts.
 */

export interface RateLimitWindow {
  hits: number
  windowStart: Date
}

export interface RateLimitDecision {
  allowed: boolean
  hits: number
  windowStart: Date
}

/**
 * Pure decision: given the current window (or null) and the window config,
 * decide whether the next hit is allowed and what the new state should be.
 * Resets to a single fresh hit once the window has elapsed.
 */
export function evaluateRateLimit(
  existing: RateLimitWindow | null,
  now: Date,
  limit: number,
  windowSec: number,
): RateLimitDecision {
  if (!existing) {
    return { allowed: true, hits: 1, windowStart: now }
  }
  const elapsed = (now.getTime() - existing.windowStart.getTime()) / 1000
  if (elapsed >= windowSec) {
    return { allowed: true, hits: 1, windowStart: now }
  }
  const hits = existing.hits + 1
  return { allowed: hits <= limit, hits, windowStart: existing.windowStart }
}

/**
 * DB-backed check + increment. Returns `true` if the request is allowed
 * (and records the hit); `false` if the limit is already reached.
 * Throws only on transport errors from Supabase.
 */
export async function checkAndIncrementRateLimit(
  client: SupabaseClient,
  keyHash: string,
  bucket: string,
  now: Date,
  limit = 10,
  windowSec = 3600,
): Promise<boolean> {
  const { data } = await client
    .from('rfq_rate_limits')
    .select('hits, window_start')
    .eq('key_hash', keyHash)
    .eq('bucket', bucket)
    .maybeSingle()

  const existing: RateLimitWindow | null = data
    ? { hits: data.hits, windowStart: new Date(data.window_start as string) }
    : null

  const decision = evaluateRateLimit(existing, now, limit, windowSec)

  if (decision.allowed) {
    await client.from('rfq_rate_limits').upsert(
      {
        key_hash: keyHash,
        bucket,
        hits: decision.hits,
        window_start: decision.windowStart.toISOString(),
      },
      { onConflict: 'key_hash,bucket' },
    )
  }

  return decision.allowed
}
