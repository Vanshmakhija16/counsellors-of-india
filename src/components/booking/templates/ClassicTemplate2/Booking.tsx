'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { slotToISO, type MonthDayAvailability } from '../templateUtils'
import { Check, Loader2, Sun, Sunset, Moon } from 'lucide-react'
import { useBooking } from '@/lib/useBooking'
import MonthCalendar from './MonthCalendar'

interface BookingProps {
  therapist: TherapistProfile
  bookedTimes?: string[]
  bookingLimitReached?: boolean
}

function groupSlotsByPeriod(slots: { label: string; iso: string }[]) {
  const morning: typeof slots = []
  const afternoon: typeof slots = []
  const evening: typeof slots = []
  for (const s of slots) {
    const hour = new Date(s.iso).getHours()
    if (hour < 12) morning.push(s)
    else if (hour < 17) afternoon.push(s)
    else evening.push(s)
  }
  return [
    { key: 'morning',   label: 'Morning',   Icon: Sun,    slots: morning   },
    { key: 'afternoon', label: 'Afternoon', Icon: Sunset, slots: afternoon },
    { key: 'evening',   label: 'Evening',   Icon: Moon,   slots: evening   },
  ].filter(g => g.slots.length > 0)
}

// Booking flow ported over from ClassicTemplate7's Atrium "Ceremony" layout:
// a full-width header (step counter / title / fee+duration meta / progress
// dots), then a single row that reads left to right like a ledger being
// filled in — the hanging wall calendar always anchors the left, and each
// decision (a time, then your details) opens up as its own framed column
// beside it, so nothing already chosen ever disappears from view. Restyled
// throughout in CT2's own "Rosewater Quiet" palette.
export default function Booking({ therapist, bookedTimes: initialBookedTimes = [], bookingLimitReached = false }: BookingProps) {
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

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDay, setSelectedDay] = useState<MonthDayAvailability | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null)
  const [hasVisitedDetails, setHasVisitedDetails] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [booked, setBooked] = useState(false)
  const [limitReached, setLimitReached] = useState(false)
  const [touched, setTouched] = useState<{ name?: boolean; phone?: boolean }>({})
  const slotsColRef = useRef<HTMLDivElement | null>(null)
  const detailsColRef = useRef<HTMLDivElement | null>(null)

  const { book, loading } = useBooking({
    onSuccess: () => setBooked(true),
    onError: (msg) => {
      if (msg === 'NO_SLOTS_AVAILABLE') { setLimitReached(true); return }
      setError(msg)
    },
    onSlotsRefresh: (fresh) => {
      setBookedTimes(fresh)
      setSelectedDay(null)
      setSelectedDate(null)
      setSelectedSlot(null)
      setSelectedSlotIso(null)
    },
  })

  const slots = useMemo(() =>
    selectedDay ? selectedDay.slots.map(label => ({ label, iso: slotToISO(label, selectedDay.dateObj) })) : [],
  [selectedDay])
  const slotGroups = useMemo(() => groupSlotsByPeriod(slots), [slots])

  // Step counter, purely for the "01/03" label + progress dots — the
  // calendar, slots, and details columns all coexist on screen at once;
  // this just tracks how far along the person is.
  const step = !selectedDay ? 1 : !selectedSlot ? 2 : 3

  function scrollColIntoView(ref: React.RefObject<HTMLDivElement | null>) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
      })
    })
  }

  function handleSelectDate(day: MonthDayAvailability) {
    setSelectedDate(day.dateObj)
    setSelectedDay(day)
    // Only deselect the slot itself (it belonged to the old date) — do NOT
    // touch hasVisitedDetails, so the "Your details" column stays mounted
    // instead of collapsing the layout back down.
    setSelectedSlot(null)
    setSelectedSlotIso(null)
    setError('')
    scrollColIntoView(slotsColRef)
  }

  function handleSelectSlot(label: string, iso: string) {
    setSelectedSlot(label)
    setSelectedSlotIso(iso)
    setHasVisitedDetails(true)
    scrollColIntoView(detailsColRef)
  }

  if (!mounted || slotsLoading) return (
    <section id="book" className="px-6 lg:px-10 py-28 lg:py-36" style={{ background: 'var(--ink-0)' }}>
      <div className="mx-auto max-w-[1080px] flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--gold)' }} />
      </div>
    </section>
  )

  async function handleConfirm() {
    if (!selectedSlotIso) { setError('Please choose a time.'); return }
    if (!name.trim() || !phone.trim()) { setError('Please complete name and phone.'); return }
    setError('')
    await book({
      therapist_id: therapist.id!,
      client_name: name,
      client_email: email,
      client_phone: phone,
      scheduled_at: selectedSlotIso,
      duration_mins: therapist.sessionDuration,
      service_price: typeof therapist.fee === 'number' && therapist.fee > 0 ? therapist.fee : 500,
    })
  }

  const dateLabel = selectedDay
    ? selectedDay.dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  const displayFee = typeof therapist.fee === 'number' && therapist.fee > 0 ? therapist.fee : 500
  const feeLabel = `\u20b9${new Intl.NumberFormat('en-IN').format(displayFee)}`
  const durationLabel = therapist.sessionDuration ? `${therapist.sessionDuration} min` : null

  const nameValid = name.trim().length > 0
  const phoneValid = phone.trim().length >= 7

  const showLimitReached = bookingLimitReached || limitReached

  return (
    <section id="book" className="ct2-bk px-6 lg:px-10 py-28 lg:py-36" style={{ background: 'var(--ink-0)' }}>
      <style>{`
        .ct2-bk-head { max-width: 640px; margin: 0 auto clamp(28px, 4vw, 48px); text-align: center; }
        .ct2-bk-step {
          font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace; font-size: 11px; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--gold); margin-bottom: 14px; display: block;
        }
        .ct2-bk-title {
          font-family: 'Fraunces', 'Playfair Display', Georgia, serif; font-weight: 400; letter-spacing: -0.01em;
          font-size: clamp(34px, 4.4vw, 52px); color: var(--bone); margin: 0; text-align: center;
        }
        .ct2-bk-title em { font-style: italic; color: var(--gold); }

        .ct2-bk-meta {
          display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
          margin-top: 14px;
          font-family: 'Geist', 'Inter', system-ui, sans-serif; font-size: 12.5px; color: var(--mute);
        }
        .ct2-bk-meta b { color: var(--gold); font-weight: 700; }
        .ct2-bk-meta-dot { opacity: 0.5; }

        .ct2-bk-dots { display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 16px; }
        .ct2-bk-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--ink-3); transition: all 300ms cubic-bezier(.16,.84,.3,1); }
        .ct2-bk-dot--done { background: var(--gold); }
        .ct2-bk-dot--active { background: var(--gold); width: 16px; border-radius: 4px; }

        .ct2-bk-layout { max-width: 1180px; margin: 0 auto; }
        .ct2-bk-layout--narrow { max-width: 640px; }

        /* ── Row of columns: calendar always present, slots + details
           open up beside it (left→right) as choices are made ── */
        .ct2-bk-row {
          display: flex; flex-wrap: wrap; gap: clamp(22px, 3vw, 36px);
          justify-content: center; align-items: flex-start;
        }
        .ct2-bk-col-cal { flex: 0 1 440px; max-width: 440px; }
        .ct2-bk-col-slots, .ct2-bk-col-details { flex: 1 1 300px; max-width: 340px; }
        .ct2-bk-col-slots .ct2-bk-col-card { margin-top: 30px; }
        .ct2-bk-col-details .ct2-bk-col-card { margin-top: 30px; }
        @media (max-width: 760px) {
          .ct2-bk-col-slots, .ct2-bk-col-details { flex-basis: 100%; max-width: 420px; margin: 0 auto; }
        }

        @keyframes ct2-bk-col-in {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 760px) {
          @keyframes ct2-bk-col-in {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        }
        .ct2-bk-col-slots, .ct2-bk-col-details { animation: ct2-bk-col-in 480ms cubic-bezier(.16,.84,.3,1) both; }

        .ct2-bk-col-card {
          background: var(--ink-1); border: 1px solid var(--ink-3);
          border-radius: 10px; padding: clamp(20px, 3vw, 28px);
        }

        .ct2-bk-label {
          font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace; text-transform: uppercase;
          letter-spacing: 0.08em; font-size: 10px; color: var(--mute);
          margin-bottom: 10px; display: block; text-align: center;
        }

        /* ── Slot picker ── */
        .ct2-bk-slotgroup { margin-bottom: 18px; }
        .ct2-bk-slotgroup:last-child { margin-bottom: 0; }
        .ct2-bk-slotgroup-head {
          display: flex; align-items: center; gap: 6px; margin-bottom: 10px;
          font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace; font-size: 10.5px; text-transform: uppercase;
          letter-spacing: 0.07em; color: var(--mute);
        }
        .ct2-bk-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 9px; }
        .ct2-bk-slot {
          padding: 11px 6px; border-radius: 8px; border: 1px solid var(--ink-3);
          background: var(--ink-0); color: var(--bone);
          font-size: 13px; cursor: pointer; transition: all 200ms cubic-bezier(.16,.84,.3,1);
          font-family: 'Geist', 'Inter', system-ui, sans-serif;
        }
        .ct2-bk-slot:hover { border-color: var(--gold);  }
        .ct2-bk-slot--on { background: var(--gold); border-color: var(--gold); color: #FFF9F6; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 5px; }
        .ct2-bk-empty { font-size: 13px; color: var(--mute); padding: 14px 0; text-align: center; }

        /* ── Details column ── */
        .ct2-bk-summary {
          background: rgba(185,128,121,0.08); border: 1px solid rgba(185,128,121,0.25);
          border-radius: 10px; padding: 14px 16px; margin-bottom: 18px; text-align: center;
        }
        .ct2-bk-summary-text { font-family: 'Geist', 'Inter', system-ui, sans-serif; font-size: 13px; color: var(--bone); line-height: 1.6; }
        .ct2-bk-summary-text b { color: var(--gold); font-weight: 700; }

        .ct2-bk-fields { display: grid; gap: 14px; }
        .ct2-bk-field label {
          display: block; margin-bottom: 6px;
          font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace; font-size: 10px; letter-spacing: 0.07em;
          text-transform: uppercase; color: var(--mute);
        }
        .ct2-bk-field-err { color: var(--rose); }
        .ct2-bk-field input {
          width: 100%; background: var(--ink-0); border: 1px solid var(--ink-3);
          border-radius: 8px; color: var(--bone);
          font-family: 'Geist', 'Inter', system-ui, sans-serif; font-size: 13.5px;
          padding: 12px 13px; outline: none; transition: border-color 200ms cubic-bezier(.16,.84,.3,1);
        }
        .ct2-bk-field input::placeholder { color: var(--mute); }
        .ct2-bk-field input:focus { border-color: var(--gold); }
        .ct2-bk-field input[data-invalid="true"] { border-color: var(--rose); }

        .ct2-bk-submit {
          width: 100%; padding: 15px; border-radius: 100px; border: none; cursor: pointer;
          background: var(--gold); color: #FFF9F6; margin-top: 6px;
          font-family: 'Geist', 'Inter', system-ui, sans-serif; font-weight: 700; font-size: 13.5px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 200ms cubic-bezier(.16,.84,.3,1), box-shadow 200ms cubic-bezier(.16,.84,.3,1), background 200ms;
        }
        .ct2-bk-submit:hover { transform: translateY(-1px); box-shadow: 0 12px 28px -10px rgba(185,128,121,0.45); background: var(--rose); }
        .ct2-bk-submit:disabled { opacity: 0.7; cursor: default; transform: none; }
        .ct2-bk-err { color: var(--rose); font-size: 13px; text-align: center; margin: 10px 0 0; }

        .ct2-bk-done { text-align: center; padding: 48px 10px; }
        .ct2-bk-done-ring {
          width: 56px; height: 56px; border-radius: 50%; background: var(--gold);
          display: grid; place-items: center; margin: 0 auto 16px; color: #FFF9F6;
        }
        .ct2-bk-done h3 { font-family: 'Fraunces', 'Playfair Display', Georgia, serif; font-weight: 400; font-size: 26px; color: var(--bone); margin: 0 0 8px; }
        .ct2-bk-done p { color: var(--mute); font-size: 14px; }

        /* ── The hanging wall calendar (CT2 "Rosewater Quiet" version) ── */
        .ct2-bk-hang {
          position: relative; display: flex; flex-direction: column; align-items: center;
          padding-top: 22px;
        }
        .ct2-bk-hang::before {
          content: ''; position: absolute; left: 50%; top: 64px; transform: translateX(-50%);
          width: min(240px, 88%); height: 64px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(42,36,32,0.14) 0%, transparent 72%);
          filter: blur(4px); z-index: 0; pointer-events: none;
        }

        .ct2-bk-nail {
          position: relative; width: 10px; height: 10px; border-radius: 50%; z-index: 4;
          background: radial-gradient(circle at 35% 30%, #F1DAC8, #B98079 65%, #7A4F45 100%);
          box-shadow: 0 2px 5px rgba(42,36,32,0.35);
        }
        .ct2-bk-nail::after {
          content: ''; position: absolute; left: 50%; top: 100%; width: 1px; height: 18px;
          background: rgba(42,36,32,0.18); transform: translateX(-50%);
        }

        .ct2-bk-paper-stack { position: relative; width: 100%; max-width: 400px; margin: 2px auto 0; z-index: 1; }
        .ct2-bk-paper-sheet {
          position: absolute; inset: 0; border-radius: 4px 4px 14px 14px;
          box-shadow: 0 16px 32px rgba(42,36,32,0.10);
        }
        .ct2-bk-paper-sheet--1 { background: var(--ink-2); transform: rotate(-2.4deg) translateY(4px); z-index: 1; }
        .ct2-bk-paper-sheet--2 { background: #EAD9D0; transform: rotate(2deg) translateY(6px); z-index: 0; opacity: 0.8; }

        .ct2-bk-paper {
          position: relative; z-index: 2;
          background: #FBF4EE;
          border: 1px solid var(--ink-3);
          border-radius: 4px 4px 12px 12px;
          padding: 16px clamp(10px, 2.4vw, 14px) 14px;
          box-shadow:
            0 20px 40px rgba(42,36,32,0.10),
            0 3px 0 rgba(42,36,32,0.03) inset;
          transform: rotate(-1deg);
          transition: transform 420ms cubic-bezier(.16,.84,.3,1), box-shadow 420ms cubic-bezier(.16,.84,.3,1);
        }
        .ct2-bk-paper:hover { transform: rotate(0deg) translateY(-2px); box-shadow: 0 30px 56px rgba(42,36,32,0.14); }

        .ct2-bk-punch {
          position: absolute; top: -5px; left: 0; right: 0; z-index: 3;
          display: flex; justify-content: center; gap: clamp(10px, 4vw, 22px);
        }
        .ct2-bk-punch span {
          position: relative; width: 9px; height: 9px; border-radius: 50%;
          background: var(--ink-1);
          box-shadow:
            0 0 0 2px rgba(185,128,121,0.28),
            inset 0 1.5px 2px rgba(42,36,32,0.18);
        }

        .ct2-bk-paper-tab {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin: 1px 0 10px;
          font-family: 'Geist Mono', 'JetBrains Mono', ui-monospace, monospace; font-size: 7.5px;
          letter-spacing: 0.14em; text-transform: uppercase; color: var(--mute);
        }
        .ct2-bk-paper-tab::before, .ct2-bk-paper-tab::after {
          content: ''; width: 10px; height: 1px; background: var(--ink-3);
        }
      `}</style>

      <div className="ct2-bk-head">
        <h2 className="ct2-bk-title">Choose a <em>time</em>.</h2>
        {!booked && !showLimitReached && (
          <div className="ct2-bk-dots">
            {[1, 2, 3].map(n => (
              <span key={n} className={`ct2-bk-dot ${n < step ? 'ct2-bk-dot--done' : n === step ? 'ct2-bk-dot--active' : ''}`} />
            ))}
          </div>
        )}
      </div>

      {booked ? (
        <div className="ct2-bk-layout ct2-bk-layout--narrow">
          <div className="ct2-bk-done">
            <div className="ct2-bk-done-ring"><Check size={26} /></div>
            <h3>You&rsquo;re booked.</h3>
            <p>A confirmation is on its way to your inbox.</p>
          </div>
        </div>
      ) : showLimitReached ? (
        <div className="ct2-bk-layout ct2-bk-layout--narrow">
          <div className="ct2-bk-done">
            <h3>No available slots.</h3>
            <p>New session times open next month. Please reach out directly to schedule.</p>
          </div>
        </div>
      ) : (
        <div className="ct2-bk-layout">
          <div className="ct2-bk-row">
            {/* ── Column 1: the calendar, always here ── */}
            <div className="ct2-bk-col ct2-bk-col-cal">
              <span className="ct2-bk-label">Choose a date</span>
              <div className="ct2-bk-hang">
                <div className="ct2-bk-nail" />
                <div className="ct2-bk-paper-stack">
                  <div className="ct2-bk-paper-sheet ct2-bk-paper-sheet--2" />
                  <div className="ct2-bk-paper-sheet ct2-bk-paper-sheet--1" />
                  <div className="ct2-bk-paper">
                    <div className="ct2-bk-punch"><span /><span /><span /><span /><span /></div>
                    <div className="ct2-bk-paper-tab">{therapist.name}&rsquo;s availability</div>
                    <MonthCalendar
                      availability={therapist.availability}
                      durationMin={therapist.sessionDuration}
                      bookedISO={bookedTimes}
                      selectedDate={selectedDate}
                      onSelectDate={handleSelectDate}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Column 2: times for the chosen date ── */}
            {selectedDay && (
              <div className="ct2-bk-col ct2-bk-col-slots" ref={slotsColRef}>
                <span className="ct2-bk-label">Choose a time</span>
                <div className="ct2-bk-col-card">
                  {slots.length === 0 ? (
                    <div className="ct2-bk-empty">No available times on this day.</div>
                  ) : (
                    slotGroups.map(group => (
                      <div key={group.key} className="ct2-bk-slotgroup">
                        <div className="ct2-bk-slotgroup-head"><group.Icon size={12} /> {group.label}</div>
                        <div className="ct2-bk-slots">
                          {group.slots.map(s => (
                            <button
                              key={s.label}
                              className={`ct2-bk-slot ${selectedSlot === s.label ? 'ct2-bk-slot--on' : ''}`}
                              onClick={() => handleSelectSlot(s.label, s.iso)}
                            >
                              {selectedSlot === s.label && <Check size={13} strokeWidth={2.5} />}
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ── Column 3: your details ── */}
            {(selectedSlot || hasVisitedDetails) && (
              <div className="ct2-bk-col ct2-bk-col-details" ref={detailsColRef}>
                <span className="ct2-bk-label">Your details</span>
                <div className="ct2-bk-col-card">
                  <div className="ct2-bk-summary">
                    <span className="ct2-bk-summary-text">
                      {selectedSlot ? (
                        <>
                          {dateLabel} &middot; <b>{selectedSlot}</b> (IST)<br />
                          {durationLabel && <>{durationLabel} &middot; </>}<b>{feeLabel}</b>
                        </>
                      ) : (
                        <>Pick a new time above for <b>{dateLabel}</b></>
                      )}
                    </span>
                  </div>

                  <div className="ct2-bk-fields">
                    <div className="ct2-bk-field">
                      <label htmlFor="ct2-bk-name">Your name{touched.name && !nameValid && <span className="ct2-bk-field-err"> &mdash; required</span>}</label>
                      <input
                        id="ct2-bk-name"
                        placeholder="e.g. Aditi Sharma"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, name: true }))}
                        data-invalid={touched.name && !nameValid ? 'true' : 'false'}
                      />
                    </div>
                    <div className="ct2-bk-field">
                      <label htmlFor="ct2-bk-email">Email (optional)</label>
                      <input id="ct2-bk-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="ct2-bk-field">
                      <label htmlFor="ct2-bk-phone">Phone{touched.phone && !phoneValid && <span className="ct2-bk-field-err"> &mdash; required</span>}</label>
                      <input
                        id="ct2-bk-phone"
                        type="tel"
                        placeholder="e.g. 98765 43210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                        data-invalid={touched.phone && !phoneValid ? 'true' : 'false'}
                      />
                    </div>
                  </div>
                  {error && <p className="ct2-bk-err">{error}</p>}
                  <button className="ct2-bk-submit" onClick={handleConfirm} disabled={loading}>
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Holding your place&hellip;</> : <>Pay {feeLabel} & Book</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
