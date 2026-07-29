import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { resolveTenantId } from '@/lib/tenants'

// ───────────────────────────────────────────────────────────────────────────
// Multi-tenant domain resolution ("the receptionist").
//
// Reads the incoming Host header, resolves it to a TenantId (in/us/ca/uk/au),
// and forwards it as an `x-tenant` request header so every server component
// and route handler downstream can read it (via headers() / request.headers)
// without re-deriving it themselves.
//
// Golden rule (see MULTI_COUNTRY_EXPANSION_POA.md §4 and §5 Phase 0):
// any host we don't recognise — including localhost and the real India
// domain — resolves to the 'in' tenant. This middleware is additive only;
// it must never change the live India site's behaviour.
// ───────────────────────────────────────────────────────────────────────────

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  const tenantId = resolveTenantId(host)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant', tenantId)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

// Run on everything except static assets / Next internals, so both pages
// and API routes get the x-tenant header (payment routes need it too, once
// Phase 2/3 land).
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)',
  ],
}
