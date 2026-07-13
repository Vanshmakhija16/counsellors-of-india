import type { Metadata } from 'next'
import Link from 'next/link'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import { ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Counsellors of India helps psychologists, counsellors and therapists build a professional digital presence — website, bookings and payments in one place.',
}

const PILLARS = [
  { t: 'Professionalism', d: 'Every psychologist deserves a digital presence that reflects their expertise.' },
  { t: 'Accessibility', d: "Building a professional website shouldn't require technical knowledge or a large budget." },
  { t: 'Simplicity', d: 'Technology should simplify practice management, not complicate it.' },
  { t: 'Trust', d: 'Helping professionals establish credibility before the first conversation begins.' },
]

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFCF8]">
      <SiteNav />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-20 pb-16">
        <div className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-[#FF9933] opacity-[0.07] blur-3xl" />
        <div className="mx-auto max-w-3xl text-center">
          {/* <span className="mb-6 inline-flex items-center rounded-full border border-[#FF9933]/25 bg-[#FF9933]/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#B4600F]">
            About Counsellors of India
          </span> */}
          <h1
            className="text-4xl leading-[1.12] text-[#1F1C18] sm:text-5xl"
            style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
          >
            Building the digital future of mental health professionals.
          </h1>
        </div>
      </section>

      {/* Intro */}
      <section className="px-6 pb-4">
        <div className="mx-auto max-w-2xl space-y-5 text-[15.5px] leading-relaxed text-[#4A453D]">
          <p>
            At Counsellors of India, we believe that every psychologist deserves a professional digital presence.
            While businesses across industries have embraced websites and digital tools, many psychologists still
            rely on social media profiles, spreadsheets, messaging apps, and manual scheduling to manage their
            practice. This often makes it harder to present themselves professionally, streamline their work, and
            reach people who are actively looking for support.
          </p>
          <p>We created Counsellors of India to change that.</p>
          <p>
            Our platform enables psychologists, counsellors, therapists, and mental health professionals to create
            their own professional website in minutes — without writing a single line of code. Alongside their
            website, they can manage appointments, accept online payments, showcase their qualifications and
            services, and build a stronger online identity, all from one platform.
          </p>
          <p className="font-medium text-[#1F1C18]">
            We are not just helping professionals build websites. We are helping them build trust, credibility, and
            a digital identity that reflects the quality of the work they do.
          </p>
        </div>
      </section>

      {/* Vision */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-3xl rounded-3xl border border-[#ECE5D9] bg-white p-10 text-center shadow-sm">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#B4600F]">Our Vision</div>
          <p
            className="text-2xl leading-snug text-[#1F1C18] sm:text-[28px]"
            style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
          >
            To empower every mental health professional in India with accessible digital tools that help them
            build, manage, and grow their practice with confidence.
          </p>
        </div>
      </section>

      {/* What we stand for */}
      <section className="px-6 py-6">
        <div className="mx-auto max-w-5xl">
          <h2
            className="mb-10 text-center text-3xl text-[#1F1C18]"
            style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
          >
            What we stand for
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((p, i) => (
              <div key={p.t} className="rounded-2xl border border-[#ECE5D9] bg-white p-6">
                <div className="mb-3 text-[11px] font-bold text-[#FF9933]">0{i + 1}</div>
                <div className="mb-2 text-[16px] font-semibold text-[#1F1C18]">{p.t}</div>
                <p className="text-[13.5px] leading-relaxed text-[#6E685F]">{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why COI */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="mb-4 text-3xl text-[#1F1C18]"
            style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
          >
            Why Counsellors of India?
          </h2>
          <p className="text-[15.5px] leading-relaxed text-[#4A453D]">
            Because a modern practice needs more than an Instagram profile. It needs a place where clients can
            learn about you, understand your expertise, book appointments, make payments, and connect with
            confidence. Counsellors of India brings all of this together through one intuitive platform designed
            specifically for mental health professionals.
          </p>
        </div>
      </section>

      {/* Looking ahead */}
      <section className="px-6 pb-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-[#1F1C18] p-10 text-center text-white sm:p-14">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#FFB866]">Looking Ahead</div>
          <p className="mb-8 text-[15.5px] leading-relaxed text-white/70">
            We envision a future where every psychologist in India has a professional online presence, making
            quality mental health care easier to discover, access, and trust. As the profession continues to
            evolve, Counsellors of India will continue building tools that support practitioners at every stage of
            their journey, from starting a private practice to growing an established one.
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
