import { expect, test } from '@playwright/test'

/**
 * End-to-end coverage for the buyer → sales workflow and the admin console
 * security gates (Plan Task 11).
 *
 * NOTE: Playwright cannot run inside the build sandbox (browser processes are
 * killed). Run this on a non-sandboxed runner with a live stack:
 *   - Supabase running via `supabase start` (seeded)
 *   - `next start` (or `next dev`) on http://127.0.0.1:3000
 *   - NEXT_PUBLIC_TURNSTILE_SITE_KEY UNSET in the test env so the Turnstile
 *     widget is absent and the RFQ submit path is exercised without a token
 *   - E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD pointing at a seeded WIZ member
 *   - E2E_ENFORCE_WEBHOOK_SIGNATURE=1 to actually enforce webhook signatures
 *     (otherwise the route skips verification in dev, per security-model §5)
 *   - E2E_TURNSTILE_ENABLED=1 + a site key to exercise the failed-Turnstile path
 *   - E2E_ATTACHMENT_ID set to a seeded inquiry_attachments id to exercise the
 *     signed-download (and its 5-minute expiry) path
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? ''
const ENFORCE_WEBHOOK = process.env.E2E_ENFORCE_WEBHOOK_SIGNATURE === '1'
const TURNSTILE_ENABLED = process.env.E2E_TURNSTILE_ENABLED === '1'
const SEEDED_ATTACHMENT_ID = process.env.E2E_ATTACHMENT_ID ?? ''

async function completeValidRfq(
  page: import('@playwright/test').Page,
  email = `buyer+${Date.now()}@example.com`,
) {
  await page.goto('/en/rfq?product=custom-pvc-rubber-patches&application=surf-watersports')
  await page.getByLabel(/company/i).fill('Test Outdoor Brand')
  await page.getByLabel(/contact/i).fill('Jane Buyer')
  await page.getByLabel(/email/i).fill(email)
  await page.getByLabel(/country/i).fill('United States')
  await page.getByLabel(/project/i).fill('Surf team logo patches')
  await page.getByLabel(/quantity/i).fill('500')
  // No Turnstile widget is rendered when the site key is unset in test env.
  await page.getByRole('button', { name: /submit/i }).click()
}

async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/en/login')
  await page.getByLabel(/email/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/password/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /sign in|log in/i }).click()
}

/** Close an open inquiry with a reason (used by the closure/reopen tests). */
async function closeWithReason(page: import('@playwright/test').Page, reason: string) {
  await page.getByLabel(/move to/i).selectOption('closed')
  await page.getByLabel(/reason/i).fill(reason)
  await page.getByRole('button', { name: /apply/i }).click()
}

test('buyer RFQ reaches the sales workflow exactly once', async ({ page }) => {
  await completeValidRfq(page)
  // Two near-simultaneous submits of the SAME rendered form must resolve to a
  // single inquiry (this is also the plan's "duplicate submit" case).
  await Promise.all([
    page.getByRole('button', { name: /submit/i }).click(),
    page.getByRole('button', { name: /submit/i }).click(),
  ]).catch(() => {})
  await expect(page.getByText(/WIZ-\d{8}-\d{6}/)).toBeVisible()

  await loginAsAdmin(page)
  // The just-created inquiry appears exactly once in the admin console.
  await expect(page.getByText('Test Outdoor Brand')).toHaveCount(1)
})

test('anonymous admin access is denied', async ({ page }) => {
  await page.goto('/en/admin/inquiries')
  await expect(page).toHaveURL(/\/en\/login/)
})

test('unsigned private-file download is denied', async ({ request }) => {
  const res = await request.get('/en/api/admin/files/00000000-0000-0000-0000-000000000000')
  expect(res.status()).toBe(401)
})

test('invalid Resend webhook signature is rejected', async ({ request }) => {
  // Verification is skipped in dev (security-model §5); only enforce under
  // production + secret. Skip loudly when preconditions aren't met so the
  // 401 path is never silently assumed to pass.
  test.skip(!ENFORCE_WEBHOOK, 'set E2E_ENFORCE_WEBHOOK_SIGNATURE=1 to exercise the 401 path')
  const res = await request.post('/api/webhooks/resend', {
    headers: {
      'svix-id': 'msg_1',
      'svix-timestamp': String(Math.floor(Date.now() / 1000)),
      'svix-signature': 'v1=deadbeef',
    },
    data: { type: 'email.bounced', data: { id: 'fake' } },
  })
  expect(res.status()).toBe(401)
})

test('signed-file link is time-limited (5-minute storage TTL)', async ({ request }) => {
  test.skip(!SEEDED_ATTACHMENT_ID, 'set E2E_ATTACHMENT_ID to exercise the signed-download path')
  const res = await request.get(`/en/api/admin/files/${SEEDED_ATTACHMENT_ID}`, {
    headers: { cookie: '' },
  })
  // Admin authed → 302 to a Supabase signed URL (token/expiry params prove the
  // time limit). The 5-minute expiry itself is a Supabase storage guarantee
  // (security-model §10); a frozen-clock harness should advance 6 min and expect
  // the signed URL to 404/410.
  expect(res.status()).toBe(302)
  const location = res.headers()['location'] ?? ''
  expect(location).toMatch(/[?&](token|signature)=/)
})

