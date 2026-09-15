import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Ensures a confirmed test therapist account exists in India's Supabase
// project, using the admin API — so tests/login-flow.spec.ts can log in
// for real through the actual UI without going through the multi-step
// signup form (password strength meter, demo-session carryover, etc.),
// which would be flaky to automate end-to-end.
//
// Runs once, automatically, before the test suite (wired in via
// playwright.config.ts's globalSetup). Safe to run repeatedly — if the
// user already exists, Supabase's "already registered" error is caught
// and ignored.
//
// Needs these in .env.local (same file `npm run dev` already reads):
//   NEXT_PUBLIC_SUPABASE_URL       (already there for the app to run at all)
//   SUPABASE_SERVICE_ROLE_KEY      (already there for the app to run at all)
//   TEST_USER_EMAIL                (add this — any email, doesn't need to be real)
//   TEST_USER_PASSWORD             (add this — any password, meets Supabase's min length)

function loadEnvLocal() {
  const path = resolve(process.cwd(), '.env.local')
  if (!existsSync(path)) return
  for (const line of readFileSync(path, 'utf-8').split('\n')) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue
    const [, key, rawValue] = match
    if (process.env[key]) continue // don't clobber already-set env vars
    process.env[key] = rawValue.trim().replace(/^["']|["']$/g, '')
  }
}

export default async function globalSetup() {
  loadEnvLocal()

  const url        = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const email       = process.env.TEST_USER_EMAIL
  const password    = process.env.TEST_USER_PASSWORD

  if (!url || !serviceKey) {
    console.warn(
      '[seed-test-user] Skipping — NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY ' +
      'not found in .env.local. tests/login-flow.spec.ts will fail without a seeded user.'
    )
    return
  }
  if (!email || !password) {
    console.warn(
      '[seed-test-user] Skipping — add TEST_USER_EMAIL and TEST_USER_PASSWORD to .env.local ' +
      'to enable the real login test in tests/login-flow.spec.ts.'
    )
    return
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip the email-verification step entirely
  })

  if (error && !/already.*registered|already exists/i.test(error.message)) {
    console.warn(`[seed-test-user] Could not create test user: ${error.message}`)
    return
  }

  console.log(`[seed-test-user] Test user ready: ${email}`)
}
