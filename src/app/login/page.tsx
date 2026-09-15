import { getCurrentTenant } from '@/lib/tenants/server'
import LoginPageClient from './LoginPageClient'

/**
 * Server component — resolves the current tenant so the login page's
 * AuthLayout branding panel shows the right brand (e.g. "Counsellors of
 * America" on the America portal) instead of always hardcoding India.
 *
 * Also re-themes the accent color for America, mirroring signup/page.tsx
 * exactly (see that file's comment for why both variables point at the
 * same blue rather than a red/blue pair). Every other tenant keeps the
 * default saffron by passing nothing.
 */
export default async function LoginPage() {
  const tenant = await getCurrentTenant()

  const isUs = tenant.id === 'us'
  const accentColor     = isUs ? '#3C3B6E' : undefined // Old Glory Blue
  const accentColorDark = isUs ? '#3C3B6E' : undefined // Old Glory Blue

  return (
    <LoginPageClient
      brandName={tenant.brandName}
      tagline={tenant.footerTagline}
      logoPath={tenant.logoPath}
      accentColor={accentColor}
      accentColorDark={accentColorDark}
      contentClassName={isUs ? 'mt-4' : undefined}
      headerClassName={isUs ? 'mt-4 mb-6' : undefined}
      panelBackground={isUs ? 'linear-gradient(155deg, #14133A 0%, #23225A 42%, #3C3B6E 100%)' : undefined}
      panelAccent={isUs ? '#B22234' : undefined}
    />
  )
}
