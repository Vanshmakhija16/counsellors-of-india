import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { getCurrentTenant } from './tenants/server'

// ───────────────────────────────────────────────────────────────────────────
// Tenant-aware Supabase credential resolution.
//
// Each tenant can have its own Supabase project via prefixed env vars:
//   SUPABASE_URL_<PREFIX>, SUPABASE_ANON_KEY_<PREFIX>, SUPABASE_SERVICE_ROLE_KEY_<PREFIX>
// e.g. SUPABASE_URL_US, SUPABASE_ANON_KEY_US, SUPABASE_SERVICE_ROLE_KEY_US
//
// India (`IN`) is the one exception: if the prefixed vars aren't set, this
// falls back to the ORIGINAL, already-in-production env vars
// (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY /
// SUPABASE_SERVICE_ROLE_KEY). This guarantees zero config changes are
// required in Azure for the live India site to keep working exactly as
// it does today — see MULTI_COUNTRY_EXPANSION_POA.md, Phase 1.
// ───────────────────────────────────────────────────────────────────────────

interface SupabaseCreds {
  url: string
  anonKey: string
  serviceRoleKey: string
}

function getCredsForPrefix(prefix: string): SupabaseCreds {
  const url = process.env[`SUPABASE_URL_${prefix}`]
  const anonKey = process.env[`SUPABASE_ANON_KEY_${prefix}`]
  const serviceRoleKey = process.env[`SUPABASE_SERVICE_ROLE_KEY_${prefix}`]

  if (url && anonKey && serviceRoleKey) {
    return { url, anonKey, serviceRoleKey }
  }

  if (prefix === 'IN') {
    // Fallback to the original, already-deployed env var names so the live
    // India site needs zero Azure config changes for this refactor.
    const fallbackUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const fallbackAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const fallbackService = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (fallbackUrl && fallbackAnon && fallbackService) {
      return { url: fallbackUrl, anonKey: fallbackAnon, serviceRoleKey: fallbackService }
    }
  }

  throw new Error(
    `Missing Supabase credentials for tenant prefix "${prefix}". ` +
    `Set SUPABASE_URL_${prefix}, SUPABASE_ANON_KEY_${prefix}, and SUPABASE_SERVICE_ROLE_KEY_${prefix}.`
  )
}

/**
 * Server-side Supabase client (App Router / Server Components).
 * Uses the anon key + cookie-based session, for whichever tenant the
 * current request resolved to (via middleware.ts -> getCurrentTenant()).
 * Must be called inside a Server Component, Route Handler, or Server Action.
 *
 * (Already async before this change, since cookies() is async in this
 * Next.js version — adding tenant resolution here does not change its
 * signature, so every existing `await createServerSupabaseClient()` call
 * site keeps working unmodified.)
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  const tenant = await getCurrentTenant()
  const creds = getCredsForPrefix(tenant.supabaseEnvPrefix)

  return createServerClient(
    creds.url,
    creds.anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Components cannot set cookies — safe to ignore
          }
        },
      },
    }
  )
}

/**
 * Service-role Supabase client — bypasses RLS.
 * Synchronous — safe to call without await, UNCHANGED from before this
 * refactor. Still always uses India's original env vars directly.
 *
 * Deliberately NOT made tenant-aware in place: this function is likely
 * called without `await` across many existing API routes (payments,
 * bookings, etc.), so flipping it to async here would silently break every
 * one of those call sites. Use `createServiceSupabaseClientForTenant()`
 * below for any NEW route that needs to target a specific tenant's
 * database — existing call sites are migrated deliberately, one at a time,
 * in Phase 2/3 of MULTI_COUNTRY_EXPANSION_POA.md, not automatically here.
 */
export function createServiceSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * Public (non-secret) Supabase creds for the current request's tenant —
 * safe to pass down into client components. Anon keys are meant to be
 * public; RLS policies are what actually enforce access control, not
 * secrecy of this key. Used by RootLayout to feed TenantSupabaseProvider so
 * client-side auth (login/signup) reads/writes the correct tenant's
 * Supabase project instead of always defaulting to India's.
 */
export async function getPublicSupabaseCredsForTenant() {
  const tenant = await getCurrentTenant()
  const creds = getCredsForPrefix(tenant.supabaseEnvPrefix)
  return { url: creds.url, anonKey: creds.anonKey }
}

/**
 * Tenant-aware service-role client. ASYNC — must be awaited. Resolves the
 * current request's tenant (via middleware.ts) and returns a service-role
 * client pointed at that tenant's own Supabase project.
 *
 * Use this in any NEW route/action that needs to read/write a specific
 * tenant's database. Do not swap this in for `createServiceSupabaseClient()`
 * in existing India call sites without testing — see the note above.
 */
export async function createServiceSupabaseClientForTenant() {
  const tenant = await getCurrentTenant()
  const creds = getCredsForPrefix(tenant.supabaseEnvPrefix)
  return createClient(creds.url, creds.serviceRoleKey)
}