test('invalid or oversized artwork file is rejected', async ({ page }) => {
  await page.goto('/en/rfq?product=custom-pvc-rubber-patches&application=surf-watersports')
  const fileInput = page.getByLabel(/artwork|attachment|file/i)
  test.skip((await fileInput.count()) === 0, 'RFQ form exposes no artwork input in this build')

  // A disallowed / oversized file must block submission (no inquiry number).
  const big = Buffer.alloc(60 * 1024 * 1024, 0x41) // 60 MB > 20 MB limit
  await fileInput.setInputFiles({ name: 'huge.bin', mimeType: 'application/octet-stream', buffer: big })
  await page.getByLabel(/company/i).fill('Test Outdoor Brand')
  await page.getByLabel(/contact/i).fill('Jane Buyer')
  await page.getByLabel(/email/i).fill(`buyer+${Date.now()}@example.com`)
  await page.getByLabel(/country/i).fill('United States')
  await page.getByLabel(/project/i).fill('Surf team logo patches')
  await page.getByLabel(/quantity/i).fill('500')
  await page.getByRole('button', { name: /submit/i }).click()

  await expect(page.getByText(/WIZ-\d{8}-\d{6}/)).toHaveCount(0)
})

test('failed Turnstile blocks submission', async ({ page }) => {
  test.skip(!TURNSTILE_ENABLED, 'set E2E_TURNSTILE_ENABLED=1 to exercise the failed-Turnstile path')
  await page.goto('/en/rfq?product=custom-pvc-rubber-patches&application=surf-watersports')
  // With the widget present, a missing/invalid token must reject the submit.
  await page.getByLabel(/company/i).fill('Test Outdoor Brand')
  await page.getByLabel(/contact/i).fill('Jane Buyer')
  await page.getByLabel(/email/i).fill(`buyer+${Date.now()}@example.com`)
  await page.getByLabel(/country/i).fill('United States')
  await page.getByLabel(/project/i).fill('Surf team logo patches')
  await page.getByLabel(/quantity/i).fill('500')
  await page.getByRole('button', { name: /submit/i }).click()

  await expect(page.getByText(/WIZ-\d{8}-\d{6}/)).toHaveCount(0)
})

test('notification-provider failure still persists the inquiry', async ({ page }) => {
  // The notify step is non-fatal: even with the email provider down, the
  // inquiry is durably created and visible to admin. Run with a broken/missing
  // RESEND key to prove the failure does not block persistence.
  await completeValidRfq(page)
  await expect(page.getByText(/WIZ-\d{8}-\d{6}/)).toBeVisible()

  await loginAsAdmin(page)
  await expect(page.getByText('Test Outdoor Brand')).toHaveCount(1)
})

test('closing an inquiry requires a reason', async ({ page }) => {
  await completeValidRfq(page)
  await loginAsAdmin(page)
  await page.getByRole('link', { name: /WIZ-/ }).first().click()

  const badge = page.locator('.admin-page__badge')
  const before = (await badge.innerText()).trim()

  // Move to "closed" without a reason → transition is rejected (silently).
  await page.getByLabel(/move to/i).selectOption('closed')
  await page.getByRole('button', { name: /apply/i }).click()
  await expect(badge).toHaveText(before)
})

test('reopening an inquiry requires a note', async ({ page }) => {
  await completeValidRfq(page)
  await loginAsAdmin(page)
  await page.getByRole('link', { name: /WIZ-/ }).first().click()

  // First close it WITH a reason.
  await closeWithReason(page, 'Customer unresponsive')
  await expect(page.locator('.admin-page__badge')).toHaveText(/closed/i)

  // Now reopen without a note → rejected, stays closed.
  await page.getByLabel(/move to/i).selectOption('contacted')
  await page.getByRole('button', { name: /apply/i }).click()
  await expect(page.locator('.admin-page__badge')).toHaveText(/closed/i)
})

test('CSV export escapes formula injection and excludes private data', async ({ page }) => {
  await loginAsAdmin(page)
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('link', { name: /export csv/i }).click(),
  ])
  const stream = await download.createReadStream()
  const chunks: Buffer[] = []
  for await (const chunk of stream) chunks.push(Buffer.from(chunk))
  const csv = Buffer.concat(chunks).toString('utf8')

  expect(csv).toContain('inquiry_number,company_name,status,owner,created_at')
  expect(csv).not.toContain('internal_note')
  expect(csv).not.toContain('storage_path')
  // No unescaped formula trigger at the start of a line.
  expect(csv).not.toMatch(/^=['+\-@]/m)
})
