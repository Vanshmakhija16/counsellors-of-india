'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile } from './templateUtils'
import { resolveCT2Content } from './templateUtils'
import { getOrderedSections } from '@/lib/template'
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
  const orderedIds = getOrderedSections('classic2', therapist.section_order, hiddenSections).map(s => s.id)
  const [scrolled, setScrolled] = useState(false)
  const [heroLoaded, setHeroLoaded] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)

  // Resolve real saved content — falls back to defaults only if never set
  const ct2 = resolveCT2Content((therapist.profile_content as any)?.classic2)

  // Map EditableService → ServiceItem shape CT2/Services expects
  const services = ct2.services.map((s, i) => ({
    code:    s.code ?? String(i + 1).padStart(2, '0'),
    title:   s.name,
    kind:    s.kind ?? '',
    desc:    s.desc,
    forWhom: s.forWhom ?? [],
  }))

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
    const y = target.getBoundingClientRect().top + window.scrollY - 20
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <div className="ct2-root">
      <style>{ct2Styles}</style>
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..900,0..100,0..1;1,9..144,300..900,0..100,0..1&family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
      <Navbar scrolled={scrolled} scrollTo={scrollTo} therapist={therapist} />
      {orderedIds.map(id => {
        switch (id) {
          case 'hero':     return <Hero     key={id} therapist={therapist} heroLoaded={heroLoaded} heroRef={heroRef} />
          case 'about':    return <About    key={id} therapist={therapist} />
          case 'services': return <Services key={id} services={services} />
          case 'insights': return <Insights key={id} insights={ct2.insights} />
          case 'booking':  return <Booking  key={id} therapist={therapist} bookedTimes={bookedTimes} />
          case 'faq':      return <FAQ      key={id} faqs={ct2.faq} />
          case 'footer':   return <Footer   key={id} therapist={therapist} />
          default: return null
        }
      })}
    </div>
  )
}
