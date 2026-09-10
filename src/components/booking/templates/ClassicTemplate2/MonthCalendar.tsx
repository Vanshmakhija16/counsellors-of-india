'use client'

import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getAvailabilityForMonth, type MonthDayAvailability } from '../templateUtils'
import type { AvailabilityData } from '../templateUtils'

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

interface MonthCalendarProps {
  availability: AvailabilityData | null | undefined
  durationMin: number
  bookedISO?: string[]
  selectedDate: Date | null
  onSelectDate: (day: MonthDayAvailability) => void
  monthsAhead?: number
}

// Fork of ClassicTemplate7's MonthCalendar, restyled with ct2-cal-* class
// names (already defined in ClassicTemplate2/styles.ts) so it inherits
// CT2's "Rosewater Quiet" palette instead of reaching across templates.
// Interaction model is identical: month-grid, one entry per calendar day,
// only days with open slots are selectable.
export default function MonthCalendar({
  availability, durationMin, bookedISO = [], selectedDate, onSelectDate, monthsAhead = 6,
}: MonthCalendarProps) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const monthDays = useMemo(
    () => getAvailabilityForMonth(availability, durationMin, cursor.getFullYear(), cursor.getMonth(), bookedISO),
    [availability, durationMin, cursor, bookedISO]
  )

  const leadingBlanks = monthDays[0]?.dayOfWeek ?? 0
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

  const selectedDay = selectedDate && monthDays.find(d => d.dateObj.toDateString() === selectedDate.toDateString())
  const hasNoSlotsOnSelected = !!selectedDay && selectedDay.slots.length === 0

  return (
    <div className="ct2-cal">
      <div className="ct2-cal-head">
        <button type="button" className="ct2-cal-nav" onClick={() => changeMonth(-1)} disabled={!canGoPrev} aria-label="Previous month">
          <ChevronLeft size={15} />
        </button>
        <span className="ct2-cal-month ct2-serif">{MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}</span>
        <button type="button" className="ct2-cal-nav" onClick={() => changeMonth(1)} disabled={!canGoNext} aria-label="Next month">
          <ChevronRight size={15} />
        </button>
      </div>

      <div className="ct2-cal-weekdays">
        {WEEKDAY_LABELS.map(w => <span key={w}>{w}</span>)}
      </div>

      <div className="ct2-cal-grid">
        {Array.from({ length: leadingBlanks }).map((_, i) => <span key={`b${i}`} className="ct2-cal-cell ct2-cal-cell--blank" />)}

        {monthDays.map((day) => {
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
                'ct2-cal-cell',
                hasSlots ? 'ct2-cal-cell--open' : 'ct2-cal-cell--muted',
                isSelected ? 'ct2-cal-cell--selected' : '',
              ].join(' ').trim()}
              aria-label={day.dateObj.toDateString() + (hasSlots ? ', available' : ', unavailable')}
              aria-pressed={isSelected}
            >
              {day.date}
              {isToday && !isSelected && (
                <span className={`ct2-cal-cell-dot ${hasSlots ? 'ct2-cal-cell-dot--open' : ''}`} />
              )}
            </button>
          )
        })}
      </div>

      <div className="ct2-cal-msg">
        {!selectedDate
          ? 'Please choose a highlighted date to see available times.'
          : hasNoSlotsOnSelected
            ? 'There are no available times on this day.'
            : null}
      </div>
    </div>
  )
}
