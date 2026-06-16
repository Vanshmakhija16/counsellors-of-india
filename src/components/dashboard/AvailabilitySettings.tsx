'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Clock, Check, Plus, Trash2, Copy, CalendarOff, Wand2 } from 'lucide-react'

// ── Types ──────────────────────────────────────────────────────────────────
interface TimeRange {
  start: string  // "09:00"
  end: string    // "17:00"
}

interface DaySchedule {
  enabled: boolean
  ranges: TimeRange[]
}

type WeekSchedule = Record<string, DaySchedule>

// A date-specific override: a full day off, or custom hours for that one date.
export interface DateException {
  date: string                 // "2026-08-15"
  type: 'off' | 'custom'
  ranges?: TimeRange[]         // only for type: 'custom'
}

export interface AvailabilityData {
  duration: number
  schedule: WeekSchedule
  buffer?: number              // gap (mins) after each session
  exceptions?: DateException[] // date-specific overrides
}

// ── Constants ──────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DURATION_OPTIONS = [30, 45, 50, 60, 75, 90]
const BUFFER_OPTIONS = [0, 5, 10, 15, 30]

// One-tap presets to fill the whole week.
const PRESETS: Record<string, WeekSchedule> = {
  'Weekdays 9–5': Object.fromEntries(DAYS.map(d => [d, {
    enabled: !['Saturday', 'Sunday'].includes(d),
    ranges: ['Saturday', 'Sunday'].includes(d) ? [] : [{ start: '09:00', end: '17:00' }],
  }])),
  'Mornings only': Object.fromEntries(DAYS.map(d => [d, {
    enabled: d !== 'Sunday',
    ranges: d === 'Sunday' ? [] : [{ start: '09:00', end: '13:00' }],
  }])),
  'Evenings only': Object.fromEntries(DAYS.map(d => [d, {
    enabled: d !== 'Sunday',
    ranges: d === 'Sunday' ? [] : [{ start: '17:00', end: '21:00' }],
  }])),
  'All week 10–6': Object.fromEntries(DAYS.map(d => [d, {
    enabled: true,
    ranges: [{ start: '10:00', end: '18:00' }],
  }])),
}

