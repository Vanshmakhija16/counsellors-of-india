'use client'

import { useRef } from 'react'
import { ShieldCheck, HeartHandshake, Sparkles, Star, Play } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { useCt7HeroScale } from './_heroScroll'

interface HeroProps {
  therapist: TherapistProfile
  scrollTo: (id: string) => void
}

const FEATURES = [
  { Icon: ShieldCheck,     title: 'Licensed & Trained',  sub: 'Verified practitioners' },
  { Icon: HeartHandshake,  title: 'Personalized Care',   sub: 'Tailored to you' },
  { Icon: Sparkles,        title: 'Confidential Space',  sub: 'Private sessions' },
  { Icon: Star,            title: '5-Star Rated',        sub: 'By real clients' },
]

export default function Hero({ therapist, scrollTo }: HeroProps) {
  const specialty = therapist.specialties?.[0]?.trim()
  const firstName = therapist.name?.split(' ')[0]

  const heroRef = useRef<HTMLElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  useCt7HeroScale(frameRef, heroRef)

  return (
    <section id="home" className="ct7-hero" ref={heroRef}>
      <style>{`
        .ct7-hero {
          position: relative;
          min-height: 100vh;
          display: flex; align-items: center;
          padding: 150px 0 100px;
          background:
            radial-gradient(120% 100% at 85% 15%, rgba(198,167,107,0.08) 0%, transparent 55%),
            radial-gradient(90% 90% at 10% 100%, rgba(107,122,112,0.14) 0%, transparent 60%),
            linear-gradient(160deg, #2C3B35 0%, #23302B 60%, #1A2521 100%);
          overflow: hidden;
        }
        .ct7-hero::after {
          content: '';
          position: absolute; inset: 0; opacity: 0.4; mix-blend-mode: overlay; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.3'/%3E%3C/svg%3E");
        }

        /* Stacked/centered layout: text block on top, image banner below */
        .ct7-hero-grid {
          position: relative; z-index: 2;
          width: 100%; max-width: 980px; margin: 0 auto;
          padding: 0 clamp(20px, 5vw, 56px);
          display: flex; flex-direction: column; align-items: center;
          text-align: center;
        }

        .ct7-hero-left {
          display: flex; flex-direction: column; align-items: center;
          width: 100%; max-width: 700px;
        }

        .ct7-hero-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 100px;
          background: rgba(198,167,107,0.12); border: 1px solid rgba(198,167,107,0.28);
          font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 600;
          color: #D9BC85; margin-bottom: 26px;
        }

        .ct7-hero-headline {
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.01em;
          font-size: clamp(36px, 5.4vw, 62px); line-height: 1.08;
          max-width: 17ch; color: #F6F1E7;
          margin: 0 auto;
        }
        .ct7-hero-headline em {
          font-style: normal; color: #D9BC85;
        }

        .ct7-hero-sub {
          margin: 22px auto 0; max-width: 52ch;
          font-family: 'Inter', system-ui, sans-serif;
          font-size: clamp(14.5px, 1.1vw, 16.5px); line-height: 1.65;
          color: rgba(246,241,231,0.62);
        }

        .ct7-hero-feats {
          margin: 36px auto 0; width: 100%; max-width: 620px;
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;
        }
        @media (max-width: 700px) { .ct7-hero-feats { grid-template-columns: 1fr 1fr; max-width: 460px; } }
        .ct7-hero-feat {
          display: flex; flex-direction: column; align-items: center; text-align: center; gap: 9px;
          padding: 16px 10px; border-radius: 12px;
          background: rgba(246,241,231,0.04); border: 1px solid rgba(246,241,231,0.08);
        }
        .ct7-hero-feat-icon {
          width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
          background: rgba(198,167,107,0.14); color: #D9BC85;
          display: flex; align-items: center; justify-content: center;
        }
        .ct7-hero-feat-t { font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 600; color: #F6F1E7; line-height: 1.3; }
        .ct7-hero-feat-s { font-family: 'Inter', system-ui, sans-serif; font-size: 10.5px; color: rgba(246,241,231,0.42); margin-top: 1px; }

        .ct7-hero-ctas { margin-top: 38px; display: flex; align-items: center; justify-content: center; gap: 18px; flex-wrap: wrap; }

        .ct7-hero-cta-primary {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 15px 28px; border-radius: 100px;
          background: #C6A76B; color: #23302B;
          border: none; cursor: pointer;
          font-family: 'Inter', system-ui, sans-serif; font-size: 14px; font-weight: 700;
          box-shadow: 0 10px 26px rgba(198,167,107,0.22);
          transition: transform 260ms var(--ct7-ease-out), box-shadow 260ms var(--ct7-ease-out);
        }
        .ct7-hero-cta-primary:hover { transform: translateY(-2px); box-shadow: 0 14px 32px rgba(198,167,107,0.3); }

        .ct7-hero-cta-secondary {
          display: inline-flex; align-items: center; gap: 10px;
          background: none; border: none; cursor: pointer;
          font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px; font-weight: 600;
          color: rgba(246,241,231,0.82);
        }
        .ct7-hero-cta-secondary-icon {
          width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
          border: 1px solid rgba(246,241,231,0.24);
          display: flex; align-items: center; justify-content: center;
          transition: background 220ms var(--ct7-ease-out), border-color 220ms var(--ct7-ease-out);
        }
        .ct7-hero-cta-secondary:hover .ct7-hero-cta-secondary-icon {
          background: rgba(246,241,231,0.08); border-color: rgba(246,241,231,0.4);
        }

        /* Image banner below the text, full width of the hero grid */
        .ct7-hero-right {
          position: relative; display: flex; justify-content: center;
          width: 100%; margin-top: 56px;
        }

        .ct7-hero-frame {
          position: relative;
          width: 100%; max-width: 760px;
          aspect-ratio: 16 / 9;
          border-radius: 24px;
          padding: 0;
          overflow: hidden;
          background: linear-gradient(160deg, #3B4B43, #23302B);
          box-shadow: 0 40px 80px rgba(0,0,0,0.3);
          /* transform/border-radius/box-shadow are scrubbed directly to scroll
             position by useCt7HeroScale — no CSS transition here so the
             motion stays glued to the scrollbar instead of chasing it. */
        }
        @media (max-width: 700px) { .ct7-hero-frame { aspect-ratio: 4 / 5; border-radius: 20px; } }
        .ct7-hero-frame img {
          width: 100%; height: 100%; object-fit: cover; object-position: center 22%; display: block;
          filter: grayscale(0.1) contrast(1.03);
        }

        .ct7-hero-badge {
          position: absolute; left: 18px; bottom: 18px; z-index: 3;
          background: rgba(35,48,43,0.9); backdrop-filter: blur(6px);
          border: 1px solid rgba(246,241,231,0.1);
          padding: 9px 15px; border-radius: 100px;
          font-family: 'Inter', system-ui, sans-serif; font-size: 11.5px; font-weight: 600; color: #F6F1E7;
          display: flex; align-items: center; gap: 8px;
        }
        .ct7-hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #C6A76B; box-shadow: 0 0 8px 2px rgba(198,167,107,0.5); }

        .ct7-hero-stat {
          position: absolute; top: 18px; right: 18px; z-index: 3;
          background: #F6F1E7; color: #23302B;
          padding: 12px 16px; border-radius: 14px;
          box-shadow: 0 16px 32px rgba(0,0,0,0.2);
          font-family: 'Inter', system-ui, sans-serif;
        }
        .ct7-hero-stat-n { font-size: 18px; font-weight: 700; line-height: 1; }
        .ct7-hero-stat-l { font-size: 10px; color: #6B7A70; margin-top: 3px; font-weight: 600; }
      `}</style>

      <div className="ct7-hero-grid">
        <div className="ct7-hero-left">
          {/* <span className="ct7-hero-pill ct7-hero-enter" style={{ '--ct7-d': '200ms' } as React.CSSProperties}>
            <Sparkles size={13} /> Feel Better · Move Freely · Live Fully
          </span> */}

          <h1 className="ct7-hero-headline ct7-hero-enter" style={{ '--ct7-d': '340ms' } as React.CSSProperties}>
            {therapist.tagline?.trim() || (
              <>Transforming pain into <em>strength</em>, one step at a time</>
            )}
          </h1>

          <p className="ct7-hero-sub ct7-hero-enter" style={{ '--ct7-d': '460ms' } as React.CSSProperties}>
            {therapist.approach_text?.trim() ||
              (specialty
                ? `Personalised support for ${specialty.toLowerCase()}, a calm, considered space to help you recover, cope, and move forward.`
                : 'Personalised, evidence-based support to help you recover, cope, and move toward a fuller life, at your own pace.')}
          </p>



          <div className="ct7-hero-ctas ct7-hero-enter" style={{ '--ct7-d': '680ms' } as React.CSSProperties}>
            <button className="ct7-hero-cta-primary" onClick={() => scrollTo('booking')} data-magnetic>
              Book a Session
            </button>
            <button className="ct7-hero-cta-secondary" onClick={() => scrollTo('about')}>
              <span className="ct7-hero-cta-secondary-icon"><Play size={13} fill="currentColor" /></span>
              Learn more
            </button>
          </div>
        </div>

        <div className="ct7-hero-right ct7-hero-enter" style={{ '--ct7-d': '800ms' } as React.CSSProperties}>
          <div className="ct7-hero-frame" ref={frameRef}>
            {therapist.image && <img src={therapist.image} alt={therapist.name || 'Therapist portrait'} />}
            <div className="ct7-hero-badge">
              <span className="ct7-hero-badge-dot" />
              Accepting new clients
            </div>

            {therapist.experience ? (
              <div className="ct7-hero-stat">
                <div className="ct7-hero-stat-n">{therapist.experience}+ yrs</div>
                <div className="ct7-hero-stat-l">{firstName ? `with ${firstName}` : 'in practice'}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
