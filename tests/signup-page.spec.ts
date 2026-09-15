import { test, expect } from '@playwright/test'
import { US_BASE_URL } from './tenant'

// Same AuthLayout as login — brandName is only an <img alt>, never visible
// text. See the comment in login-page.spec.ts for why.

test.describe('Signup page — India (default tenant)', () => {
  test('renders with India tagline, logo, and domain preview', async ({ page }) => {
    const response = await page.goto('/signup')
    expect(response?.status()).toBeLessThan(400)
    await expect(page.getByText(/calm, trusted home for every counselling practice in India/i)).toBeVisible()
    await expect(page.locator('img[alt="Counsellors of India"]')).toBeVisible()
    // domainDisplay from signup/page.tsx: tenant.siteUrl stripped of protocol/www
    await expect(page.getByText('counsellorsofindia.com/')).toBeVisible()
  })
})

test.describe('Signup page — US tenant', () => {
  test.use({ baseURL: US_BASE_URL })

  test('renders with US tagline, logo, and domain preview, not India', async ({ page }) => {
    const response = await page.goto('/signup')
    expect(response?.status(), 'If this fails with a connection error, check the hosts-file setup in tests/tenant.ts').toBeLessThan(400)
    await expect(page.getByText(/calm, trusted home for every private practice in America/i)).toBeVisible()
    await expect(page.locator('img[alt="Counsellors of America"]')).toBeVisible()
    await expect(page.getByText('counsellorsofamerica.com/')).toBeVisible()
    await expect(page.getByText(/counselling practice in India/i)).toHaveCount(0)
  })
})
