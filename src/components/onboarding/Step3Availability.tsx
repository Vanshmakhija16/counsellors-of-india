'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface Props {
  data: any
  onChange: (data: any) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}

const DAYS = [
  { id: 0, label: 'Sun' },
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
]

const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30',
]

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m === 0 ? '00' : m} ${ampm}`
}

export default function Step3Availability({ data, onChange, onSubmit, onBack, loading }: Props) {
  // availability: { dayOfWeek: number, startTime: string }[]
  const availability: { dayOfWeek: number; startTime: string }[] = data.availability ?? []
  const [activeDay, setActiveDay] = useState<number>(1)

  function isSelected(day: number, time: string) {
    return availability.some(a => a.dayOfWeek === day && a.startTime === time)
  }

  function toggleSlot(day: number, time: string) {
    const exists = isSelected(day, time)
    const updated = exists
      ? availability.filter(a => !(a.dayOfWeek === day && a.startTime === time))
      : [...availability, { dayOfWeek: day, startTime: time }]
    onChange({ ...data, availability: updated })
  }

  function getDaySlotCount(day: number) {
    return availability.filter(a => a.dayOfWeek === day).length
  }

  return (
    <div className="space-y-6">

      <p className="text-sm text-[#6b7280]">
        Select the days and times you are available for sessions.
        Clients will only see these slots when booking.
      </p>

      {/* Day selector */}
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map(day => {
          const count = getDaySlotCount(day.id)
          return (
            <button
              key={day.id}
              onClick={() => setActiveDay(day.id)}
              className={`
                py-3 rounded-xl text-center transition flex flex-col items-center gap-1
                ${activeDay === day.id
                  ? 'bg-[#2d4a47] text-white'
                  : count > 0
                  ? 'bg-[#d4e4e1] text-[#2d4a47] border border-[#a3b8b4]'
                  : 'bg-[#f2f0ed] text-[#6b7280] border border-[#e8e4df] hover:border-[#a3b8b4]'}
              `}
            >
              <span className="text-xs font-semibold">{day.label}</span>
              {count > 0 && (
                <span className={`text-xs ${activeDay === day.id ? 'text-[#d4e4e1]' : 'text-[#a3b8b4]'}`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Time grid for active day */}
      <div>
        <p className="text-xs font-semibold text-[#6b7280] uppercase tracking-widest mb-3">
          {DAYS.find(d => d.id === activeDay)?.label} — tap slots to toggle
        </p>
        <div className="grid grid-cols-4 gap-2">
          {TIME_SLOTS.map(time => (
            <button
              key={time}
              onClick={() => toggleSlot(activeDay, time)}
              className={`
                py-2.5 rounded-lg text-xs font-medium border transition
                ${isSelected(activeDay, time)
                  ? 'bg-[#a3b8b4] text-white border-[#a3b8b4]'
                  : 'bg-white text-[#6b7280] border-[#e8e4df] hover:border-[#a3b8b4]'}
              `}
            >
              {formatTime(time)}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#f2f0ed] rounded-xl p-4">
        <p className="text-xs font-semibold text-[#2d4a47] mb-2">
          Total slots selected: {availability.length}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {DAYS.filter(d => getDaySlotCount(d.id) > 0).map(d => (
            <span key={d.id}
              className="text-xs px-2 py-1 bg-[#d4e4e1] text-[#2d4a47] rounded-full">
              {d.label}: {getDaySlotCount(d.id)} slots
            </span>
          ))}
          {availability.length === 0 && (
            <span className="text-xs text-[#6b7280]">
              No slots selected yet — select at least one
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          ← Back
        </Button>
        <Button
          onClick={onSubmit}
          loading={loading}
          className="flex-grow"
          disabled={availability.length === 0}
        >
          Complete Setup →
        </Button>
      </div>
    </div>
  )
}