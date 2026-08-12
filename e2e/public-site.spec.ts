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
