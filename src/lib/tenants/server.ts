import { headers } from 'next/headers'
import { getTenantConfig, DEFAULT_TENANT, TENANTS } from './index'
import type { TenantConfig, TenantId } from './types'

/**
 * Server-only helper: reads the `x-tenant` header that middleware.ts set on
 * this request (already a resolved TenantId, e.g. 'us' — NOT a domain) and
 * returns the matching TenantConfig. Use this from server components /
 * route handlers instead of re-reading the Host header yourself.
 *
 * NOTE: does not yet change any behaviour anywhere it's called from — Phase
 * 1+ (database selection, payment gateway, pricing, branding) will start
 * consuming this. See MULTI_COUNTRY_EXPANSION_POA.md.
 */
export async function getCurrentTenant(): Promise<TenantConfig> {
  const headerList = await headers()
  const tenantHeader = headerList.get('x-tenant') as TenantId | null
  const tenantId: TenantId = tenantHeader && tenantHeader in TENANTS ? tenantHeader : DEFAULT_TENANT
  return getTenantConfig(tenantId)
}
