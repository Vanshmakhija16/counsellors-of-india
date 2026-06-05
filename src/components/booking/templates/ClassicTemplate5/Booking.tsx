'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays, slotToISO } from '../templateUtils'
import { useRazorpay } from '@/lib/useRazorpay'

interface BookingProps {
  therapist: TherapistProfile
  bookedTimes?: string[]
}

export default function Booking({ therapist, bookedTimes = [] }: BookingProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const section = sectionRef.current
    if (!section) return
    const revealAll = () =>
      section.querySelectorAll('.ct5-reveal, .ct5-reveal-left, .ct5-reveal-right')
        .forEach(el => el.classList.add('visible'))
    const rect = section.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) { revealAll(); return }
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { revealAll(); obs.disconnect() } })
    }, { threshold: 0, rootMargin: '0px 0px -5% 0px' })
    obs.observe(section)
    return () => obs.disconnect()
  }, [])

  const availableDays = useMemo(
    () => getAvailableDays(therapist.availability, therapist.sessionDuration ?? 50, 14, bookedTimes),
    [therapist.availability, therapist.sessionDuration, bookedTimes]
  )

  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [booked, setBooked] = useState(false)

  const { openRazorpay } = useRazorpay()

  const day = availableDays[selectedDayIdx]
  const slotsForDay = useMemo(() => {
    if (!day) return []
    return day.slots.map(label => ({ label, isoTime: slotToISO(label, day.dateObj) }))
  }, [day])

  async function doBooking() {
    const res = await fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        therapist_id:  therapist.id,
        client_name:   clientName,
        client_email:  clientEmail,
        client_phone:  clientPhone,
        scheduled_at:  selectedSlotIso,
        duration_mins: therapist.sessionDuration,
        service_price: therapist.fee ?? null,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Booking failed. Please try again.')
    setBooked(true)
  }

  async function handleConfirm() {
    if (!selectedSlot || !selectedSlotIso) return
    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setBookingError('Please complete all fields to continue.')
      return
    }
    setBookingError('')

    if (therapist.fee && therapist.fee > 0) {
      setBookingLoading(true)
      await openRazorpay({
        amount:      therapist.fee,
        description: `Therapy session with ${therapist.name}`,
        receipt:     `book_${therapist.id}_${Date.now()}`,
        prefill:     { name: clientName, email: clientEmail, contact: clientPhone },
        onSuccess: async (payload) => {
          const verifyRes = await fetch('/api/razorpay?action=verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          const vd = await verifyRes.json()
          if (!verifyRes.ok || !vd.verified) throw new Error('Payment verification failed.')
          await doBooking()
        },
        onFailure: (msg) => { setBookingError(msg); setBookingLoading(false) },
      })
      setBookingLoading(false)
    } else {
      try {
        setBookingLoading(true)
        await doBooking()
      } catch (e: any) {
        setBookingError(e?.message ?? 'Network error. Please try again.')
      } finally {
        setBookingLoading(false)
      }
    }
  }

  return (
    <section id="book" ref={sectionRef} className="ct5-section ct5-booking">
      <div className="ct5-container">
        <div className="ct5-booking-grid">

          {/* LEFT — Info column */}
          <div className="ct5-reveal">
            <div className="ct5-label">Book a Session</div>
            <h2 className="ct5-section-title">Begin your<br /><em>journey</em></h2>
            <p className="ct5-booking-info-text">
              Your first step doesn't have to be big, just honest. Choose a time that works for you and I'll be there, ready to listen.
            </p>

            <div className="ct5-session-card">
              <span className="ct5-session-title">Session Details</span>
              <div className="ct5-session-row">
                <span className="ct5-session-key">Duration</span>
                <span className="ct5-session-val">{therapist.sessionDuration ?? 50} minutes</span>
              </div>
              <div className="ct5-session-row">
                <span className="ct5-session-key">Investment</span>
                <span className="ct5-session-val">{therapist.fee ? `₹ ${therapist.fee.toLocaleString()}` : '—'}</span>
              </div>
              <div className="ct5-session-row">
                <span className="ct5-session-key">Format</span>
                <span className="ct5-session-val">Online · In-Person</span>
              </div>
              <div className="ct5-session-row">
                <span className="ct5-session-key">Payment</span>
                <span className="ct5-session-val">🔒 Secure via Razorpay</span>
              </div>
            </div>

            {/* <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🔒', text: 'Fully confidential always' },
                { icon: '📋', text: 'Evidence-based, personalised care' },
                { icon: '✅', text: 'RCI Licensed Psychologist' },
              ].map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 300, color: 'var(--charcoal)' }}>
                  <span style={{ fontSize: 16 }}>{t.icon}</span>{t.text}
                </div>
              ))}
            </div> */}
          </div>

          {/* RIGHT — Booking flow card */}
          <div className="ct5-booking-card ct5-reveal" style={{ transitionDelay: '0.12s' }}>
            {!mounted ? (
              <div style={{ padding: '1rem 0', opacity: 0.2 }}>
                {[55, 38, 46].map((w, i) => (
                  <div key={i} style={{ height: 8, background: 'var(--border)', marginBottom: 14, width: `${w}%`, borderRadius: 4 }} />
                ))}
              </div>
            ) : booked ? (
              <div className="ct5-booking-success">
                <div className="ct5-success-icon"><Check size={28} strokeWidth={1.5} /></div>
                <h3 className="ct5-success-title">Session Confirmed</h3>
                <p className="ct5-success-body">
                  A confirmation has been sent to{' '}
                  <strong style={{ color: 'var(--forest)' }}>{clientEmail}</strong>. I look forward to meeting you.
                </p>
              </div>
            ) : !selectedSlot ? (
              /* ── PICKER VIEW — day + time. Swaps out once a slot is chosen ── */
              <>
                {/* Step 1 */}
                <div style={{ marginBottom: '1.8rem' }}>
                  <span className="ct5-booking-step-label">Step 1 — Choose a Day</span>
                  <div className="ct5-booking-step-divider" />
                  {availableDays.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--warm-gray)', fontWeight: 300, fontStyle: 'italic' }}>No upcoming availability. Please reach out directly.</p>
                  ) : (
                    <div className="ct5-day-chips">
                      {availableDays.slice(0, 10).map((d, i) => (
                        <button key={i} className={`ct5-day-chip ${selectedDayIdx === i ? 'selected' : ''}`}
                          onClick={() => { setSelectedDayIdx(i); setSelectedSlot(null); setSelectedSlotIso(null); setClientName(''); setClientEmail(''); setClientPhone(''); setBookingError('') }}>
                          {d.label}&nbsp;{d.date}&nbsp;{d.month.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2 */}
                <div>
                  <span className="ct5-booking-step-label">Step 2 — Choose a Time</span>
                  <div className="ct5-booking-step-divider" />
                  {slotsForDay.length === 0 ? (
                    <p style={{ fontSize: 13, color: 'var(--warm-gray)', fontWeight: 300, fontStyle: 'italic' }}>No remaining slots for this day.</p>
                  ) : (
                    <div className="ct5-time-chips">
                      {slotsForDay.map(s => (
                        <button key={s.label} className={`ct5-time-chip ${selectedSlot === s.label ? 'selected' : ''}`}
                          onClick={() => { setSelectedSlot(s.label); setSelectedSlotIso(s.isoTime) }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* ── DETAILS VIEW — swapped in after a slot is picked ── */
              <div style={{ animation: 'ct5-fade-up 0.5s ease both' }}>
                {/* Back to change date/time */}
                <button
                  type="button"
                  className="ct5-booking-back"
                  onClick={() => { setSelectedSlot(null); setSelectedSlotIso(null); setClientName(''); setClientEmail(''); setClientPhone(''); setBookingError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warm-gray)', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: 0, marginBottom: '1.2rem' }}
                >
                  ← Change date or time
                </button>

                {/* Selected session summary */}
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, paddingBottom: '1.2rem', marginBottom: '1.6rem', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: 'var(--forest)' }}>
                    {day?.label} {day?.date} {day?.month?.toUpperCase()}
                  </span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--charcoal)' }}>
                    {selectedSlot} · {therapist.sessionDuration ?? 50} min
                  </span>
                </div>

                <span className="ct5-booking-step-label">Your Details</span>
                <div className="ct5-booking-step-divider" />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="ct5-input-group">
                    <label className="ct5-input-label">Full Name</label>
                    <input className="ct5-input" placeholder="Your name" value={clientName} onChange={e => setClientName(e.target.value)} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div className="ct5-input-group">
                      <label className="ct5-input-label">Email</label>
                      <input className="ct5-input" placeholder="you@email.com" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                    </div>
                    <div className="ct5-input-group">
                      <label className="ct5-input-label">Phone</label>
                      <input className="ct5-input" placeholder="+91 00000 00000" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                    </div>
                  </div>
                </div>

                {bookingError && (
                  <p style={{ color: '#b85050', fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', marginTop: '1rem' }}>⚠ {bookingError}</p>
                )}

                {therapist.fee && therapist.fee > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--warm-gray)', marginTop: '1rem', lineHeight: 1.5 }}>
                    You will be charged{' '}
                    <strong style={{ color: 'var(--forest)' }}>₹{therapist.fee.toLocaleString()}</strong>
                    {' '}via Razorpay before your booking is confirmed.
                  </p>
                )}

                <button
                  className="ct5-btn-primary ct5-btn-full"
                  style={{ marginTop: '1.5rem' }}
                  onClick={handleConfirm}
                  disabled={bookingLoading}
                >
                  {bookingLoading ? (
                    <><Loader2 size={13} className="animate-spin" /> Processing…</>
                  ) : therapist.fee && therapist.fee > 0 ? (
                    <>Pay ₹{therapist.fee.toLocaleString()} & Confirm &nbsp;→</>
                  ) : (
                    <>Confirm Session &nbsp;→</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
