import { test, expect } from '@playwright/test'
import { US_BASE_URL } from './tenant'

// Smoke test for the US tenant homepage.
// See tests/tenant.ts for why this needs a hosts-file entry rather than
// header spoofing, and the one-time setup steps.

test.describe('America homepage (US tenant)', () => {
  test.use({ baseURL: US_BASE_URL })

  test('loads with US branding and USD pricing', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status(), 'If this fails with a connection error, check the hosts-file setup in tests/tenant.ts').toBeLessThan(400)

    // brandName from us.ts
    await expect(page).toHaveTitle(/Counsellors of America/i)

    // currencySymbol from us.ts — pricing section should show $, never ₹
    await expect(page.getByText('$19')).toBeVisible()
    await expect(page.getByText('$39')).toBeVisible()

    // Sanity check: nothing India-branded leaked onto the US homepage.
    await expect(page.getByText('₹1,499')).toHaveCount(0)
  })
})
