'use client'

import { useEffect, useMemo, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays, slotToISO } from '../templateUtils'
import { Check, Loader2 } from 'lucide-react'
import { useRazorpay } from '@/lib/useRazorpay'

interface BookingProps {
  therapist: TherapistProfile
  bookedTimes?: string[]
}

export default function Booking({ therapist, bookedTimes = [] }: BookingProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const availableDays = useMemo(
    () => getAvailableDays(therapist.availability, therapist.sessionDuration, 14, bookedTimes),
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
    return day.slots.map((label) => ({ label, isoTime: slotToISO(label, day.dateObj) }))
  }, [day])

  if (!mounted) return null

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
      setBookingError('Please complete name, email, and phone.')
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
    <section
      id="book"
      className="px-6 lg:px-10 py-28 lg:py-36"
      style={{ background: 'var(--ink-0)' }}
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-14 lg:gap-20">
          {/* Left — pitch */}
          <div>
            <span className="ct2-eyebrow">— Reserve</span>
            <h2
              className="ct2-serif mt-6"
              style={{ fontSize: 'clamp(38px, 5vw, 64px)', lineHeight: 1.05, color: 'var(--bone)' }}
            >
              Choose a <em style={{ color: 'var(--gold)' }}>time</em>, leave the rest with me.
            </h2>
            <p style={{ color: 'var(--mute)', marginTop: 24, lineHeight: 1.7, maxWidth: '42ch' }}>
              All first sessions are 50 minutes. You will receive a confirmation email within a few minutes; the meeting
              link follows separately the day before.
            </p>

            <div className="mt-12 ct2-card p-6" style={{ background: 'var(--ink-1)' }}>
              <div className="ct2-eyebrow mb-4">Session details</div>
              <ul className="space-y-3 text-sm" style={{ color: 'var(--bone)' }}>
                <li className="flex items-center justify-between">
                  <span style={{ color: 'var(--mute)' }}>Duration</span>
                  <span className="ct2-mono">{therapist.sessionDuration ?? 50} min</span>
                </li>
                <li className="flex items-center justify-between">
                  <span style={{ color: 'var(--mute)' }}>Fee</span>
                  <span className="ct2-mono">₹ {therapist.fee?.toLocaleString() ?? '—'}</span>
                </li>
                <li className="flex items-center justify-between">
                  <span style={{ color: 'var(--mute)' }}>Format</span>
                  <span className="ct2-mono">Online / in-person</span>
                </li>
                <li className="flex items-center justify-between">
                  <span style={{ color: 'var(--mute)' }}>Cancellation</span>
                  <span className="ct2-mono">48 hrs free</span>
                </li>
                <li className="flex items-center justify-between">
                  <span style={{ color: 'var(--mute)' }}>Payment</span>
                  <span className="ct2-mono" style={{ color: 'var(--gold)' }}>🔒 Razorpay</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right — booking flow */}
          <div className="ct2-card p-7 lg:p-10" style={{ background: 'var(--ink-1)' }}>
            {booked ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', background: 'var(--gold)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: '#1a1410', marginBottom: 20,
                }}>
                  <Check size={28} strokeWidth={2.5} />
                </div>
                <h3 className="ct2-serif text-2xl" style={{ color: 'var(--bone)' }}>
                  Reservation received.
                </h3>
                <p className="mt-3" style={{ color: 'var(--mute)', maxWidth: '40ch' }}>
                  A confirmation has been sent to {clientEmail}. I look forward to meeting you.
                </p>
              </div>
            ) : (
              <>
                {/* Day picker */}
                <div className="mb-7">
                  <div className="ct2-eyebrow mb-4">Day</div>
                  <div className="flex flex-wrap gap-2">
                    {availableDays.slice(0, 10).map((d, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedDayIdx(i); setSelectedSlot(null); setSelectedSlotIso(null); setClientName(''); setClientEmail(''); setClientPhone(''); setBookingError('') }}
                        className={`ct2-chip ${selectedDayIdx === i ? 'selected' : ''}`}
                      >
                        {d.label.toUpperCase()} {d.date} {d.month.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slot picker */}
                <div className="mb-7">
                  <div className="ct2-eyebrow mb-4">Time</div>
                  {slotsForDay.length === 0 ? (
                    <p style={{ color: 'var(--mute)', fontSize: 14 }}>No remaining slots on this day. Try another.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {slotsForDay.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => { setSelectedSlot(s.label); setSelectedSlotIso(s.isoTime) }}
                          className={`ct2-chip ${selectedSlot === s.label ? 'selected' : ''}`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form */}
                {selectedSlot && (
                  <div className="ct2-rise pt-4" style={{ borderTop: '1px solid var(--ink-3)' }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-4">
                      <div className="sm:col-span-2">
                        <input className="ct2-input" placeholder="Full name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                      </div>
                      <input className="ct2-input" placeholder="Email address" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
                      <input className="ct2-input" placeholder="Phone (with country code)" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} />
                    </div>

                    {bookingError && (
                      <p className="ct2-mono mt-5" style={{ color: 'var(--rose)', fontSize: 12 }}>⚠ {bookingError}</p>
                    )}

                    <button
                      onClick={handleConfirm}
                      disabled={bookingLoading}
                      className="ct2-btn-primary mt-8 w-full justify-center"
                      style={{ opacity: bookingLoading ? 0.7 : 1 }}
                    >
                      {bookingLoading ? (
                        <><Loader2 size={16} className="animate-spin" /> Processing…</>
                      ) : therapist.fee && therapist.fee > 0 ? (
                        <>Pay ₹{therapist.fee.toLocaleString()} & Reserve →</>
                      ) : (
                        <>Reserve this slot →</>
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
