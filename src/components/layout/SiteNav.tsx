'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import '../../app/page.css'

/**
 * The site's real top nav — same markup/classes as the homepage's own
 * <nav className="nav">, extracted here so standalone marketing pages
 * (About, Why Us, Onboarding Guide, Blog, Contact) render the identical
 * dark frosted-glass nav + mobile hamburger sidebar instead of a separate
 * lighter design.
 *
 * Nav links point to the other marketing pages (About, Why Us, Onboarding
 * Guide, Blog, Contact) rather than the homepage's in-page section anchors,
 * since visitors on these pages are navigating the site, not scrolling
 * the homepage.
 */
export default function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

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

  return (
    <>
      <nav className={`nav site-topnav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">

          <Link href="/" className="logo">
            <img src="/coi.png" alt="" className="logo-img" />
            <span className="logo-tagline">Counsellors<br />of India</span>
          </Link>

          <span className="nav-mobile-title">Counsellors of India</span>

          <div className="nav-mid">
            <Link href="/#experience" className="nav-a">Templates</Link>
            <Link href="/#templates" className="nav-a">Demo</Link>
            <Link href="/#how" className="nav-a">Steps</Link>
            <Link href="/#therapists" className="nav-a">Therapists</Link>
            <Link href="/#pricing" className="nav-a">Pricing</Link>
          </div>

          <div className="nav-r">
            <Link href="/signup" className="btn btn-dark">
              List your practice
            </Link>
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
            <img src="/coi.png" alt="Counsellors of India" />
            <h3>Counsellors of India</h3>
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
          <a href="/#templates">Demo</a>
          <a href="/#experience">Templates</a>
          <a href="/#how">Steps</a>
          <a href="/#therapists">Therapists</a>
          <a href="/#pricing">Pricing</a>
        </div>

        <div className="sidebar-card">
          <p>Grow your counselling practice online.</p>
          <Link href="/signup" className="btn btn-dark">
            Get Started
          </Link>
        </div>
      </aside>
    </>
  )
}
