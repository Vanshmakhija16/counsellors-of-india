'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

// See SiteFooter.tsx for why this is a small local shape rather than the
// full server-only TenantConfig. Default is India's exact original copy.
export interface SiteNavTenant {
  brandName: string
}

const DEFAULT_TENANT: SiteNavTenant = { brandName: 'Counsellors of India' }

// ── Shared design tokens — same warm-paper / saffron language as the blog
// pages, so the nav now reads as one coherent site instead of homepage's
// nav and this one being two unrelated designs. ─────────────────────────
const INK = '#2B3B37'
const INK_MUT = '#6B7570'
const SAFFRON = '#FF9933'
const SAFFRON_DEEP = '#E07A12'
const RULE = '#E4DCC9'

// Real site pages, not homepage in-page anchors — a visitor on /blog or
// /contact clicking "Templates" used to get yanked back to the homepage
// mid-read. These links now go where a visitor standing on a standalone
// page actually expects: the other standalone pages.
const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Why Us', href: '/why-us' },
  { label: 'Onboarding Guide', href: '/onboarding-guide' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
]

/**
 * The site's shared top nav for every standalone marketing page (About, Why
 * Us, Onboarding Guide, Blog, Contact). Fully self-contained — its own
 * scoped `.sitenav-*` classes and its own <style> block below, so it no
 * longer depends on (or fights with) the three separate legacy .nav /
 * .mobile-sidebar / .menu-btn definitions living in app/page.css, which
 * were only ever meant for the homepage's own separate nav.
 */
