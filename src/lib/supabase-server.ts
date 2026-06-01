import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/**
 * Server-side Supabase client (App Router / Server Components).
 * Uses the anon key + cookie-based session.
 * Must be called inside a Server Component, Route Handler, or Server Action.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
 * Synchronous — safe to call without await.
 * Use ONLY in trusted server contexts (Route Handlers, Server Actions).
 * NEVER expose to the browser.
 */
export function createServiceSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
