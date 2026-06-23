import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

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

const BASE_URL = 'https://www.counsellorsofindia.com'
const OG_IMAGE = `${BASE_URL}/og-image.png`

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: 'Counsellors of India – Website Builder for Indian Therapists',
    template: '%s | Counsellors of India',
  },

  // xlsx Sheet 2, homepage description (exact)
  description:
    'Start getting therapy clients online. Build your website, take bookings & collect payments in under 10 minutes. Join 500+ Indian counsellors.',

  keywords: [
    'therapist website builder India',
    'counsellor profile India',
    'online booking for therapists India',
    'practice management Indian therapists',
    'psychologist website India',
    'Razorpay therapy payments',
    'counsellors of India',
  ],

  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Counsellors of India',
    title: 'Counsellors of India – Website Builder for Indian Therapists',
    description:
      'Counsellors of India – therapist website builder showing profile, booking and Razorpay payments.',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Counsellors of India – therapist website builder showing profile, booking and Razorpay payments',
      },
    ],
    locale: 'en_IN',
  },

  twitter: {
    card: 'summary_large_image',
    site: '@counsellorsin',
    title: 'Counsellors of India – Website Builder for Indian Therapists',
    description:
      'Start getting therapy clients online. Build your website, take bookings & collect payments in under 10 minutes.',
    images: [
      {
        url: OG_IMAGE,
        alt: 'Counsellors of India – therapist website builder showing profile, booking and Razorpay payments',
      },
    ],
  },

  alternates: { canonical: BASE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
        {children}
      </body>
    </html>
  )
}
