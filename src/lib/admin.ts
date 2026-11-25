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

import { redirect } from 'next/navigation'
import {
  createServerSupabaseClient,
  createServiceSupabaseClientForTenantOrLegacyIndia,
} from '@/lib/supabase-server'

export interface AdminUser {
  id: string
  full_name: string | null
  email: string | null
}

export async function requireAdmin(): Promise<AdminUser> {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/admin')

  const db = await createServiceSupabaseClientForTenantOrLegacyIndia()
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
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const db = await createServiceSupabaseClientForTenantOrLegacyIndia()
  const { data: therapist } = await db
    .from('therapists')
    .select('role, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  if (!therapist || therapist.role !== 'admin') return null

  return { id: user.id, full_name: therapist.full_name, email: therapist.email ?? user.email ?? null }
}
