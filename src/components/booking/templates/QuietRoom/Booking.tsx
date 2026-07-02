'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { slotToISO, type MonthDayAvailability } from '../templateUtils'
import { Check, Loader2, Sun, Sunset, Moon, ChevronLeft } from 'lucide-react'
import { useRazorpay } from '@/lib/useRazorpay'

// ── Temporary: send to WhatsApp instead of API/payment ──────────────────
const USE_WHATSAPP = true
function openWhatsApp(therapist: TherapistProfile, name: string, slot: string, date: string) {
  const num = (therapist.whatsapp ?? therapist.phone ?? '').replace(/\D/g, '')
  const msg = `Hi, I'd like to book a session.%0AName: ${encodeURIComponent(name)}%0ADate & Time: ${encodeURIComponent(date + ', ' + slot)}%0AService Duration: ${therapist.sessionDuration ?? 50} mins`
  window.open(`https://wa.me/${num}?text=${msg}`, '_blank')
}
import { useQuietRoomMotion } from './_motion'
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
    { key: 'afternoon', label: 'Afternoon',  Icon: Sunset, slots: afternoon },
    { key: 'evening',   label: 'Evening',    Icon: Moon,   slots: evening   },
  ].filter(g => g.slots.length > 0)
}

export default function Booking({ therapist, bookedTimes = [] }: BookingProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [selectedDate, setSelectedDate]     = useState<Date | null>(null)
  const [selectedDay, setSelectedDay]       = useState<MonthDayAvailability | null>(null)
  const [selectedSlot, setSelectedSlot]     = useState<string | null>(null)
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null)
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [booked, setBooked]   = useState(false)

  const { openRazorpay } = useRazorpay()

  const slots = useMemo(() =>
    selectedDay ? selectedDay.slots.map(label => ({ label, iso: slotToISO(label, selectedDay.dateObj) })) : [],
  [selectedDay])

  const slotGroups = useMemo(() => groupSlotsByPeriod(slots), [slots])

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

  useQuietRoomMotion(({ gsap, reduced }) => {
    const ctx = gsap.context(() => {
      if (reduced) { gsap.set(rootRef.current, { opacity: 1 }); return }
      gsap.fromTo(rootRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: rootRef.current, start: 'top 70%' } })
    }, rootRef)
    return () => ctx.revert()
  })

  if (!mounted) return null

  async function doBooking() {
    const res = await fetch('/api/book', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        therapist_id: therapist.id, client_name: name, client_email: email, client_phone: phone,
        scheduled_at: selectedSlotIso, duration_mins: therapist.sessionDuration, service_price: therapist.fee ?? null,
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Booking failed. Please try again.')
    setBooked(true)
  }

  async function handleConfirm() {
    if (!selectedSlotIso) { setError('Please choose a time.'); return }
    if (!name.trim() || !phone.trim()) { setError('Please complete name and phone.'); return }
    setError('')
    if (USE_WHATSAPP) {
      const dateLabel = selectedDay?.dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }) ?? ''
      openWhatsApp(therapist, name, selectedSlot ?? '', dateLabel)
      setBooked(true)
      return
    }
    if (therapist.fee && therapist.fee > 0) {
      setLoading(true)
      await openRazorpay({
        amount: therapist.fee, description: `Therapy session with ${therapist.name}`,
        receipt: `book_${therapist.id}_${Date.now()}`,
        prefill: { name, email, contact: phone },
        onSuccess: async (payload) => {
          const v = await fetch('/api/razorpay?action=verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
          })
          const vd = await v.json()
          if (!v.ok || !vd.verified) throw new Error('Payment verification failed.')
          await doBooking()
        },
        onFailure: (msg) => { setError(msg); setLoading(false) },
      })
      setLoading(false)
    } else {
      try { setLoading(true); await doBooking() }
      catch (e) { setError(e instanceof Error ? e.message : 'Network error. Please try again.') }
      finally { setLoading(false) }
    }
  }

  // ── chosen date label for the slots header ──────────────────────────────
  const datLabel = selectedDay
    ? selectedDay.dateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  return (
    <section id="book" ref={rootRef} className="qr-dusk qr-section qr-bk">
      <style>{`
        .qr-bk { position: relative; overflow: hidden; }

        /* ── outer wrapper — always 2 columns: left panel + right form ── */
        .qr-bk-layout {
          position: relative; z-index: 2;
          max-width: 900px; margin: 0 auto;
          padding: 0 clamp(16px,4vw,40px);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
          align-items: start;
        }
        @media (max-width: 640px) {
          .qr-bk-layout { grid-template-columns: 1fr; gap: 20px; }
        }

        /* ── left panel: calendar OR slots (swap via JS, same space) ─── */
        .qr-bk-left { min-width: 0; }

        /* ── right panel: always the form ──────────────────────────────── */
        .qr-bk-right { min-width: 0; display: flex; flex-direction: column; gap: 16px; }

        .qr-bk-label {
          font-family: 'IBM Plex Mono', monospace; text-transform: uppercase;
          letter-spacing: 0.08em; font-size: 10px; color: rgba(242,238,228,0.5);
          margin-bottom: 8px; display: block;
        }

        /* ── back button ──────────────────────────────────────────────── */
        .qr-bk-back {
          display: inline-flex; align-items: center; gap: 5px; margin-bottom: 12px;
          font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase;
          letter-spacing: 0.07em;  cursor: pointer;
           background: none; color: var(--qr-paper); border: none; padding: 0; transition: color 200ms;
        }
        .qr-bk-back:hover { color: var(--qr-honey); }

        /* ── slot groups ──────────────────────────────────────────────── */
        .qr-bk-slotgroup { margin-bottom: 16px; }
        .qr-bk-slotgroup:last-child { margin-bottom: 0; }
        .qr-bk-slotgroup-head {
          display: flex; align-items: center; gap: 6px; margin-bottom: 9px;
          font-family: 'IBM Plex Mono', monospace; font-size: 10.5px;
          text-transform: uppercase; letter-spacing: 0.07em; color: rgba(242,238,228,0.5);
        }
        .qr-bk-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(82px, 1fr)); gap: 8px; }
        .qr-bk-slot {
          padding: 9px 6px; border-radius: 9px; border: 1px solid rgba(242,238,228,0.12);
          background: rgba(242,238,228,0.03); color: rgba(242,238,228,0.82);
          font-size: 13px; cursor: pointer; transition: all 200ms var(--qr-calm-out);
        }
        .qr-bk-slot:hover { border-color: rgba(199,154,61,0.5); background: rgba(199,154,61,0.06); }
        .qr-bk-slot--on {
          background: var(--qr-honey); border-color: var(--qr-honey);
          color: var(--qr-ink); font-weight: 600;
          animation: qr-bk-pop 250ms var(--qr-settle);
        }
        .qr-bk-empty { font-size: 13px; color: rgba(242,238,228,0.5); padding: 14px 0; }
        @keyframes qr-bk-pop { from { transform: scale(0.8); } to { transform: scale(1); } }

        /* ── calendar ─────────────────────────────────────────────────── */
        .qr-cal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
        .qr-cal-month { font-family: 'Spectral', serif; font-weight: 400; font-size: 13px; color: var(--qr-paper); }
        .qr-cal-nav {
          width: 22px; height: 22px; border-radius: 50%;
          border: 1px solid rgba(242,238,228,0.14); background: rgba(242,238,228,0.04);
          color: rgba(242,238,228,0.8); display: grid; place-items: center;
          cursor: pointer; transition: all 200ms var(--qr-calm-out);
        }
        .qr-cal-nav:hover:not(:disabled) { border-color: var(--qr-honey); color: var(--qr-honey); }
        .qr-cal-nav:disabled { opacity: 0.25; cursor: default; }
        .qr-cal-weekdays { display: grid; grid-template-columns: repeat(7,1fr); gap: 1px; margin-bottom: 2px; }
        .qr-cal-weekdays span { text-align: center; font-size: 8px; font-weight: 600; letter-spacing: 0.04em; color: rgba(242,238,228,0.4); padding: 2px 0; }
        .qr-cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 1px; }
        .qr-cal-cell {
          aspect-ratio: 1; display: grid; place-items: center; border-radius: 50%;
          font-size: 10px; background: transparent; border: 1px solid transparent;
          color: rgba(242,238,228,0.34); cursor: default; transition: all 180ms var(--qr-calm-out);
        }
        .qr-cal-cell--blank { visibility: hidden; }
        .qr-cal-cell--muted { color: rgba(242,238,228,0.22); }
        .qr-cal-cell--open { color: var(--qr-paper); cursor: pointer; }
        .qr-cal-cell--open:hover { background: rgba(199,154,61,0.14); }
        .qr-cal-cell--today.qr-cal-cell--open { background: rgba(199,154,61,0.22); font-weight: 600; }
        .qr-cal-cell--today.qr-cal-cell--muted { border-color: rgba(242,238,228,0.18); }
        .qr-cal-cell--selected { background: var(--qr-honey) !important; color: var(--qr-ink) !important; font-weight: 700; animation: qr-bk-pop 250ms var(--qr-settle); }
        .qr-cal-msg { margin-top: 8px; padding: 8px 10px; border-radius: 8px; background: rgba(242,238,228,0.04); font-size: 11px; line-height: 1.5; color: rgba(242,238,228,0.62); }
        .qr-cal-msg:empty { display: none; margin: 0; padding: 0; }

        /* ── form fields ──────────────────────────────────────────────── */
        .qr-bk-fields { display: grid; gap: 12px; }
        .qr-bk-field { position: relative; }
        .qr-bk-field input {
          width: 100%; background: transparent; border: none;
          border-bottom: 1px solid rgba(242,238,228,0.2); color: var(--qr-paper);
          font-family: 'IBM Plex Sans', sans-serif; font-size: 13px;
          padding: 8px 2px; outline: none;
        }
        .qr-bk-field input::placeholder { color: rgba(242,238,228,0.4); }
        .qr-bk-field::after {
          content: ''; position: absolute; left: 0; bottom: 0; height: 1px; width: 100%;
          background: var(--qr-honey); transform: scaleX(0); transform-origin: left;
          transition: transform 300ms var(--qr-calm-inout);
        }
        .qr-bk-field:focus-within::after { transform: scaleX(1); }

        .qr-bk-submit {
          width: 100%; padding: 12px; border-radius: 10px; border: none; cursor: pointer;
          background: var(--qr-fig); color: var(--qr-paper);
          font-family: 'IBM Plex Sans', sans-serif; font-weight: 500; font-size: 13px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: box-shadow 300ms var(--qr-calm-out);
        }
        .qr-bk-submit:hover { box-shadow: 0 0 0 4px rgba(199,154,61,0.18); }
        .qr-bk-submit:disabled { opacity: 0.7; cursor: default; }
        .qr-bk-err { color: #e7a3a5; font-size: 13px; }

        /* ── success ──────────────────────────────────────────────────── */
        .qr-bk-done { text-align: center; padding: 30px 10px; }
        .qr-bk-done-ring {
          width: 56px; height: 56px; border-radius: 50%; background: rgba(199,154,61,0.18);
          display: grid; place-items: center; margin: 0 auto 16px;
          animation: qr-bk-pop 350ms var(--qr-settle);
        }
        .qr-bk-done h3 { font-family: 'Spectral', serif; font-weight: 400; font-size: 24px; color: var(--qr-paper); margin: 0 0 6px; }
        .qr-bk-done p { color: rgba(242,238,228,0.7); font-size: 14px; }

        .qr-bk-confidential {
          position: relative; z-index: 2; max-width: 900px; margin: 48px auto 0;
          padding: 0 clamp(20px,5vw,56px); font-size: 11px; color: rgba(242,238,228,0.42);
        }
        .qr-spin { animation: qr-spin 1s linear infinite; }
        @keyframes qr-spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="qr-window qr-window--static" style={{ right: '-6%', bottom: '-6%', opacity: 0.1 }} />

      <div className="qr-bk-pitch" style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)', marginBottom: 32 }}>
        <span className="qr-eyebrow">Begin</span>
      </div>

      {booked ? (
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 900, margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
          <div className="qr-bk-done">
            <div className="qr-bk-done-ring"><Check size={26} style={{ color: 'var(--qr-honey)' }} /></div>
            <h3>You&rsquo;re booked.</h3>
            <p>A confirmation is on its way to your inbox. Take a breath — the hard part is done.</p>
          </div>
        </div>
      ) : (
        <div className="qr-bk-layout">

          {/* ── LEFT: calendar → replaced by slots on date select ── */}
          <div className="qr-bk-left">
            {!selectedDay ? (
              <>
                <span className="qr-bk-label">Choose a date</span>
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
                {/* back → calendar */}
                <button className="qr-bk-back" onClick={handleBackToCalendar}>
                  <ChevronLeft size={12} /> Back to calendar
                </button>
                <span className="qr-bk-label">Choose a time — {datLabel}</span>

                {slots.length === 0 ? (
                  <div className="qr-bk-empty">No available times on this day.</div>
                ) : (
                  slotGroups.map(group => (
                    <div key={group.key} className="qr-bk-slotgroup">
                      <div className="qr-bk-slotgroup-head">
                        <group.Icon size={12} /> {group.label}
                      </div>
                      <div className="qr-bk-slots">
                        {group.slots.map(s => (
                          <button
                            key={s.label}
                            className={`qr-bk-slot ${selectedSlot === s.label ? 'qr-bk-slot--on' : ''}`}
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

          {/* ── RIGHT: form — always visible ── */}
          <div className="qr-bk-right">
            <div className="qr-bk-fields">
              <div className="qr-bk-field">
                <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="qr-bk-field">
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="qr-bk-field">
                <input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
            </div>
            {error && <p className="qr-bk-err">{error}</p>}
            <button className="qr-bk-submit" onClick={handleConfirm} disabled={loading}>
              {loading
                ? <><Loader2 size={16} className="qr-spin" /> Holding your place…</>
                : <>Confirm booking</>}
            </button>
          </div>

        </div>
      )}

      <p className="qr-bk-confidential qr-mono">
        Everything shared here is confidential, within standard clinical limits.
      </p>
    </section>
  )
}
