import type { TenantConfig } from './types'

// Canada — stub. Resolves correctly via middleware for local testing, but
// not linked from production nav/marketing yet. Fill in real copy/branding
// in Phase 5/6 once America is stable (see MULTI_COUNTRY_EXPANSION_POA.md,
// Phase 11).
export const caTenant: TenantConfig = {
  id: 'ca',
  domains: [
    'counsellorsofcanada.com',
    'www.counsellorsofcanada.com',
    'counsellorsofcanada.local',
  ],
  brandName: 'Counsellors of Canada',
  brandShort: 'Counsellors',
  currency: 'CAD',
  currencySymbol: '$',
  paymentGateway: 'stripe',
  defaultTimezone: 'America/Toronto',
  supabaseEnvPrefix: 'CA',
  isLive: false,

  // Stub metadata — real copy comes in Phase 11 (after America is stable).
  siteUrl: 'https://www.counsellorsofcanada.com',
  metaTitle: 'Counsellors of Canada | Website Builder for Therapists',
  metaTitleTemplate: '%s | Counsellors of Canada',
  metaDescription:
    'Start getting therapy clients online. Build your website, take bookings & collect payments in under 10 minutes.',
  ogDescription:
    'Counsellors of Canada – therapist website builder showing profile, booking and secure Stripe payments.',
  keywords: [
    'therapist website builder Canada',
    'counsellor profile website Canada',
    'online booking for therapists Canada',
    'private practice management software Canada',
    'psychologist website builder Canada',
    'Stripe therapy payments Canada',
    'counsellors of Canada',
  ],
  ogLocale: 'en_CA',
  twitterHandle: '@counsellorsca',
  footerTagline:
    'A calm, trusted home for every counselling practice in Canada, websites, bookings, and payments in one place.',

  // PLACEHOLDER CAD pricing — not yet confirmed with real numbers or live
  // Stripe products. Update the `price` strings here once you've decided
  // final CAD pricing and created the matching Stripe price objects.
  plans: [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'Get started quickly',
      price: '$25',
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
      price: '$49',
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

  defaultCountryIso: 'CA',

  // TEMP: no dedicated Canada logo asset exists yet, so reuse the India
  // mark for now rather than showing a text/monogram fallback. Swap this
  // to a real Canada-specific logo path once one exists.
  logoPath: '/coi.png',
}
