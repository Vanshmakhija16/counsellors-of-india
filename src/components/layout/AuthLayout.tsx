import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  /** Tenant-aware branding — defaults preserve exactly what India showed
   *  before this redesign. */
  brandName?: string
  tagline?: string
  /** Path to the tenant's real logo image (e.g. '/coi.png'), if one exists.
   *  When absent, the right panel falls back to a clean text/monogram
   *  wordmark instead of a placeholder image. */
  logoPath?: string
  /** Optional content rendered in the RIGHT brand panel, above the tagline
   *  — e.g. the signup flow's <JourneyProgress /> step tracker. Signup
   *  passes this; login leaves it unset and nothing renders there. */
  journeySlot?: React.ReactNode
  /** Optional link rendered directly under the title (e.g. "Already have
   *  an account? Sign in") — kept up top near the title instead of buried
   *  at the very bottom of a long form. */
  topLink?: React.ReactNode
  /** Small step-progress badge (e.g. "Step 1 of 2") rendered inline next
   *  to the title itself, instead of crowding the topLink row — keeps
   *  "go back / sign in" as its own clean row underneath. */
  stepLabel?: string
  /** Signup's form is meaningfully wider (name+username rows, phone row)
   *  than login's — widen the left column's container to match instead of
   *  clipping it down to login's narrower max-width. */
  wide?: boolean
}

/**
 * Premium, warm, LIGHT auth shell — matches the saffron / parchment brand.
 * Used by /login and /signup.
 *
 * Two-column on large screens: the form sits on a warm parchment surface
 * on the left, left-aligned (not centered — reads more confident and lets
 * the eye travel top-to-bottom naturally); the right column is a lighter,
 * softly-tinted brand panel, top-weighted with the tenant's logo, a single
 * punchy message, and one CTA link, plus soft brand-colored shapes for
 * texture instead of a flat gradient. Collapses to a single column (form
 * only, panel hidden) on mobile.
 */
export default function AuthLayout({ children, title, brandName = 'Counsellors of India', tagline, logoPath, journeySlot, topLink, stepLabel, wide }: AuthLayoutProps) {
  const initial = brandName.split(' ').map(w => w[0]).slice(0, 1).join('')

  return (
    <main className="min-h-screen lg:h-screen grid lg:grid-cols-[46%_54%] lg:overflow-hidden" style={{ background: '#FFFFFF' }}>

      {/* ── LEFT — the form ── */}
      <div
        className="flex items-start justify-center px-6 sm:px-10 lg:px-14 py-6 lg:py-10 lg:h-screen lg:overflow-y-auto [&::-webkit-scrollbar]:hidden"
        style={{ background: '#FFFFFF', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className={`w-full ${wide ? 'max-w-2xl' : 'max-w-md'}`}>

          <div className="flex items-center justify-center lg:justify-start gap-3 mb-1">
            <Link href="/" className="inline-flex items-center shrink-0 group">
              {logoPath ? (
                <img src={logoPath} alt={brandName} className="h-28 w-auto" />
              ) : (
                <span
                  className="inline-flex w-7 h-7 rounded-full items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg,#FF9933,#C2650A)' }}
                >
                  <span className="text-white text-xs font-black">{initial}</span>
                </span>
              )}
            </Link>

            <div>
              {title && (
                <p
                  className="text-[#2A2118] font-[var(--font-inter)]"
                  style={{ fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.15 }}
                >
                  {title}
                </p>
              )}

              {topLink && (
                <div className="text-center lg:text-left mt-1 text-sm text-[#6E685F]">
                  {topLink}
                </div>
              )}
            </div>
          </div>

          {children}

        </div>
      </div>

      {/* ── RIGHT — brand panel (hidden on mobile, the form takes priority there) ──
          Light, warm-tinted, top-weighted content, with soft brand-colored
          shapes for real texture instead of a flat gradient rectangle. */}
      <div
        className="hidden lg:flex flex-col relative overflow-hidden px-14 pt-0 pb-10"
        style={{
          background: 'linear-gradient(155deg, #2A160A 0%, #4A2410 42%, #8A4A1F 100%)',
        }}
      >
        {/* Bold abstract shapes bleeding off-canvas — solid fills instead of
            thin outlined rings, for a richer, more confident feel. */}
        <svg
          className="absolute -right-32 -top-32 w-[600px] h-[600px] pointer-events-none"
          viewBox="0 0 600 600" fill="none" aria-hidden="true"
        >
          <circle cx="300" cy="300" r="300" fill="#FF9933" fillOpacity="0.14" />
          <circle cx="300" cy="300" r="220" fill="#FF9933" fillOpacity="0.10" />
        </svg>
        <svg
          className="absolute -left-32 -bottom-40 w-[520px] h-[520px] pointer-events-none"
          viewBox="0 0 520 520" fill="none" aria-hidden="true"
        >
          <path
            d="M40 480C160 460 120 300 240 250C340 208 380 100 320 20C480 60 520 220 460 320C400 420 260 460 40 480Z"
            fill="#C2650A" fillOpacity="0.22"
          />
        </svg>

        {/* Top-weighted content — headline, one line of body copy, one CTA
            link — with open space beneath for the shapes to breathe,
            instead of spreading a checklist across the whole column. */}
        <div className="relative max-w-md mt-24">
          {journeySlot && <div className="mb-12">{journeySlot}</div>}

          <p
            className="text-white mb-5"
            style={{
              fontFamily: "'Fraunces','Instrument Serif',Georgia,serif",
              fontWeight: 400,
              fontSize: '1.65rem',
              lineHeight: 1.22,
              letterSpacing: '-0.01em',
            }}
          >
            {tagline ?? 'A calm, trusted home for your practice — websites, bookings, and payments in one place.'}
          </p>

          <p className="text-white/70 text-[14px] leading-relaxed mb-7">
            Your booking website, secure payments, and client dashboard, all set up in minutes, no code required.
          </p>

          <Link
            href="/#how"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white underline decoration-current decoration-2 underline-offset-4 hover:text-[#FFD9A8] transition"
          >
            See how it works <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </main>
  )
}
