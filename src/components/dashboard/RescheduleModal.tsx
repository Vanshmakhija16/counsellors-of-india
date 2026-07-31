'use client'

/**
 * RescheduleModal — therapist-side reschedule flow.
 *
 * Opens from the "Reschedule" button on dashboard/appointments. Shows a
 * month calendar of the therapist's OWN availability (reusing the exact
 * getAvailabilityForMonth() helper the public booking pages already use,
 * so "what counts as an open slot" never drifts between the client-facing
 * and therapist-facing views). Selecting a date reveals that day's open
 * time slots; selecting a slot + confirming calls the reschedule API,
 * which re-checks the slot is still free, moves the appointment, and
 * (if "Inform client" is on) notifies both sides -- email on Starter,
 * WhatsApp on Pro.
 */

import { useEffect, useMemo, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Loader2, Bell, BellOff } from 'lucide-react'
import {
  getAvailabilityForMonth,
  slotToISO,
  type AvailabilityData,
  type MonthDayAvailability,
} from '@/components/booking/templates/templateUtils'
import type { Appointment } from '@/lib/clinical/appointments'

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface RescheduleModalProps {
  appointment: Appointment
  onClose: () => void
  onRescheduled: (updated: Appointment) => void
}

export default function RescheduleModal({ appointment, onClose, onRescheduled }: RescheduleModalProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [availability, setAvailability] = useState<AvailabilityData | null>(null)
  const [durationMins, setDurationMins] = useState(50)
  const [bookedISO, setBookedISO] = useState<string[]>([])

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))
  const [selectedDate, setSelectedDate] = useState<MonthDayAvailability | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [informClient, setInformClient] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/dashboard/appointments/reschedule?appointment_id=${encodeURIComponent(appointment.id)}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to load availability')
        if (cancelled) return
        setAvailability(data.availability)
        setDurationMins(data.duration_mins ?? 50)
        setBookedISO(data.booked_times ?? [])
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load availability')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [appointment.id])

  const monthDays = useMemo(
    () => getAvailabilityForMonth(availability, durationMins, cursor.getFullYear(), cursor.getMonth(), bookedISO),
    [availability, durationMins, cursor, bookedISO]
  )

  const leadingBlanks = monthDays[0] ? (monthDays[0].dayOfWeek + 6) % 7 : 0
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + 6, 1)
  const canGoPrev = cursor.getTime() > minMonth.getTime()
  const canGoNext = cursor.getTime() < maxMonth.getTime()

  function changeMonth(delta: number) {
    setCursor(prev => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + delta, 1)
      if (next < minMonth) return minMonth
      if (next > maxMonth) return maxMonth
      return next
    })
  }

  function selectDate(day: MonthDayAvailability) {
    setSelectedDate(day)
    setSelectedSlot(null)
  }

  async function confirmReschedule() {
    if (!selectedDate || !selectedSlot) return
    setSubmitting(true)
    setError(null)
    try {
      const newScheduledAt = slotToISO(selectedSlot, selectedDate.dateObj)
      const res = await fetch('/api/dashboard/appointments/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointment_id: appointment.id,
          new_scheduled_at: newScheduledAt,
          inform_client: informClient,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to reschedule')
      onRescheduled(data.appointment)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reschedule')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-lg bg-white rounded-2xl border border-[#e8e4df] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8e4df]">
          <div>
            <h2 className="text-base font-semibold text-[#1c1c1e]">Reschedule</h2>
            <p className="text-xs text-[#6b7280] mt-0.5">{appointment.client_name}</p>
          </div>
          <button type="button" onClick={onClose} className="text-[#9ca3af] hover:text-[#1c1c1e] transition">
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-[#FF9933]" />
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-50 border border-red-100 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* Calendar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    disabled={!canGoPrev}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e8e4df] text-[#6b7280] disabled:opacity-30 hover:bg-gray-50"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="text-sm font-semibold text-[#1c1c1e]">
                    {MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}
                  </span>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    disabled={!canGoNext}
                    className="w-7 h-7 flex items-center justify-center rounded-lg border border-[#e8e4df] text-[#6b7280] disabled:opacity-30 hover:bg-gray-50"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-1">
                  {WEEKDAY_LABELS.map(w => (
                    <span key={w} className="text-[10px] font-medium text-[#9ca3af] text-center">{w}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: leadingBlanks }).map((_, i) => <span key={`b${i}`} />)}
                  {monthDays.map(day => {
                    const hasSlots = day.slots.length > 0 && !day.isPast
                    const isSelected = !!selectedDate && day.isoDate === selectedDate.isoDate
                    const isToday = day.dateObj.toDateString() === today.toDateString()
                    return (
                      <button
                        key={day.isoDate}
                        type="button"
                        disabled={!hasSlots}
                        onClick={() => selectDate(day)}
                        className={`h-9 rounded-lg text-xs font-medium transition ${
                          isSelected
                            ? 'bg-[#1c1c1e] text-white'
                            : hasSlots
                              ? 'bg-[#FFF7EE] text-[#C46800] hover:bg-[#FFEFD9]'
                              : 'text-[#d1d5db]'
                        } ${isToday && !isSelected ? 'ring-1 ring-[#FF9933]' : ''}`}
                      >
                        {day.date}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Slots for selected date */}
              {selectedDate && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">
                    Available times — {selectedDate.dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                  {selectedDate.slots.length === 0 ? (
                    <p className="text-xs text-[#9ca3af]">No open slots this day.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {selectedDate.slots.map(slot => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`h-9 rounded-lg text-xs font-semibold border transition ${
                            selectedSlot === slot
                              ? 'bg-[#FF9933] border-[#FF9933] text-white'
                              : 'bg-white border-[#e8e4df] text-[#1c1c1e] hover:border-[#FF9933]'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Inform client toggle */}
              <button
                type="button"
                onClick={() => setInformClient(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-[#e8e4df] mb-4"
              >
                <span className="flex items-center gap-2 text-xs font-medium text-[#1c1c1e]">
                  {informClient ? <Bell size={13} className="text-[#FF9933]" /> : <BellOff size={13} className="text-[#9ca3af]" />}
                  Inform client
                  <span className="text-[10px] text-[#9ca3af] font-normal">
                    ({informClient ? 'email or WhatsApp will be sent' : 'no notification sent'})
                  </span>
                </span>
                <span
                  className="w-9 h-5 rounded-full relative transition"
                  style={{ background: informClient ? '#FF9933' : '#e5e7eb' }}
                >
                  <span
                    className="absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                    style={{ left: informClient ? '18px' : '2px' }}
                  />
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-10 rounded-lg border border-[#e8e4df] text-sm font-medium text-[#6b7280] hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmReschedule}
                  disabled={!selectedSlot || submitting}
                  className="flex-1 h-10 rounded-lg bg-[#FF9933] text-white text-sm font-semibold hover:bg-[#E07A12] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Confirm reschedule
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
