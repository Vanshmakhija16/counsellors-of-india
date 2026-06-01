'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import type { TherapistProfile, EditableService } from '../templateUtils'
import { getAvailableDays, slotToISO } from '../templateUtils'
import { useRazorpay } from '@/lib/useRazorpay'

interface BookingProps {
  therapist: TherapistProfile
  bookedTimes?: string[]
  selectedService?: EditableService | null
  onClearService?: () => void
}

export default function Booking({ therapist, bookedTimes = [], selectedService, onClearService }: BookingProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const section = sectionRef.current
    if (!section) return
    const revealAll = () =>
      section.querySelectorAll('.ct4-reveal').forEach(el => el.classList.add('visible'))
    const rect = section.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) { revealAll(); return }
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) { revealAll(); observer.disconnect() } }) },
      { threshold: 0, rootMargin: '0px 0px -5% 0px' }
    )
    observer.observe(section)
    return () => observer.disconnect()
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

  const effectivePrice = selectedService?.price != null ? selectedService.price : therapist.fee

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
        service_name:  selectedService?.name ?? null,
        service_price: effectivePrice ?? null,
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

    if (effectivePrice && effectivePrice > 0) {
      setBookingLoading(true)
      await openRazorpay({
        amount:      effectivePrice,
        description: selectedService?.name
          ? `${selectedService.name} with ${therapist.name}`
          : `Therapy session with ${therapist.name}`,
        receipt: `book_${therapist.id}_${Date.now()}`,
        prefill: { name: clientName, email: clientEmail, contact: clientPhone },
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
    <section id="book" ref={sectionRef} className="ct4-section ct4-booking">
      <div className="ct4-container">
        <div className="ct4-section-header ct4-reveal">
          <div>
            <h2 className="ct4-section-title">Choose your <em>moment</em></h2>
          </div>
        </div>

        <div className="ct4-booking-grid">
          {/* LEFT: Info / Session Summary */}
          <div className="ct4-reveal">
            <div className="ct4-spec-card">
              <span className="ct4-eyebrow" style={{ display: 'block', marginBottom: '1.2rem' }}>Session Summary</span>
              <div className="ct4-rule-gold" style={{ marginBottom: '1.5rem' }} />

              {selectedService && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'rgba(212,175,55,0.08)', border: '0.5px solid var(--border-gold)',
                  borderRadius: 3, padding: '0.65rem 0.9rem', marginBottom: '1.4rem', gap: '0.75rem',
                }}>
                  <div>
                    <p style={{ fontSize: 10, color: 'var(--gold-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 3 }}>Selected Service</p>
                    <p style={{ fontSize: 13, color: 'var(--platinum)', fontWeight: 400, lineHeight: 1.4 }}>{selectedService.name}</p>
                  </div>
                  <button onClick={onClearService} title="Clear selection"
                    style={{ color: 'var(--silver)', flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                    <X size={14} />
                  </button>
                </div>
              )}

              <dl>
                <SpecRow k="Duration"     v={`${therapist.sessionDuration ?? 50} Minutes`} />
                <SpecRow k="Investment"   v={effectivePrice ? `₹ ${effectivePrice.toLocaleString()}` : '—'} highlight={selectedService?.price != null} />
                <SpecRow k="Format"       v="Online · In-Person" />
                <SpecRow k="Confirmation" v="Immediate via Whatsapp" />
                <SpecRow k="Payment"      v="🔒 Secure via Razorpay" />
              </dl>
            </div>
          </div>

          {/* RIGHT: Booking flow */}
          <div className="ct4-booking-card ct4-reveal" style={{ transitionDelay: '0.12s' }}>
            {!mounted ? (
              <div style={{ padding: '2rem 0', opacity: 0.25 }}>
                <div style={{ height: 10, background: 'var(--border)', marginBottom: 14, width: '55%', borderRadius: 2 }} />
                <div style={{ height: 10, background: 'var(--border)', marginBottom: 14, width: '38%', borderRadius: 2 }} />
              </div>
            ) : booked ? (
              <div className="ct4-booking-success">
                <div className="ct4-success-ring"><Check size={26} strokeWidth={1.5} /></div>
                <h3 className="ct4-display" style={{ fontSize: 28, color: 'var(--platinum)', margin: '0 0 0.5rem' }}>Reservation Received</h3>
                <p style={{ fontSize: 15, color: 'var(--silver)', fontWeight: 300, maxWidth: '40ch', lineHeight: 1.75 }}>
                  A confirmation has been sent to <span style={{ color: 'var(--gold)' }}>{clientEmail}</span>.
                </p>
              </div>
            ) : (
              <>
                {/* Day picker */}
                <div style={{ marginBottom: '1.8rem' }}>
                  <span className="ct4-eyebrow" style={{ display: 'block', marginBottom: '0.9rem' }}>Select a Day</span>
                  <div className="ct4-rule-gold" style={{ marginBottom: '1rem' }} />
                  {availableDays.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--silver)', fontWeight: 300, fontStyle: 'italic' }}>No availability found. Please check back later.</p>
                  ) : (
                    <div className="ct4-day-chips">
                      {availableDays.slice(0, 10).map((d, i) => (
                        <button key={i} className={`ct4-day-chip ${selectedDayIdx === i ? 'selected' : ''}`}
                          onClick={() => { setSelectedDayIdx(i); setSelectedSlot(null); setSelectedSlotIso(null); setClientName(''); setClientEmail(''); setClientPhone(''); setBookingError('') }}>
                          {d.label} {d.date} {d.month.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Time picker */}
                <div style={{ marginBottom: '1.8rem' }}>
                  <span className="ct4-eyebrow" style={{ display: 'block', marginBottom: '0.9rem' }}>Select a Time</span>
                  <div className="ct4-rule-gold" style={{ marginBottom: '1rem' }} />
                  {slotsForDay.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--silver)', fontWeight: 300, fontStyle: 'italic' }}>No remaining availability today.</p>
                  ) : (
                    <div className="ct4-time-chips">
                      {slotsForDay.map(s => (
                        <button key={s.label} className={`ct4-time-chip ${selectedSlot === s.label ? 'selected' : ''}`}
                          onClick={() => { setSelectedSlot(s.label); setSelectedSlotIso(s.isoTime) }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contact form */}
                {selectedSlot && (
                  <div style={{ borderTop: '0.5px solid var(--border)', paddingTop: '1.8rem', animation: 'ct4-fade-up 0.5s ease both' }}>
                    <span className="ct4-eyebrow" style={{ display: 'block', marginBottom: '0.9rem' }}>Your Details</span>
                    <div className="ct4-rule-gold" style={{ marginBottom: '0.5rem' }} />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <input className="ct4-input" placeholder="Full Name" value={clientName} onChange={e => setClientName(e.target.value)} />
                      </div>
                      <input className="ct4-input" placeholder="Email Address" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                      <input className="ct4-input" placeholder="Phone Number" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                    </div>

                    {bookingError && (
                      <p className="ct4-mono" style={{ color: '#e07070', fontSize: 11, letterSpacing: '0.12em', marginTop: '1rem' }}>⚠ {bookingError}</p>
                    )}

                    {effectivePrice && effectivePrice > 0 && (
                      <p style={{ fontSize: 12, color: 'var(--silver)', marginTop: '1.2rem', letterSpacing: '0.04em' }}>
                        You will be charged{' '}
                        <span style={{ color: 'var(--gold)', fontWeight: 500 }}>₹ {effectivePrice.toLocaleString()}</span>
                        {selectedService ? ` for ${selectedService.name}` : ''} via Razorpay before your booking is confirmed.
                      </p>
                    )}

                    <button
                      className="ct4-btn-primary ct4-btn-full"
                      style={{ marginTop: '1.5rem', opacity: bookingLoading ? 0.6 : 1 }}
                      onClick={handleConfirm}
                      disabled={bookingLoading}
                    >
                      {bookingLoading ? (
                        <><Loader2 size={13} className="animate-spin" /> Processing…</>
                      ) : effectivePrice && effectivePrice > 0 ? (
                        <>Pay ₹{effectivePrice.toLocaleString()} & Confirm →</>
                      ) : (
                        <>Confirm Reservation →</>
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

function SpecRow({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className="ct4-spec-row">
      <dt className="ct4-spec-key">{k}</dt>
      <dd className="ct4-spec-val" style={highlight ? { color: 'var(--gold)', fontWeight: 500 } : undefined}>{v}</dd>
    </div>
  )
}
