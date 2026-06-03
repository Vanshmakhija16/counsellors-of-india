import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
// import LiquidInkCursor from '@/components/ui/LiquidInkCursor'

/* ONE premium type system (SaaS/product direction):
   Plus Jakarta Sans for display/headings (700-800), Inter for body (400-500). */
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
    <html lang="en" className={`${jakarta.variable} ${inter.variable}  antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-stone-50 font-[var(--font-inter)]" suppressHydrationWarning>
        {/* <LiquidInkCursor /> */}
        {children}
      </body>
    </html>
  )
}