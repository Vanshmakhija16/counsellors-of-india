import type { TenantConfig, TenantId } from './types'
import { inTenant } from './in'
import { usTenant } from './us'
import { caTenant } from './ca'
import { ukTenant } from './uk'
import { auTenant } from './au'

export type { TenantConfig, TenantId, PaymentGateway } from './types'

// The one true list of tenants. Adding a 6th country later means adding one
// file in this folder + one line here — nothing else in this registry
// changes.
export const TENANTS: Record<TenantId, TenantConfig> = {
  in: inTenant,
  us: usTenant,
  ca: caTenant,
  uk: ukTenant,
  au: auTenant,
}

// India is the safe default. Any host we don't recognise (a typo domain, a
// preview/staging URL, a bot hitting the IP directly, etc.) resolves here,
// which is what guarantees this whole system can never accidentally change
// the live India site's behaviour — see MULTI_COUNTRY_EXPANSION_POA.md §4.
export const DEFAULT_TENANT: TenantId = 'in'

// Built once at module load: every domain string -> its TenantId, so
// resolution is an O(1) lookup instead of looping TENANTS on every request.
const DOMAIN_TO_TENANT: Record<string, TenantId> = Object.values(TENANTS).reduce(
  (acc, tenant) => {
    tenant.domains.forEach(domain => {
      acc[domain.toLowerCase()] = tenant.id
    })
    return acc
  },
  {} as Record<string, TenantId>
)

/**
 * Resolve a raw Host header (e.g. "counsellorsofamerica.com:3000") to a
 * TenantId. Strips port + leading "www." is handled by also registering the
 * www. domain explicitly in each tenant file (kept explicit on purpose —
 * easier to read in each config than a regex normalising it away).
 */
export function resolveTenantId(host: string | null | undefined): TenantId {
  if (!host) return DEFAULT_TENANT
  const hostname = host.split(':')[0].toLowerCase().trim()
  return DOMAIN_TO_TENANT[hostname] ?? DEFAULT_TENANT
}

export function getTenantConfig(id: TenantId): TenantConfig {
  return TENANTS[id]
}

/** Convenience: resolve straight from a Host header to the full config. */
export function getTenantConfigForHost(host: string | null | undefined): TenantConfig {
  return getTenantConfig(resolveTenantId(host))
}
