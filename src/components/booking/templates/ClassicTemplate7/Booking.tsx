'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { slotToISO, type MonthDayAvailability } from '../templateUtils'
import { Check, Loader2, Sun, Sunset, Moon, ChevronLeft } from 'lucide-react'
import { useBooking } from '@/lib/useBooking'
import { useCt7Reveal } from './_reveal'
import MonthCalendar from './MonthCalendar'

interface BookingProps {
  therapist: TherapistProfile
  bookedTimes?: string[]
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

// "The Ceremony" — this is Atrium's one deliberately elevated moment: a
// full-bleed dark panel with a mono step counter that echoes the loader's
// counting ritual (STEP 01 / 03 ... ), so booking feels like the intended
// destination rather than a bolted-on form.
export default function Booking({ therapist, bookedTimes: initialBookedTimes = [] }: BookingProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  useCt7Reveal(rootRef)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [bookedTimes, setBookedTimes] = useState<string[]>(initialBookedTimes)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedDay, setSelectedDay] = useState<MonthDayAvailability | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [booked, setBooked] = useState(false)
  const [limitReached, setLimitReached] = useState(false)

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

  // Step counter: 01 date, 02 time, 03 details.
  const step = !selectedDay ? 1 : !selectedSlot ? 2 : 3

  function handleSelectDate(day: MonthDayAvailability) {
    setSelectedDate(day.dateObj)
    setSelectedDay(day)
    setSelectedSlot(null)
    setSelectedSlotIso(null)
    setError('')
  }

