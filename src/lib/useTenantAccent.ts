'use client'

import { useState } from 'react'
import { resolveTenantId, type TenantId } from '@/lib/tenants'

// Shared brand palette per tenant, for client components that can't read
// the x-tenant header directly (dashboard pages are all 'use client').
// Resolves once from window.location.hostname on mount -- same domain list
// middleware.ts / the pricing page already use, so it's consistent with
// what the rest of the app calls this visitor.
//
// India (and every tenant without an explicit override below) keeps the
// original saffron dashboard exactly as it was. Only 'us' is re-themed —
// blue for the main accent, red as the secondary/alert accent, replacing
// saffron and its darker "SAFFRON_DEEP" shade respectively.
const ACCENT_BY_TENANT: Record<TenantId, { accent: string; accentDark: string; accentSoft: string }> = {
  in: { accent: '#FF9933', accentDark: '#C2650A', accentSoft: 'rgba(255,153,51,0.10)' },
  us: { accent: '#3C3B6E', accentDark: '#B22234', accentSoft: 'rgba(60,59,110,0.10)' }, // Old Glory Blue + Red
  ca: { accent: '#FF9933', accentDark: '#C2650A', accentSoft: 'rgba(255,153,51,0.10)' },
  uk: { accent: '#FF9933', accentDark: '#C2650A', accentSoft: 'rgba(255,153,51,0.10)' },
  au: { accent: '#FF9933', accentDark: '#C2650A', accentSoft: 'rgba(255,153,51,0.10)' },
}

/**
 * Client-side hook for dashboard pages: returns this visitor's tenant-aware
 * brand colors. Use in place of a hardcoded `const SAFFRON = '#FF9933'` /
 * `SAFFRON_DEEP` constant.
 *
 *   const { accent, accentDark, accentSoft } = useTenantAccent()
 *
 * `accent` is the primary color (was always saffron before); `accentDark`
 * is the secondary/hover/emphasis shade (was SAFFRON_DEEP); `accentSoft`
 * is a low-opacity tint for backgrounds (was `${SAFFRON}10`-style hex+alpha
 * tricks, which don't work with a runtime color -- use this instead).
 */
export function useTenantAccent() {
  const [tenantId] = useState<TenantId>(() => {
    if (typeof window === 'undefined') return 'in'
    return resolveTenantId(window.location.hostname)
  })
  return { tenantId, ...ACCENT_BY_TENANT[tenantId] }
}
