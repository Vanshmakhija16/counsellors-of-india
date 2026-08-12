'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Loader2, Clock, Video, ArrowLeft, CalendarCheck } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { slotToISO, type MonthDayAvailability } from '../templateUtils'
import { useBooking } from '@/lib/useBooking'
import MonthCalendar from './MonthCalendar'

interface BookingProps {
  therapist: TherapistProfile
  bookedTimes?: string[]
}

export default function Booking({ therapist, bookedTimes: initialBookedTimes = [] }: BookingProps) {
  const [mounted, setMounted] = useState(false)
  const [bookedTimes, setBookedTimes] = useState<string[]>(initialBookedTimes)
  const [slotsLoading, setSlotsLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
    if (!therapist.id) { setSlotsLoading(false); return }
    fetch(`/api/booked-slots?therapist_id=${encodeURIComponent(therapist.id)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (d?.bookedTimes) setBookedTimes(d.bookedTimes) })
      .catch(() => {})
      .finally(() => setSlotsLoading(false))
  }, [therapist.id])

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDay, setSelectedDay] = useState<MonthDayAvailability | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [bookingError, setBookingError] = useState('')
  const [booked, setBooked] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

  const { book, loading: bookingLoading } = useBooking({
    onSuccess: () => setBooked(true),
    onError: msg => {
      if (msg === 'NO_SLOTS_AVAILABLE') { setLimitReached(true); return }
      setBookingError(msg)
    },
    onSlotsRefresh: fresh => {
      setBookedTimes(fresh)
      setSelectedDay(null)
      setSelectedDate(null)
      setSelectedSlot(null)
      setSelectedSlotIso(null)
      setShowDetails(false)
    },
  })

  const slots = useMemo(
    () => (selectedDay ? selectedDay.slots.map(label => ({ label, iso: slotToISO(label, selectedDay.dateObj) })) : []),
    [selectedDay]
  )

  function handleSelectDate(day: MonthDayAvailability) {
    setSelectedDate(day.dateObj)
    setSelectedDay(day)
    setSelectedSlot(null)
    setSelectedSlotIso(null)
    setBookingError('')
  }

  function handlePickSlot(label: string, iso: string) {
    setSelectedSlot(label)
    setSelectedSlotIso(iso)
  }

  function handleBackToCalendar() {
    setShowDetails(false)
    setBookingError('')
  }

  async function handleConfirm() {
    if (!selectedSlot || !selectedSlotIso) return
    if (bookingLoading) return // guard against double-submit (e.g. rapid re-click, back-then-forward)
    if (!clientName.trim() || !clientPhone.trim()) {
      setBookingError('Please complete name and phone to continue.')
      return
    }
    const digitsOnly = clientPhone.replace(/[^0-9]/g, '')
    if (digitsOnly.length < 10) {
      setBookingError('Please enter a valid phone number (at least 10 digits).')
      return
    }
    if (clientEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      setBookingError('Please enter a valid email address.')
      return
    }
    setBookingError('')
    await book({
      therapist_id: therapist.id!,
      client_name: clientName,
      client_email: clientEmail,
      client_phone: clientPhone,
      scheduled_at: selectedSlotIso,
      duration_mins: therapist.sessionDuration ?? 50,
      service_price: typeof therapist.fee === 'number' && therapist.fee > 0 ? therapist.fee : 500,
    })
  }

  const dateLabel = selectedDay
    ? selectedDay.dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''
  const duration = therapist.sessionDuration ?? 50
  const feeLabel = therapist.fee ? `₹${therapist.fee.toLocaleString('en-IN')}` : null

  // Auto-detect the visitor's own timezone (Calendly does the same) so the
  // displayed slots are unambiguous regardless of where the client is
  // booking from relative to the therapist.
  const timezoneLabel = useMemo(() => {
    if (typeof Intl === 'undefined') return ''
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
      const offset = new Intl.DateTimeFormat('en-US', { timeZoneName: 'shortOffset', timeZone: zone })
        .formatToParts(new Date())
        .find(p => p.type === 'timeZoneName')?.value ?? ''
      return `${zone.replace(/_/g, ' ')} ${offset}`.trim()
    } catch {
      return ''
    }
  }, [])

  return (
    <section id="book" className="ct8-section ct8-section-alt">
      <div className="ct8-container">
        <div className="ct8-section-head">
          <span className="ct8-eyebrow">Book a Session</span>
          <h2 className="ct8-heading ct8-section-title">
            Begin, whenever<br /><em>you&apos;re ready</em>
          </h2>
        </div>

        {!mounted || slotsLoading ? (
          <div className="ct8-card" style={{ padding: '2rem', opacity: 0.25 }}>
            {[55, 38, 46].map((w, i) => (
              <div key={i} style={{ height: 8, background: 'var(--line)', marginBottom: 14, width: `${w}%`, borderRadius: 4 }} />
            ))}
          </div>
        ) : booked ? (
          <div className="ct8-card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: 420 }}>
            <div className="ct8-success-icon" style={{ margin: '0 auto 1rem' }}><Check size={26} strokeWidth={1.5} /></div>
            <h3 className="ct8-heading ct8-success-title">Session Confirmed</h3>
            <p className="ct8-success-body">
              A confirmation has been sent to <strong style={{ color: 'var(--accent)' }}>{clientEmail}</strong>.
            </p>
          </div>
        ) : limitReached ? (
          <div className="ct8-card" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: 420 }}>
            <h3 className="ct8-heading ct8-success-title">No slots left</h3>
            <p className="ct8-success-body">New times open soon — please check back or reach out directly.</p>
          </div>
        ) : (
          <div className={`ct8-book-card${showDetails ? ' ct8-book-card--details' : selectedDay ? ' ct8-book-card--with-times' : ''}`}>
            {/* ── Left: static event info ── */}
            <div className="ct8-book-info">
              <div className="ct8-book-brand">{therapist.name || 'Counsellors of India'}</div>
              <h3 className="ct8-book-title">{duration} Minute Session</h3>
              <div className="ct8-book-meta-row"><Clock size={15} /> {duration} min</div>
              <div className="ct8-book-meta-row"><Video size={15} /> Online · In-Person</div>
              {feeLabel && <div className="ct8-book-meta-row">{feeLabel} per session</div>}

              {selectedDay && selectedSlot && (
                <div className="ct8-book-confirm-box">
                  <CalendarCheck size={15} />
                  <span><b>{selectedSlot}</b> · {dateLabel}</span>
                </div>
              )}
            </div>

            {/* ── Calendar + times, or the details form ── */}
            {!showDetails ? (
              <>
                <div className="ct8-book-cal-col">
                  <MonthCalendar
                    availability={therapist.availability}
                    durationMin={duration}
                    bookedISO={bookedTimes}
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                  />

                  <div className="ct8-book-tz">
                    <div className="ct8-book-tz-label">Time zone</div>
                    <div className="ct8-book-tz-value">
                      <Clock size={13} />
                      <span>{timezoneLabel}</span>
                    </div>
                  </div>
                </div>

                {selectedDay && (
                  <div className="ct8-book-times-col">
                    <div className="ct8-book-times-date">{dateLabel}</div>
                    {slots.length === 0 ? (
                      <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>No available times on this day.</p>
                    ) : (
                      <div className="ct8-book-slot-list">
                        {slots.map(s => (
                          selectedSlot === s.label ? (
                            <div key={s.label} className="ct8-book-slot-row">
                              <button className="ct8-book-slot ct8-book-slot--picked" onClick={() => handlePickSlot(s.label, s.iso)}>{s.label}</button>
                              <button className="ct8-book-next" onClick={() => setShowDetails(true)}>Next</button>
                            </div>
                          ) : (
                            <button key={s.label} className="ct8-book-slot" onClick={() => handlePickSlot(s.label, s.iso)}>
                              {s.label}
                            </button>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="ct8-book-details-col">
              <div className="ct8-book-details-head">
                <button type="button" className="ct8-book-back" onClick={handleBackToCalendar} aria-label="Back">
                  <ArrowLeft size={16} />
                </button>
              </div>

                <div className="ct8-book-field">
                  <label>Full Name</label>
                  <input placeholder="Your name" value={clientName} onChange={e => setClientName(e.target.value)} />
                </div>
                <div className="ct8-book-field-row">
                  <div className="ct8-book-field">
                    <label>Email</label>
                    <input placeholder="you@email.com" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
                  </div>
                  <div className="ct8-book-field">
                    <label>Phone</label>
                    <input placeholder="+91 00000 00000" type="tel" inputMode="tel" value={clientPhone} onChange={e => setClientPhone(e.target.value)} />
                  </div>
                </div>

                {bookingError && (
                  <p style={{ color: '#c0483f', fontSize: 12, fontWeight: 500, marginTop: '0.5rem' }}>⚠ {bookingError}</p>
                )}

                {therapist.fee != null && therapist.fee > 0 && (
                  <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: '0.8rem 0 0', lineHeight: 1.5 }}>
                    You will be charged <strong style={{ color: 'var(--accent)' }}>₹{therapist.fee.toLocaleString()}</strong> before your booking is confirmed.
                  </p>
                )}

                <button className="ct8-btn-primary ct8-btn-full" style={{ marginTop: '1.4rem' }} onClick={handleConfirm} disabled={bookingLoading}>
                  {bookingLoading ? (
                    <><Loader2 size={13} className="animate-spin" /> Processing…</>
                  ) : therapist.fee != null && therapist.fee > 0 ? (
                    <>Pay ₹{therapist.fee.toLocaleString()} & Confirm</>
                  ) : (
                    <>Confirm Session</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
