'use client'

// ───────────────────────────────────────────────────────────────────────────
// "The Atrium" (classic7) — premium template, work-in-progress.
// Built so far: the loading ritual + hero. Remaining sections (about,
// expertise, process, testimonials, faq, booking, footer) get designed and
// slotted into the switch below in later passes — same pattern as classic6.
// ───────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { TherapistProfile } from './templateUtils'
import { ct7Styles } from './ClassicTemplate7/styles'
import Loader from './ClassicTemplate7/Loader'
import Navbar from './ClassicTemplate7/Navbar'
import Hero from './ClassicTemplate7/Hero'

interface ClassicTemplate7Props {
  therapist: TherapistProfile
  bookedTimes?: string[]
  hiddenSections?: string[]
}

export default function ClassicTemplate7({ therapist, bookedTimes = [], hiddenSections = [] }: ClassicTemplate7Props) {
  const [loaded, setLoaded] = useState(false)

  function scrollTo(id: string) {
    const target = document.getElementById(id)
    if (!target) return
    const y = target.getBoundingClientRect().top + window.scrollY - 12
    window.scrollTo({ top: y, behavior: 'smooth' })
  }

  return (
    <div className="ct7-root">
      <style>{ct7Styles}</style>
      <link
        href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,500;1,9..144,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <Loader onDone={() => setLoaded(true)} therapistName={therapist.name} />

      <Navbar therapist={therapist} scrollTo={scrollTo} />

      <div className={`ct7-stage ${loaded ? 'ct7-stage--in' : ''}`}>
        <Hero therapist={therapist} scrollTo={scrollTo} />

        {/* TODO — about, expertise, process, testimonials, faq, booking, footer */}
      </div>
    </div>
  )
}
