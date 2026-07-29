import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
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

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
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

  return (
    <html
      lang="en"
      className={`${jakarta.variable} ${inter.variable} antialiased`}
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
