'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { TherapistProfile } from '../templateUtils'
import { getAvailableDays, slotToISO } from '../templateUtils'
import { Check, Loader2 } from 'lucide-react'
import { useRazorpay } from '@/lib/useRazorpay'
import { useQuietRoomMotion } from './_motion'

interface BookingProps {
  therapist: TherapistProfile
  bookedTimes?: string[]
}

export default function Booking({ therapist, bookedTimes = [] }: BookingProps) {
  const rootRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const availableDays = useMemo(
    () => getAvailableDays(therapist.availability, therapist.sessionDuration, 14, bookedTimes),
    [therapist.availability, therapist.sessionDuration, bookedTimes]
  )

  const [selectedDayIdx, setSelectedDayIdx] = useState(0)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [selectedSlotIso, setSelectedSlotIso] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [booked, setBooked] = useState(false)

  const { openRazorpay } = useRazorpay()

  const day = availableDays[selectedDayIdx]
  const slots = useMemo(() =>
    day ? day.slots.map(label => ({ label, iso: slotToISO(label, day.dateObj) })) : [],
  [day])

  useQuietRoomMotion(({ gsap, reduced }) => {
    const ctx = gsap.context(() => {
      if (reduced) { gsap.set('.qr-bk-glass', { opacity: 1, scale: 1 }); return }
      gsap.fromTo('.qr-bk-glass',
        { opacity: 0, scale: 0.96, filter: 'blur(6px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out',
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
    if (!name.trim() || !email.trim() || !phone.trim()) { setError('Please complete name, email, and phone.'); return }
    setError('')
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

  return (
    <section id="book" ref={rootRef} className="qr-dusk qr-section qr-bk">
      <style>{`
        .qr-bk { position: relative; overflow: hidden; }
        .qr-bk-grid { position: relative; z-index: 2; max-width: 1080px; margin: 0 auto;
          padding: 0 clamp(20px,5vw,56px); display: grid; grid-template-columns: 0.85fr 1.15fr; gap: clamp(32px,5vw,72px);
          align-items: start; }
        @media (max-width: 860px) { .qr-bk-grid { grid-template-columns: 1fr; gap: 36px; } }

        .qr-bk-pitch h2 { font-family: 'Spectral', serif; font-weight: 300; font-size: clamp(32px,4.4vw,56px);
          line-height: 1.08; letter-spacing: -0.02em; color: var(--qr-paper); margin: 12px 0 0; }
        .qr-bk-pitch h2 em { font-style: italic; color: var(--qr-honey); }
        .qr-bk-pitch p { color: rgba(242,238,228,0.74); margin-top: 22px; line-height: 1.7; max-width: 38ch; }
        .qr-bk-meta { margin-top: 34px; font-size: 13px; color: rgba(242,238,228,0.55); display: grid; gap: 8px; }
        .qr-bk-meta b { color: var(--qr-paper); font-weight: 500; }

        .qr-bk-glass { border-radius: 18px; padding: 28px; background: rgba(242,238,228,0.06);
          border: 1px solid rgba(242,238,228,0.1); backdrop-filter: blur(20px); }
        .qr-bk-label { font-family: 'IBM Plex Mono', monospace; text-transform: uppercase; letter-spacing: 0.08em;
          font-size: 10px; color: rgba(242,238,228,0.5); margin-bottom: 12px; display: block; }

        .qr-bk-days { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }
        .qr-bk-day { flex-shrink: 0; min-width: 62px; text-align: center; padding: 10px 8px; border-radius: 10px;
          background: rgba(242,238,228,0.04); border: 1px solid transparent; color: rgba(242,238,228,0.8);
          cursor: pointer; transition: all 250ms var(--qr-calm-out); }
        .qr-bk-day--on { background: rgba(199,154,61,0.16); border-color: var(--qr-honey); color: var(--qr-paper); }
        .qr-bk-day span { display: block; font-size: 10px; opacity: 0.6; text-transform: uppercase; letter-spacing: 0.06em; }
        .qr-bk-day b { font-family: 'Spectral', serif; font-weight: 400; font-size: 19px; }

        .qr-bk-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(82px, 1fr)); gap: 8px; margin-top: 18px; }
        .qr-bk-slot { padding: 9px 6px; border-radius: 9px; border: 1px solid rgba(242,238,228,0.12);
          background: rgba(242,238,228,0.03); color: rgba(242,238,228,0.82); font-size: 13px; cursor: pointer;
          transition: all 200ms var(--qr-calm-out); }
        .qr-bk-slot:hover { border-color: rgba(199,154,61,0.5); }
        .qr-bk-slot--on { background: var(--qr-honey); border-color: var(--qr-honey); color: var(--qr-ink); font-weight: 600;
          animation: qr-bk-pop 250ms var(--qr-settle); }
        @keyframes qr-bk-pop { from { transform: scale(0.8); } to { transform: scale(1); } }
        .qr-bk-empty { font-size: 13px; color: rgba(242,238,228,0.5); padding: 14px 0; }

        .qr-bk-fields { display: grid; gap: 16px; margin-top: 24px; }
        .qr-bk-field { position: relative; }
        .qr-bk-field input { width: 100%; background: transparent; border: none; border-bottom: 1px solid rgba(242,238,228,0.2);
          color: var(--qr-paper); font-family: 'IBM Plex Sans', sans-serif; font-size: 15px; padding: 10px 2px; outline: none; }
        .qr-bk-field input::placeholder { color: rgba(242,238,228,0.4); }
        .qr-bk-field::after { content: ''; position: absolute; left: 0; bottom: 0; height: 1px; width: 100%;
          background: var(--qr-honey); transform: scaleX(0); transform-origin: left; transition: transform 300ms var(--qr-calm-inout); }
        .qr-bk-field:focus-within::after { transform: scaleX(1); }

        .qr-bk-submit { width: 100%; margin-top: 22px; padding: 15px; border-radius: 12px; border: none; cursor: pointer;
          background: var(--qr-fig); color: var(--qr-paper); font-family: 'IBM Plex Sans', sans-serif; font-weight: 500;
          font-size: 15px; display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: box-shadow 300ms var(--qr-calm-out); }
        .qr-bk-submit:hover { box-shadow: 0 0 0 4px rgba(199,154,61,0.18); }
        .qr-bk-submit:disabled { opacity: 0.7; cursor: default; }
        .qr-bk-err { color: #e7a3a5; font-size: 13px; margin-top: 12px; }

        .qr-bk-done { text-align: center; padding: 30px 10px; }
        .qr-bk-done-ring { width: 56px; height: 56px; border-radius: 50%; background: rgba(199,154,61,0.18);
          display: grid; place-items: center; margin: 0 auto 16px; animation: qr-bk-pop 350ms var(--qr-settle); }
        .qr-bk-done h3 { font-family: 'Spectral', serif; font-weight: 400; font-size: 24px; color: var(--qr-paper); margin: 0 0 6px; }
        .qr-bk-done p { color: rgba(242,238,228,0.7); font-size: 14px; }

        .qr-bk-confidential { position: relative; z-index: 2; max-width: 1080px; margin: 48px auto 0;
          padding: 0 clamp(20px,5vw,56px); font-size: 11px; color: rgba(242,238,228,0.42); }
      `}</style>

      <div className="qr-window qr-window--static" style={{ right: '-6%', bottom: '-6%', opacity: 0.1 }} />

      <div className="qr-bk-grid">
        <div className="qr-bk-pitch">
          <span className="qr-eyebrow">Begin</span>
          <h2>Taking the first step is the <em>hardest part</em>.</h2>
          <p>I&rsquo;m here when you&rsquo;re ready. Pick a time that suits you — everything after that, we&rsquo;ll work out together.</p>
          <div className="qr-bk-meta qr-mono">
            <div>Session · <b>{therapist.sessionDuration ?? 50} minutes</b></div>
            <div>Fee · <b>{therapist.fee ? `₹${therapist.fee}` : 'On enquiry'}</b></div>
            {therapist.city && <div>Based in · <b>{therapist.city}</b></div>}
          </div>
        </div>

        <div className="qr-bk-glass">
          {booked ? (
            <div className="qr-bk-done">
              <div className="qr-bk-done-ring"><Check size={26} style={{ color: 'var(--qr-honey)' }} /></div>
              <h3>You&rsquo;re booked.</h3>
              <p>A confirmation is on its way to your inbox. Take a breath — the hard part is done.</p>
            </div>
          ) : (
            <>
              <span className="qr-bk-label">Choose a day</span>
              {availableDays.length === 0 ? (
                <p className="qr-bk-empty">No times are open just now — please check back soon.</p>
              ) : (
                <>
                  <div className="qr-bk-days">
                    {availableDays.map((d, idx) => (
                      <button key={idx} className={`qr-bk-day ${idx === selectedDayIdx ? 'qr-bk-day--on' : ''}`}
                        onClick={() => { setSelectedDayIdx(idx); setSelectedSlot(null); setSelectedSlotIso(null) }}>
                        <span>{d.dayName.slice(0, 3)}</span>
                        <b>{d.date}</b>
                        <span>{d.month}</span>
                      </button>
                    ))}
                  </div>

                  <div className="qr-bk-slots">
                    {slots.length === 0 ? (
                      <p className="qr-bk-empty">No slots this day — try another.</p>
                    ) : slots.map(s => (
                      <button key={s.label} className={`qr-bk-slot ${selectedSlot === s.label ? 'qr-bk-slot--on' : ''}`}
                        onClick={() => { setSelectedSlot(s.label); setSelectedSlotIso(s.iso) }}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </>
              )}

              <div className="qr-bk-fields">
                <div className="qr-bk-field"><input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} /></div>
                <div className="qr-bk-field"><input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                <div className="qr-bk-field"><input type="tel" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} /></div>
              </div>

              {error && <p className="qr-bk-err">{error}</p>}

              <button className="qr-bk-submit" onClick={handleConfirm} disabled={loading}>
                {loading ? <><Loader2 size={16} className="qr-spin" /> Holding your place…</>
                  : <>Confirm booking</>}
              </button>
            </>
          )}
        </div>
      </div>

      <p className="qr-bk-confidential qr-mono">
        Everything shared here is confidential, within standard clinical limits.
      </p>

      <style>{`.qr-spin { animation: qr-spin 1s linear infinite; } @keyframes qr-spin { to { transform: rotate(360deg); } }`}</style>
    </section>
  )
}
