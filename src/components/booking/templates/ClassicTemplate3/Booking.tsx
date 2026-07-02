'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import type { TherapistProfile, EditableService } from '../templateUtils'
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
  selectedService?: EditableService | null
  onClearService?: () => void
}

function Spec({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="ct3-spec-row">
      <dt className="ct3-spec-key">{k}</dt>
      <dd className="ct3-spec-val" style={highlight ? { color: 'var(--gold)', fontWeight: 400 } : {}}>
        {v}
      </dd>
    </div>
  )
}

export default function Booking({ therapist, bookedTimes: initialBookedTimes = [], selectedService, onClearService }: BookingProps) {
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
    function revealAll() {
      section!.querySelectorAll('.ct3-reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), i * 80)
      })
    }
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

  const effectivePrice: number | null = (() => {
    if (selectedService?.price != null) {
      const n = Number(selectedService.price)
      return isNaN(n) || n <= 0 ? 500 : n
    }
    return typeof therapist.fee === 'number' && therapist.fee > 0 ? therapist.fee : 500
  })()

  const day = availableDays[selectedDayIdx]
  const slotsForDay = useMemo(() => {
    if (!day) return []
    return day.slots
      .map(label => ({ label, isoTime: slotToISO(label, day.dateObj) }))
      .filter(s => new Date(s.isoTime).getTime() > Date.now())
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
      service_name:  selectedService?.name ?? null,
      service_price: effectivePrice,
    })
  }

  return (
    <section id="book" ref={sectionRef} className="ct3-section ct3-booking ct3-gold-rule-top">
      <div className="ct3-container">

        <div className="ct3-folio-header ct3-reveal">
          <div>
            <h2 className="ct3-folio-title" style={{ marginTop: '0.5rem' }}>
              Choose a <em>time</em>.
            </h2>
          </div>
        </div>

        <div className="ct3-booking-grid">

          {/* Left — session summary */}
          <div className="ct3-reveal">
            <div className="ct3-booking-details">
              <span className="ct3-eyebrow" style={{ display: 'block', marginBottom: '1.1rem' }}>
                Session details
              </span>

              {selectedService && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--gold-pale)', border: '1px solid var(--gold-border)',
                  padding: '10px 14px', marginBottom: '1.2rem', gap: 10,
                }}>
                  <div>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 3 }}>
                      Selected service
                    </p>
                    <p style={{ fontFamily: "'Fraunces', serif", fontSize: 14, color: 'var(--ink)', fontWeight: 300 }}>
                      {selectedService.name}
                    </p>
                  </div>
                  <button onClick={onClearService} style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--ink-3)', padding: 2, flexShrink: 0,
                  }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              <dl>
                <Spec k="Duration"     v={`${therapist.sessionDuration ?? 50} minutes`} />
                <Spec k="Format"       v="Online · In-person" />
                <Spec k="Confirmation" v="Instant via email" />
                {effectivePrice != null && effectivePrice > 0 && (
                  <Spec k="Payment" v="🔒 Secure via PayU" highlight />
                )}
              </dl>

              {effectivePrice != null && effectivePrice > 0 && selectedService && (
                <p style={{
                  marginTop: '1rem', fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6,
                }}>
                  You will be charged{' '}
                  <span style={{ color: 'var(--gold)', fontWeight: 500 }}>
                    ₹ {effectivePrice.toLocaleString()}
                  </span>{' '}
                  for {selectedService.name} via PayU before booking is confirmed.
                </p>
              )}
            </div>
          </div>

          {/* Right — booking flow */}
          <div className="ct3-booking-card ct3-reveal" style={{ transitionDelay: '0.1s' }}>

            {!mounted || slotsLoading ? (
              <div style={{ padding: '2rem 0', opacity: 0.2 }}>
                <div style={{ height: 8, background: 'var(--rule)', marginBottom: 12, width: '55%' }} />
                <div style={{ height: 8, background: 'var(--rule)', marginBottom: 12, width: '38%' }} />
                <div style={{ height: 8, background: 'var(--rule)', width: '46%' }} />
              </div>
            ) : booked ? (
              <div className="ct3-booking-success">
                <div className="ct3-success-circle">
                  <Check size={28} strokeWidth={2} />
                </div>
                <h3 className="ct3-serif" style={{ fontSize: 26, color: 'var(--ink)', margin: '0 0 0.6rem' }}>
                  Reservation received.
                </h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--ink-2)', fontWeight: 300, maxWidth: '42ch', lineHeight: 1.7 }}>
                  A confirmation has been sent to <strong style={{ color: 'var(--gold)' }}>{clientEmail}</strong>. I look forward to meeting you.
                </p>
              </div>
            ) : (
              <>
                {/* Day picker */}
                <div style={{ marginBottom: '1.8rem' }}>
                  <span className="ct3-eyebrow" style={{ display: 'block', marginBottom: '0.9rem' }}>Select a day</span>
                  <div style={{ height: 1, background: 'var(--rule)', marginBottom: '1rem' }} />
                  {availableDays.length === 0 ? (
                    <p className="ct3-serif" style={{ fontSize: 14, color: 'var(--ink-3)' }}>
                      No availability found. Contact directly to schedule.
                    </p>
                  ) : (
                    <div className="ct3-chips">
                      {availableDays.slice(0, 10).map((d, i) => (
                        <button
                          key={i}
                          className={`ct3-chip ${selectedDayIdx === i ? 'selected' : ''}`}
                          onClick={() => { setSelectedDayIdx(i); setSelectedSlot(null); setSelectedSlotIso(null) }}
                        >
                          {d.label} {d.date} {d.month.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Time picker */}
                <div style={{ marginBottom: '1.8rem' }}>
                  <span className="ct3-eyebrow" style={{ display: 'block', marginBottom: '0.9rem' }}>Select a time</span>
                  <div style={{ height: 1, background: 'var(--rule)', marginBottom: '1rem' }} />
                  {slotsForDay.length === 0 ? (
                    <p className="ct3-serif" style={{ fontSize: 14, color: 'var(--ink-3)', fontStyle: 'italic' }}>
                      No remaining slots today. Please choose another day.
                    </p>
                  ) : (
                    <div className="ct3-chips">
                      {slotsForDay.map(s => (
                        <button
                          key={s.label}
                          className={`ct3-chip ${selectedSlot === s.label ? 'selected' : ''}`}
                          onClick={() => { setSelectedSlot(s.label); setSelectedSlotIso(s.isoTime) }}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contact form */}
                {selectedSlot && (
                  <div style={{
                    borderTop: '1px solid var(--rule)', paddingTop: '1.8rem',
                    animation: 'ct3-fade-up-anim 0.45s ease both',
                  }}>
                    <span className="ct3-eyebrow" style={{ display: 'block', marginBottom: '0.9rem' }}>Your details</span>
                    <div style={{ height: 1, background: 'var(--rule)', marginBottom: '0.5rem' }} />
                    <div className="ct3-form-grid" style={{ display: 'grid', gap: '0 1.5rem' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <input className="ct3-input" placeholder="Full name"
                          value={clientName} onChange={e => setClientName(e.target.value)} />
                      </div>
                      <input className="ct3-input" type="email" placeholder="Email address"
                        value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                      <input className="ct3-input" placeholder="Phone number"
                        value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                    </div>

                    {bookingError && (
                      <p style={{ fontFamily: "'DM Mono', monospace", color: '#9b3333', fontSize: 11, letterSpacing: '0.12em', marginTop: '1rem' }}>
                        ⚠ {bookingError}
                      </p>
                    )}

                    <button
                      className="ct3-btn-primary ct3-btn-full"
                      style={{ marginTop: '1.5rem', opacity: bookingLoading ? 0.65 : 1 }}
                      onClick={handleConfirm}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <><Loader2 size={13} className="animate-spin" /> Processing…</>
                      ) : effectivePrice != null && effectivePrice > 0 ? (
                        <>Pay ₹{effectivePrice.toLocaleString()} & Confirm →</>
                      ) : (
                        <>Confirm reservation →</>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
