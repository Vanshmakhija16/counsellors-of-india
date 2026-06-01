'use client'

import { useEffect, useRef, useState } from 'react'
import type { TherapistProfile } from './templateUtils'
import { ct5Styles } from './ClassicTemplate5/styles'
import Navbar from './ClassicTemplate5/Navbar'
import Hero from './ClassicTemplate5/Hero'
import Ticker from './ClassicTemplate5/Ticker'
import About from './ClassicTemplate5/About'
import Services from './ClassicTemplate5/Services'
import Insights from './ClassicTemplate5/Insights'
import FAQ from './ClassicTemplate5/FAQ'
import Booking from './ClassicTemplate5/Booking'
import Footer from './ClassicTemplate5/Footer'

interface ClassicTemplate5Props {
  therapist: TherapistProfile
  bookedTimes?: string[]
  hiddenSections?: string[]
}

export default function ClassicTemplate5({ therapist, bookedTimes = [], hiddenSections = [] }: ClassicTemplate5Props) {
  const show = (id: string) => !hiddenSections.includes(id)
  const [loaded, setLoaded] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 80)
    return () => window.clearTimeout(t)
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="ct5">
      <style>{ct5Styles}</style>
      <Navbar scrollTo={scrollTo} therapist={therapist} />
      <main>
        {show('hero')     && <Hero therapist={therapist} loaded={loaded} heroRef={heroRef} />}
        {show('ticker')   && <Ticker />}
        {show('about')    && <About therapist={therapist} />}
        {show('services') && <Services therapist={therapist} />}
        {show('insights') && <Insights therapist={therapist} />}
        {show('faq')      && <FAQ />}
        {show('booking')  && <Booking therapist={therapist} bookedTimes={bookedTimes} />}
        {show('footer')   && <Footer therapist={therapist} />}
      </main>
    </div>
  )
}
