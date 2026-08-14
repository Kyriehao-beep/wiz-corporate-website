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
 */

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? ''

async function completeValidRfq(page: import('@playwright/test').Page) {
  await page.goto('/en/rfq?product=custom-pvc-rubber-patches&application=surf-watersports')
  await page.getByLabel(/company/i).fill('Test Outdoor Brand')
  await page.getByLabel(/contact/i).fill('Jane Buyer')
  await page.getByLabel(/email/i).fill(`buyer+${Date.now()}@example.com`)
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

test('buyer RFQ reaches the sales workflow exactly once', async ({ page }) => {
  await completeValidRfq(page)
  // Single submit → one inquiry number shown.
  await expect(page.getByText(/WIZ-\d{8}-\d{6}/)).toBeVisible()

  await loginAsAdmin(page)
  // The just-created inquiry appears exactly once in the admin console.
  await expect(page.getByText('Test Outdoor Brand')).toHaveCount(1)
})

test('duplicate submit does not create two inquiries', async ({ page }) => {
  await completeValidRfq(page)
  const inquiryNumber = await page.getByText(/WIZ-\d{8}-\d{6}/).innerText()
  // Re-submitting the same idempotent payload must resolve to the same number.
  await completeValidRfq(page)
  await expect(page.getByText(inquiryNumber)).toBeVisible()
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
  // Requires NODE_ENV=production and RESEND_WEBHOOK_SECRET set on the server.
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
  await page.getByLabel(/move to/i).selectOption('closed')
  await page.getByLabel(/reason/i).fill('Customer unresponsive')
  await page.getByRole('button', { name: /apply/i }).click()
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