const DEFAULT_SCHEDULE: WeekSchedule = {
  Monday:    { enabled: true,  ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  Tuesday:   { enabled: true,  ranges: [{ start: '09:00', end: '13:00' }] },
  Wednesday: { enabled: true,  ranges: [{ start: '14:00', end: '18:00' }] },
  Thursday:  { enabled: true,  ranges: [{ start: '09:00', end: '17:00' }] },
  Friday:    { enabled: true,  ranges: [{ start: '10:00', end: '15:00' }] },
  Saturday:  { enabled: false, ranges: [] },
  Sunday:    { enabled: false, ranges: [] },
}

// ── Generate slots from ranges + duration (+ buffer after each session) ─────
export function generateSlots(ranges: TimeRange[], durationMin: number, bufferMin = 0): string[] {
  const slots: string[] = []
  const step = durationMin + bufferMin
  for (const range of ranges) {
    const [startH, startM] = range.start.split(':').map(Number)
    const [endH, endM] = range.end.split(':').map(Number)
    let current = startH * 60 + startM
    const endTotal = endH * 60 + endM
    while (current + durationMin <= endTotal) {
      const h = Math.floor(current / 60)
      const m = current % 60
      const ampm = h >= 12 ? 'PM' : 'AM'
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
      slots.push(`${displayH}:${m.toString().padStart(2, '0')} ${ampm}`)
      current += step
    }
  }
  return slots
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AvailabilitySettings() {
  const supabase = createClient()
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE)
  const [duration, setDuration] = useState(50)
  const [buffer, setBuffer] = useState(0)
  const [exceptions, setExceptions] = useState<DateException[]>([])
  const [activeDay, setActiveDay] = useState('Monday')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // ── Load saved availability on mount ──────────────────────────────────
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('therapists')
        .select('availability, session_duration_mins, availability_buffer_mins, availability_exceptions')
        .eq('id', user.id)
        .single()

      if (data?.availability) {
        const av = data.availability as AvailabilityData
        setSchedule(av.schedule ?? DEFAULT_SCHEDULE)
        setDuration(av.duration ?? data.session_duration_mins ?? 50)
        // Buffer/exceptions live in their own columns (fall back to JSON for old saves).
        setBuffer((data as any).availability_buffer_mins ?? av.buffer ?? 0)
        setExceptions((data as any).availability_exceptions ?? av.exceptions ?? [])
      } else if (data?.session_duration_mins) {
        setDuration(data.session_duration_mins)
      }
      setLoading(false)
    }
    load()
  }, [])

  function toggleDay(day: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        ranges: prev[day].ranges.length === 0 ? [{ start: '09:00', end: '17:00' }] : prev[day].ranges,
      }
    }))
  }

 
  


  function updateRange(day: string, index: number, field: 'start' | 'end', value: string) {
    setSchedule(prev => {
      const ranges = [...prev[day].ranges]
      ranges[index] = { ...ranges[index], [field]: value }
      return { ...prev, [day]: { ...prev[day], ranges } }
    })
  }

  function addRange(day: string) {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: [...prev[day].ranges, { start: '09:00', end: '13:00' }]
      }
    }))
  }

  function removeRange(day: string, index: number) {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        ranges: prev[day].ranges.filter((_, i) => i !== index)
      }
    }))
  }

  // Apply a one-tap preset to the whole week.
  function applyPreset(name: string) {
    const preset = PRESETS[name]
    if (preset) setSchedule(structuredClone(preset))
  }

  // Copy the active day's hours to every other day.
  function copyToAllDays() {
    const src = schedule[activeDay]
    setSchedule(prev => {
      const next: WeekSchedule = {}
      for (const day of DAYS) {
        next[day] = day === activeDay ? prev[day] : structuredClone(src)
      }
      return next
    })
  }

  // ── Date exceptions ──
  function addException(type: 'off' | 'custom') {
    const today = new Date().toISOString().slice(0, 10)
    setExceptions(prev => [
      ...prev,
      type === 'off'
        ? { date: today, type: 'off' }
        : { date: today, type: 'custom', ranges: [{ start: '10:00', end: '14:00' }] },
    ])
  }

  function updateException(i: number, patch: Partial<DateException>) {
    setExceptions(prev => prev.map((e, idx) => (idx === i ? { ...e, ...patch } : e)))
  }

  function updateExceptionRange(i: number, field: 'start' | 'end', value: string) {
    setExceptions(prev => prev.map((e, idx) => {
      if (idx !== i) return e
      const ranges = e.ranges?.length ? [...e.ranges] : [{ start: '10:00', end: '14:00' }]
      ranges[0] = { ...ranges[0], [field]: value }
      return { ...e, ranges }
    }))
  }

  function removeException(i: number) {
    setExceptions(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const availability: AvailabilityData = { duration, schedule, buffer, exceptions }

      const { error: dbErr } = await supabase
        .from('therapists')
        .update({
          availability,
          session_duration_mins: duration,
          availability_buffer_mins: buffer,
          availability_exceptions: exceptions,
        })
        .eq('id', user.id)

      if (dbErr) throw dbErr

      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const previewSlots = generateSlots(schedule[activeDay]?.ranges ?? [], duration, buffer)

  const totalWeeklySlots = Object.values(schedule)
    .filter(d => d.enabled)
    .reduce((acc, d) => acc + generateSlots(d.ranges, duration, buffer).length, 0)

  const enabledDays = Object.values(schedule).filter(d => d.enabled).length

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#FF9933] border-t-transparent" />
    </div>
  )

  return (
    <div className="p-8 max-w-4xl">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}>
            Availability
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Set your working hours — clients see real dates &amp; slots on your portfolio
          </p>
        </div>
        <Button onClick={handleSave} loading={saving} className="flex items-center gap-2">
          {saved ? <><Check size={15} /> Saved!</> : 'Save Changes'}
        </Button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
          {error}
        </div>
      )}

      {/* Quick presets — fill the whole week in one tap */}
      {/* <Card padding="md" className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Wand2 size={15} className="text-[#C46800]" />
          <h2 className="text-sm font-semibold text-gray-900">Quick fill</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(PRESETS).map(name => (
            <button
              key={name}
              onClick={() => applyPreset(name)}
              className="px-3.5 py-2 rounded-lg text-sm font-medium border border-gray-200
                         text-gray-600 hover:border-[#E07A12] hover:text-[#C46800] transition">
              {name}
            </button>
          ))}
        </div>
      </Card> */}

      {/* Session Duration */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Session Duration</h2>
        <p className="text-sm text-gray-500 mb-4">
          {/* Controls how slots are generated. A 50-min session at 9:00 AM means the next slot is 9:50 AM. */}
        </p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                ${duration === d
                  ? 'bg-[#FF9933] border-[#FF9933] text-white'
                  : 'border-gray-200 text-gray-600 hover:border-[#E07A12] hover:text-[#C46800]'
                }`}>
              {d} min
            </button>
          ))}
        </div>
        {/* Buffer between sessions */}
        <div className="mt-5 pt-5 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">Buffer between sessions</h3>
          <p className="text-xs text-gray-500 mb-3">
            {/* A gap added after each session (e.g. notes, breaks) before the next slot starts. */}
          </p>
          <div className="flex flex-wrap gap-2">
            {BUFFER_OPTIONS.map(b => (
              <button
                key={b}
                onClick={() => setBuffer(b)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                  ${buffer === b
                    ? 'bg-[#FF9933] border-[#FF9933] text-white'
                    : 'border-gray-200 text-gray-600 hover:border-[#E07A12] hover:text-[#C46800]'
                  }`}>
                {b === 0 ? 'None' : `${b} min`}
              </button>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Currently: <span className="text-[#C46800] font-medium">{duration} minutes</span> per session
          {buffer > 0 && <> · <span className="text-[#C46800] font-medium">{buffer} min buffer</span></>}
          · <span className="text-gray-600 font-medium">{totalWeeklySlots} total weekly slots</span>
        </p>
      </Card>

      {/* Summary strip */}
      <div className="flex gap-4 mb-6">
        <Card padding="sm" className="flex-1 text-center">
          <p className="text-2xl font-semibold text-[#C46800]">{enabledDays}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active days</p>
        </Card>
        <Card padding="sm" className="flex-1 text-center">
          <p className="text-2xl font-semibold text-[#C46800]">{totalWeeklySlots}</p>
          <p className="text-xs text-gray-500 mt-0.5">Weekly slots</p>
        </Card>
        <Card padding="sm" className="flex-1 text-center">
          <p className="text-2xl font-semibold text-[#C46800]">{previewSlots.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">Slots on {activeDay.slice(0, 3)}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — Day toggles */}
        <div className="lg:col-span-1">
          <Card padding="md">
            <h2 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">Working Days</h2>
            <div className="space-y-1">
              {DAYS.map(day => (
                <div key={day}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition
                    ${activeDay === day ? 'bg-[#FFEFD9]' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveDay(day)}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={e => { e.stopPropagation(); toggleDay(day) }}
                      className={`w-9 h-5 rounded-full transition relative shrink-0
                        ${schedule[day]?.enabled ? 'bg-[#FF9933]' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all
                        ${schedule[day]?.enabled ? 'left-4' : 'left-0.5'}`} />
                    </button>
                    <span className={`text-sm font-medium ${activeDay === day ? 'text-[#9A5200]' : 'text-gray-700'}`}>
                      {day}
                    </span>
                  </div>
                  {schedule[day]?.enabled && (
                    <span className="text-xs text-gray-400">
                      {generateSlots(schedule[day].ranges, duration, buffer).length} slots
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right — Time range editor + preview */}
        <div className="lg:col-span-2 space-y-4">

          {/* Time range editor */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Working Hours — {activeDay}
              </h2>
              {schedule[activeDay]?.enabled && (
                <div className="flex items-center gap-3">
                  <button onClick={copyToAllDays}
                    className="flex items-center gap-1 text-xs text-[#C46800] hover:text-[#9A5200] font-medium transition">
                    <Copy size={13} /> Set for all days
                  </button>
                  <button onClick={() => addRange(activeDay)}
                    className="flex items-center gap-1 text-xs text-[#C46800] hover:text-[#9A5200] font-medium transition">
                    <Plus size={13} /> Add range
                  </button>
                </div>
              )}
            </div>

            {schedule[activeDay]?.enabled ? (
              <div className="space-y-3">
                {schedule[activeDay].ranges.map((range, i) => (
                  <div key={i} className="flex items-center gap-3 bg-stone-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 flex-1">
                      <Clock size={14} className="text-gray-400 shrink-0" />
                      <input type="time" value={range.start}
                        onChange={e => updateRange(activeDay, i, 'start', e.target.value)}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700
                                   focus:outline-none focus:ring-2 focus:ring-[#FF9933] bg-white w-32" />
                      <span className="text-gray-400 text-sm">to</span>
                      <input type="time" value={range.end}
                        onChange={e => updateRange(activeDay, i, 'end', e.target.value)}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700
                                   focus:outline-none focus:ring-2 focus:ring-[#FF9933] bg-white w-32" />
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right shrink-0">
                      {generateSlots([range], duration, buffer).length} slots
                    </span>
                    {schedule[activeDay].ranges.length > 1 && (
                      <button onClick={() => removeRange(activeDay, i)}
                        className="text-gray-300 hover:text-red-500 transition shrink-0">
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Clock size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{activeDay} is a day off.</p>
                <button onClick={() => toggleDay(activeDay)}
                  className="mt-2 text-sm text-[#C46800] hover:text-[#9A5200] font-medium transition">
                  Enable {activeDay} →
                </button>
              </div>
            )}
          </Card>

          {/* Live slot preview */}
          {schedule[activeDay]?.enabled && previewSlots.length > 0 && (
            <Card padding="md">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Slot Preview — {activeDay} · {duration} min each
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {previewSlots.map(slot => (
                  <div key={slot}
                    className="h-10 rounded-lg border border-[#F5D9B0] bg-[#FFEFD9] text-[#9A5200]
                               text-xs font-medium flex items-center justify-center">
                    {slot}
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3">
                These exact slots will appear on your portfolio when clients visit on a {activeDay}.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Date exceptions — time off / one-off hours */}
      <Card padding="md" className="mt-6">
        <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CalendarOff size={15} className="text-[#C46800]" />
            <h2 className="text-sm font-semibold text-gray-900">Time off &amp; exceptions</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => addException('off')}
              className="flex items-center gap-1 text-xs text-[#C46800] hover:text-[#9A5200] font-medium transition">
              <Plus size={13} /> Day off
            </button>
            <button onClick={() => addException('custom')}
              className="flex items-center gap-1 text-xs text-[#C46800] hover:text-[#9A5200] font-medium transition">
              <Plus size={13} /> Custom hours
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Override a specific date — block a holiday, or open one-off hours — without changing your weekly pattern.
        </p>

        {exceptions.length === 0 ? (
          <p className="text-xs text-gray-400 py-3 text-center">No exceptions. Your weekly schedule applies to every date.</p>
        ) : (
          <div className="space-y-2">
            {exceptions.map((ex, i) => (
              <div key={i} className="flex items-center gap-3 bg-stone-50 rounded-xl p-3 flex-wrap">
                <input type="date" value={ex.date}
                  onChange={e => updateException(i, { date: e.target.value })}
                  className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700
                             focus:outline-none focus:ring-2 focus:ring-[#FF9933] bg-white" />
                {ex.type === 'off' ? (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-100">
                    Day off
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-400 shrink-0" />
                    <input type="time" value={ex.ranges?.[0]?.start ?? '10:00'}
                      onChange={e => updateExceptionRange(i, 'start', e.target.value)}
                      className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700
                                 focus:outline-none focus:ring-2 focus:ring-[#FF9933] bg-white w-28" />
                    <span className="text-gray-400 text-sm">to</span>
                    <input type="time" value={ex.ranges?.[0]?.end ?? '14:00'}
                      onChange={e => updateExceptionRange(i, 'end', e.target.value)}
                      className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700
                                 focus:outline-none focus:ring-2 focus:ring-[#FF9933] bg-white w-28" />
                  </div>
                )}
                <button onClick={() => removeException(i)}
                  className="ml-auto text-gray-300 hover:text-red-500 transition shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Info box */}
      <div className="mt-6 p-4 bg-[#FFF7EE] border border-[#F5D9B0] rounded-xl">
        <p className="text-sm text-[#9A5200] font-medium mb-1">How this works</p>
        <p className="text-xs text-[#C46800] leading-relaxed">
          Your portfolio (Growth plan) shows the next 14 days with real available slots based on this schedule.
          When a client picks a slot and books, it's saved as an appointment and that slot is marked taken automatically.
        </p>
      </div>
    </div>
  )
}
