import type { Metadata } from 'next'
import { Cormorant_Garamond, DM_Sans, Fraunces } from 'next/font/google'
import './globals.css'
// import LiquidInkCursor from '@/components/ui/LiquidInkCursor'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
})

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

export const metadata: Metadata = {
  title: 'Counsellors of India',
  description: 'Practice management for Indian therapists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${fraunces.variable} ${dmSans.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-stone-50 font-[var(--font-dm-sans)]" suppressHydrationWarning>
        {/* <LiquidInkCursor /> */}
        {children}
      </body>
    </html>
  )
}