import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, Fraunces, Instrument_Sans } from 'next/font/google'
import './globals.css'
import WhatsAppFab from '@/components/layout/WhatsAppFab'
import { getCurrentTenant } from '@/lib/tenants/server'
import { getPublicSupabaseCredsForTenant } from '@/lib/supabase-server'
import { TenantSupabaseProvider } from '@/components/providers/TenantSupabaseProvider'

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
})

// Used for the admin panel tables -- an editorial, slightly-condensed sans
// that pairs with Fraunces/Instrument Serif elsewhere on the site, so the
// admin panel reads as premium rather than a generic dashboard font.
const instrumentSans = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

// Was referenced as var(--font-fraunces) in dashboard/appointments/page.tsx
// already, but never actually loaded here -- it was silently falling back
// to the browser's generic `serif`. Loading it properly now also powers
// the new editorial blog design (headlines + pull-quotes).
const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: 'variable',
  style: ['normal', 'italic'],
  axes: ['opsz', 'SOFT', 'WONK'],
})

// Metadata is built per-request from the resolved tenant (see
// middleware.ts -> getCurrentTenant()) instead of being hardcoded to
// India. For India, every value below resolves to the exact same string
// that used to be hardcoded here — see src/lib/tenants/in.ts. Using
// headers() (inside getCurrentTenant) opts the whole app out of static
// rendering, which is expected/required for multi-tenant metadata.
export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant()
  const baseUrl = tenant.siteUrl
  const ogImage = `${baseUrl}/og-image.png`

  return {
    metadataBase: new URL(baseUrl),

    title: {
      default: tenant.metaTitle,
      template: tenant.metaTitleTemplate,
    },

    description: tenant.metaDescription,

    keywords: tenant.keywords,

    openGraph: {
      type: 'website',
      url: baseUrl,
      siteName: tenant.brandName,
      title: tenant.metaTitle,
      description: tenant.ogDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: tenant.ogDescription,
        },
      ],
      locale: tenant.ogLocale,
    },

    twitter: {
      card: 'summary_large_image',
      site: tenant.twitterHandle,
      title: tenant.metaTitle,
      description: tenant.metaDescription,
      images: [
        {
          url: ogImage,
          alt: tenant.ogDescription,
        },
      ],
    },

    alternates: { canonical: baseUrl },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },

    // Site favicon / browser-tab icon — uses the real COI brand mark
    // (same file already used for the navbar logo) instead of the stale
    // default favicon.ico that was showing up in Google search results.
    icons: {
      icon: [
        { url: '/coi.png', type: 'image/png' },
      ],
      shortcut: '/coi.png',
      apple: '/coi.png',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Resolves once per request from the x-tenant header middleware.ts set —
  // anon key only (non-secret), safe to hand down into a client provider so
  // client-side auth/data calls target the right tenant's Supabase project.
  const { url, anonKey } = await getPublicSupabaseCredsForTenant()
  const tenant = await getCurrentTenant()

  // ── Site-wide brand color, threaded as CSS custom properties ──────────
  // page.css's several :root blocks define these exact variable names
  // hardcoded to saffron (--gold/--gold2, and the --wn-saffron*/--wn-sage*
  // family — "sage" is a leftover name from an earlier design, its actual
  // value has always been saffron). An inline style on <html> beats any
  // stylesheet's :root rule in the cascade regardless of import order, so
  // setting them here overrides page.css's hardcoded values for every
  // page that imports it, without editing page.css itself. India's
  // tenant config holds those exact same hex codes, so this is a no-op
  // for the live India site.
  const rgb = hexToRgb(tenant.primaryColor)
  const brandVars = {
    '--gold': tenant.primaryColorDark,
    '--gold2': tenant.primaryColor,
    '--gold-bg': `rgba(${rgb}, 0.07)`,
    '--gold-line': `rgba(${rgb}, 0.24)`,
    '--wn-saffron': tenant.primaryColor,
    '--wn-saffron-deep': tenant.primaryColorDark,
    '--wn-saffron-soft': tenant.primaryColorSoft,
    '--wn-saffron-tint': `rgba(${rgb}, 0.1)`,
    '--wn-sage': tenant.primaryColor,
    '--wn-sage-deep': tenant.primaryColorDark,
    '--wn-sage-soft': tenant.primaryColorSoft,
    '--wn-sage-tint': `rgba(${rgb}, 0.08)`,
    // Secondary accent for hover/interactive states — falls back to the
    // dark brand shade for tenants (like India) that don't set a distinct
    // accentColor, so this is a no-op unless a tenant opts in.
    '--wn-accent': tenant.accentColor ?? tenant.primaryColorDark,
  } as React.CSSProperties

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} ${fraunces.variable} ${instrumentSans.variable} antialiased`}
      style={brandVars}
      suppressHydrationWarning
    >
      <body
        className="min-h-full flex flex-col bg-stone-50 font-[var(--font-inter)]"
        suppressHydrationWarning
      >
        <TenantSupabaseProvider url={url} anonKey={anonKey}>
          {children}
          <WhatsAppFab />
        </TenantSupabaseProvider>
      </body>
    </html>
  )
}

/** '#3C3B6E' -> '60, 59, 110', for building rgba(...) strings from a
 *  tenant's hex brand color. */
function hexToRgb(hex: string): string {
  const clean = hex.replace('#', '')
  const r = parseInt(clean.slice(0, 2), 16)
  const g = parseInt(clean.slice(2, 4), 16)
  const b = parseInt(clean.slice(4, 6), 16)
  return `${r}, ${g}, ${b}`
}
