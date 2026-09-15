import { defineConfig, devices } from '@playwright/test'

// Playwright config for the counsellors-of-india / counsellors-of-america
// multi-tenant Next.js app.
//
// Tenant resolution happens in src/middleware.ts purely off the Host
// header (see resolveTenantId in src/lib/tenants/index.ts). Real browsers
// refuse to let you set the Host header directly on navigation, so tests
// that need to simulate the US tenant intercept requests with page.route()
// and rewrite the Host header there instead — see tests/homepage-us.spec.ts.
//
// Run against your local dev server:
//   npm run dev            (in one terminal)
//   npx playwright test    (in another)
//
// Or point PLAYWRIGHT_BASE_URL at a deployed environment to smoke-test it:
//   PLAYWRIGHT_BASE_URL=https://counsellorsofindia.com npx playwright test

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/setup/seed-test-user.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Only auto-start a dev server when testing locally (not when pointed at
  // a deployed URL via PLAYWRIGHT_BASE_URL).
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
})
