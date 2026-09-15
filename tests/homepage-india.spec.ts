import { test, expect } from '@playwright/test'

// Smoke test for the India tenant — the default/live tenant.
//
// Any unrecognised Host (including "localhost", which is what this test
// hits by default) resolves to the 'in' tenant per src/lib/tenants/index.ts.
// So this test needs no special header tricks: it's just verifying the
// homepage renders India's actual branding from src/lib/tenants/in.ts.

test.describe('India homepage (default tenant)', () => {
  test('loads with India branding and pricing', async ({ page }) => {
    const response = await page.goto('/')
    expect(response?.status()).toBeLessThan(400)

    // brandName from in.ts
    await expect(page).toHaveTitle(/Counsellors of India/i)

    // currencySymbol from in.ts — pricing section should show ₹, never $
    await expect(page.getByText('₹1,499')).toBeVisible()
    await expect(page.getByText('₹2,499')).toBeVisible()

    // Sanity check: nothing US-branded leaked onto the India homepage.
    await expect(page.getByText('Counsellors of America')).toHaveCount(0)
  })

  test('nav links to key sections work', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#templates')).toBeAttached()
    await expect(page.locator('#therapists')).toBeAttached()
    await expect(page.locator('#faq')).toBeAttached()
  })
})
