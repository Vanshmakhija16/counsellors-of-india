import type { TenantConfig } from './types'

// UK — stub. Resolves correctly via middleware for local testing, but not
// linked from production nav/marketing yet. Fill in real copy/branding in
// Phase 5/6 once America is stable (see MULTI_COUNTRY_EXPANSION_POA.md,
// Phase 11).
export const ukTenant: TenantConfig = {
  id: 'uk',
  domains: [
    'counsellorsofuk.com',
    'www.counsellorsofuk.com',
    'counsellorsofuk.local',
  ],
  brandName: 'Counsellors of UK',
  brandShort: 'Counsellors',
  currency: 'GBP',
  currencySymbol: '£',
  paymentGateway: 'stripe',
  defaultTimezone: 'Europe/London',
  supabaseEnvPrefix: 'UK',
  isLive: false,

  // Stub metadata — real copy comes in Phase 11 (after America is stable).
  siteUrl: 'https://www.counsellorsofuk.com',
  metaTitle: 'Counsellors of UK | Website Builder for Therapists',
  metaTitleTemplate: '%s | Counsellors of UK',
  metaDescription:
    'Start getting therapy clients online. Build your website, take bookings & collect payments in under 10 minutes.',
  ogDescription:
    'Counsellors of UK – therapist website builder showing profile, booking and secure Stripe payments.',
  keywords: ['therapist website builder UK', 'counsellors of UK'],
  ogLocale: 'en_GB',
  twitterHandle: '@counsellorsuk',
  footerTagline:
    'A calm, trusted home for every counselling practice in the UK, websites, bookings, and payments in one place.',

  // Stub placeholder — real GBP pricing comes in Phase 11.
  plans: [
    { id: 'starter', name: 'Starter', tagline: 'Get started quickly', price: '£15', period: '/ month', hi: false, recommended: false, feats: ['Professional therapist website', 'Custom domain', 'Online appointment booking', 'Secure online payments'], cta: 'Get Started', ctaStyle: 'ghost' },
    { id: 'pro', name: 'PRO', tagline: 'Best for growing practices', price: '£30', period: '/ month', hi: true, recommended: true, feats: ['Everything in Starter, plus:', 'Unlimited bookings', 'Priority support'], cta: 'Grow Your Practice', ctaStyle: 'filled' },
  ],

  defaultCountryIso: 'GB',
}
