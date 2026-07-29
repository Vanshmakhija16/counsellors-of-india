'use client'

import { createContext, useContext, useMemo } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { setTenantSupabaseCreds } from '@/lib/supabase'

interface TenantSupabaseCreds {
  url: string
  anonKey: string
}

const TenantSupabaseContext = createContext<TenantSupabaseCreds | null>(null)

/**
 * Wraps the app (see RootLayout) with the current request's resolved
 * tenant's public Supabase creds. RootLayout is a Server Component that
 * already knows the tenant (via middleware.ts's x-tenant header), so it
 * computes these once per request and hands them down here — no extra
 * client-side fetch needed.
 */
export function TenantSupabaseProvider({
  url,
  anonKey,
  children,
}: TenantSupabaseCreds & { children: React.ReactNode }) {
  // Set synchronously during render (not in a useEffect) so it's guaranteed
  // to run before any child component or plain helper module (e.g.
  // lib/clinical/appointments.ts) calls createClient() from lib/supabase.ts
  // — React always renders a parent fully before its children mount.
  // Idempotent, so re-renders (incl. React Strict Mode's double-invoke) are
  // harmless.
  setTenantSupabaseCreds({ url, anonKey })

  const value = useMemo(() => ({ url, anonKey }), [url, anonKey])
  return (
    <TenantSupabaseContext.Provider value={value}>
      {children}
    </TenantSupabaseContext.Provider>
  )
}

/**
 * Client-side Supabase client, scoped to whichever tenant served the
 * current page. Use this instead of the old `createClient()` from
 * `@/lib/supabase` in any 'use client' component that reads/writes
 * Supabase directly (auth, therapist rows, etc.) — that old helper always
 * pointed at India's project regardless of tenant.
 *
 * Falls back to India's original NEXT_PUBLIC_ env vars if, for some reason,
 * this is rendered outside the provider (shouldn't happen since RootLayout
 * always wraps the tree) — keeps existing behaviour rather than crashing.
 */
export function useSupabaseClient(): SupabaseClient {
  const creds = useContext(TenantSupabaseContext)
  const url = creds?.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anonKey = creds?.anonKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  // Memoized per url/anonKey pair so the same client instance is reused
  // across re-renders (matters for auth session state).
  return useMemo(() => createBrowserClient(url, anonKey), [url, anonKey])
}
