export interface TurnstileVerifyResult {
  ok: boolean
  /** Machine-readable reason for failures / degraded states (never user-facing). */
  reason?: string
}

export interface TurnstileVerifyParams {
  token: string | null | undefined
  /** Override the secret (tests / explicit injection). Falls back to env. */
  secret?: string
  /** Caller IP for Cloudflare's `remoteip` audit field. */
  ip?: string
  /** Injectable fetcher so the verifier is fully unit-testable. */
  fetchImpl?: typeof fetch
}

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

interface SiteverifyResponse {
  success?: boolean
  'error-codes'?: string[]
}

/** Pure parser — extracted so the decision can be unit-tested without a network. */
export function parseTurnstileResponse(body: SiteverifyResponse): boolean {
  return body?.success === true
}

/**
 * Verify a Cloudflare Turnstile challenge token.
 *
 * Security posture:
 * - Missing secret (local/dev/self-host) → fail OPEN so the RFQ form stays usable.
 * - Missing token (bot, or widget never rendered) → fail CLOSED.
 * - Cloudflare unreachable → fail OPEN to preserve form availability, but the
 *   degraded state is recorded in `reason` for monitoring.
 * - Challenge rejected → fail CLOSED with the error-codes for debugging.
 */
export async function verifyTurnstile(params: TurnstileVerifyParams): Promise<TurnstileVerifyResult> {
  const secret = params.secret ?? process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    return { ok: true, reason: 'turnstile_not_configured' }
  }

  const token = params.token
  if (!token) {
    return { ok: false, reason: 'missing_token' }
  }

  const doFetch = params.fetchImpl ?? fetch
  let body: SiteverifyResponse
  try {
    const res = await doFetch(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(params.ip ? { remoteip: params.ip } : {}),
      }),
    })
    if (!res.ok) {
      return { ok: false, reason: `siteverify_http_${res.status}` }
    }
    body = (await res.json()) as SiteverifyResponse
  } catch (err) {
    return { ok: true, reason: `siteverify_unreachable:${String(err)}` }
  }

  if (!parseTurnstileResponse(body)) {
    return { ok: false, reason: `challenge_failed:${(body['error-codes'] ?? []).join(',')}` }
  }
  return { ok: true }
}
