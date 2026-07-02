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
  /** Owners can't book past months looking for nothing — clamp navigation to a sane window. */
  monthsAhead?: number
}

/**
 * Month-grid date picker, in the same spirit as the reference screenshot:
 * weekday header row, full grid (leading blanks for the 1st's offset),
 * a filled accent circle on today, an outlined ring on the selected date,
 * and greyed/unclickable cells for days with no open slots. Below the
 * grid, a message panel mirrors the screenshot's copy exactly.
 */
export default function MonthCalendar({
  availability, durationMin, bookedISO = [], selectedDate, onSelectDate, monthsAhead = 6,
}: MonthCalendarProps) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d }, [])
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1))

  const monthDays = useMemo(
    () => getAvailabilityForMonth(availability, durationMin, cursor.getFullYear(), cursor.getMonth(), bookedISO),
    [availability, durationMin, cursor, bookedISO]
  )

  // Leading blank cells so day-of-week columns line up (Sunday-first, matching the screenshot).
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
    <div className="qr-cal">
      <div className="qr-cal-head">
        <button
          type="button"
          className="qr-cal-nav"
          onClick={() => changeMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="qr-cal-month">{MONTH_LABELS[cursor.getMonth()]} {cursor.getFullYear()}</span>
        <button
          type="button"
          className="qr-cal-nav"
          onClick={() => changeMonth(1)}
          disabled={!canGoNext}
          aria-label="Next month"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="qr-cal-weekdays">
        {WEEKDAY_LABELS.map(w => <span key={w}>{w}</span>)}
      </div>

      <div className="qr-cal-grid">
        {Array.from({ length: leadingBlanks }).map((_, i) => <span key={`b${i}`} className="qr-cal-cell qr-cal-cell--blank" />)}

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
                'qr-cal-cell',
                hasSlots ? 'qr-cal-cell--open' : 'qr-cal-cell--muted',
                isToday ? 'qr-cal-cell--today' : '',
                isSelected ? 'qr-cal-cell--selected' : '',
              ].join(' ').trim()}
              aria-label={day.dateObj.toDateString() + (hasSlots ? ', available' : ', unavailable')}
              aria-pressed={isSelected}
            >
              {day.date}
            </button>
          )
        })}
      </div>

      <div className="qr-cal-msg">
        {!selectedDate
          ? 'Please choose a highlighted date to see available times.'
          : hasNoSlotsOnSelected
            ? `There are no available times on this day.`
            : null}
      </div>
    </div>
  )
}
