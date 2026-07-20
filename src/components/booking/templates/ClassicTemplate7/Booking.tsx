'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { slotToISO, type MonthDayAvailability } from '../templateUtils'
import { Check, Loader2, Sun, Sunset, Moon } from 'lucide-react'
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

// "The Ceremony" — this is Atrium's one deliberately elevated moment.
// The booking flow reads left to right, like a ledger being filled in:
// the wall calendar always anchors the left, and each decision (a time,
// then your details) opens up as its own framed column beside it, so
// nothing already chosen ever disappears from view.
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
    // instead of collapsing the layout back down to two columns.
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

  function handleBackToCalendar() {
    setSelectedDay(null)
    setSelectedDate(null)
    setSelectedSlot(null)
    setSelectedSlotIso(null)
    setHasVisitedDetails(false)
    setError('')
  }

  function handleBackToSlots() {
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

  const displayFee = typeof therapist.fee === 'number' && therapist.fee > 0 ? therapist.fee : 500
  const feeLabel = `\u20b9${new Intl.NumberFormat('en-IN').format(displayFee)}`
  const durationLabel = therapist.sessionDuration ? `${therapist.sessionDuration} min` : null

  const nameValid = name.trim().length > 0
  const phoneValid = phone.trim().length >= 7

  return (
    <section id="booking" ref={rootRef} className="ct7-section ct7-bk">
      <style>{`
        .ct7-bk {
          position: relative; overflow: hidden;
          background:
            radial-gradient(90% 70% at 90% 10%, rgba(198,167,107,0.07) 0%, transparent 55%),
            var(--ct7-ink);
        }
        .ct7-bk-head { max-width: 640px; margin: 0 auto clamp(28px, 4vw, 48px); padding: 0 clamp(20px,5vw,56px); text-align: center; }
        .ct7-bk-step {
          font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--ct7-brass); margin-bottom: 14px; display: block;
        }
        .ct7-bk-title {
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; letter-spacing: -0.01em;
          font-size: clamp(28px, 4vw, 42px); color: #F6F1E7; margin: 0;
        }
        .ct7-bk-title em { font-style: italic; color: var(--ct7-brass); }

        .ct7-bk-meta {
          display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap;
          margin-top: 14px;
          font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; color: rgba(246,241,231,0.6);
        }
        .ct7-bk-meta b { color: var(--ct7-brass); font-weight: 700; }
        .ct7-bk-meta-dot { opacity: 0.4; }

        .ct7-bk-dots { display: flex; align-items: center; justify-content: center; gap: 7px; margin-top: 16px; }
        .ct7-bk-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(246,241,231,0.18); transition: all 300ms var(--ct7-ease-out); }
        .ct7-bk-dot--done { background: var(--ct7-brass); }
        .ct7-bk-dot--active { background: var(--ct7-brass); width: 16px; border-radius: 4px; }

        .ct7-bk-layout {
          max-width: 1180px; margin: 0 auto; padding: 0 clamp(20px,5vw,56px);
        }
        .ct7-bk-layout--narrow { max-width: 640px; }

        /* ── Row of columns: calendar always present, slots + details
           open up beside it (left→right) as choices are made ── */
        .ct7-bk-row {
          display: flex; flex-wrap: wrap; gap: clamp(22px, 3vw, 36px);
          justify-content: center; align-items: flex-start;
        }
        .ct7-bk-col-cal { flex: 0 1 360px; max-width: 360px; }
        .ct7-bk-col-slots, .ct7-bk-col-details { flex: 1 1 300px; max-width: 340px; }
        /* The calendar's card sits lower than its column top (the nail +
           thread + hang padding push it down ~43px). The other two columns
           had no such offset, so their cards started noticeably higher than
           the calendar's — push them down to start at the same point. */
        .ct7-bk-col-slots .ct7-bk-col-card { margin-top: 43px; }
        .ct7-bk-col-details .ct7-bk-col-card { margin-top: 43px; }
        @media (max-width: 760px) {
          .ct7-bk-col-slots, .ct7-bk-col-details { flex-basis: 100%; max-width: 420px; margin: 0 auto; }
        }

        @keyframes ct7-bk-col-in {
          from { opacity: 0; transform: translateX(18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 760px) {
          @keyframes ct7-bk-col-in {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        }
        .ct7-bk-col-slots, .ct7-bk-col-details { animation: ct7-bk-col-in 480ms var(--ct7-ease-out) both; }

        .ct7-bk-col-card {
          background: rgba(246,241,231,0.03); border: 1px solid rgba(246,241,231,0.1);
          border-radius: 18px; padding: clamp(20px, 3vw, 28px);
        }
        .ct7-bk-col-sub {
          display: block; text-align: center; margin: -8px 0 4px;
          font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 15px; color: #F6F1E7;
        }

        .ct7-bk-label {
          font-family: 'JetBrains Mono', monospace; text-transform: uppercase;
          letter-spacing: 0.08em; font-size: 10px; color: rgba(246,241,231,0.5);
          margin-bottom: 10px; display: block; text-align: center;
        }
        .ct7-bk-tz {
          display: block; text-align: center; margin: 0 0 16px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.06em;
          color: rgba(246,241,231,0.4); text-transform: uppercase;
        }
        .ct7-bk-col-change {
          display: block; margin: 14px auto 0;
          font-family: 'JetBrains Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em;
          color: rgba(246,241,231,0.5); background: none; border: none; cursor: pointer;
          transition: color 200ms;
        }
        .ct7-bk-col-change:hover, .ct7-bk-col-change:focus-visible { color: var(--ct7-brass); }
        .ct7-bk-col-change:focus-visible { outline: 2px solid var(--ct7-brass); outline-offset: 3px; border-radius: 3px; }

        /* ── Slot picker (paper note) ── */
        .ct7-bk-slotgroup { margin-bottom: 18px; }
        .ct7-bk-slotgroup:last-child { margin-bottom: 0; }
        .ct7-bk-slotgroup-head {
          display: flex; align-items: center; gap: 6px; margin-bottom: 10px;
          font-family: 'JetBrains Mono', monospace; font-size: 10.5px; text-transform: uppercase;
          letter-spacing: 0.07em; color: rgba(246,241,231,0.5);
        }
        .ct7-bk-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr)); gap: 9px; }
        .ct7-bk-slot {
          padding: 12px 6px; border-radius: 9px; border: 1px solid rgba(246,241,231,0.14);
          background: rgba(246,241,231,0.03); color: rgba(246,241,231,0.84);
          font-size: 13.5px; cursor: pointer; transition: all 200ms var(--ct7-ease-out);
        }
        .ct7-bk-slot:hover { border-color: rgba(198,167,107,0.5); background: rgba(198,167,107,0.06); }
        .ct7-bk-slot:focus-visible { outline: 2px solid var(--ct7-brass); outline-offset: 2px; }
        .ct7-bk-slot--on { background: var(--ct7-brass); border-color: var(--ct7-brass); color: var(--ct7-ink); font-weight: 700; display: inline-flex; align-items: center; justify-content: center; gap: 5px; }
        .ct7-bk-empty { font-size: 13px; color: rgba(246,241,231,0.5); padding: 14px 0; text-align: center; }

        /* ── Details column ── */
        .ct7-bk-summary {
          background: rgba(198,167,107,0.08); border: 1px solid rgba(198,167,107,0.22);
          border-radius: 14px; padding: 14px 16px; margin-bottom: 18px; text-align: center;
        }
        .ct7-bk-summary-text { font-family: 'Inter', system-ui, sans-serif; font-size: 13px; color: #F6F1E7; line-height: 1.6; }
        .ct7-bk-summary-text b { color: var(--ct7-brass); font-weight: 700; }

        .ct7-bk-fields { display: grid; gap: 14px; }
        .ct7-bk-field label {
          display: block; margin-bottom: 6px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.07em;
          text-transform: uppercase; color: rgba(246,241,231,0.45);
        }
        .ct7-bk-field-err { color: #E8A899; }
        .ct7-bk-field input {
          width: 100%; background: rgba(246,241,231,0.04); border: 1px solid rgba(246,241,231,0.14);
          border-radius: 10px; color: #F6F1E7;
          font-family: 'Inter', system-ui, sans-serif; font-size: 13.5px;
          padding: 13px 14px; outline: none; transition: border-color 200ms var(--ct7-ease-out);
        }
        .ct7-bk-field input::placeholder { color: rgba(246,241,231,0.4); }
        .ct7-bk-field input:focus { border-color: var(--ct7-brass); }
        .ct7-bk-field input[data-invalid="true"] { border-color: #C97D6B; }
        .ct7-bk-confidential-inline {
          font-family: 'Inter', system-ui, sans-serif; font-size: 11.5px; line-height: 1.5;
          color: rgba(246,241,231,0.4); text-align: center; margin: 14px 0 0;
        }

        .ct7-bk-submit {
          width: 100%; padding: 15px; border-radius: 100px; border: none; cursor: pointer;
          background: var(--ct7-brass); color: var(--ct7-ink); margin-top: 6px;
          font-family: 'Inter', system-ui, sans-serif; font-weight: 700; font-size: 13.5px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: transform 200ms var(--ct7-ease-out), box-shadow 200ms var(--ct7-ease-out);
        }
        .ct7-bk-submit:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(198,167,107,0.28); }
        .ct7-bk-submit:disabled { opacity: 0.7; cursor: default; transform: none; }
        .ct7-bk-err { color: #E8A899; font-size: 13px; text-align: center; margin: 10px 0 0; }

        .ct7-bk-done { text-align: center; padding: 48px 10px; }
        .ct7-bk-done-ring {
          width: 56px; height: 56px; border-radius: 50%; background: var(--ct7-brass-dim);
          display: grid; place-items: center; margin: 0 auto 16px;
        }
        .ct7-bk-done h3 { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 26px; color: #F6F1E7; margin: 0 0 8px; }
        .ct7-bk-done p { color: rgba(246,241,231,0.65); font-size: 14px; }

        .ct7-spin { animation: ct7-spin 1s linear infinite; }
        @keyframes ct7-spin { to { transform: rotate(360deg); } }

        /* ── The hanging wall calendar ─────────────────────────────────
           A pad of paper, punch-holed along the top, hung from a small wall
           nail on a thread, with a couple of sheets peeking out behind it
           to read as a pad rather than a single flat card. It anchors the
           left of the row and never leaves the screen. */
        .ct7-bk-hang {
          position: relative; display: flex; flex-direction: column; align-items: center;
          padding-top: 30px;
        }
        .ct7-bk-hang::before {
          content: ''; position: absolute; left: 50%; top: 86px; transform: translateX(-50%);
          width: min(360px, 84%); height: 100px; border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 72%);
          filter: blur(4px); z-index: 0; pointer-events: none;
        }

        .ct7-bk-nail {
          position: relative; width: 11px; height: 11px; border-radius: 50%; z-index: 4;
          background: radial-gradient(circle at 35% 30%, #F1E6C8, #A88A54 65%, #5B4C31 100%);
          box-shadow: 0 2px 6px rgba(0,0,0,0.55);
        }
        .ct7-bk-nail::after {
          content: ''; position: absolute; left: 50%; top: 100%; width: 1px; height: 20px;
          background: rgba(246,241,231,0.22); transform: translateX(-50%);
        }

        .ct7-bk-paper-stack { position: relative; width: 100%; max-width: 360px; margin-top: 2px; z-index: 1; }
        .ct7-bk-paper-sheet {
          position: absolute; inset: 0; border-radius: 4px 4px 14px 14px;
          box-shadow: 0 20px 42px rgba(0,0,0,0.28);
        }
        .ct7-bk-paper-sheet--1 { background: var(--ct7-bone-dim); transform: rotate(-2.6deg) translateY(4px); z-index: 1; }
        .ct7-bk-paper-sheet--2 { background: #E4DCC7; transform: rotate(2.2deg) translateY(6px); z-index: 0; opacity: 0.85; }

        .ct7-bk-paper {
          position: relative; z-index: 2;
          background: var(--ct7-bone);
          border-radius: 4px 4px 12px 12px;
          padding: 24px clamp(16px, 3.4vw, 22px) 20px;
          box-shadow:
            0 24px 48px rgba(0,0,0,0.4),
            0 3px 0 rgba(0,0,0,0.06) inset;
          transform: rotate(-1.1deg);
          transition: transform 420ms var(--ct7-ease-out), box-shadow 420ms var(--ct7-ease-out);
        }
        .ct7-bk-paper:hover { transform: rotate(0deg) translateY(-2px); box-shadow: 0 38px 74px rgba(0,0,0,0.44); }
        .ct7-bk-paper::before {
          content: ''; position: absolute; inset: 0; opacity: 0.5; mix-blend-mode: multiply; pointer-events: none;
          border-radius: inherit;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
        }
        .ct7-bk-punch {
          position: absolute; top: -7px; left: 0; right: 0; z-index: 3;
          display: flex; justify-content: center; gap: clamp(16px, 6vw, 34px);
        }
        .ct7-bk-punch span {
          position: relative; width: 12px; height: 12px; border-radius: 50%;
          background: radial-gradient(circle at 32% 28%, #6B5A38 0%, #4A3D26 60%, #362C1B 100%);
          box-shadow:
            0 0 0 2px rgba(198,167,107,0.22),
            0 1px 1px rgba(246,241,231,0.12);
        }
        .ct7-bk-punch span::after {
          content: ''; position: absolute; inset: 2.5px; border-radius: 50%;
          background: var(--ct7-ink);
          box-shadow: inset 0 1.5px 2px rgba(0,0,0,0.6);
        }

        .ct7-bk-paper-tab {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          margin: 2px 0 14px;
          font-family: 'JetBrains Mono', monospace; font-size: 8.5px; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--ct7-moss);
        }
        .ct7-bk-paper-tab::before, .ct7-bk-paper-tab::after {
          content: ''; width: 14px; height: 1px; background: rgba(43,51,46,0.16);
        }

        /* ── calendar (Atrium tone) — compact but tappable ── */
        .ct7-cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .ct7-cal-month { font-family: 'Fraunces', Georgia, serif; font-weight: 500; font-size: 17px; color: var(--ct7-charcoal); letter-spacing: -0.01em; }
        .ct7-cal-nav {
          width: 32px; height: 32px; border-radius: 50%;
          border: 1px solid rgba(43,51,46,0.16); background: transparent;
          color: var(--ct7-charcoal); display: grid; place-items: center;
          cursor: pointer; transition: all 200ms var(--ct7-ease-out);
        }
        .ct7-cal-nav:hover:not(:disabled) { border-color: var(--ct7-brass); color: var(--ct7-brass); background: rgba(198,167,107,0.08); }
        .ct7-cal-nav:focus-visible { outline: 2px solid var(--ct7-brass); outline-offset: 2px; }
        .ct7-cal-nav:disabled { opacity: 0.22; cursor: default; }
        .ct7-cal-weekdays {
          display: grid; grid-template-columns: repeat(7,1fr); gap: 1px;
          padding-bottom: 7px; margin-bottom: 6px; border-bottom: 1px dashed rgba(43,51,46,0.14);
        }
        .ct7-cal-weekdays span { text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 8.5px; font-weight: 600; letter-spacing: 0.06em; color: var(--ct7-moss); padding: 2px 0; text-transform: uppercase; }
        .ct7-cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 3px; }

        .ct7-cal-cell {
          position: relative; aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%;
          font-family: 'Inter', system-ui, sans-serif; font-size: 12.5px; font-weight: 500;
          background: transparent; border: 1px solid transparent;
          color: rgba(43,51,46,0.34); cursor: default;
          transition: background 220ms var(--ct7-ease-out), border-color 220ms var(--ct7-ease-out), color 220ms var(--ct7-ease-out), transform 220ms var(--ct7-ease-out), box-shadow 220ms var(--ct7-ease-out);
        }
        .ct7-cal-cell:focus-visible { outline: 2px solid var(--ct7-brass); outline-offset: 2px; }
        .ct7-cal-cell--blank { visibility: hidden; }
        .ct7-cal-cell--muted { color: rgba(43,51,46,0.28); }

        .ct7-cal-cell--open {
          color: var(--ct7-ink); cursor: pointer; font-weight: 700;
          background: var(--ct7-brass-dim); border-color: rgba(198,167,107,0.4);
        }
        .ct7-cal-cell--open:hover {
          background: var(--ct7-brass); border-color: var(--ct7-brass); color: var(--ct7-ink);
          transform: scale(1.1); box-shadow: 0 6px 14px rgba(198,167,107,0.35);
        }
        .ct7-cal-cell--selected {
          background: var(--ct7-brass) !important; border-color: var(--ct7-brass) !important; color: var(--ct7-ink) !important;
          font-weight: 700; box-shadow: 0 8px 18px rgba(198,167,107,0.4);
        }

        .ct7-cal-cell-dot {
          position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
          width: 3.5px; height: 3.5px; border-radius: 50%; background: rgba(43,51,46,0.3);
        }
        .ct7-cal-cell-dot--open { background: var(--ct7-ink); }

        .ct7-cal-msg { margin-top: 14px; padding: 8px 11px; border-radius: 9px; background: rgba(43,51,46,0.05); font-size: 11px; line-height: 1.5; color: var(--ct7-moss); text-align: center; }
        .ct7-cal-msg:empty { display: none; }
      `}</style>

      <div className="ct7-bk-head">
        <span className="ct7-bk-step">Step {String(step).padStart(2, '0')} / 03</span>
        <h2 className="ct7-bk-title">Reserve your <em>session</em>.</h2>
        {!booked && !limitReached && (
          <>
            <div className="ct7-bk-meta">
              {durationLabel && <span>{durationLabel} session</span>}
              {durationLabel && <span className="ct7-bk-meta-dot">&middot;</span>}
              <b>{feeLabel}</b>
              <span className="ct7-bk-meta-dot">&middot;</span>
              <span>IST</span>
            </div>
            <div className="ct7-bk-dots">
              {[1, 2, 3].map(n => (
                <span key={n} className={`ct7-bk-dot ${n < step ? 'ct7-bk-dot--done' : n === step ? 'ct7-bk-dot--active' : ''}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {booked ? (
        <div className="ct7-bk-layout ct7-bk-layout--narrow">
          <div className="ct7-bk-done">
            <div className="ct7-bk-done-ring"><Check size={26} style={{ color: 'var(--ct7-brass)' }} /></div>
            <h3>You&rsquo;re booked.</h3>
            <p>A confirmation is on its way to your inbox.</p>
          </div>
        </div>
      ) : limitReached ? (
        <div className="ct7-bk-layout ct7-bk-layout--narrow">
          <div className="ct7-bk-done">
            <h3>No available slots.</h3>
            <p>New session times open next month. Please reach out directly to schedule.</p>
          </div>
        </div>
      ) : (
        <div className="ct7-bk-layout">
          <div className="ct7-bk-row">
            {/* ── Column 1: the calendar, always here ── */}
            <div className="ct7-bk-col ct7-bk-col-cal">
              <span className="ct7-bk-label">Choose a date</span>
              <div className="ct7-bk-hang">
                <div className="ct7-bk-nail" />
                <div className="ct7-bk-paper-stack">
                  <div className="ct7-bk-paper-sheet ct7-bk-paper-sheet--2" />
                  <div className="ct7-bk-paper-sheet ct7-bk-paper-sheet--1" />
                  <div className="ct7-bk-paper">
                    <div className="ct7-bk-punch"><span /><span /><span /><span /><span /></div>
                    <span className="ct7-corner" style={{ top: 16, left: 16 }}>+</span>
                    <span className="ct7-corner" style={{ top: 16, right: 16 }}>+</span>
                    <div className="ct7-bk-paper-tab">{therapist.name}&rsquo;s availability</div>
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
              <div className="ct7-bk-col ct7-bk-col-slots" ref={slotsColRef}>
                <span className="ct7-bk-label">Choose a time</span>
                {/* <span className="ct7-bk-col-sub">{dateLabel}</span> */}
                {/* <span className="ct7-bk-tz">Times shown in IST</span> */}

                <div className="ct7-bk-col-card">
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
              <div className="ct7-bk-col ct7-bk-col-details" ref={detailsColRef}>
                <span className="ct7-bk-label">Your details</span>

                <div className="ct7-bk-col-card">
                  <div className="ct7-bk-summary">
                    <span className="ct7-bk-summary-text">
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

                  <div className="ct7-bk-fields">
                    <div className="ct7-bk-field">
                      <label htmlFor="ct7-bk-name">Your name{touched.name && !nameValid && <span className="ct7-bk-field-err"> &mdash; required</span>}</label>
                      <input
                        id="ct7-bk-name"
                        placeholder="e.g. Aditi Sharma"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, name: true }))}
                        data-invalid={touched.name && !nameValid ? 'true' : 'false'}
                      />
                    </div>
                    <div className="ct7-bk-field">
                      <label htmlFor="ct7-bk-email">Email (optional)</label>
                      <input id="ct7-bk-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="ct7-bk-field">
                      <label htmlFor="ct7-bk-phone">Phone{touched.phone && !phoneValid && <span className="ct7-bk-field-err"> &mdash; required</span>}</label>
                      <input
                        id="ct7-bk-phone"
                        type="tel"
                        placeholder="e.g. 98765 43210"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, phone: true }))}
                        data-invalid={touched.phone && !phoneValid ? 'true' : 'false'}
                      />
                    </div>
                  </div>
                  {error && <p className="ct7-bk-err">{error}</p>}
                  <button className="ct7-bk-submit" onClick={handleConfirm} disabled={loading}>
                    {loading ? <><Loader2 size={16} className="ct7-spin" /> Holding your place&hellip;</> : <>Pay  {feeLabel} & Book</>}
                  </button>
                  {/* <p className="ct7-bk-confidential-inline">Your details are encrypted and shared only with your therapist, within standard clinical confidentiality limits.</p> */}
                </div>
                {/* <button className="ct7-bk-col-change" onClick={handleBackToSlots}>Change time</button> */}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
