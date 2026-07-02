// components/landing/FooterReveal.tsx
'use client'

export default function FooterReveal() {
  return (
    <div
      className="relative bottom-0 z-0 h-[50vh] w-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0a0a0a' }}
    >

      {/* ── Subtle grid texture ── */}
      <div
        className="pointer-events-none absolute inset-0"
        // style={{
        //   backgroundImage: `
        //     linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        //     linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        //   `,
        //   backgroundSize: '80px 80px',
        // }}
      />

      {/* ── Radial glow — center ── */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 60%, rgba(90,127,122,0.18), transparent)',
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">

        {/* Eyebrow */}
        {/* <p
          className="text-xs font-bold uppercase tracking-[0.3em] mb-8"
          style={{ color: 'rgba(90,127,122,0.8)' }}
        >
          Your practice. Online.
        </p> */}

        {/* Hero type — the big statement */}
        <h2
          className="font-bold leading-[0.9] tracking-tighter mb-8 select-none"
          style={{
            fontSize: 'clamp(52px, 7vw, 140px)',
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '-0.01em',
          }}
        >
          Counsellors of India
        </h2>

        {/* Sub statement */}
        {/* <p
          className="text-base md:text-lg font-normal leading-relaxed mb-12 max-w-md mx-auto"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          A beautiful profile. Real bookings.
          <br />
          Built for therapists in India.
        </p> */}

        {/* CTA */}
        {/* <a 
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold transition-opacity hover:opacity-80"
          style={{
            background: '#5a7f7a',
            color: '#fff',
            boxShadow: '0 8px 40px rgba(90,127,122,0.4)',
          }}
        >
          Claim your profile — it's free
          <span style={{ fontSize: 16 }}>→</span>
        </a> */}
      </div>

      {/* ── Bottom micro footer ──
      <div
        className="absolute bottom-8 left-0 right-0 flex items-center justify-center gap-8"
        style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }}
      >
        <span>© 2025 Counsellors of India</span>
        <span>·</span>
        <a href="/privacy" className="hover:text-white/40 transition">Privacy</a>
        <span>·</span>
        <a href="/terms" className="hover:text-white/40 transition">Terms</a>
      </div> */}

    </div>
  )
}