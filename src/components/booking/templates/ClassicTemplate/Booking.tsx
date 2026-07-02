'use client'

import { useEffect, useMemo, useState } from 'react'
import { Clock, Video, Shield, ArrowLeft, Calendar, X } from 'lucide-react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays, slotToISO } from '../templateUtils'
import type { ServiceItem } from './Services'
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
  selectedService?: ServiceItem | null
  onClearService?: () => void
}

export default function Booking({ therapist, bookedTimes: initialBookedTimes = [], selectedService, onClearService }: BookingProps) {
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
  }, [therapist.id])

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
  const [booked, setBooked] = useState(false)

  const { book, loading: bookingLoading } = useBooking({
    onSuccess: () => setBooked(true),
    onError:   (msg) => setBookingError(msg),
    onSlotsRefresh: (fresh) => {
      setBookedTimes(fresh)
      // Clear the selected slot — it just got taken
      setSelectedSlot(null)
      setSelectedSlotIso(null)
    },
  })

  if (!mounted) return null
  if (slotsLoading) return (
    <section id="contact" className="relative bg-[#f5ecd6]" style={{ borderTop: '3px solid #b46b50' }}>
      <div className="mx-auto max-w-[1180px] px-6 py-24 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#b46b50] border-t-transparent" />
      </div>
    </section>
  )

  const day = availableDays[selectedDayIdx]
  const slotsForDay = availableDays[selectedDayIdx]?.slots
    .map(label => ({ label, isoTime: slotToISO(label, day.dateObj) })) ?? []

  const effectivePrice: number | null =
    selectedService?.price != null
      ? (typeof selectedService.price === 'number' ? selectedService.price : null)
      : typeof therapist.fee === 'number' && therapist.fee > 0 ? therapist.fee : 500

  async function handleConfirmBooking() {
    if (!selectedSlot || !selectedSlotIso) return
    if (!clientName.trim() || !clientPhone.trim()) {
      setBookingError('Please enter your name and phone number.')
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
      duration_mins: therapist.sessionDuration,
      service_name:  selectedService?.title ?? null,
      service_price: effectivePrice,
    })
  }

  if (availableDays.length === 0) {
    return (
      <section id="contact" className="relative bg-[#f5ecd6]" style={{ borderTop: '3px solid #b46b50' }}>
        <div className="mx-auto max-w-[1180px] px-6 py-24 text-center lg:px-12">
          <p className="text-[11px] font-medium uppercase tracking-[0.30em] text-[#6b6056]">06 — Book A Session</p>
          <h2 className="mt-6 text-[40px] leading-[1.05] tracking-[-0.03em] text-[#1a1a18] lg:text-[56px]" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
            Currently fully booked.
          </h2>
          <p className="mx-auto mt-6 max-w-[420px] text-[14.5px] leading-[1.85] text-[#6b6056]">
            New session times open weekly. Please reach out by email and we'll share the next opening.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="contact" className="relative bg-[#f5ecd6]" style={{ borderTop: '3px solid #b46b50' }}>
      <div className="pointer-events-none absolute -left-32 -bottom-32 h-[400px] w-[400px] rounded-full bg-[#b46b50]/40 blur-[90px]" />
      <div className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-[#b46b50]/30 blur-[80px]" />

      <div className="relative z-10 mx-auto max-w-[1180px] px-4 pt-20 pb-32 sm:px-6 lg:px-12 lg:pt-24 lg:pb-44">
        <div className="mb-10 flex items-center gap-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.30em] text-[#6b6056]"> Book A Session</p>
        </div>

        <div className="grid overflow-hidden rounded-[24px] border border-[#b46b50]/60 bg-[#f5ecd6] shadow-2xl shadow-[#1a1a18]/15 lg:grid-cols-[1fr_1.1fr]" style={{ minWidth: 0 }}>

          {/* LEFT — info */}
          <div className="flex min-w-0 flex-col justify-between p-5 sm:p-8 lg:p-12">
            <div>
              <h2
                className="text-[34px] font-normal leading-[1] tracking-[-0.03em] text-[#1a1a18] sm:text-[40px] lg:text-[56px]"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                Begin your<br />
                <em className="text-[#6b6056]">healing</em> journey.
              </h2>
              <p className="mt-6 max-w-[300px] text-[14.5px] leading-[1.8] text-[#6b6056]">
                Select a date and time that feels comfortable.
              </p>

              {selectedService && (
                <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#b46b50]/50 bg-[#efe7d6] px-4 py-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#b46b50]">Selected Service</p>
                    <p className="mt-0.5 text-[14px] font-semibold text-[#1a1a18]" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                      {selectedService.title}
                    </p>
                    {effectivePrice != null && effectivePrice > 0 && (
                      <p className="mt-0.5 text-[13px] text-[#6b6056]">
                        ₹{effectivePrice.toLocaleString('en-IN')} / session
                      </p>
                    )}
                  </div>
                  <button
                    onClick={onClearService}
                    className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#b46b50]/40 text-[#6b6056] transition hover:bg-[#b46b50] hover:text-white"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-4 lg:mt-0">
              {[
                { Icon: Video,  label: 'Online via Google Meet / Zoom' },
                { Icon: Clock,  label: `${therapist.sessionDuration} minute sessions` },
                { Icon: Shield, label: 'Private & confidential' },
              ].map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#b46b50] bg-[#efe7d6]">
                    <Icon size={15} className="text-[#6b6056]" />
                  </div>
                  <p className="text-[13.5px] font-medium text-[#6b6056]">{label}</p>
                </div>
              ))}
              {effectivePrice != null && effectivePrice > 0 && (
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#b46b50]/30 bg-[#efe7d6] px-4 py-2.5">
                  <span className="text-[18px]">🔒</span>
                  <p className="text-[12px] text-[#6b6056]">Secure payment via PayU before booking is confirmed</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — booking flow */}
          <div className="flex min-w-0 flex-col justify-center border-t border-[#b46b50]/40 bg-[#efe7d6] p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-12">

            {booked ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#b46b50] text-white text-lg">✓</div>
                <h3 className="text-[26px] leading-tight text-[#1a1a18]" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                  Session requested
                </h3>
                <p className="mt-2 text-[13px] text-[#6b6056]">{day?.fullLabel} · {selectedSlot}</p>
                <p className="mt-3 text-[12px] text-[#6b6056]">
                  Confirmation sent to{' '}
                  <span className="font-semibold text-[#1a1a18]">{clientEmail}</span>
                </p>
              </div>

            ) : !selectedSlot ? (
              <>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6b6056]">Select Date</p>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {availableDays.slice(0, 7).map((d, i) => (
                    <button
                      key={d.dateObj.toISOString()}
                      onClick={() => { setSelectedDayIdx(i); setSelectedSlot(null); setSelectedSlotIso(null) }}
                      className={[
                        'flex min-w-[64px] flex-col items-center rounded-xl border py-3.5 transition-all duration-250',
                        selectedDayIdx === i
                          ? 'border-[#b46b50] bg-[#b46b50] text-white shadow-md'
                          : 'border-[#b46b50] bg-[#f5ecd6] text-[#6b6056]',
                      ].join(' ')}
                    >
                      <span className="text-[8.5px] font-bold uppercase tracking-[0.16em]">{d.label.slice(0, 3)}</span>
                      <span className="mt-1 text-[24px] leading-none" style={{ fontFamily: 'var(--font-fraunces), serif' }}>{d.date}</span>
                      <span className="mt-0.5 text-[8px] uppercase tracking-[0.12em]">{d.month}</span>
                    </button>
                  ))}
                </div>

                <p className="mb-3 mt-8 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6b6056]">Select Time</p>
                {slotsForDay.length === 0 ? (
                  <p className="rounded-xl border border-[#b46b50]/50 bg-[#f5ecd6] px-4 py-3 text-[12.5px] text-[#6b6056]">
                    All slots booked for this day.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-3 sm:grid-cols-4">
                    {slotsForDay.map(slot => (
                      <button
                        key={slot.isoTime}
                        onClick={() => { setSelectedSlot(slot.label); setSelectedSlotIso(slot.isoTime) }}
                        className="rounded-full border border-[#b46b50] bg-[#f5ecd6] px-1 py-2.5 text-center text-[11.5px] font-medium whitespace-nowrap text-[#6b6056] transition-all duration-200 hover:bg-[#b46b50] hover:text-white hover:shadow-sm"
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                )}

                <button disabled className="mt-7 flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-xl bg-[#b46b50]/70 py-4 text-[11px] font-bold uppercase tracking-[0.28em] text-[#f5ecd6]/80">
                  Select a Time Slot
                </button>
              </>

            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setSelectedSlot(null); setSelectedSlotIso(null); setClientName(''); setClientEmail(''); setClientPhone(''); setBookingError('') }}
                  className="mb-5 inline-flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.22em] text-[#6b6056] transition hover:text-[#1a1a18]"
                >
                  <ArrowLeft size={12} /> Change date or time
                </button>

                <div className="rounded-2xl border border-[#b46b50] bg-[#f5ecd6] px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6b6056]">Selected session</p>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#b46b50] text-white">
                      <Calendar size={14} />
                    </span>
                    <div>
                      <p className="text-[16px] leading-tight text-[#1a1a18]" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                        {day?.fullLabel}
                      </p>
                      <p className="text-[12.5px] font-medium text-[#6b6056]">
                        {selectedSlot} · {therapist.sessionDuration} min
                      </p>
                    </div>
                  </div>

                  {effectivePrice != null && effectivePrice > 0 && (
                    <div className="mt-3 flex items-center justify-between border-t border-[#e8dfc8] pt-3">
                      <span className="text-[12px] text-[#6b6056]">
                        {selectedService ? selectedService.title : 'Session fee'}
                      </span>
                      <span className="text-[15px] font-semibold text-[#1a1a18]" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
                        ₹{effectivePrice.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mb-3 mt-7 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6b6056]">Your Details</p>
                <div className="space-y-3">
                  <input type="text" placeholder="Full name" value={clientName}
                    onChange={e => setClientName(e.target.value)} autoComplete="name"
                    className="h-11 w-full rounded-full border border-[#b46b50] bg-[#f5ecd6] px-5 text-[13px] text-[#1a1a18] placeholder-[#6b6056]/70 outline-none transition focus:border-[#1a1a18] focus:bg-white"
                  />
                  <input type="email" placeholder="Email address" value={clientEmail}
                    onChange={e => setClientEmail(e.target.value)} autoComplete="email"
                    className="h-11 w-full rounded-full border border-[#b46b50] bg-[#f5ecd6] px-5 text-[13px] text-[#1a1a18] placeholder-[#6b6056]/70 outline-none transition focus:border-[#1a1a18] focus:bg-white"
                  />
                  <input type="tel" placeholder="Phone number" value={clientPhone}
                    onChange={e => setClientPhone(e.target.value)} autoComplete="tel"
                    className="h-11 w-full rounded-full border border-[#b46b50] bg-[#f5ecd6] px-5 text-[13px] text-[#1a1a18] placeholder-[#6b6056]/70 outline-none transition focus:border-[#1a1a18] focus:bg-white"
                  />
                  {bookingError && <p className="text-[12px] text-red-600">{bookingError}</p>}
                </div>

                <button
                  disabled={bookingLoading}
                  onClick={handleConfirmBooking}
                  className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#1a1a18] py-4 text-[11px] font-bold uppercase tracking-[0.28em] text-[#f5ecd6] transition hover:bg-[#b46b50] disabled:opacity-60"
                >
                  {bookingLoading
                    ? 'Processing…'
                    : effectivePrice != null && effectivePrice > 0
                      ? `Pay ₹${effectivePrice.toLocaleString('en-IN')} & Book`
                      : 'Confirm Booking'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
