'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTherapist } from '@/lib/useTherapist'

// See SiteFooter.tsx / SiteNav.tsx for why this is a small local shape
// rather than the full server-only TenantConfig. Default is India's exact
// original hardcoded copy, so any call site that doesn't pass `tenant`
// yet renders byte-for-byte what it did before.
export interface SiteNavbarTenant {
  brandName: string
  logoPath?: string
  // Overrides the "List your practice" CTA's border/fill color (resting
  // state + hover fill). Falls back to the site's default saffron
  // (--wn-saffron) when omitted, so India's navbar is unaffected. Scoped
  // as a CSS variable directly on <nav> (see --nav-cta-color usage in
  // page.css's FINAL .nav .btn-dark override) rather than relying on the
  // indirect <html>-level --wn-saffron threading in layout.tsx, since that
  // path goes through a :root{--wn-saffron:#FF9933} redeclaration in
  // page.css first and was not reliably resolving to the tenant color.
  ctaColor?: string
}

const DEFAULT_TENANT: SiteNavbarTenant = { brandName: 'Counsellors of India', logoPath: '/coi.png' }

// The real site navbar (logo, section links, mobile sidebar, auth-aware
// CTA) — shared by the homepage and any other marketing/directory page so
// visitors get the exact same header + navigation everywhere. Section links
// point to "/#section": from the homepage this behaves as a normal in-page
// anchor jump (same path, browsers don't reload for a hash-only change);
// from any other page it navigates back to the homepage and then jumps to
// that section.
export default function SiteNavbar({ tenant = DEFAULT_TENANT }: { tenant?: SiteNavbarTenant } = {}) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [brandFirst, brandRest] = tenant.brandName.split(' of ')

  const { therapist: authTherapist } = useTherapist()
  const authNameParts = (authTherapist?.full_name ?? '').trim().split(/\s+/).filter(Boolean)
  const authFirstName = authNameParts.length > 1 && /^(dr|mr|mrs|ms|miss|mx|prof)\.?$/i.test(authNameParts[0])
    ? authNameParts[1]
    : (authNameParts[0] ?? '')
  const authHasPlan = !!authTherapist?.plan && !['none', 'free', ''].includes(authTherapist.plan)
  const authHref = authHasPlan ? '/dashboard' : '/pricing?redirect=' + encodeURIComponent('/dashboard')

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

  // In-page section links ("/#therapists" etc.) rely on the browser's
  // native anchor jump by default, which computes the target's position
  // once, at click-time, against whatever the layout happens to be right
  // then. From the very top of the homepage, sections below (therapist
  // cards loaded async, iframes, images) are often still resizing the
  // page, so that one-shot calculation lands short/long. Lenis (the smooth
  // -scroll library the homepage uses) caches its own document-height
  // measurement too, which goes stale the same way. Intercepting the click
  // lets us force a fresh measurement and scroll right at that moment
  // instead of trusting a calculation from whenever Lenis/the browser last
  // measured the page.
  function handleHashNavClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const href = e.currentTarget.getAttribute('href') ?? ''
    const hashIdx = href.indexOf('#')
    if (hashIdx === -1) return // not a hash link -- let it navigate normally

    const targetPath = href.slice(0, hashIdx) || '/'
    const currentPath = window.location.pathname
    // Only intercept when we're already on the page the hash lives on --
    // otherwise let Next.js/the browser do the normal cross-page navigation
    // (can't scroll to an element that isn't in the DOM yet).
    if (targetPath !== currentPath && targetPath !== '') return

    const id = href.slice(hashIdx + 1)
    const target = document.getElementById(id)
    if (!target) return // fall back to native jump if we somehow can't find it

    e.preventDefault()
    const lenis = (window as any).__lenis
    if (lenis) {
      lenis.resize() // re-measure the document now, not from whenever it last checked
      lenis.scrollTo(target, { duration: 1 })
    } else {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    window.history.pushState(null, '', href)
  }

  return (
    <>
      <nav
        className={`nav site-topnav ${scrolled ? 'scrolled' : ''}`}
        style={tenant.ctaColor ? ({ ['--nav-cta-color' as any]: tenant.ctaColor } as React.CSSProperties) : undefined}
      >
        <div className="nav-inner">
          <Link href="/" className="logo">
            <img src={tenant.logoPath ?? '/coi.png'} alt="" className="logo-img" />
            <span className="logo-tagline">{brandFirst}{brandRest ? <><br />of {brandRest}</> : null}</span>
          </Link>

          <span className="nav-mobile-title">{tenant.brandName}</span>

          <div className="nav-mid">
            <a href="/#experience" className="nav-a" onClick={handleHashNavClick}>Templates</a>
            <a href="/#templates" className="nav-a" onClick={handleHashNavClick}>Demo</a>
            <a href="/#how" className="nav-a" onClick={handleHashNavClick}>Steps </a>
            <a href="/#therapists" className="nav-a" onClick={handleHashNavClick}>Therapists</a>
            <a href="/#pricing" className="nav-a" onClick={handleHashNavClick}>Pricing</a>
          </div>

          <div className="nav-r">
            {authTherapist ? (
              <Link href={authHref} className="btn btn-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {authFirstName || 'Dashboard'}
                {authTherapist.photo_url && (
                  <img
                    src={authTherapist.photo_url}
                    alt=""
                    style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
              </Link>
            ) : (
              <Link href="/signup" className="btn btn-dark">
                List your practice
              </Link>
            )}
          </div>

          <button
            className={`menu-btn ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </nav>

      <div
        className={`mobile-overlay ${menuOpen ? 'show' : ''}`}
        onClick={() => setMenuOpen(false)}
      />

      <aside
        className={`mobile-sidebar ${menuOpen ? 'show' : ''}`}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('a')) setMenuOpen(false)
        }}
      >
        <div className="sidebar-glow"></div>

        <div className="sidebar-top">
          <div className="sidebar-brand">
            <img src="/coi.png" alt={tenant.brandName} />
            <h3>{tenant.brandName}</h3>
          </div>

          <button
            className="sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close Menu"
          >
            ✕
          </button>
        </div>

        <div className="sidebar-links">
          <a href="/#templates" onClick={handleHashNavClick}>Demo</a>
          <a href="/#experience" onClick={handleHashNavClick}>Templates</a>
          <a href="/#how" onClick={handleHashNavClick}>Steps</a>
          <a href="/#therapists" onClick={handleHashNavClick}>Therapists</a>
          <a href="/#pricing" onClick={handleHashNavClick}>Pricing</a>
        </div>

        <div className="sidebar-card">
          <p>Go to your dashabord.</p>

          {authTherapist ? (
            <Link href={authHref} className="btn btn-dark" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {authFirstName || 'Dashboard'}
              {authTherapist.photo_url && (
                <img
                  src={authTherapist.photo_url}
                  alt=""
                  style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                />
              )}
            </Link>
          ) : (
            <Link href="/signup" className="btn btn-dark">
              Get Started
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}
