import { headers } from 'next/headers'
import { getTenantConfig } from '@/lib/tenants'
import HomeClient, { type HomeTenant } from '@/components/home/HomeClient'

/**
 * Server component — reads the x-tenant header set by middleware and passes
 * a lean HomeTenant prop to the client. India is the default, so the live
 * site renders byte-for-byte what it did before.
 */
export default async function Home() {
  const headersList = await headers()
  const tenantId = headersList.get('x-tenant') ?? 'in'
  const config   = getTenantConfig(tenantId as any)

  const tenant: HomeTenant = {
    brandName:      config.brandName,
    currencySymbol: config.currencySymbol,
    siteUrl:        config.siteUrl,
    footerTagline:  config.footerTagline,
    plans:          config.plans,
  }

  return <HomeClient tenant={tenant} />
}
