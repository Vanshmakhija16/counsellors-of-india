import { test, expect } from '@playwright/test'
import { US_BASE_URL } from './tenant'

// AuthLayout (used by /login) renders brandName only as an <img alt="...">
// attribute and a monogram initial — never as visible text. The real
// visible, tenant-specific signal on this page is the tagline (see
// src/components/layout/AuthLayout.tsx and src/lib/tenants/{in,us}.ts).

test.describe('Login page — India (default tenant)', () => {
  test('renders with India tagline and logo', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status()).toBeLessThan(400)
    // footerTagline from in.ts
    await expect(page.getByText(/calm, trusted home for every counselling practice in India/i)).toBeVisible()
    await expect(page.locator('img[alt="Counsellors of India"]')).toBeVisible()
  })
})

test.describe('Login page — US tenant', () => {
  test.use({ baseURL: US_BASE_URL })

  test('renders with US tagline and logo, not India', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status(), 'If this fails with a connection error, check the hosts-file setup in tests/tenant.ts').toBeLessThan(400)
    // footerTagline from us.ts
    await expect(page.getByText(/calm, trusted home for every private practice in America/i)).toBeVisible()
    await expect(page.locator('img[alt="Counsellors of America"]')).toBeVisible()
    await expect(page.getByText(/counselling practice in India/i)).toHaveCount(0)
  })
})
