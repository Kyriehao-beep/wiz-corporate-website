import { expect, test } from '@playwright/test'

test('root route enters the English website', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/en$/)
})

for (const locale of ['en', 'ja', 'zh-CN']) {
  test(`${locale} route renders the WIZ heading`, async ({ page }) => {
    await page.goto(`/${locale}`)

    await expect(page.getByRole('heading', { level: 1 })).toContainText('WIZ')
    await expect(page.locator('html')).toHaveAttribute('lang', locale)
  })
}

test('mobile navigation and skip link are keyboard usable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/en')

  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: /skip to content/i })).toBeFocused()

  await page.getByRole('button', { name: /open menu/i }).click()
  await expect(page.getByRole('navigation', { name: /mobile/i })).toBeVisible()
})

test('visitor can move from surf application to a contextual inquiry', async ({ page }) => {
  await page.goto('/en/applications')
  await page.getByRole('link', { name: /surf & watersports/i }).click()
  await expect(page).toHaveURL(/applications\/surf-watersports/)
  await page.locator('main').getByRole('link', { name: /start your custom patch/i }).first().click()
  await expect(page).toHaveURL(/rfq\?application=surf-watersports/)
  await expect(page.getByLabel(/application/i)).toHaveValue('surf-watersports')
})

test('primary public routes have headings, no horizontal overflow, and no console errors', async ({ page }) => {
  const errors: string[] = []
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()) })
  await page.setViewportSize({ width: 390, height: 844 })
  for (const path of ['', '/products', '/applications', '/custom-process', '/capabilities', '/about', '/contact', '/privacy', '/terms', '/rfq']) {
    await page.goto(`/en${path}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }))
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1)
  }
  expect(errors).toEqual([])
})

test('SEO endpoints are available', async ({ request }) => {
  for (const path of ['/robots.txt', '/sitemap.xml', '/og-image.svg']) {
    const response = await request.get(path)
    expect(response.ok(), `${path} should respond successfully`).toBe(true)
  }
})
