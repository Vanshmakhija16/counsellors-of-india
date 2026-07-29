import type { TenantConfig } from './types'

// Australia — stub. Resolves correctly via middleware for local testing,
// but not linked from production nav/marketing yet. Fill in real
// copy/branding in Phase 5/6 once America is stable (see
// MULTI_COUNTRY_EXPANSION_POA.md, Phase 11).
export const auTenant: TenantConfig = {
  id: 'au',
  domains: [
    'counsellorsofaustralia.com',
    'www.counsellorsofaustralia.com',
    'counsellorsofaustralia.local',
  ],
  brandName: 'Counsellors of Australia',
  brandShort: 'Counsellors',
  currency: 'AUD',
  currencySymbol: '$',
  paymentGateway: 'stripe',
  defaultTimezone: 'Australia/Sydney',
  supabaseEnvPrefix: 'AU',
  isLive: false,

  // Stub metadata — real copy comes in Phase 11 (after America is stable).
  siteUrl: 'https://www.counsellorsofaustralia.com',
  metaTitle: 'Counsellors of Australia | Website Builder for Therapists',
  metaTitleTemplate: '%s | Counsellors of Australia',
  metaDescription:
    'Start getting therapy clients online. Build your website, take bookings & collect payments in under 10 minutes.',
  ogDescription:
    'Counsellors of Australia – therapist website builder showing profile, booking and secure Stripe payments.',
  keywords: ['therapist website builder Australia', 'counsellors of Australia'],
  ogLocale: 'en_AU',
  twitterHandle: '@counsellorsau',
  footerTagline:
    'A calm, trusted home for every counselling practice in Australia, websites, bookings, and payments in one place.',

  // Stub placeholder — real AUD pricing comes in Phase 11.
  plans: [
    { id: 'starter', name: 'Starter', tagline: 'Get started quickly', price: '$29', period: '/ month', hi: false, recommended: false, feats: ['Professional therapist website', 'Custom domain', 'Online appointment booking', 'Secure online payments'], cta: 'Get Started', ctaStyle: 'ghost' },
    { id: 'pro', name: 'PRO', tagline: 'Best for growing practices', price: '$59', period: '/ month', hi: true, recommended: true, feats: ['Everything in Starter, plus:', 'Unlimited bookings', 'Priority support'], cta: 'Grow Your Practice', ctaStyle: 'filled' },
  ],

  defaultCountryIso: 'AU',
}
