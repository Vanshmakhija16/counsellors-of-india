import type { TenantConfig } from './types'

// America — first expansion tenant. Config exists and resolves correctly
// via middleware, but isLive stays false until Phase 5 (branding/copy) and
// Phase 6 (legal pages) are done — see MULTI_COUNTRY_EXPANSION_POA.md.
export const usTenant: TenantConfig = {
  id: 'us',
  domains: [
    'counsellorsofamerica.com',
    'www.counsellorsofamerica.com',
    // local testing via Windows hosts file, per the POA:
    // 127.0.0.1  counsellorsofamerica.local
    'counsellorsofamerica.local',
  ],
  brandName: 'Counsellors of America',
  brandShort: 'Counsellors',
  currency: 'USD',
  currencySymbol: '$',
  paymentGateway: 'stripe',
  defaultTimezone: 'America/New_York',
  supabaseEnvPrefix: 'US',
  isLive: false,

  siteUrl: 'https://www.counsellorsofamerica.com',
  metaTitle: 'Counsellors of America | Website Builder for Therapists',
  metaTitleTemplate: '%s | Counsellors of America',
  metaDescription:
    'Start getting therapy clients online. Build your website, take bookings & collect payments in under 10 minutes.',
  ogDescription:
    'Counsellors of America – therapist website builder showing profile, booking and secure Stripe payments.',
  keywords: [
    'therapist website builder',
    'counselor profile website',
    'online booking for therapists',
    'private practice management software',
    'psychologist website builder',
    'Stripe therapy payments',
    'counsellors of America',
  ],
  ogLocale: 'en_US',
  twitterHandle: '@counsellorsus',
  footerTagline:
    'A calm, trusted home for every private practice in America, websites, bookings, and payments in one place.',

  // PLACEHOLDER USD pricing — not yet confirmed with real numbers or live
  // Stripe products. Update the `price` strings here once you've decided
  // final USD pricing and created the matching Stripe price objects.
  plans: [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'Get started quickly',
      price: '$19',
      period: '/ month',
      hi: false,
      recommended: false,
      feats: [
        'Professional therapist website',
        'Custom domain',
        'Online appointment booking',
        'Secure online payments',
        'Email booking confirmations',
        'Client management dashboard',
        'Shareable profile link',
        'Up to 10 bookings per month',
      ],
      cta: 'Get Started',
      ctaStyle: 'ghost',
    },
    {
      id: 'pro',
      name: 'PRO',
      tagline: 'Best for growing practices',
      price: '$39',
      period: '/ month',
      hi: true,
      recommended: true,
      feats: [
        'Everything in Starter, plus:',
        'Unlimited bookings',
        'SMS booking confirmations',
        'Featured Therapist badge',
        'Higher visibility in directory',
        'Priority support',
      ],
      cta: 'Grow Your Practice',
      ctaStyle: 'filled',
    },
  ],

  defaultCountryIso: 'US',

  // TEMP: no dedicated America logo asset exists yet, so reuse the India
  // mark for now rather than showing a text/monogram fallback. Swap this
  // to a real America-specific logo path once one exists.
  logoPath: '/coi.png',
}