  function handleBackToCalendar() {
    setSelectedDay(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    setSelectedSlotIso(null)
    setError('')
  }

  if (!mounted) return null

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

  return (
    <section id="booking" ref={rootRef} className="ct7-section ct7-bk">
      <style>{`
        .ct7-bk {
          position: relative; overflow: hidden;
          background:
            radial-gradient(90% 70% at 90% 10%, rgba(198,167,107,0.07) 0%, transparent 55%),
            var(--ct7-ink);
        }
        .ct7-bk-head { max-width: 900px; margin: 0 auto clamp(28px, 4vw, 48px); padding: 0 clamp(20px,5vw,56px); }
        .ct7-bk-step {
          font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--ct7-brass); margin-bottom: 14px; display: block;
        }
        .ct7-bk-title {
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.01em;
          font-size: clamp(28px, 4vw, 42px); color: #F6F1E7; margin: 0;
        }
        .ct7-bk-title em { font-style: italic; color: var(--ct7-brass); }

        .ct7-bk-layout {
          max-width: 900px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px);
          display: grid; grid-template-columns: 1fr 1fr; gap: 36px; align-items: start;
        }
        @media (max-width: 640px) { .ct7-bk-layout { grid-template-columns: 1fr; gap: 24px; } }

        .ct7-bk-label {
          font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
          letter-spacing: 0.08em; font-size: 10px; color: rgba(246,241,231,0.5);
          margin-bottom: 10px; display: block;
        }
        .ct7-bk-back {
          display: inline-flex; align-items: center; gap: 5px; margin-bottom: 14px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase;
          letter-spacing: 0.07em; cursor: pointer; background: none; color: #F6F1E7; border: none; padding: 0;
          transition: color 200ms;
        }
        .ct7-bk-back:hover { color: var(--ct7-brass); }

        .ct7-bk-slotgroup { margin-bottom: 18px; }
        .ct7-bk-slotgroup-head {
          display: flex; align-items: center; gap: 6px; margin-bottom: 10px;
          font-family: 'JetBrains Mono', monospace; font-size: 10.5px; text-transform: uppercase;
          letter-spacing: 0.07em; color: rgba(246,241,231,0.5);
        }
        .ct7-bk-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 8px; }
        .ct7-bk-slot {
          padding: 10px 6px; border-radius: 9px; border: 1px solid rgba(246,241,231,0.14);
          background: rgba(246,241,231,0.03); color: rgba(246,241,231,0.84);
          font-size: 13px; cursor: pointer; transition: all 200ms var(--ct7-ease-out);
        }
        .ct7-bk-slot:hover { border-color: rgba(198,167,107,0.5); background: rgba(198,167,107,0.06); }
        .ct7-bk-slot--on { background: var(--ct7-brass); border-color: var(--ct7-brass); color: var(--ct7-ink); font-weight: 700; }
        .ct7-bk-empty { font-size: 13px; color: rgba(246,241,231,0.5); padding: 14px 0; }

        .ct7-bk-fields { display: grid; gap: 14px; }
        .ct7-bk-field input {
          width: 100%; background: rgba(246,241,231,0.04); border: 1px solid rgba(246,241,231,0.14);
          border-radius: 10px; color: #F6F1E7;
          font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px;
          padding: 13px 14px; outline: none; transition: border-color 200ms var(--ct7-ease-out);
        }
        .ct7-bk-field input::placeholder { color: rgba(246,241,231,0.4); }
        .ct7-bk-field input:focus { border-color: var(--ct7-brass); }

        .ct7-bk-submit {
          width: 100%; padding: 14px; border-radius: 100px; border: none; cursor: pointer;
          background: var(--ct7-brass); color: var(--ct7-ink);
          font-family: 'Inter', system-ui, sans-serif; font-weight: 700; font-size: 13.5px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 200ms var(--ct7-ease-out), box-shadow 200ms var(--ct7-ease-out);
        }
        .ct7-bk-submit:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(198,167,107,0.28); }
        .ct7-bk-submit:disabled { opacity: 0.7; cursor: default; transform: none; }
        .ct7-bk-err { color: #E8A899; font-size: 13px; }

        .ct7-bk-done { text-align: center; padding: 48px 10px; }
        .ct7-bk-done-ring {
          width: 56px; height: 56px; border-radius: 50%; background: var(--ct7-brass-dim);
          display: grid; place-items: center; margin: 0 auto 16px;
        }
        .ct7-bk-done h3 { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 26px; color: #F6F1E7; margin: 0 0 8px; }
        .ct7-bk-done p { color: rgba(246,241,231,0.65); font-size: 14px; }

        .ct7-bk-confidential {
          max-width: 900px; margin: 40px auto 0; padding: 0 clamp(20px,5vw,56px);
          font-family: 'JetBrains Mono', monospace; font-size: 10.5px; letter-spacing: 0.06em;
          color: rgba(246,241,231,0.4); text-transform: uppercase;
        }
        .ct7-spin { animation: ct7-spin 1s linear infinite; }
        @keyframes ct7-spin { to { transform: rotate(360deg); } }

        /* ── calendar (Atrium tone) ── */
        .ct7-cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
        .ct7-cal-month { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 13.5px; color: #F6F1E7; }
        .ct7-cal-nav {
          width: 24px; height: 24px; border-radius: 50%;
          border: 1px solid rgba(246,241,231,0.16); background: rgba(246,241,231,0.04);
          color: rgba(246,241,231,0.8); display: grid; place-items: center;
          cursor: pointer; transition: all 200ms var(--ct7-ease-out);
        }
        .ct7-cal-nav:hover:not(:disabled) { border-color: var(--ct7-brass); color: var(--ct7-brass); }
        .ct7-cal-nav:disabled { opacity: 0.25; cursor: default; }
        .ct7-cal-weekdays { display: grid; grid-template-columns: repeat(7,1fr); gap: 1px; margin-bottom: 3px; }
        .ct7-cal-weekdays span { text-align: center; font-size: 8.5px; font-weight: 600; letter-spacing: 0.04em; color: rgba(246,241,231,0.4); padding: 2px 0; }
        .ct7-cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
        .ct7-cal-cell {
          aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%;
          font-size: 10.5px; background: transparent; border: 1px solid transparent;
          color: rgba(246,241,231,0.36); cursor: default; transition: all 180ms var(--ct7-ease-out);
        }
        .ct7-cal-cell--blank { visibility: hidden; }
        .ct7-cal-cell--muted { color: rgba(246,241,231,0.2); }
        .ct7-cal-cell--open { color: #F6F1E7; cursor: pointer; }
        .ct7-cal-cell--open:hover { background: rgba(198,167,107,0.16); }
        .ct7-cal-cell--today.ct7-cal-cell--open { background: rgba(198,167,107,0.22); font-weight: 700; }
        .ct7-cal-cell--selected { background: var(--ct7-brass) !important; color: var(--ct7-ink) !important; font-weight: 700; }
        .ct7-cal-msg { margin-top: 10px; padding: 9px 11px; border-radius: 8px; background: rgba(246,241,231,0.04); font-size: 11.5px; line-height: 1.5; color: rgba(246,241,231,0.6); }
        .ct7-cal-msg:empty { display: none; }
      `}</style>

      <div className="ct7-bk-head">
        <span className="ct7-bk-step">Step {String(step).padStart(2, '0')} / 03</span>
        <h2 className="ct7-bk-title">Reserve your <em>session</em>.</h2>
      </div>

      {booked ? (
        <div className="ct7-bk-layout" style={{ gridTemplateColumns: '1fr' }}>
          <div className="ct7-bk-done">
            <div className="ct7-bk-done-ring"><Check size={26} style={{ color: 'var(--ct7-brass)' }} /></div>
            <h3>You&rsquo;re booked.</h3>
            <p>A confirmation is on its way to your inbox.</p>
          </div>
        </div>
      ) : limitReached ? (
        <div className="ct7-bk-layout" style={{ gridTemplateColumns: '1fr' }}>
          <div className="ct7-bk-done">
            <h3>No available slots.</h3>
            <p>New session times open next month. Please reach out directly to schedule.</p>
          </div>
        </div>
      ) : (
        <div className="ct7-bk-layout">
          <div>
            {!selectedDay ? (
              <>
                <span className="ct7-bk-label">Choose a date</span>
                <MonthCalendar
                  availability={therapist.availability}
                  durationMin={therapist.sessionDuration}
                  bookedISO={bookedTimes}
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                />
              </>
            ) : (
              <>
                <button className="ct7-bk-back" onClick={handleBackToCalendar}>
                  <ChevronLeft size={12} /> Back to calendar
                </button>
                <span className="ct7-bk-label">Choose a time &mdash; {dateLabel}</span>

                {slots.length === 0 ? (
                  <div className="ct7-bk-empty">No available times on this day.</div>
                ) : (
                  slotGroups.map(group => (
                    <div key={group.key} className="ct7-bk-slotgroup">
                      <div className="ct7-bk-slotgroup-head"><group.Icon size={12} /> {group.label}</div>
                      <div className="ct7-bk-slots">
                        {group.slots.map(s => (
                          <button
                            key={s.label}
                            className={`ct7-bk-slot ${selectedSlot === s.label ? 'ct7-bk-slot--on' : ''}`}
                            onClick={() => { setSelectedSlot(s.label); setSelectedSlotIso(s.iso) }}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="ct7-bk-label">Your details</span>
            <div className="ct7-bk-fields">
              <div className="ct7-bk-field"><input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="ct7-bk-field"><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="ct7-bk-field"><input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} /></div>
            </div>
            {error && <p className="ct7-bk-err">{error}</p>}
            <button className="ct7-bk-submit" onClick={handleConfirm} disabled={loading}>
              {loading ? <><Loader2 size={16} className="ct7-spin" /> Holding your place&hellip;</> : <>Confirm booking</>}
            </button>
          </div>
        </div>
      )}

      <p className="ct7-bk-confidential">Everything shared here is confidential, within standard clinical limits.</p>
    </section>
  )
}
