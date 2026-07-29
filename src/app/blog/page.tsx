import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowRight, PenLine } from 'lucide-react'
import { getCurrentTenant } from '@/lib/tenants/server'

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Practice-growth tips, guides, and stories for therapists and counsellors — coming soon.',
}

export default async function BlogPage() {
  const tenant = await getCurrentTenant()
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFCF8]">
      <SiteNav tenant={{ brandName: tenant.brandName }} />

      <section className="relative overflow-hidden px-6 pt-20 pb-14">
        <div className="pointer-events-none absolute -top-24 left-[-10%] h-[420px] w-[420px] rounded-full bg-[#FF9933] opacity-[0.07] blur-3xl" />
        <div className="mx-auto max-w-2xl text-center">
          {/* <span className="mb-6 inline-flex items-center rounded-full border border-[#FF9933]/25 bg-[#FF9933]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#B4600F]">
            Blog
          </span> */}
          <h1
            className="text-4xl leading-[1.12] text-[#1F1C18] sm:text-5xl"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            Practice-growth tips for therapists.
          </h1>
        </div>
      </section>

      {/* Empty state — no posts yet */}
      <section className="flex-1 px-6 pb-24">
        <div className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-dashed border-[#ECE5D9] bg-white/60 px-8 py-16 text-center">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF6EC] text-[#B4600F]">
            <PenLine size={22} />
          </div>
          <h2
            className="mb-2 text-[22px] text-[#1F1C18]"
            style={{ fontFamily: 'var(--font-jakarta)' }}
          >
            First posts coming soon
          </h2>
          <p className="mb-7 max-w-sm text-[13.5px] leading-relaxed text-[#6E685F]">
            We&apos;re writing guides on growing a private practice, getting your first online clients, and running
            a calm, well-organised counselling business. Check back soon.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF9933] px-5 py-2.5 text-[13.5px] font-semibold text-white transition hover:bg-[#E07A12]"
          >
            List your practice <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <SiteFooter tenant={{ brandName: tenant.brandName, footerTagline: tenant.footerTagline }} />
    </div>
  )
}
