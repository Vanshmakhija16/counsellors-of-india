'use client'

import { useEffect, useMemo, useState } from 'react'
import { Clock, Video, Shield } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays, slotToISO } from '../templateUtils'

interface BookingProps {
  therapist: TherapistProfile
  bookedTimes?: string[]
}

export default function Booking({
  therapist,
  bookedTimes = [],
}: BookingProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const availableDays = useMemo(
    () =>
      getAvailableDays(
        therapist.availability,
        therapist.sessionDuration,
        14
      ),
    [therapist.availability, therapist.sessionDuration]
  )

  // Normalize booked slots
  const bookedSet = useMemo(
    () =>
      new Set(
        bookedTimes.map((time) =>
          new Date(time).toISOString()
        )
      ),
    [bookedTimes]
  )

  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedSlotIso, setSelectedSlotIso] =
    useState<string | null>(null)

  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPhone, setClientPhone] = useState('')

  const [bookingError, setBookingError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  const [booked, setBooked] = useState(false)

  // Prevent hydration mismatch

  const day = availableDays[selectedDayIdx]

  // Filter slots
  const slotsForDay = useMemo(() => {
    if (!day) return []

    return day.slots
      .map((label) => ({
        label,
        isoTime: slotToISO(label, day.dateObj),
      }))
      .filter(
        (s) =>
          !bookedSet.has(
            new Date(s.isoTime).toISOString()
          )
      )
      .filter(
        (s) =>
          new Date(s.isoTime).getTime() >
          Date.now()
      )
  }, [day, bookedSet])
    if (!mounted) return null


  async function handleConfirmBooking() {
    if (!selectedSlot || !selectedSlotIso) return

    if (!clientName.trim() || !clientEmail.trim()) {
      setBookingError(
        'Please enter your name and email'
      )
      return
    }

    try {
      setBookingLoading(true)
      setBookingError('')

      const res = await fetch('/api/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          therapist_id: therapist.id,
          client_name: clientName,
          client_email: clientEmail,
          client_phone: clientPhone,
          scheduled_at: selectedSlotIso,
          duration_mins:
            therapist.sessionDuration,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setBookingError(
          data.error ??
            'Booking failed. Please try again.'
        )
        return
      }

      setBooked(true)

      const therapistWa =
        data?.whatsapp?.therapist

      if (therapistWa) {
        window.open(
          therapistWa,
          '_blank',
          'noopener,noreferrer'
        )
      }
    } catch (error) {
      console.error(error)

      setBookingError(
        'Something went wrong. Please try again.'
      )
    } finally {
      setBookingLoading(false)
    }
  }

  if (availableDays.length === 0) {
    return (
      <section
        id="contact"
        className="relative bg-[#efe7d6]"
      >
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.30em] text-[#6b6056]">
            06 — Book A Session
          </p>

          <h2
            className="mt-6 text-[40px] leading-[1.05] tracking-[-0.03em] text-[#1a1a18] lg:text-[56px]"
            style={{
              fontFamily:
                'var(--font-fraunces), serif',
            }}
          >
            Currently fully booked.
          </h2>

          <p className="mx-auto mt-6 max-w-[420px] text-[14.5px] leading-[1.85] text-[#6b6056]">
            New session times open weekly.
            Please reach out by email and
            we'll share the next opening.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      id="contact"
      className="relative bg-[#efe7d6]"
    >
      <div className="pointer-events-none absolute -left-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-[#b46b50]/40 blur-[90px]" />

      <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-[#b46b50]/30 blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-[1180px] px-6 pt-20 pb-32 lg:px-12 lg:pt-24 lg:pb-44">
        <div className="mb-10 flex items-center gap-3">
          <span className="block h-px w-7 bg-[#b46b50]" />

          <p className="text-[11px] font-medium uppercase tracking-[0.30em] text-[#6b6056]">
            06 — Book A Session
          </p>
        </div>

        <div className="grid overflow-hidden rounded-[24px] border border-[#b46b50]/60 bg-[#f5ecd6] shadow-2xl shadow-[#1a1a18]/15 lg:grid-cols-[1fr_1.1fr]">

          {/* LEFT */}
          <div className="flex flex-col justify-between p-8 lg:p-12">
            <div>
              <h2
                className="text-[40px] font-normal leading-[1] tracking-[-0.03em] text-[#1a1a18] lg:text-[56px]"
                style={{
                  fontFamily:
                    'var(--font-fraunces), serif',
                }}
              >
                Begin your
                <br />
                <em className="text-[#6b6056]">
                  healing
                </em>{' '}
                journey.
              </h2>

              <p className="mt-6 max-w-[300px] text-[14.5px] leading-[1.8] text-[#6b6056]">
                Select a date and time that
                feels comfortable.
              </p>
            </div>

            <div className="mt-10 space-y-4 lg:mt-0">
              {[
                {
                  Icon: Video,
                  label:
                    'Online via Google Meet / Zoom',
                },
                {
                  Icon: Clock,
                  label: `${therapist.sessionDuration} minute sessions`,
                },
                {
                  Icon: Shield,
                  label: 'Private & confidential',
                },
              ].map(({ Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[#b46b50] bg-[#efe7d6]">
                    <Icon
                      size={15}
                      className="text-[#6b6056]"
                    />
                  </div>

                  <p className="text-[13.5px] font-medium text-[#6b6056]">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col justify-center border-l border-[#b46b50]/40 bg-[#efe7d6] p-8 lg:p-12">

            {booked ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#b46b50] text-white">
                  ✓
                </div>

                <h3
                  className="text-[26px] leading-tight text-[#1a1a18]"
                  style={{
                    fontFamily:
                      'var(--font-fraunces), serif',
                  }}
                >
                  Session requested
                </h3>

                <p className="mt-2 text-[13px] text-[#6b6056]">
                  {day?.fullLabel} ·{' '}
                  {selectedSlot}
                </p>

                <p className="mt-3 text-[12px] text-[#6b6056]">
                  Confirmation email sent to{' '}
                  <span className="font-semibold text-[#1a1a18]">
                    {clientEmail}
                  </span>
                </p>
              </div>
            ) : (
              <>
                {/* DATE */}
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6b6056]">
                  Select Date
                </p>

                <div className="flex gap-2 overflow-x-auto pb-1">
                  {availableDays
                    .slice(0, 7)
                    .map((d, i) => (
                      <button
                        key={
                          d.dateObj.toISOString()
                        }
                        onClick={() => {
                          setSelectedDayIdx(i)
                          setSelectedSlot(null)
                          setSelectedSlotIso(
                            null
                          )
                        }}
                        className={[
                          'flex min-w-[64px] flex-col items-center rounded-xl border py-3.5 transition-all duration-250',
                          selectedDayIdx === i
                            ? 'border-[#b46b50] bg-[#b46b50] text-white shadow-md'
                            : 'border-[#b46b50] bg-[#f5ecd6] text-[#6b6056]',
                        ].join(' ')}
                      >
                        <span className="text-[8.5px] font-bold uppercase tracking-[0.16em]">
                          {d.label.slice(0, 3)}
                        </span>

                        <span
                          className="mt-1 text-[24px] leading-none"
                          style={{
                            fontFamily:
                              'var(--font-fraunces), serif',
                          }}
                        >
                          {d.date}
                        </span>

                        <span className="mt-0.5 text-[8px] uppercase tracking-[0.12em]">
                          {d.month}
                        </span>
                      </button>
                    ))}
                </div>

                {/* TIME */}
                <p className="mb-3 mt-8 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6b6056]">
                  Select Time
                </p>

                {slotsForDay.length === 0 ? (
                  <p className="rounded-xl border border-[#b46b50]/50 bg-[#f5ecd6] px-4 py-3 text-[12.5px] text-[#6b6056]">
                    All slots booked for this
                    day.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {slotsForDay.map((slot) => (
                      <button
                        key={slot.isoTime}
                        onClick={() => {
                          setSelectedSlot(
                            slot.label
                          )
                          setSelectedSlotIso(
                            slot.isoTime
                          )
                        }}
                        className={[
                          'rounded-full border py-2.5 text-[11.5px] font-medium transition-all duration-200',
                          selectedSlot ===
                          slot.label
                            ? 'border-[#b46b50] bg-[#b46b50] text-white shadow-sm'
                            : 'border-[#b46b50] bg-[#f5ecd6] text-[#6b6056]',
                        ].join(' ')}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* FORM */}
                {selectedSlot && (
                  <div className="mt-6 space-y-3">
                    <input
                      type="text"
                      placeholder="Full Name *"
                      value={clientName}
                      onChange={(e) =>
                        setClientName(
                          e.target.value
                        )
                      }
                      className="h-11 w-full rounded-full border border-[#b46b50] bg-[#f5ecd6] px-5"
                    />

                    <input
                      type="email"
                      placeholder="Email Address *"
                      value={clientEmail}
                      onChange={(e) =>
                        setClientEmail(
                          e.target.value
                        )
                      }
                      className="h-11 w-full rounded-full border border-[#b46b50] bg-[#f5ecd6] px-5"
                    />

                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={clientPhone}
                      onChange={(e) =>
                        setClientPhone(
                          e.target.value
                        )
                      }
                      className="h-11 w-full rounded-full border border-[#b46b50] bg-[#f5ecd6] px-5"
                    />

                    {bookingError && (
                      <p className="text-[12px] text-red-600">
                        {bookingError}
                      </p>
                    )}
                  </div>
                )}

                <button
                  disabled={
                    !selectedSlot ||
                    bookingLoading
                  }
                  onClick={
                    handleConfirmBooking
                  }
                  className={[
                    'mt-7 flex w-full items-center justify-center gap-2.5 rounded-xl py-4 text-[11px] font-bold uppercase tracking-[0.28em]',
                    selectedSlot
                      ? 'bg-[#1a1a18] text-[#f5ecd6]'
                      : 'bg-[#b46b50] text-[#6b6056]',
                  ].join(' ')}
                >
                  {bookingLoading
                    ? 'Confirming...'
                    : selectedSlot
                    ? therapist.fee
                      ? `Confirm — ₹${therapist.fee.toLocaleString(
                          'en-IN'
                        )}`
                      : `Confirm — ${selectedSlot}`
                    : 'Select a Time Slot'}
                </button>

                <p className="mt-3 text-center text-[10.5px] text-[#6b6056]">
                  Free cancellation · 24h
                  before session
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
