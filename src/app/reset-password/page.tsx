import { getCurrentTenant } from '@/lib/tenants/server'
import ResetPasswordPageClient from './ResetPasswordPageClient'

export default async function ResetPasswordPage() {
  const tenant = await getCurrentTenant()
  const isUs = tenant.id === 'us'

  return (
    <ResetPasswordPageClient
      brandName={tenant.brandName}
      tagline={tenant.footerTagline}
      logoPath={tenant.logoPath}
      accentColor={isUs ? '#3C3B6E' : undefined}
      accentColorDark={isUs ? '#3C3B6E' : undefined}
      panelBackground={isUs ? 'linear-gradient(155deg, #14133A 0%, #23225A 42%, #3C3B6E 100%)' : undefined}
      panelAccent={isUs ? '#B22234' : undefined}
    />
  )
}
