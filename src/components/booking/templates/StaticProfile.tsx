'use client'

import { useEffect } from 'react'
import {
  Phone, MessageCircle, ArrowUpRight, ArrowRight,
} from 'lucide-react'

interface Props {
  therapist: {
    name: string
    credentials: string
    bio: string
    image: string
    location: string
    experience: number
    fee: number
    specialties: string[]
    languages: string[]
    sessionDuration: number
    sessionMode: string
    phone: string
    plan: string
    whatsapp?: string
    instagram?: string
    linkedin?: string
    website?: string
  }
}

export default function StaticProfile({ therapist }: Props) {
  const initials = therapist.name
    .split(' ').map(w => w[0]).join('').slice(0, 2)

  const firstName = therapist.name.split(' ')[0]

  const whatsappLink = therapist.whatsapp
    ? `https://wa.me/${therapist.whatsapp}?text=Hi ${therapist.name}, I'd like to book a session.`
    : therapist.phone
    ? `https://wa.me/91${therapist.phone.replace(/\D/g, '')}?text=Hi ${therapist.name}, I'd like to book a session.`
    : null

  const sessionModeLabel =
    therapist.sessionMode === 'both'
      ? 'Online & In-person'
      : therapist.sessionMode === 'online'
      ? 'Online'
      : 'In-person'

  // Scroll reveal — fire once and stay revealed
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(el => {
          if (el.isIntersecting) {
            el.target.classList.add('revealed')
            observer.unobserve(el.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const year = new Date().getFullYear()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ed-root {
          font-family: 'Inter', sans-serif;
          // background: #f4f1ec;
          background: white;
          color: #1a1a1a;
          -webkit-font-smoothing: antialiased;
        }
        .ed-root img { display: block; max-width: 100%; }
        .ed-serif { font-family: 'Cormorant Garamond', serif; }

        /* ── REVEAL ── */
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 1.2s cubic-bezier(0.22,1,0.36,1),
                      transform 1.2s cubic-bezier(0.22,1,0.36,1);
        }
        .reveal.revealed { opacity: 1; transform: none; }
        .reveal-d1 { transition-delay: 0.08s; }
        .reveal-d2 { transition-delay: 0.18s; }
        .reveal-d3 { transition-delay: 0.28s; }
        .reveal-d4 { transition-delay: 0.38s; }
        .reveal-d5 { transition-delay: 0.48s; }

        /* Page-load: gentle stagger */
        @keyframes edRise {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes edFade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes edImage {
          from { opacity: 0; transform: scale(1.03); }
          to   { opacity: 1; transform: scale(1); }
        }
        .ed-rise-1 { animation: edRise 1.1s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
        .ed-rise-2 { animation: edRise 1.1s cubic-bezier(0.22,1,0.36,1) 0.18s both; }
        .ed-rise-3 { animation: edRise 1.1s cubic-bezier(0.22,1,0.36,1) 0.32s both; }
        .ed-rise-4 { animation: edRise 1.1s cubic-bezier(0.22,1,0.36,1) 0.46s both; }
        .ed-rise-5 { animation: edRise 1.1s cubic-bezier(0.22,1,0.36,1) 0.6s both; }
        .ed-fade   { animation: edFade  1.4s ease 0.2s both; }
        .ed-image  { animation: edImage 1.6s cubic-bezier(0.22,1,0.36,1) 0.1s both; }

        /* ─────────── NAV — plain, sticky ─────────── */
        .ed-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          padding: 20px 48px;
          background: #f4f1ec;
          gap: 32px;
        }
        .ed-nav-mark {
          display: flex;
          align-items: center;
          gap: 14px;
          justify-self: start;
        }
        .ed-nav-avatar {
          width: 52px; height: 52px;
          border-radius: 50%;
          overflow: hidden;
          background: #d8d2c6;
          flex-shrink: 0;
          border: 1px solid rgba(26,26,26,0.08);
        }
        .ed-nav-avatar img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          display: block;
        }
        .ed-nav-avatar-fb {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(160deg, #c8c2b6 0%, #9aa39b 100%);
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 400;
          color: rgba(255,255,255,0.85);
          letter-spacing: -0.5px;
        }
        .ed-nav-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: #1a1a1a;
          line-height: 1;
        }
        .ed-nav-links {
          display: flex; gap: 40px; justify-content: center;
        }
        .ed-nav-links a {
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          color: #1a1a1a;
          text-decoration: none;
          font-weight: 400;
          transition: color 0.2s;
          padding-bottom: 2px;
        }
        .ed-nav-links a:hover { color: #6b7d6e; }
        .ed-nav-right {
          display: flex; justify-content: flex-end; align-items: center; gap: 16px;
        }
        .ed-nav-cta {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #1a1a1a;
          text-decoration: none;
          padding: 11px 24px;
          border: 1.5px solid #1a1a1a;
          border-radius: 4px;
          background: transparent;
          transition: background 0.2s, color 0.2s;
        }
        .ed-nav-cta:hover { background: #1a1a1a; color: #f4f1ec; }

        /* ─────────── HERO — quote-led ─────────── */
        .ed-hero {
          position: relative;
          min-height: calc(100vh - 92px);
          padding: 100px 48px 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .ed-hero-quote-wrap {
          position: relative;
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
          text-align: center;
        }
        .ed-hero-quote-eyebrow {
          display: inline-flex; align-items: center; gap: 14px;
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #5a5a55;
          margin-bottom: 56px;
        }
        .ed-hero-quote-eyebrow::before,
        .ed-hero-quote-eyebrow::after {
          content: '';
          width: 32px; height: 1px;
          background: rgba(26,26,26,0.3);
        }
        .ed-hero-quote-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5.4vw, 88px);
          font-weight: 300;
          line-height: 1.12;
          letter-spacing: -0.025em;
          color: #1a1a1a;
          max-width: 22ch;
          margin: 0 auto 56px;
        }
        .ed-hero-quote-text em {
          font-style: italic;
          color: #6b7d6e;
          font-weight: 400;
        }
        .ed-hero-quote-rule {
          display: block;
          width: 64px; height: 1px;
          background: rgba(26,26,26,0.3);
          margin: 0 auto 28px;
        }
        .ed-hero-quote-by {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-style: italic;
          color: #5a5a55;
          line-height: 1.5;
        }
        .ed-hero-quote-by strong {
          font-weight: 500;
          font-style: normal;
          color: #1a1a1a;
        }
        .ed-hero-quote-actions {
          margin-top: 64px;
          display: inline-flex; align-items: center; gap: 32px;
          flex-wrap: wrap; justify-content: center;
        }

        /* ─────────── PROFILE — info that used to live in hero ─────────── */
.ed-profile {
  padding:
    140px 64px
    160px;

  background: #ece7df;

  border-top:
    1px solid rgba(26,26,26,0.08);

  position: relative;
  overflow: hidden;
}

.ed-profile-inner {
  max-width: 1400px;
  margin: 0 auto;

  display: flex;
  flex-direction: column;

  align-items: flex-start;
}

.ed-profile-name {
  font-family: 'Cormorant Garamond', serif;

  font-size: clamp(72px, 10vw, 168px);

  font-weight: 300;

  line-height: 0.84;

  letter-spacing: -0.055em;

  color: #1a1a1a;

  margin-bottom: 48px;

  max-width: 10ch;
}

        .ed-profile-name .ln { display: block; }
        .ed-profile-name em {
          font-style: italic;
          color: #6b7d6e;
          font-weight: 400;
        }
.ed-profile-sub {
  font-size: 11px;

  letter-spacing: 4px;

  text-transform: uppercase;

  color: #6d6d67;

  margin-bottom: 48px;

  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.ed-profile-meta {
  width: 100%;

  display: grid;

  grid-template-columns:
    180px 1fr
    180px 1fr;

  gap: 36px 48px;

  padding-top: 40px;

  border-top:
    1px solid rgba(26,26,26,0.12);
}

        .ed-profile-meta-k {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #8a8a85;
          padding-top: 6px;
        }
.ed-profile-meta-v {
  font-family: 'Cormorant Garamond', serif;

  font-size: clamp(22px, 2vw, 30px);

  font-weight: 400;

  font-style: italic;

  color: #1a1a1a;

  line-height: 1.25;
}

        .ed-profile-meta-v .ed-sep {
          display: inline-block;
          margin: 0 10px;
          color: #b8b8b3;
          font-style: normal;
        }
.ed-profile-actions {
  margin-top: 72px;

  display: flex;
  align-items: center;
  gap: 40px;

  flex-wrap: wrap;
}
        .ed-hero-issue {
          position: absolute;
          top: 32px; right: 48px;
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #8a8a85;
          z-index: 4;
        }
        .ed-hero-issue em {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: #5a5a55;
          font-size: 12px;
          margin-left: 6px;
        }

        .ed-hero-left {
          position: relative;
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          z-index: 3;
        }

        .ed-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 12px;
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #5a5a55;
          margin-bottom: 56px;
        }
        .ed-hero-eyebrow::before {
          content: '';
          width: 36px; height: 1px;
          background: #1a1a1a;
          opacity: 0.4;
        }

        .ed-hero-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(64px, 9.5vw, 152px);
          font-weight: 300;
          line-height: 0.92;
          letter-spacing: -0.04em;
          color: #1a1a1a;
          margin: 0;
        }
        .ed-hero-name .ln {
          display: block;
        }
        .ed-hero-name em {
          font-style: italic;
          color: #6b7d6e;
          font-weight: 400;
        }

        .ed-hero-meta {
          margin-top: 40px;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 28px 40px;
          padding-top: 28px;
          border-top: 1px solid rgba(26,26,26,0.12);
          max-width: 520px;
        }
        .ed-hero-meta-k {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #8a8a85;
          padding-top: 4px;
        }
        .ed-hero-meta-v {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 400;
          color: #1a1a1a;
          font-style: italic;
          line-height: 1.4;
        }
        .ed-hero-meta-v .ed-sep {
          display: inline-block;
          margin: 0 10px;
          color: #b8b8b3;
          font-style: normal;
        }

        /* Right portrait — interrupts the layout */
        .ed-hero-right {
          position: relative;
          z-index: 1;
          align-self: stretch;
          margin-top: 24px;
          margin-right: -24px;
        }
        .ed-hero-portrait {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 560px;
          overflow: hidden;
          background: #d8d2c6;
        }
        .ed-hero-portrait img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          filter: grayscale(0.08) contrast(1.02);
        }
        .ed-hero-portrait-fb {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(160deg, #c8c2b6 0%, #9aa39b 100%);
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(120px, 14vw, 180px);
          font-weight: 300;
          color: rgba(255,255,255,0.55);
          letter-spacing: -4px;
        }
        .ed-hero-caption {
          position: absolute;
          left: 16px; bottom: 16px;
          font-size: 10px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #ece7df;
          text-shadow: 0 1px 8px rgba(0,0,0,0.4);
          display: flex; align-items: center; gap: 10px;
        }
        .ed-hero-caption::before {
          content: ''; width: 24px; height: 1px;
          background: rgba(236,231,223,0.6);
        }
        .ed-hero-caption em {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          text-transform: none;
          letter-spacing: 0;
          color: #ece7df;
          margin-left: 6px;
          font-size: 13px;
        }

        /* CTA bar at bottom of hero */
        .ed-hero-actions {
          margin-top: 56px;
          display: flex; align-items: center; gap: 28px;
          flex-wrap: wrap;
        }
        .ed-cta-link {
          display: inline-flex; align-items: center; gap: 12px;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #1a1a1a;
          text-decoration: none;
          padding-bottom: 6px;
          border-bottom: 1px solid #1a1a1a;
          transition: gap 0.25s, opacity 0.25s;
        }
        .ed-cta-link:hover { gap: 16px; opacity: 0.75; }
        .ed-cta-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #5a5a55;
          text-decoration: none;
          transition: color 0.25s;
        }
        .ed-cta-ghost:hover { color: #1a1a1a; }

        /* ─────────── INDEX strip ─────────── */
        .ed-index {
          padding: 32px 48px;
          border-top: 1px solid rgba(26,26,26,0.1);
          border-bottom: 1px solid rgba(26,26,26,0.1);
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 40px;
          align-items: center;
          background: #f4f1ec;
        }
        .ed-index-label {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #8a8a85;
        }
        .ed-index-words {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 2.2vw, 28px);
          font-weight: 300;
          color: #1a1a1a;
          line-height: 1.3;
          font-style: italic;
        }
        .ed-index-words .dot {
          color: #b8b8b3;
          font-style: normal;
          margin: 0 16px;
          font-size: 0.7em;
          vertical-align: middle;
        }
        .ed-index-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-style: italic;
          color: #6b7d6e;
        }

        /* ─────────── MANIFESTO ─────────── */
        .ed-manifesto {
          padding: 180px 48px;
          background: #f4f1ec;
          position: relative;
        }
        .ed-manifesto-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 80px;
        }
        .ed-section-tag {
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #8a8a85;
          padding-top: 14px;
          position: relative;
        }
        .ed-section-tag::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 40px; height: 1px;
          background: #1a1a1a;
        }
        .ed-section-tag em {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          text-transform: none;
          letter-spacing: 0;
          color: #6b7d6e;
          margin: 0 4px;
        }
        .ed-manifesto-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 3.4vw, 48px);
          font-weight: 300;
          line-height: 1.25;
          letter-spacing: -0.015em;
          color: #1a1a1a;
          max-width: 22ch;
        }
        .ed-manifesto-text em {
          font-style: italic;
          color: #6b7d6e;
        }

        /* ─────────── ABOUT ─────────── */
        .ed-about {
          padding: 140px 48px 160px;
          background: #ece7df;
          position: relative;
        }
        .ed-about-head {
          max-width: 1200px;
          margin: 0 auto 96px;
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 80px;
          align-items: end;
        }
        .ed-about-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(48px, 6vw, 88px);
          font-weight: 300;
          line-height: 0.95;
          letter-spacing: -0.03em;
          color: #1a1a1a;
        }
        .ed-about-title em {
          font-style: italic;
          color: #6b7d6e;
        }

        .ed-about-spread {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 200px 1fr 1fr;
          gap: 64px;
        }
        .ed-about-folio {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-style: italic;
          color: #8a8a85;
          padding-top: 8px;
          line-height: 1.6;
        }
        .ed-about-img-wrap {
          position: relative;
          aspect-ratio: 4 / 5;
          overflow: hidden;
          background: #d8d2c6;
          border-radius: 15%
          width: 80%; height: 80%;

        }
        .ed-about-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover;
          object-position: center top;
          filter: grayscale(0.05);
          border-radius: 5%;
                  }
        .ed-about-img-fb {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          background: linear-gradient(160deg, #d8d2c6 0%, #9aa39b 100%);
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(80px, 8vw, 120px);
          color: rgba(255,255,255,0.5);
          letter-spacing: -3px;
        }
        .ed-about-img-cap {
          position: absolute;
          left: 16px; bottom: 16px;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          color: #ece7df;
          font-size: 14px;
          text-shadow: 0 1px 8px rgba(0,0,0,0.4);
        }

        .ed-about-body { padding-top: 8px; }
        .ed-about-lede {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px, 2.2vw, 30px);
          font-weight: 400;
          font-style: italic;
          line-height: 1.45;
          color: #1a1a1a;
          margin-bottom: 36px;
          letter-spacing: -0.005em;
        }
        .ed-about-lede::first-letter {
          font-size: 1.4em;
          line-height: 1;
        }
        .ed-about-bio {
          font-size: 14px;
          line-height: 1.85;
          color: #4a4a45;
          font-weight: 400;
          max-width: 44ch;
        }

        .ed-about-meta {
          margin-top: 56px;
          padding-top: 32px;
          border-top: 1px solid rgba(26,26,26,0.15);
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          max-width: 480px;
        }
        .ed-about-meta-k {
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #8a8a85;
          margin-bottom: 8px;
        }
        .ed-about-meta-v {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 400;
          color: #1a1a1a;
          line-height: 1.2;
          letter-spacing: -0.01em;
        }
        .ed-about-meta-v em {
          font-style: italic;
          color: #6b7d6e;
        }
        .ed-about-meta-v .unit {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-style: normal;
          color: #8a8a85;
          margin-left: 6px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        /* ─────────── PULL QUOTE ─────────── */
        .ed-pullquote {
          padding: clamp(140px, 18vw, 220px) 48px;
          background: #f4f1ec;
          text-align: center;
          position: relative;
        }
        .ed-pullquote::before,
        .ed-pullquote::after {
          content: '';
          position: absolute;
          left: 50%; transform: translateX(-50%);
          width: 1px; height: 56px;
          background: rgba(26,26,26,0.2);
        }
        .ed-pullquote::before { top: 56px; }
        .ed-pullquote::after  { bottom: 56px; }
        .ed-pullquote-inner {
          max-width: 880px; margin: 0 auto;
        }
        .ed-pullquote-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(32px, 4.5vw, 60px);
          font-weight: 300;
          font-style: italic;
          line-height: 1.25;
          letter-spacing: -0.02em;
          color: #1a1a1a;
          margin-bottom: 48px;
        }
        .ed-pullquote-text em {
          color: #6b7d6e;
          font-weight: 400;
        }
        .ed-pullquote-by {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #8a8a85;
          display: inline-flex; align-items: center; gap: 14px;
        }
        .ed-pullquote-by::before,
        .ed-pullquote-by::after {
          content: '';
          width: 24px; height: 1px;
          background: rgba(26,26,26,0.25);
        }

        /* ─────────── HOW ─────────── */
        .ed-how {
          padding: 140px 48px 160px;
          background: #ece7df;
        }
        .ed-how-head {
          max-width: 1200px;
          margin: 0 auto 96px;
          display: grid;
          grid-template-columns: 200px 1fr;
          gap: 80px;
          align-items: end;
        }
        .ed-how-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 5vw, 72px);
          font-weight: 300;
          line-height: 1;
          letter-spacing: -0.025em;
          color: #1a1a1a;
        }
        .ed-how-title em { font-style: italic; color: #6b7d6e; }
        .ed-how-list {
          max-width: 1200px;
          margin: 0 auto;
        }
        .ed-how-step {
          display: grid;
          grid-template-columns: 200px 1fr 2fr;
          gap: 80px;
          padding: 56px 0;
          border-top: 1px solid rgba(26,26,26,0.15);
          align-items: start;
        }
        .ed-how-step:last-child {
          border-bottom: 1px solid rgba(26,26,26,0.15);
        }
        .ed-how-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-style: italic;
          color: #6b7d6e;
          letter-spacing: 1px;
        }
        .ed-how-step-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 3.2vw, 44px);
          font-weight: 300;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: #1a1a1a;
        }
        .ed-how-step-title em { font-style: italic; color: #6b7d6e; }
        .ed-how-step-desc {
          font-size: 14px;
          line-height: 1.85;
          color: #4a4a45;
          max-width: 44ch;
        }

        /* ─────────── SPECIALTIES ─────────── */
        .ed-spec {
          padding: 140px 48px 160px;
          background: #f4f1ec;
        }
        .ed-spec-head {
          max-width: 1200px;
          margin: 0 auto 96px;
          display: grid;
          grid-template-columns: 200px 1fr auto;
          gap: 80px;
          align-items: end;
        }
        .ed-spec-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(48px, 6vw, 88px);
          font-weight: 300;
          line-height: 0.95;
          letter-spacing: -0.03em;
          color: #1a1a1a;
        }
        .ed-spec-title em { font-style: italic; color: #6b7d6e; }
        .ed-spec-count {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          color: #8a8a85;
          font-style: italic;
          white-space: nowrap;
        }
        .ed-spec-count strong {
          font-family: 'Cormorant Garamond', serif;
          font-size: 56px;
          font-weight: 300;
          color: #1a1a1a;
          font-style: normal;
          margin-right: 6px;
          letter-spacing: -0.02em;
        }
        .ed-spec-list {
          list-style: none;
          max-width: 1200px;
          margin: 0 auto;
        }
        .ed-spec-item {
          display: grid;
          grid-template-columns: 80px 1fr auto;
          align-items: center;
          gap: 40px;
          padding: 32px 0;
          border-top: 1px solid rgba(26,26,26,0.15);
          cursor: default;
          transition: padding-left 0.4s cubic-bezier(0.22,1,0.36,1);
        }
        .ed-spec-item:last-child {
          border-bottom: 1px solid rgba(26,26,26,0.15);
        }
        .ed-spec-item:hover { padding-left: 16px; }
        .ed-spec-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-style: italic;
          color: #8a8a85;
        }
        .ed-spec-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 3.4vw, 44px);
          font-weight: 300;
          color: #1a1a1a;
          line-height: 1.05;
          letter-spacing: -0.02em;
          transition: color 0.3s, font-style 0.3s;
        }
        .ed-spec-item:hover .ed-spec-name {
          color: #6b7d6e;
          font-style: italic;
        }
        .ed-spec-arrow {
          color: #1a1a1a;
          opacity: 0;
          transform: translateX(-12px);
          transition: opacity 0.35s, transform 0.35s;
        }
        .ed-spec-item:hover .ed-spec-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        /* ─────────── PHILOSOPHY ─────────── */
        .ed-philo {
          padding: 160px 48px;
          background: #1a1a1a;
          color: #ece7df;
          position: relative;
        }
        .ed-philo-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 96px;
          align-items: center;
        }
        .ed-philo-tag {
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #8a8a85;
          margin-bottom: 32px;
          display: inline-flex; align-items: center; gap: 14px;
        }
        .ed-philo-tag::before {
          content: ''; width: 36px; height: 1px;
          background: #6b7d6e;
        }
        .ed-philo-tag em {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          text-transform: none;
          letter-spacing: 0;
          color: #9aab9d;
          margin: 0 4px;
        }
        .ed-philo-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 5vw, 72px);
          font-weight: 300;
          line-height: 1;
          letter-spacing: -0.025em;
          color: #ece7df;
          margin-bottom: 32px;
        }
        .ed-philo-title em {
          font-style: italic;
          color: #9aab9d;
        }
        .ed-philo-body {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(20px, 1.9vw, 24px);
          font-weight: 300;
          line-height: 1.6;
          color: rgba(236,231,223,0.75);
          font-style: italic;
          max-width: 40ch;
        }
        .ed-philo-list {
          list-style: none;
          padding: 0;
        }
        .ed-philo-list li {
          display: grid;
          grid-template-columns: 60px 1fr;
          gap: 28px;
          padding: 24px 0;
          border-top: 1px solid rgba(236,231,223,0.15);
        }
        .ed-philo-list li:last-child {
          border-bottom: 1px solid rgba(236,231,223,0.15);
        }
        .ed-philo-list-k {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-style: italic;
          color: #9aab9d;
          padding-top: 4px;
        }
        .ed-philo-list-v {
          font-size: 14px;
          line-height: 1.75;
          color: rgba(236,231,223,0.7);
        }
        .ed-philo-list-v strong {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 400;
          font-style: italic;
          color: #ece7df;
          margin-bottom: 6px;
          letter-spacing: -0.005em;
        }

        /* ─────────── CTA ─────────── */
        .ed-cta {
          padding: 180px 48px;
          background: #f4f1ec;
          text-align: center;
          position: relative;
        }
        .ed-cta-inner {
          max-width: 880px;
          margin: 0 auto;
        }
        .ed-cta-eyebrow {
          font-size: 10px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #8a8a85;
          margin-bottom: 40px;
          display: inline-flex; align-items: center; gap: 14px;
        }
        .ed-cta-eyebrow::before,
        .ed-cta-eyebrow::after {
          content: ''; width: 28px; height: 1px;
          background: rgba(26,26,26,0.25);
        }
        .ed-cta-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(48px, 6vw, 96px);
          font-weight: 300;
          line-height: 0.95;
          letter-spacing: -0.03em;
          color: #1a1a1a;
          margin-bottom: 56px;
        }
        .ed-cta-title em {
          font-style: italic; color: #6b7d6e;
        }
        .ed-cta-actions {
          display: inline-flex; align-items: center;
          gap: 40px; flex-wrap: wrap; justify-content: center;
          padding-top: 40px;
          border-top: 1px solid rgba(26,26,26,0.15);
        }
        .ed-cta-note {
          margin-top: 56px;
          font-size: 11px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #8a8a85;
          display: inline-flex; align-items: center; gap: 18px;
          flex-wrap: wrap; justify-content: center;
        }
        .ed-cta-note span { color: #b8b8b3; }

        /* ─────────── FOOTER ─────────── */
        .ed-footer {
          background: #1a1a1a;
          color: #b8b8b3;
          padding: 80px 48px 40px;
        }
        .ed-footer-top {
          max-width: 1200px; margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 64px;
          padding-bottom: 64px;
          border-bottom: 1px solid rgba(236,231,223,0.12);
        }
        .ed-footer-brand {
          font-family: 'Cormorant Garamond', serif;
          font-size: 32px;
          font-weight: 300;
          color: #ece7df;
          letter-spacing: -0.01em;
          margin-bottom: 16px;
          line-height: 1.05;
        }
        .ed-footer-brand em { font-style: italic; color: #9aab9d; }
        .ed-footer-sub {
          font-size: 12px;
          color: #8a8a85;
          line-height: 1.7;
          max-width: 38ch;
        }
        .ed-footer-col-h {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #8a8a85;
          margin-bottom: 20px;
        }
        .ed-footer-col a, .ed-footer-col p {
          display: block;
          font-size: 18px;
          color: #ece7df;
          text-decoration: none;
          margin-bottom: 10px;
          transition: color 0.25s;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
        }
        .ed-footer-col a:hover { color: #9aab9d; }
        .ed-footer-bottom {
          max-width: 1200px; margin: 0 auto;
          padding-top: 32px;
          display: flex; justify-content: space-between; align-items: center;
          flex-wrap: wrap; gap: 16px;
          font-size: 10px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #5a5a55;
        }
        .ed-footer-bottom em {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          text-transform: none;
          letter-spacing: 0;
          color: #8a8a85;
          margin-left: 6px;
        }

        /* ─────────── SECTION SEPARATORS ─────────── */
        /* Every public-facing section gets a visible top border so
           sections read as distinct pages, not one long scroll. */
        .ed-profile,
        .ed-manifesto,
        .ed-about,
        .ed-pullquote,
        .ed-how,
        .ed-spec,
        .ed-philo,
        .ed-cta {
          border-top: 1px solid rgba(26,26,26,0.13);
          border-bottom: 1px solid rgba(26,26,26,0.13);
        }
        /* Dark section: use lighter rule */
        .ed-philo {
          border-color: rgba(236,231,223,0.12);
        }
        /* Index strip gets its own pair of rules */
        .ed-index {
          border-top: 1.5px solid rgba(26,26,26,0.18);
          border-bottom: 1.5px solid rgba(26,26,26,0.18);
        }

        /* ─────────── SECTION LABELS (left-rail numbers) ─────────── */
        /* Add a small coloured square before each section tag so the
           section-number acts as a visual anchor */
        .ed-section-tag::after {
          content: '';
          display: block;
          width: 6px;
          height: 6px;
          background: #6b7d6e;
          border-radius: 50%;
          margin-top: 10px;
        }

        /* ─────────── RESPONSIVE ─────────── */
        @media (max-width: 1024px) {
          .ed-nav { padding: 20px 32px; }
          .ed-nav-links { gap: 28px; }

          .ed-hero { grid-template-columns: 1fr; padding: 32px 32px 60px; }
          .ed-hero-left { padding: 0; }
          .ed-hero-right { margin-right: 0; margin-top: 56px; }
          .ed-hero-portrait { min-height: 480px; }
          .ed-hero-issue { right: 32px; top: 16px; }

          .ed-profile-inner,
          .ed-manifesto-inner,
          .ed-about-head,
          .ed-how-head,
          .ed-spec-head {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .ed-about-spread {
            grid-template-columns: 1fr;
            gap: 48px;
          }
          .ed-how-step {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 40px 0;
          }
          .ed-philo-inner {
            grid-template-columns: 1fr;
            gap: 56px;
          }
          .ed-footer-top {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 900px) {

  .ed-profile {
    padding:
      100px 24px
      120px;
  }

  .ed-profile-name {
    font-size: clamp(56px, 18vw, 92px);
    line-height: 0.9;
    max-width: 100%;
  }

  .ed-profile-meta {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .ed-profile-meta-k {
    padding-top: 0;
  }

  .ed-profile-actions {
    gap: 20px;
    margin-top: 56px;
  }

}


        @media (max-width: 768px) {
          .ed-nav { padding: 16px 24px; grid-template-columns: 1fr auto; gap: 16px; }
          .ed-nav-links { display: none; }
          .ed-nav-name { font-size: 18px; }
          .ed-nav-avatar { width: 44px; height: 44px; }
          .ed-nav-cta { padding: 9px 18px; font-size: 13px; }

          .ed-hero { padding: 64px 24px 80px; }
          .ed-hero-issue { display: none; }
          .ed-hero-quote-eyebrow { margin-bottom: 36px; }
          .ed-hero-quote-text { margin-bottom: 40px; }
          .ed-hero-quote-actions { margin-top: 48px; gap: 20px; }

          .ed-profile { padding: 72px 24px 88px; }
          .ed-profile-meta { grid-template-columns: 1fr; gap: 18px; max-width: 100%; }

          .ed-index { grid-template-columns: 1fr; gap: 16px; padding: 28px 24px; }

          .ed-manifesto { padding: 120px 24px; }
          .ed-about { padding: 100px 24px 120px; }
          .ed-pullquote { padding: 120px 24px; }
          .ed-how { padding: 100px 24px 120px; }
          .ed-spec { padding: 100px 24px 120px; }
          .ed-philo { padding: 120px 24px; }
          .ed-cta { padding: 120px 24px; }

          .ed-spec-head { grid-template-columns: 1fr; }
          .ed-spec-item { grid-template-columns: 60px 1fr auto; gap: 20px; padding: 24px 0; }
          .ed-about-meta { grid-template-columns: 1fr 1fr; }

          .ed-cta-actions { flex-direction: column; gap: 24px; padding-top: 32px; }

          .ed-footer { padding: 60px 24px 32px; }
          .ed-footer-top { grid-template-columns: 1fr; gap: 40px; padding-bottom: 40px; }
          .ed-footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div className="ed-root">

        {/* ── NAV — plain, static ── */}
        <nav className="ed-nav">
          <a href="#home" className="ed-nav-mark" style={{ textDecoration: 'none' }}>
            {/* <div className="ed-nav-avatar">
              {therapist.image && therapist.image.trim() !== '' ? (
                <img src={therapist.image} alt={therapist.name} />
              ) : (
                <div className="ed-nav-avatar-fb">{initials}</div>
              )}
            </div> */}
            <span className="ed-nav-name">{therapist.name}</span>
          </a>
          <div className="ed-nav-links">
            <a href="#about">About</a>
            <a href="#practice">Practice</a>
            <a href="#services">Areas</a>
            <a href="#philosophy">Philosophy</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="ed-nav-right">
            {whatsappLink && (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="ed-nav-cta">
                Schedule Visit
              </a>
            )}
          </div>
        </nav>

        {/* ── HERO — quote-led ── */}
        <section className="ed-hero" id="home">
          {/* <div className="ed-hero-issue ed-fade">
            Volume 01 <em>—</em> {year}
          </div> */}

          <div className="ed-hero-quote-wrap">
            <div className="ed-hero-quote-eyebrow ed-rise-1">A note from the practice</div>

            <h1 className="ed-hero-quote-text ed-rise-3">
              &ldquo;You don&rsquo;t have to carry it <em>alone</em>. Take a breath.&rdquo;
            </h1>

            <span className="ed-hero-quote-rule ed-rise-4" aria-hidden="true" />

            <p className="ed-hero-quote-by ed-rise-4">
              <strong> ~ {therapist.name}</strong>
            </p>

            <div className="ed-hero-quote-actions ed-rise-5">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="ed-cta-link">
                  <MessageCircle size={14} />
                  Begin a conversation
                </a>
              )}
              <a href="#profile" className="ed-cta-ghost">
                Meet {firstName}
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* ── PROFILE — identity + meta moved out of hero ── */}
        <section className="ed-profile" id="profile">
          <div className="ed-profile-inner">
            {/* <div className="ed-profile-eyebrow reveal">Profile <em style={{ fontFamily: 'Cormorant Garamond, serif', fontStyle: 'italic', textTransform: 'none', letterSpacing: 0, color: '#6b7d6e' }}>—</em> 00</div> */}
            <div>
              <h2 className="ed-profile-name reveal reveal-d1">
                <span className="ln">
                  {therapist.name.split(' ').length > 1
                    ? therapist.name.split(' ').slice(0, -1).join(' ')
                    : therapist.name}
                </span>
                {therapist.name.split(' ').length > 1 && (
                  <span className="ln">
                    <em>{therapist.name.split(' ').slice(-1)[0]}</em>
                  </span>
                )}
              </h2>

              <div className="ed-profile-sub reveal reveal-d1">
                {therapist.location || 'India'}
                <span style={{ color: '#b8b8b3', margin: '0 8px' }}>·</span>
                Practising{therapist.experience > 0 ? ` since ${year - therapist.experience}` : ''}
              </div>

              <div className="ed-profile-meta reveal reveal-d2">
                <div className="ed-profile-meta-k">Discipline</div>
                <div className="ed-profile-meta-v">{therapist.credentials || 'Psychotherapy'}</div>

                <div className="ed-profile-meta-k">Mode</div>
                <div className="ed-profile-meta-v">
                  {sessionModeLabel}
 
                </div>

                <div className="ed-profile-meta-k">Languages</div>
                <div className="ed-profile-meta-v">{therapist.languages.join(' · ')}</div>

                <div className="ed-profile-meta-k">Duration</div>
                <div className="ed-profile-meta-v">                 <span className="ed-sep">/</span>
                  {therapist.sessionDuration} minutes</div>
              </div>

              {/* <div className="ed-profile-actions reveal reveal-d3">
                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="ed-cta-link">
                    <MessageCircle size={14} />
                    Begin a conversation
                  </a>
                )}
                <a href="#about" className="ed-cta-ghost">
                  Read more
                  <ArrowRight size={14} />
                </a>
              </div> */}
            </div>
          </div>
        </section>

        {/* ── INDEX strip ── */}
        <div className="ed-index reveal">
          <div className="ed-index-label">Index</div>
          <div className="ed-index-words">
            {therapist.specialties.slice(0, 4).map((s, i, arr) => (
              <span key={s}>
                {s}
                {i < arr.length - 1 && <span className="dot">·</span>}
              </span>
            ))}
          </div>
          {/* <div className="ed-index-num">N° {String(therapist.specialties.length).padStart(2, '0')}</div> */}
        </div>

        {/* ── MANIFESTO ── */}
        <section className="ed-manifesto">
          <div className="ed-manifesto-inner">
            <div className="ed-section-tag reveal">Statement <em>—</em> 01</div>
            <p className="ed-manifesto-text reveal reveal-d1">
              A practice built on <em>presence</em>, not performance. Slow, considered, and quietly held — for the work that matters most.
            </p>
          </div>
        </section>

        {/* ── ABOUT — magazine spread ── */}
        <section className="ed-about" id="about">
          <div className="ed-about-head">
            <div className="ed-section-tag reveal">About <em>—</em> 02</div>
            <h2 className="ed-about-title reveal reveal-d1">
              In the room with <em>{firstName}</em>
            </h2>
          </div>

          <div className="ed-about-spread">
            <div className="ed-about-folio reveal">
              fig. 01<br />
              {therapist.location || 'Practice'}
            </div>

            <div className="ed-about-img-wrap reveal reveal-d1">
              <img
                src={therapist.image && therapist.image.trim() !== '' ? therapist.image : '/profiledemo.png'}
                alt={therapist.name}
              />
              <div className="ed-about-img-cap">{therapist.name}</div>
            </div>

            <div className="ed-about-body reveal reveal-d2">
              {therapist.bio && (() => {
                const sentences = therapist.bio.split('. ').filter(Boolean)
                const lede = sentences[0] + (sentences[0]?.endsWith('.') ? '' : '.')
                const rest = sentences.slice(1).join('. ').trim()
                return (
                  <>
                    <p className="ed-about-lede">{lede}</p>
                    {rest && <p className="ed-about-bio">{rest}</p>}
                  </>
                )
              })()}

              <div className="ed-about-meta">
                <div>
                  <div className="ed-about-meta-k">Experience</div>
                  <div className="ed-about-meta-v">
                    <em>{therapist.experience > 0 ? therapist.experience : '—'}</em>
                    {therapist.experience > 0 && <span className="unit">yrs</span>}
                  </div>
                </div>
                <div>
                  <div className="ed-about-meta-k">Languages</div>
                  <div className="ed-about-meta-v"><em>{therapist.languages}</em></div>
                </div>
                <div>
                  <div className="ed-about-meta-k">Session</div>
                  <div className="ed-about-meta-v">
                    <em>{therapist.sessionDuration}</em>
                    <span className="unit">min</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PULL QUOTE ── */}
        <section className="ed-pullquote">
          <div className="ed-pullquote-inner">
            <p className="ed-pullquote-text reveal">
              &ldquo;Therapy is not about <em>fixing</em> what is broken — it is about meeting yourself with the kind of attention you&rsquo;ve always deserved.&rdquo;
            </p>
            <div className="ed-pullquote-by reveal reveal-d2">{firstName}</div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="ed-how" id="practice">
          <div className="ed-how-head">
            <div className="ed-section-tag reveal">Practice <em>—</em> 03</div>
            <h2 className="ed-how-title reveal reveal-d1">
              A <em>quiet</em> beginning
            </h2>
          </div>

          <div className="ed-how-list">
            {[
              {
                num: 'I.',
                title: 'Reach out',
                desc: 'Send a message — over WhatsApp or call. Tell me, in your own words, what brings you here. I respond personally, within twenty-four hours.'
              },
              {
                num: 'II.',
                title: 'First meeting',
                desc: 'A 50-minute conversation. No agenda, no commitment. We see whether the work we might do together feels right for you.'
              },
              {
                num: 'III.',
                title: 'Ongoing care',
                desc: 'Sessions held at your pace, on your terms. The relationship between us is the work — slow, steady, and deeply considered.'
              },
            ].map((step) => (
              <div key={step.num} className="ed-how-step reveal">
                <div className="ed-how-num">{step.num}</div>
                <h3 className="ed-how-step-title">{step.title}</h3>
                <p className="ed-how-step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SPECIALTIES ── */}
        <section className="ed-spec" id="services">
          <div className="ed-spec-head">
            <div className="ed-section-tag reveal">Areas of practice <em>—</em> 04</div>
            <h2 className="ed-spec-title reveal reveal-d1">
              What I work <em>with</em>
            </h2>
            <div className="ed-spec-count reveal reveal-d2">
              <strong>{String(therapist.specialties.length).padStart(2, '0')}</strong>
              areas
            </div>
          </div>

          <ul className="ed-spec-list">
            {therapist.specialties.map((s, i) => (
              <li key={s} className="ed-spec-item reveal">
                <span className="ed-spec-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="ed-spec-name">{s}</span>
                <ArrowUpRight size={20} className="ed-spec-arrow" strokeWidth={1.2} />
              </li>
            ))}
          </ul>
        </section>

        {/* ── PHILOSOPHY ── */}
        <section className="ed-philo" id="philosophy">
          <div className="ed-philo-inner">
            <div>
              <div className="ed-philo-tag reveal">Philosophy <em>—</em> 05</div>
              <h2 className="ed-philo-title reveal reveal-d1">
                The work is <em>relational</em>
              </h2>
              <p className="ed-philo-body reveal reveal-d2">
                I believe the most lasting change happens not through technique alone, but in the steady, careful attention of one person to another — over time.
              </p>
            </div>

            <ul className="ed-philo-list">
              <li className="reveal">
                <div className="ed-philo-list-k">i.</div>
                <div className="ed-philo-list-v">
                  <strong>Confidential</strong>
                  Everything that passes between us stays between us. This is the foundation on which all else rests.
                </div>
              </li>
              <li className="reveal reveal-d1">
                <div className="ed-philo-list-k">ii.</div>
                <div className="ed-philo-list-v">
                  <strong>Unhurried</strong>
                  We move at the pace of your nervous system, not a curriculum. There is no schedule for becoming whole.
                </div>
              </li>
              <li className="reveal reveal-d2">
                <div className="ed-philo-list-k">iii.</div>
                <div className="ed-philo-list-v">
                  <strong>Considered</strong>
                  Each session is held with full attention. Between us, the work is treated with the seriousness it deserves.
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="ed-cta" id="contact">
          <div className="ed-cta-inner">
            <div className="ed-cta-eyebrow reveal">When you are ready</div>
            <h2 className="ed-cta-title reveal reveal-d1">
              Begin a <em>quiet</em><br />conversation
            </h2>

            <div className="ed-cta-actions reveal reveal-d2">
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="ed-cta-link">
                  <MessageCircle size={14} />
                  Write to {firstName}
                </a>
              )}
              {therapist.phone && (
                <a href={`tel:${therapist.phone}`} className="ed-cta-ghost">
                  <Phone size={14} />
                  Or call directly
                </a>
              )}
            </div>

            <div className="ed-cta-note reveal reveal-d3">
              Confidential <span>·</span> Reply within 24 hours <span>·</span> &#8377;{therapist.fee.toLocaleString()} per session
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="ed-footer">
          <div className="ed-footer-top">
            <div>
              <div className="ed-footer-brand">
                {therapist.name}<br /><em>practice</em>
              </div>
              <p className="ed-footer-sub">
                {therapist.credentials}
                {therapist.location && ` · Based in ${therapist.location}`}
              </p>
            </div>

            <div className="ed-footer-col">
              <div className="ed-footer-col-h">Sections</div>
              <a href="#home">Cover</a>
              <a href="#about">About</a>
              <a href="#practice">Practice</a>
              <a href="#services">Areas</a>
              <a href="#philosophy">Philosophy</a>
            </div>

            <div className="ed-footer-col">
              <div className="ed-footer-col-h">Contact</div>
              {whatsappLink && <a href={whatsappLink} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
              {therapist.phone && <a href={`tel:${therapist.phone}`}>Telephone</a>}
              {therapist.website && <a href={therapist.website} target="_blank" rel="noopener noreferrer">Website</a>}
            </div>

            <div className="ed-footer-col">
              <div className="ed-footer-col-h">Elsewhere</div>
              {therapist.instagram && <a href={therapist.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>}
              {therapist.linkedin && <a href={therapist.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}
              {!therapist.instagram && !therapist.linkedin && <p>By appointment</p>}
            </div>
          </div>

          <div className="ed-footer-bottom">
            <div>&copy; {year} {therapist.name}</div>
            <div>Counsellors of India <em>— Verified practitioner</em></div>
          </div>
        </footer>

      </div>
    </>
  )
}
