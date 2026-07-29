'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getAvailabilityForMonth, type MonthDayAvailability } from '../templateUtils'
import type { AvailabilityData } from '../templateUtils'

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface MonthCalendarProps {
  availability: AvailabilityData | null | undefined
  durationMin: number
  bookedISO?: string[]
  selectedDate: Date | null
  onSelectDate: (day: MonthDayAvailability) => void
  monthsAhead?: number
}

export default function MonthCalendar({
  availability, durationMin, bookedISO = [], selectedDate, onSelectDate, monthsAhead = 6,
}: MonthCalendarProps) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const monthDays = useMemo(
    () => getAvailabilityForMonth(availability, durationMin, cursor.getFullYear(), cursor.getMonth(), bookedISO),
    [availability, durationMin, cursor, bookedISO]
  )

  // Week starts Monday — shift JS's Sunday-first dayOfWeek (0=Sun) back by one.
  const leadingBlanks = monthDays[0] ? (monthDays[0].dayOfWeek + 6) % 7 : 0
  const minMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const maxMonth = new Date(today.getFullYear(), today.getMonth() + monthsAhead, 1)
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

  return (
    <div className="ct8-cal">
      <div className="ct8-cal-heading">Select a Date &amp; Time</div>

      <div className="ct8-cal-head">
        <button type="button" className="ct8-cal-nav" onClick={() => changeMonth(-1)} disabled={!canGoPrev} aria-label="Previous month">
          <ChevronLeft size={16} />
        </button>
        <span className="ct8-cal-month">{MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}</span>
        <button type="button" className="ct8-cal-nav" onClick={() => changeMonth(1)} disabled={!canGoNext} aria-label="Next month">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="ct8-cal-weekdays">
        {WEEKDAY_LABELS.map(w => <span key={w}>{w}</span>)}
      </div>

      <div className="ct8-cal-grid">
        {Array.from({ length: leadingBlanks }).map((_, i) => <span key={`b${i}`} className="ct8-cal-cell ct8-cal-cell--blank" />)}

        {monthDays.map(day => {
          const isToday = day.dateObj.toDateString() === today.toDateString()
          const isSelected = !!selectedDate && day.dateObj.toDateString() === selectedDate.toDateString()
          const hasSlots = day.slots.length > 0 && !day.isPast

          return (
            <button
              key={day.isoDate}
              type="button"
              disabled={!hasSlots}
              onClick={() => onSelectDate(day)}
              className={[
                'ct8-cal-cell',
                hasSlots ? 'ct8-cal-cell--open' : 'ct8-cal-cell--muted',
                isToday ? 'ct8-cal-cell--today' : '',
                isSelected ? 'ct8-cal-cell--selected' : '',
              ].join(' ').trim()}
              aria-label={day.dateObj.toDateString() + (hasSlots ? ', available' : ', unavailable')}
              aria-pressed={isSelected}
            >
              {day.date}
              <span className="ct8-cal-cell-dot" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
