import type { TenantConfig } from './types'

// India — the original, live production tenant. Nothing about this file
// should ever change existing behaviour; it exists so the tenant system has
// an explicit config to fall back to, rather than India being an implicit
// "default" scattered across the codebase.
export const inTenant: TenantConfig = {
  id: 'in',
  domains: [
    'counsellorsofindia.com',
    'www.counsellorsofindia.com',
    // localhost and any unrecognized host fall back to 'in' in
    // src/lib/tenants/index.ts — listed here too for clarity/completeness.
    'localhost',
  ],
  brandName: 'Counsellors of India',
  brandShort: 'Counsellors',
  currency: 'INR',
  currencySymbol: '₹',
  paymentGateway: 'razorpay_payu',
  defaultTimezone: 'Asia/Kolkata',
  supabaseEnvPrefix: 'IN',
  isLive: true,

  // Byte-for-byte copy of what src/app/layout.tsx used to hardcode.
  siteUrl: 'https://www.counsellorsofindia.com',
  metaTitle: 'Counsellors of India | Website Builder for Indian Therapists',
  metaTitleTemplate: '%s | Counsellors of India',
  metaDescription:
    'Start getting therapy clients online. Build your website, take bookings & collect payments in under 10 minutes.',
  ogDescription:
    'Counsellors of India – therapist website builder showing profile, booking and Razorpay payments.',
  keywords: [
    'therapist website builder India',
    'counsellor profile India',
    'online booking for therapists India',
    'practice management Indian therapists',
    'psychologist website India',
    'Razorpay therapy payments',
    'counsellors of India',
  ],
  ogLocale: 'en_IN',
  twitterHandle: '@counsellorsin',
  footerTagline:
    'A calm, trusted home for every counselling practice in India, websites, bookings, and payments in one place.',

  // Byte-for-byte copy of what HomeClient.tsx used to hardcode as PLANS_DATA.
  plans: [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'Get started quickly',
      price: '₹1,499',
      period: '/ year',
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
      price: '₹2,499',
      period: '/ year',
      hi: true,
      recommended: true,
      feats: [
        'Everything in Starter, plus:',
        'Unlimited bookings',
        'WhatsApp booking confirmations',
        'Featured Therapist badge',
        'Higher visibility in directory',
        'Priority support',
      ],
      cta: 'Grow Your Practice',
      ctaStyle: 'filled',
    },
  ],

  defaultCountryIso: 'IN',
  logoPath: '/coi.png',
}
