import { createBrowserClient } from '@supabase/ssr'

// Module-scoped, set once per page load by TenantSupabaseProvider (see
// components/providers/TenantSupabaseProvider.tsx) synchronously during its
// render — i.e. before any child component or helper function runs — so
// every createClient() call below, including ones made from plain helper
// modules like lib/clinical/appointments.ts that aren't React components
// and can't use hooks, automatically targets the correct tenant's Supabase
// project instead of always defaulting to India's.
let tenantCreds: { url: string; anonKey: string } | null = null

export function setTenantSupabaseCreds(creds: { url: string; anonKey: string }) {
  tenantCreds = creds
}

export function createClient() {
  return createBrowserClient(
    tenantCreds?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    tenantCreds?.anonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}