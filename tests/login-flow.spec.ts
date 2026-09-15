import { test, expect } from '@playwright/test'

// Real login attempt against the actual UI, using a test account seeded
// by tests/setup/seed-test-user.ts (see that file for what it needs in
// .env.local). Unlike login-page.spec.ts (which only checks the page
// renders), this one actually submits real credentials through the same
// Supabase signInWithPassword() call a real user's login goes through —
// see src/app/login/LoginPageClient.tsx.

test.describe('Login — real authentication attempt', () => {
  test.skip(
    !process.env.TEST_USER_EMAIL || !process.env.TEST_USER_PASSWORD,
    'Set TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.local to enable this test — see tests/setup/seed-test-user.ts'
  )

  test('valid credentials log in and reach past /login', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder('Enter your email here...').fill(process.env.TEST_USER_EMAIL!)
    await page.getByPlaceholder('Your password').fill(process.env.TEST_USER_PASSWORD!)
    await page.getByRole('button', { name: 'Sign in' }).click()

    // Successful login redirects to /dashboard (or /onboarding for a
    // brand-new account with no therapist profile yet) — either way, it
    // must leave /login. This is the one invariant true regardless of
    // this test account's onboarding state.
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10_000 })
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('wrong password shows an error and stays on /login', async ({ page }) => {
    await page.goto('/login')

    await page.getByPlaceholder('Enter your email here...').fill(process.env.TEST_USER_EMAIL!)
    await page.getByPlaceholder('Your password').fill('definitely-the-wrong-password')
    await page.getByRole('button', { name: 'Sign in' }).click()

    // handleLogin's catch block renders err.message in a red banner — see
    // LoginPageClient.tsx. Text varies by Supabase error, so just check
    // some error banner appeared and we're still on /login.
    await expect(page.locator('.text-red-600')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })
})
