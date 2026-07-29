import { getCurrentTenant } from '@/lib/tenants/server'
import LoginPageClient from './LoginPageClient'

/**
 * Server component — resolves the current tenant so the login page's
 * AuthLayout branding panel shows the right brand (e.g. "Counsellors of
 * America" on the America portal) instead of always hardcoding India.
 */
export default async function LoginPage() {
  const tenant = await getCurrentTenant()

  return (
    <LoginPageClient
      brandName={tenant.brandName}
      tagline={tenant.footerTagline}
      logoPath={tenant.logoPath}
    />
  )
}
