// ───────────────────────────────────────────────────────────────────────────
// Multi-country tenant types.
//
// A "tenant" = one country site (India, America, Canada, UK, Australia).
// The same codebase serves all of them; middleware.ts reads the incoming
// request's Host header, resolves it to a TenantId below, and every route/
// component that needs country-specific behaviour reads its settings from
// the matching config file in this folder instead of hardcoding India.
//
// See MULTI_COUNTRY_EXPANSION_POA.md for the full plan this implements.
// ───────────────────────────────────────────────────────────────────────────

export type TenantId = 'in' | 'us' | 'ca' | 'uk' | 'au'

export type PaymentGateway = 'razorpay_payu' | 'stripe' | 'paypal'

/** One pricing tier shown on the homepage's "See our Plans" section. */
export interface PricingPlan {
  id: string
  name: string
  tagline: string
  /** Pre-formatted display price, e.g. '₹1,499' or '$29'. Includes the
   *  currency symbol so the UI never has to reassemble it. */
  price: string
  period: string
  hi: boolean
  recommended: boolean
  feats: string[]
  cta: string
  ctaStyle: 'ghost' | 'filled'
}

export interface TenantConfig {
  id: TenantId

  /** Production domains that resolve to this tenant (no protocol, no port). */
  domains: string[]

  /** Human-facing brand name shown in nav/footer/emails. */
  brandName: string

  /** Short brand name for tight spaces (mobile nav, favicon title, etc). */
  brandShort: string

  /** ISO 4217 currency code, e.g. 'INR', 'USD'. */
  currency: string

  /** Currency symbol used in UI, e.g. '₹', '$', '£'. */
  currencySymbol: string

  /** Which payment stack this tenant uses. India keeps Razorpay/PayU;
   *  every other country routes through Stripe. See getPaymentProvider(). */
  paymentGateway: PaymentGateway

  /** IANA default timezone used when a therapist hasn't set their own
   *  (e.g. therapist profile creation defaults to this). */
  defaultTimezone: string

  /** Supabase project env var prefix, e.g. 'IN' -> reads
   *  SUPABASE_URL_IN / SUPABASE_SERVICE_ROLE_KEY_IN, etc.
   *  See supabase-server.ts for how this is consumed. */
  supabaseEnvPrefix: string

  /** Whether this tenant is fully built out yet. Stub tenants (ca/uk/au for
   *  now) still resolve correctly via middleware but are not linked from
   *  production nav/marketing yet — flip to true once Phase 5/6 are done
   *  for that country. */
  isLive: boolean

  // ── Phase 5: branding / SEO metadata ──────────────────────────────────
  // Everything below feeds src/app/layout.tsx's generateMetadata(), plus
  // the shared SiteNav / SiteFooter components. India's values here are a
  // byte-for-byte copy of what layout.tsx used to hardcode, so wiring this
  // up changes nothing about the live India site.

  /** Canonical site URL, no trailing slash, e.g. 'https://www.counsellorsofindia.com'. */
  siteUrl: string

  /** <title> default, shown on the homepage / untitled pages. */
  metaTitle: string

  /** <title> template for every other page, e.g. '%s | Counsellors of India'. */
  metaTitleTemplate: string

  /** Default meta description (homepage). */
  metaDescription: string

  /** Open Graph / Twitter description — can differ slightly from metaDescription. */
  ogDescription: string

  /** SEO keywords array. */
  keywords: string[]

  /** Open Graph locale, e.g. 'en_IN', 'en_US'. */
  ogLocale: string

  /** Twitter @handle, including the leading @. */
  twitterHandle: string

  /** Short one-line tagline shown under the logo in the footer. */
  footerTagline: string

  /** The two pricing tiers shown in the homepage's "See our Plans" section,
   *  in this tenant's own currency. India's values here are a byte-for-byte
   *  copy of what HomeClient.tsx used to hardcode as PLANS_DATA, so wiring
   *  this up changes nothing about the live India site's pricing. */
  plans: PricingPlan[]

  /** ISO 3166-1 alpha-2 code (e.g. 'IN', 'US', 'GB') used to default the
   *  country-code selector on the signup form's mobile number field, so
   *  opening signup on a given tenant's portal pre-selects that country's
   *  dial code instead of always defaulting to India's +91. The person can
   *  still change it — this is just a sensible default. */
  defaultCountryIso: string

  /** Path (under /public) to this tenant's real logo mark, e.g. '/coi.png'.
   *  Only set this once a real logo asset exists for the tenant — leave it
   *  undefined otherwise. Auth screens (and anywhere else that shows a
   *  brand mark) fall back to a text/monogram treatment when this is
   *  unset, rather than ever fabricating a placeholder logo image. */
  logoPath?: string

  // ── Site-wide brand color ──────────────────────────────────────────
  // Threaded into the DOM as CSS custom properties by RootLayout (see
  // layout.tsx) so every page's CSS -- globals.css, page.css, and any
  // component's own scoped <style> block -- can reference them instead of
  // hardcoding India's saffron. India's values below are byte-for-byte
  // the hex codes that were previously hardcoded directly in page.css's
  // :root blocks (--gold/--gold2 and the --wn-saffron*/--wn-sage*
  // family), so wiring this up changes nothing about the live India site.

  /** Primary brand accent — buttons, links, badges, active nav states. */
  primaryColor: string
  /** Deeper shade of primaryColor — hover/pressed states. */
  primaryColorDark: string
  /** Light tint of primaryColor — used as a solid fill for soft
   *  backgrounds (badges, subtle highlights) where a translucent overlay
   *  wouldn't give enough contrast against a light page background. */
  primaryColorSoft: string

  /** Optional secondary accent, distinct from the primary brand color —
   *  used for hover/interactive states where the tenant wants a different
   *  hue rather than just a darker shade of primaryColor (e.g. America's
   *  flag red for link hovers, separate from the Old Glory Blue used
   *  everywhere else). Falls back to primaryColorDark when unset — see
   *  layout.tsx's --wn-accent wiring. */
  accentColor?: string
}
