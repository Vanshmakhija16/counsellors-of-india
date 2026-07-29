'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

// Minimal branding shape the footer actually renders — kept separate from
// the full TenantConfig so this client component doesn't need to import
// server-only tenant code. Defaults below are India's exact original
// hardcoded copy, so any call site that doesn't pass `tenant` yet renders
// byte-for-byte what it did before.
export interface SiteFooterTenant {
  brandName: string
  footerTagline: string
}

const DEFAULT_TENANT: SiteFooterTenant = {
  brandName: 'Counsellors of India',
  footerTagline:
    'A calm, trusted home for every counselling practice in India, websites, bookings, and payments in one place.',
}

const FOOTER_COLS = [
  {
    h: 'Platform',
    links: [
      { l: 'Templates', href: '/#experience' },
      { l: 'Try Demo', href: '/#templates' },
      { l: 'How It Works', href: '/#how' },
      { l: 'Pricing', href: '/#pricing' },
      { l: 'Therapist Directory', href: '/#therapists' },
      { l: 'List Your Practice', href: '/signup' },
    ],
  },
  {
    h: 'Company',
    links: [
      { l: 'About Us', href: '/about' },
      { l: 'Why Us', href: '/why-us' },
      { l: 'Onboarding Guide', href: '/onboarding-guide' },
      { l: 'Blog', href: '/blog' },
      { l: 'Contact', href: '/contact' },
    ],
  },
]

// const FOOTER_SOCIALS = [
//   { name: 'Instagram', href: '#', icon: (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.6"/><circle cx="17.2" cy="6.8" r="1"/></svg>
//   )},
//   { name: 'LinkedIn', href: '#', icon: (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4.5h.01M3.5 8h3v12h-3z"/><path d="M9.5 20V8h3v1.8c.7-1.2 2-2.1 3.8-2.1 2.8 0 4.7 1.9 4.7 5.3V20h-3v-6.6c0-1.6-.6-2.7-2.1-2.7-1.4 0-2.4 1-2.4 2.7V20z"/></svg>
//   )},
//   { name: 'X', href: '#', icon: (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l16 16M20 4L4 20"/></svg>
//   )},
//   { name: 'Email', href: 'mailto:hello@counsellorsofindia.com', icon: (
//     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></svg>
//   )},
// ]

/**
 * The site's real footer — same component used on the homepage. Extracted
 * here so every standalone marketing page (About, Why Us, Onboarding Guide,
 * Blog, Contact) shares the exact same footer + nav links instead of a
 * separate lightweight duplicate.
 */
export default function SiteFooter({ tenant = DEFAULT_TENANT }: { tenant?: SiteFooterTenant } = {}) {
  const footerRef = useRef<HTMLElement>(null)
  // "Counsellors of America" -> ["Counsellors", "America"], so the logo
  // keeps its two-line "Counsellors<br/>of X" look for any brand name.
  const [brandFirst, brandRest] = tenant.brandName.split(' of ')

  // While this footer is in view, hide any top nav tagged .site-topnav (see
  // globals.css) so the nav never visually overlaps the footer as it scrolls
  // underneath it.
  useEffect(() => {
    const el = footerRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        document.body.classList.toggle('footer-in-view', entry.isIntersecting)
      },
      { threshold: 0.01 }
    )
    obs.observe(el)
    return () => {
      obs.disconnect()
      document.body.classList.remove('footer-in-view')
    }
  }, [])

  return (
    <footer ref={footerRef} className="pfoot" aria-label="Site footer">
      <div className="pfoot-glow" aria-hidden="true" />
      <div className="pfoot-inner">

        <div className="pfoot-top">
          <div className="pfoot-brand">
            <Link href="/" className="pfoot-logo">
              <img src="/coi.png" alt="" className="pfoot-logo-img" />
              <span>{brandFirst}{brandRest ? <><br/>of {brandRest}</> : null}</span>
            </Link>
            <p className="pfoot-tag">
              {tenant.footerTagline}
            </p>
            {/* <div className="pfoot-socials">
              {FOOTER_SOCIALS.map(s => (
                <a key={s.name} href={s.href} aria-label={s.name} className="pfoot-social">
                  {s.icon}
                </a>
              ))}
            </div> */}
          </div>

          {FOOTER_COLS.map(col => (
            <div key={col.h} className="pfoot-col">
              <div className="pfoot-col-h">{col.h}</div>
              <ul className="pfoot-col-list">
                {col.links.map(link => (
                  <li key={link.l}>
                    <a href={link.href}>{link.l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* <div className="pfoot-rule" /> */}

        <div className="pfoot-bottom">
          <div className="pfoot-bottom-l">
            <span>© {new Date().getFullYear()} {tenant.brandName}. All rights reserved.</span>
          
          </div>
          {/* <div className="pfoot-badges"> */}
            {/* <span className="pfoot-badge">🔒 Secured Payments</span> */}
            {/* <span className="pfoot-badge">Razorpay  </span> */}
            {/* <span className="pfoot-badge">UPI · Cards · Netbanking</span> */}
          {/* </div> */}
        </div>

      </div>
    </footer>
  )
}
