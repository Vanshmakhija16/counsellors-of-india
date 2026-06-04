'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile } from './templateUtils'
import { ct2Styles } from './ClassicTemplate2/styles'
import Navbar from './ClassicTemplate2/Navbar'
import Hero from './ClassicTemplate2/Hero'
import About from './ClassicTemplate2/About'
import Services from './ClassicTemplate2/Services'
import Insights from './ClassicTemplate2/Insights'
import FAQ from './ClassicTemplate2/FAQ'
import Booking from './ClassicTemplate2/Booking'
import Footer from './ClassicTemplate2/Footer'

interface ClassicTemplate2Props {
  therapist: TherapistProfile
  bookedTimes?: string[]
  hiddenSections?: string[]
}

export default function ClassicTemplate2({ therapist, bookedTimes = [], hiddenSections = [] }: ClassicTemplate2Props) {
  const show = (id: string) => !hiddenSections.includes(id)
  const [scrolled, setScrolled] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = window.setTimeout(() => setHeroLoaded(true), 60)
    return () => window.clearTimeout(t)
  }, [])

  function scrollTo(id: string) {
    const target = document.getElementById(id)
    if (!target) return
    // Scroll only THIS document's own window — never asks a parent (e.g. the
    // live-preview iframe's host page) to scroll the iframe into view.
    const y = target.getBoundingClientRect().top + window.scrollY - 20
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <div className="ct2-root">
      <style>{ct2Styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <Navbar scrolled={scrolled} scrollTo={scrollTo} therapist={therapist} />
      {show('hero')     && <Hero therapist={therapist} heroLoaded={heroLoaded} heroRef={heroRef} />}
      {show('about')    && <About therapist={therapist} />}
      {show('services') && <Services />}
      {show('insights') && <Insights />}
      {show('booking')  && <Booking therapist={therapist} bookedTimes={bookedTimes} />}
      {show('faq')      && <FAQ />}
      {show('footer')   && <Footer therapist={therapist} />}
    </div>
  )
}