export default function SiteNav({ tenant = DEFAULT_TENANT }: { tenant?: SiteNavTenant } = {}) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href
  const [brandFirst, brandRest] = tenant.brandName.split(' of ')

  useEffect(() => {
    let ticking = false
    const fn = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 18)
        ticking = false
      })
    }
    window.addEventListener('scroll', fn, { passive: true })
    fn()
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [menuOpen])

  // Close the sheet automatically on route change (clicking a link).
  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <nav className={`sitenav ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="sitenav-inner">
          <Link href="/" className="sitenav-logo">
            <img src="/coi.png" alt="" className="sitenav-logo-img" />
            <span className="sitenav-logo-text">
              {brandFirst}{brandRest ? <><br />of {brandRest}</> : null}
            </span>
          </Link>

          <div className="sitenav-links">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`sitenav-link ${isActive(link.href) ? 'is-active' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="sitenav-actions">
            <Link href="/signup" className="sitenav-cta">
              List your practice
            </Link>

            <button
              className="sitenav-menu-btn"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`sitenav-overlay ${menuOpen ? 'is-show' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`sitenav-sheet ${menuOpen ? 'is-show' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="sitenav-sheet-top">
          <Link href="/" className="sitenav-sheet-brand" onClick={() => setMenuOpen(false)}>
            <img src="/coi.png" alt="" className="sitenav-sheet-brand-img" />
            <span>{tenant.brandName}</span>
          </Link>
          <button
            className="sitenav-sheet-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sitenav-sheet-links">
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`sitenav-sheet-link ${isActive(link.href) ? 'is-active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link href="/signup" className="sitenav-sheet-cta">
          List your practice
        </Link>
      </aside>

      <style>{`
        .sitenav{
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 500;
          width: 90%;
          max-width: 1180px;
          height: 60px;
          border-radius: 999px;
          background: rgba(255, 252, 247, 0.9);
          border: 1px solid ${RULE};
          backdrop-filter: blur(18px) saturate(140%);
          -webkit-backdrop-filter: blur(18px) saturate(140%);
          box-shadow: 0 4px 20px -12px rgba(31, 26, 20, 0.12);
          transition: background .35s ease, box-shadow .35s ease, border-color .35s ease;
        }
        .sitenav.is-scrolled{
          background: rgba(255, 252, 247, 0.98);
          box-shadow: 0 10px 30px -14px rgba(31, 26, 20, 0.22);
        }
        .sitenav-inner{
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          padding: 0 10px 0 18px;
        }

        .sitenav-logo{
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .sitenav-logo-img{ height: 32px; width: auto; display: block; object-fit: contain; }
        .sitenav-logo-text{
          font-family: "Times New Roman", Times, serif;
          font-size: 14px;
          font-weight: 700;
          line-height: 1.15;
          color: ${INK};
          letter-spacing: -.01em;
        }

        .sitenav-links{
          display: flex;
          align-items: center;
          gap: 26px;
        }
        .sitenav-link{
          position: relative;
          font-size: 13.5px;
          font-weight: 500;
          color: ${INK_MUT};
          text-decoration: none;
          padding: 4px 0;
          transition: color .2s ease;
        }
        .sitenav-link::after{
          content: '';
          position: absolute;
          left: 0; right: 0; bottom: -2px;
          height: 1.5px;
          background: ${SAFFRON};
          transform: scaleX(0);
          transform-origin: center;
          transition: transform .25s cubic-bezier(.22,.87,.36,1);
        }
        .sitenav-link:hover{ color: ${INK}; }
        .sitenav-link:hover::after{ transform: scaleX(1); }
        .sitenav-link.is-active{ color: ${SAFFRON_DEEP}; }
        .sitenav-link.is-active::after{ transform: scaleX(1); }

        .sitenav-actions{
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .sitenav-cta{
          display: inline-flex;
          align-items: center;
          height: 42px;
          padding: 0 20px;
          border-radius: 999px;
          background: ${INK};
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          white-space: nowrap;
          transition: background .2s ease, transform .2s ease;
        }
        .sitenav-cta:hover{ background: #1c2825; transform: translateY(-1px); }

        .sitenav-menu-btn{
          display: none;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 12px;
          background: rgba(43, 59, 55, 0.06);
          color: ${INK};
          cursor: pointer;
          transition: background .2s ease;
        }
        .sitenav-menu-btn:hover{ background: rgba(43, 59, 55, 0.1); }

        @media (max-width: 860px){
          .sitenav-links{ display: none; }
          .sitenav-cta{ display: none; }
          .sitenav-menu-btn{ display: flex; }
          .sitenav{ width: 92%; height: 56px; top: 12px; }
          .sitenav-inner{ padding: 0 8px 0 16px; }
        }

        /* ── Overlay + sheet — top-to-bottom dropdown, not a right-hand
           drawer, and consistent regardless of viewport transforms since
           nothing above them in the DOM has its own transform. ── */
        .sitenav-overlay{
          position: fixed;
          inset: 0;
          z-index: 900;
          background: rgba(20, 17, 12, 0);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: opacity .3s ease, background .3s ease;
        }
        .sitenav-overlay.is-show{
          background: rgba(20, 17, 12, 0.45);
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .sitenav-sheet{
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 950;
          width: 100%;
          max-height: calc(100vh - 16px);
          overflow-y: auto;
          border-radius: 0 0 24px 24px;
          background: #FBF7F0;
          border-bottom: 1px solid ${RULE};
          box-shadow: 0 24px 60px -20px rgba(31, 26, 20, 0.35);
          padding: 20px 22px 28px;
          transform: translateY(-100%);
          transition: transform .5s cubic-bezier(.16,1,.3,1);
        }
        .sitenav-sheet.is-show{ transform: translateY(0); }

        .sitenav-sheet-top{
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .sitenav-sheet-brand{
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: ${INK};
          font-weight: 700;
          font-size: 15px;
        }
        .sitenav-sheet-brand-img{ height: 28px; width: auto; }
        .sitenav-sheet-close{
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          background: rgba(43, 59, 55, 0.06);
          color: ${INK};
          cursor: pointer;
          transition: background .2s ease, transform .2s ease;
        }
        .sitenav-sheet-close:hover{ background: rgba(43, 59, 55, 0.1); }

        .sitenav-sheet-links{
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-bottom: 22px;
        }
        .sitenav-sheet-link{
          padding: 13px 14px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 500;
          color: ${INK};
          text-decoration: none;
          transition: background .2s ease, color .2s ease;
        }
        .sitenav-sheet-link:hover{ background: rgba(255, 153, 51, 0.08); }
        .sitenav-sheet-link.is-active{
          background: rgba(255, 153, 51, 0.1);
          color: ${SAFFRON_DEEP};
        }

        .sitenav-sheet-cta{
          display: flex;
          align-items: center;
          justify-content: center;
          height: 48px;
          border-radius: 999px;
          background: ${INK};
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        @media (prefers-reduced-motion: reduce){
          .sitenav, .sitenav-sheet, .sitenav-overlay, .sitenav-link, .sitenav-cta{
            transition: none;
          }
        }
      `}</style>
    </>
  )
}
