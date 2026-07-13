import type { Metadata } from 'next'
import SiteNav from '@/components/layout/SiteNav'
import SiteFooter from '@/components/layout/SiteFooter'
import ContactForm from '@/components/contact/ContactForm'
import { Mail, Clock, MessageCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Have a question about Counsellors of India? Send us a message and our team will get back to you shortly.',
}

const TRUST_POINTS = [
  {
    icon: Clock,
    title: 'We reply within 24 hours',
    body: 'Every message reaches our actual team, not a queue.',
  },
  {
    icon: MessageCircle,
    title: 'Talk to a real person',
    body: 'Platform questions, pricing, or getting your practice set up, ask us anything.',
  },
  {
    icon: Mail,
    title: 'Prefer email?',
    body: 'hello@counsellorsofindia.com',
  },
]

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FFFCF8]">
      <SiteNav />

      {/* Hero + form, single composed section for tighter visual rhythm */}
      <section className="relative overflow-hidden px-6 pt-28 pb-24">
        {/* Layered ambient glow — two soft blurs instead of one stray circle */}
        <div className="pointer-events-none absolute -top-32 right-[-8%] h-[440px] w-[440px] rounded-full bg-[#FF9933] opacity-[0.08] blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-40 left-[-10%] h-[380px] w-[380px] rounded-full bg-[#456554] opacity-[0.06] blur-[100px]" />

        <div className="relative mx-auto grid max-w-5xl items-start gap-16 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          {/* LEFT — heading + trust panel */}
          <div className="flex flex-col">
            <h1
              className="text-4xl leading-[1.12] text-[#1F1C18] sm:text-5xl"
              style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}
            >
              We&apos;d love to hear from you.
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#6E685F]">
              Questions about the platform, pricing, or getting started? Send us a message and our team will get
              back to you shortly.
            </p>

            <div className="mt-10 relative flex flex-col gap-9">
              {/* Connecting vertical line running through the node centers —
                  turns this into a step-by-step journey instead of a flat list. */}
              <div className="absolute left-5 top-5 bottom-5 w-px bg-gradient-to-b from-[#FF9933]/40 via-[#FF9933]/20 to-transparent" aria-hidden="true" />

              {TRUST_POINTS.map(({ icon: Icon, title, body }, i) => (
                <div key={title} className="relative flex items-start gap-4">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#FF9933]/25 bg-white text-[#B4600F] shadow-[0_2px_8px_rgba(255,153,51,0.12)]">
                    <Icon size={16} strokeWidth={1.8} />

                  </div>
                  <div className="pt-1">
                    <div className="text-[13.5px] font-semibold text-[#1F1C18]">{title}</div>
                    <div className="mt-0.5 text-[13px] leading-relaxed text-[#6E685F]">{body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — form */}
          <div>
            <ContactForm />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
