import 'server-only'

/**
 * lib/admin.ts — server-side gate for /admin/* pages.
 *
 * Reuses the SAME auth everyone else uses (Supabase Auth cookie session)
 * plus the therapists.role = 'admin' column that already protects the
 * blog admin via RLS. No separate admin credential system -- one fewer
 * thing to secure, and admin accounts are just therapist rows with
 * role = 'admin' set directly in the database.
 *
 * Unlike /admin/blog (which relies on RLS alone with no page-level check),
 * this panel surfaces client PII (names, emails, phone numbers across
 * every therapist), so every /admin/* page calls requireAdmin() at the
 * top -- non-admins are redirected away before any data is even fetched,
 * not just blocked at the query level.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createServiceSupabaseClient } from '@/lib/supabase-server'

export interface AdminUser {
  id: string
  full_name: string | null
  email: string | null
}

export async function requireAdmin(): Promise<AdminUser> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => {
          // Server Components can't write cookies (only Route Handlers and
          // Server Actions can) -- this call is Supabase trying to persist
          // a refreshed session token. This project has no middleware.ts,
          // so nothing else refreshes it server-side either; safe to
          // swallow anyway, because the browser's own Supabase client
          // (used everywhere else in the app, e.g. DashboardLayout.tsx)
          // independently keeps the session cookie fresh client-side. The
          // only real effect of ignoring this write is that a token
          // refreshed mid-request here doesn't get echoed back to the
          // browser on THIS response -- acceptable for an admin page read.
          try {
            cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // Expected in Server Components -- see comment above.
          }
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')

  const db = createServiceSupabaseClient()
  const { data: therapist } = await db
    .from('therapists')
    .select('role, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  if (!therapist || therapist.role !== 'admin') redirect('/dashboard')

  return { id: user.id, full_name: therapist.full_name, email: therapist.email ?? user.email ?? null }
}

/**
 * Same check as requireAdmin(), but for Route Handlers -- returns null on
 * failure instead of calling redirect() (which throws a special Next.js
 * error meant for page renders, not API responses). Callers should return
 * a 401/403 JSON response when this comes back null.
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const db = createServiceSupabaseClient()
  const { data: therapist } = await db
    .from('therapists')
    .select('role, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  if (!therapist || therapist.role !== 'admin') return null

  return { id: user.id, full_name: therapist.full_name, email: therapist.email ?? user.email ?? null }
}
