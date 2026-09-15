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

  // America-only accent re-theme, scoped to just this page (see
  // AuthLayout's --auth-accent/--auth-accent-dark CSS variables).
  // Every other tenant keeps the default saffron by passing nothing.
  //
  // accentColor / accentColorDark both stay Old Glory Blue -- they drive
  // the left form (OTP box, focus rings, checkmark) AND the right panel's
  // background shapes, so keeping them blue leaves those alone. Only the
  // JourneyProgress step tracker gets its own separate red
  // (journeyAccentColor below), instead of reusing accentColorDark.
  const isUs = tenant.id === 'us'
  const accentColor       = isUs ? '#3C3B6E' : undefined // Old Glory Blue
  const accentColorDark   = isUs ? '#3C3B6E' : undefined // Old Glory Blue
  const journeyAccentColor = isUs ? '#B22234' : undefined // Old Glory Red -- JourneyProgress only

  return (
    <SignupPageClient
      defaultCountryIso={tenant.defaultCountryIso}
      domainDisplay={domainDisplay}
      brandName={tenant.brandName}
      tagline={tenant.footerTagline}
      logoPath={tenant.logoPath}
      accentColor={accentColor}
      accentColorDark={accentColorDark}
      journeyAccentColor={journeyAccentColor}
      contentClassName={isUs ? 'mt-4' : undefined}
      headerClassName={isUs ? 'mt-4 mb-6' : undefined}
      panelBackground={isUs ? 'linear-gradient(155deg, #14133A 0%, #23225A 42%, #3C3B6E 100%)' : undefined}
      panelAccent={isUs ? '#B22234' : undefined}
    />
  )
}
