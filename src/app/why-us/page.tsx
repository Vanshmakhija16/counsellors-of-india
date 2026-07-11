import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import { Check, X, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Why Us',
  description:
    'A smarter way to build your online practice — see how Counsellors of India compares to generic website builders.',
}

const ROWS = [
  ['Purchase a domain separately', 'Professional website ready from day one'],
  ['Learn how to build a website yourself', 'Guided setup in just a few minutes'],
  ['Often requires designers or developers', 'No technical skills required'],
  ['High upfront development costs', 'Affordable plans designed for therapists'],
  ['Website, bookings and payments require different tools', 'Everything managed in one platform'],
  ['Generic templates for every industry', 'Templates created exclusively for mental health professionals'],
  ['Ongoing maintenance and plugin management', "We handle the technical side so you don't have to"],
]

const SUBSECTIONS = [
  {
    t: 'Save time. Save money.',
    d: 'Building a professional website traditionally involves purchasing a domain, selecting hosting, choosing a website builder, learning the platform or hiring a developer, and then paying separately for booking and payment integrations. Counsellors of India brings everything together in one simple platform, allowing you to launch your professional presence without the usual complexity.',
  },
  {
    t: 'Designed around your profession.',
    d: "Your website shouldn't feel like an online store or a restaurant page. It should reflect the trust, professionalism, and care that define your practice. Every template, feature, and workflow on Counsellors of India is designed with mental health professionals in mind.",
  },
  {
    t: 'Focus on what matters most.',
    d: "We'll take care of the technology. You focus on helping people.",
  },
]

export default function WhyUsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFCF8]">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-28 pb-16">
        <div className="pointer-events-none absolute -top-32 left-[-8%] h-[440px] w-[440px] rounded-full bg-[#FF9933] opacity-[0.08] blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 right-[-10%] h-[360px] w-[360px] rounded-full bg-[#456554] opacity-[0.06] blur-[100px]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <h1
            className="text-4xl leading-[1.12] text-[#1F1C18] sm:text-5xl"
            style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
          >
            A smarter way to build your online practice.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-[#6E685F]">
            See how a purpose-built platform for mental health professionals compares to piecing it together yourself.
          </p>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 pb-16">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-[#ECE5D9] bg-white shadow-[0_1px_2px_rgba(31,28,24,0.04),0_20px_50px_-24px_rgba(31,28,24,0.14)]">
          <div className="grid grid-cols-2">
            <div className="border-b border-r border-[#ECE5D9] bg-[#FAF7F2] px-5 py-4 text-[12.5px] font-semibold uppercase tracking-wide text-[#6E685F] sm:px-8">
              Generic Website Builders
            </div>
            <div className="border-b border-[#ECE5D9] bg-[#FFF6EC] px-5 py-4 text-[12.5px] font-semibold uppercase tracking-wide text-[#B4600F] sm:px-8">
              Counsellors of India
            </div>
          </div>
          {ROWS.map((row, i) => (
            <div key={i} className={`group grid grid-cols-2 transition-colors hover:bg-[#FCFAF6] ${i !== ROWS.length - 1 ? 'border-b border-[#ECE5D9]' : ''}`}>
              <div className="flex items-start gap-2.5 border-r border-[#ECE5D9] px-5 py-4 text-[13.5px] leading-snug text-[#6E685F] sm:px-8">
                <X size={14} className="mt-0.5 shrink-0 text-[#C9BFAF]" />
                <span>{row[0]}</span>
              </div>
              <div className="flex items-start gap-2.5 px-5 py-4 text-[13.5px] leading-snug text-[#1F1C18] sm:px-8">
                <Check size={14} className="mt-0.5 shrink-0 text-[#FF9933]" />
                <span>{row[1]}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subsections */}
      <section className="px-6 pb-20">
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-3">
          {SUBSECTIONS.map((s, i) => (
            <div key={s.t} className="flex flex-col rounded-2xl border border-[#ECE5D9] bg-white p-7">
              <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-[#FF9933]/10 text-[13px] font-bold text-[#FF9933]">
                {i + 1}
              </div>
              <h2
                className="mb-2.5 text-[19px] leading-snug text-[#1F1C18]"
                style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
              >
                {s.t}
              </h2>
              <p className="text-[13.5px] leading-relaxed text-[#6E685F]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#1F1C18] p-10 text-center text-white shadow-[0_24px_60px_-24px_rgba(31,28,24,0.45)] sm:p-14">
          <p
            className="mb-6 text-2xl leading-snug sm:text-[28px]"
            style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
          >
            See what a Counsellors of India website looks like for your practice.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-[#FF9933] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[#E07A12]"
          >
            List your practice <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
