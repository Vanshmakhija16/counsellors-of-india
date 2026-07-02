'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays, slotToISO } from '../templateUtils'
import { useBooking } from '@/lib/useBooking'

// ── Temporary: send to WhatsApp instead of API/payment ──────────────────
const USE_WHATSAPP = true
function openWhatsApp(therapist: TherapistProfile, name: string, slot: string, date: string) {
  const num = (therapist.whatsapp ?? therapist.phone ?? '').replace(/\D/g, '')
  const msg = `Hi, I'd like to book a session.%0AName: ${encodeURIComponent(name)}%0ADate & Time: ${encodeURIComponent(date + ', ' + slot)}%0AService Duration: ${therapist.sessionDuration ?? 50} mins`
  window.open(`https://wa.me/${num}?text=${msg}`, '_blank')
}

interface BookingProps {
  therapist: TherapistProfile
  bookedTimes?: string[]
}

export default function Booking({ therapist, bookedTimes: initialBookedTimes = [] }: BookingProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [bookedTimes, setBookedTimes] = useState<string[]>(initialBookedTimes)
  const [slotsLoading, setSlotsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    if (!therapist.id) { setSlotsLoading(false); return }
    fetch(`/api/booked-slots?therapist_id=${encodeURIComponent(therapist.id)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.bookedTimes) setBookedTimes(d.bookedTimes) })
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
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
  }, [therapist.id])

  const availableDays = useMemo(
    () => getAvailableDays(therapist.availability, therapist.sessionDuration ?? 50, 14, bookedTimes),
    [therapist.availability, therapist.sessionDuration, bookedTimes]
  )

  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [selectedSlot, setSelectedSlot]       = useState<string | null>(null)
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null)
  const [clientName, setClientName]           = useState('')
  const [clientEmail, setClientEmail]         = useState('')
  const [clientPhone, setClientPhone]         = useState('')
  const [bookingError, setBookingError]       = useState('')
  const [booked, setBooked]                   = useState(false)

  const { book, loading: bookingLoading } = useBooking({
    onSuccess: () => setBooked(true),
    onError:   (msg) => setBookingError(msg),
    onSlotsRefresh: (fresh) => {
      setBookedTimes(fresh)
      setSelectedSlot(null)
      setSelectedSlotIso(null)
    },
  })

  const day = availableDays[selectedDayIdx]
  const slotsForDay = useMemo(() => {
    if (!day) return []
    return day.slots.map(label => ({ label, isoTime: slotToISO(label, day.dateObj) }))
  }, [day])

  async function handleConfirm() {
    if (!selectedSlot || !selectedSlotIso) return
    if (!clientName.trim() || !clientPhone.trim()) {
      setBookingError('Please complete name and phone to continue.')
      return
    }
    setBookingError('')
    if (USE_WHATSAPP) {
      openWhatsApp(therapist, clientName, selectedSlot, day?.fullLabel ?? '')
      setBooked(true)
      return
    }
    await book({
      therapist_id:  therapist.id!,
      client_name:   clientName,
      client_email:  clientEmail,
      client_phone:  clientPhone,
      scheduled_at:  selectedSlotIso,
      duration_mins: therapist.sessionDuration ?? 50,
      service_price: typeof therapist.fee === 'number' && therapist.fee > 0 ? therapist.fee : 500,
    })
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
                <span className="ct5-session-val">🔒 Secure via PayU</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Booking flow card */}
          <div className="ct5-booking-card ct5-reveal" style={{ transitionDelay: '0.12s' }}>
            {!mounted || slotsLoading ? (
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
              <div style={{ animation: 'ct5-fade-up 0.5s ease both' }}>
                <button
                  type="button"
                  onClick={() => { setSelectedSlot(null); setSelectedSlotIso(null); setClientName(''); setClientEmail(''); setClientPhone(''); setBookingError('') }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--warm-gray)', fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', padding: 0, marginBottom: '1.2rem' }}
                >
                  ← Change date or time
                </button>

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

                {therapist.fee != null && therapist.fee > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--warm-gray)', marginTop: '1rem', lineHeight: 1.5 }}>
                    You will be charged{' '}
                    <strong style={{ color: 'var(--forest)' }}>₹{therapist.fee.toLocaleString()}</strong>
                    {' '}via PayU before your booking is confirmed.
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
                  ) : therapist.fee != null && therapist.fee > 0 ? (
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
