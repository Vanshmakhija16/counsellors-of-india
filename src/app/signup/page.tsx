import { getCurrentTenant } from '@/lib/tenants/server'
import SignupPageClient from './SignupPageClient'

/**
 * Server component — resolves the current tenant (via middleware.ts's
 * x-tenant header) so the signup form can default its country-code picker,
 * public-domain preview, and branding panel to the right country, instead
 * of always showing India's +91 / counsellorsofindia.com / brand mark
 * regardless of which portal the person actually opened.
 */
export default async function SignupPage() {
  const tenant = await getCurrentTenant()
  const domainDisplay = `${tenant.siteUrl.replace(/^https?:\/\/(www\.)?/, '')}/`

  return (
    <SignupPageClient
      defaultCountryIso={tenant.defaultCountryIso}
      domainDisplay={domainDisplay}
      brandName={tenant.brandName}
      tagline={tenant.footerTagline}
      logoPath={tenant.logoPath}
    />
  )
}
