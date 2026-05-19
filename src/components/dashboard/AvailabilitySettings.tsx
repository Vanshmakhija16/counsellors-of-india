'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Clock, Check, Plus, Trash2 } from 'lucide-react'

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

export interface AvailabilityData {
  duration: number
  schedule: WeekSchedule
}

// ── Constants ──────────────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DURATION_OPTIONS = [30, 45, 50, 60, 75, 90]

const DEFAULT_SCHEDULE: WeekSchedule = {
  Monday:    { enabled: true,  ranges: [{ start: '09:00', end: '13:00' }, { start: '14:00', end: '18:00' }] },
  Tuesday:   { enabled: true,  ranges: [{ start: '09:00', end: '13:00' }] },
  Wednesday: { enabled: true,  ranges: [{ start: '14:00', end: '18:00' }] },
  Thursday:  { enabled: true,  ranges: [{ start: '09:00', end: '17:00' }] },
  Friday:    { enabled: true,  ranges: [{ start: '10:00', end: '15:00' }] },
  Saturday:  { enabled: false, ranges: [] },
  Sunday:    { enabled: false, ranges: [] },
}

// ── Generate slots from ranges + duration ──────────────────────────────────
export function generateSlots(ranges: TimeRange[], durationMin: number): string[] {
  const slots: string[] = []
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
      current += durationMin
    }
  }
  return slots
}

// ── Component ──────────────────────────────────────────────────────────────
export default function AvailabilitySettings() {
  const supabase = createClient()
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE)
  const [duration, setDuration] = useState(50)
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
        .select('availability, session_duration_mins')
        .eq('id', user.id)
        .single()

      if (data?.availability) {
        const av = data.availability as AvailabilityData
        setSchedule(av.schedule ?? DEFAULT_SCHEDULE)
        setDuration(av.duration ?? data.session_duration_mins ?? 50)
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

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not logged in')

      const availability: AvailabilityData = { duration, schedule }

      const { error: dbErr } = await supabase
        .from('therapists')
        .update({
          availability,
          session_duration_mins: duration,
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

  const previewSlots = generateSlots(schedule[activeDay]?.ranges ?? [], duration)

  const totalWeeklySlots = Object.values(schedule)
    .filter(d => d.enabled)
    .reduce((acc, d) => acc + generateSlots(d.ranges, duration).length, 0)

  const enabledDays = Object.values(schedule).filter(d => d.enabled).length

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#a3b8b4] border-t-transparent" />
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

      {/* Session Duration */}
      <Card padding="lg" className="mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Session Duration</h2>
        <p className="text-sm text-gray-500 mb-4">
          Controls how slots are generated. A 50-min session at 9:00 AM means the next slot is 9:50 AM.
        </p>
        <div className="flex flex-wrap gap-2">
          {DURATION_OPTIONS.map(d => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition
                ${duration === d
                  ? 'bg-[#a3b8b4] border-[#a3b8b4] text-white'
                  : 'border-gray-200 text-gray-600 hover:border-[#7d9e99] hover:text-[#5a7f7a]'
                }`}>
              {d} min
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Currently: <span className="text-[#5a7f7a] font-medium">{duration} minutes</span> per session
          · <span className="text-gray-600 font-medium">{totalWeeklySlots} total weekly slots</span>
        </p>
      </Card>

      {/* Summary strip */}
      <div className="flex gap-4 mb-6">
        <Card padding="sm" className="flex-1 text-center">
          <p className="text-2xl font-semibold text-[#5a7f7a]">{enabledDays}</p>
          <p className="text-xs text-gray-500 mt-0.5">Active days</p>
        </Card>
        <Card padding="sm" className="flex-1 text-center">
          <p className="text-2xl font-semibold text-[#5a7f7a]">{totalWeeklySlots}</p>
          <p className="text-xs text-gray-500 mt-0.5">Weekly slots</p>
        </Card>
        <Card padding="sm" className="flex-1 text-center">
          <p className="text-2xl font-semibold text-[#5a7f7a]">{previewSlots.length}</p>
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
                    ${activeDay === day ? 'bg-[#d4e4e1]' : 'hover:bg-gray-50'}`}
                  onClick={() => setActiveDay(day)}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={e => { e.stopPropagation(); toggleDay(day) }}
                      className={`w-9 h-5 rounded-full transition relative shrink-0
                        ${schedule[day]?.enabled ? 'bg-[#a3b8b4]' : 'bg-gray-200'}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all
                        ${schedule[day]?.enabled ? 'left-4' : 'left-0.5'}`} />
                    </button>
                    <span className={`text-sm font-medium ${activeDay === day ? 'text-[#2d4a47]' : 'text-gray-700'}`}>
                      {day}
                    </span>
                  </div>
                  {schedule[day]?.enabled && (
                    <span className="text-xs text-gray-400">
                      {generateSlots(schedule[day].ranges, duration).length} slots
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Working Hours — {activeDay}
              </h2>
              {schedule[activeDay]?.enabled && (
                <button onClick={() => addRange(activeDay)}
                  className="flex items-center gap-1 text-xs text-[#5a7f7a] hover:text-[#2d4a47] font-medium transition">
                  <Plus size={13} /> Add range
                </button>
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
                                   focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] bg-white w-32" />
                      <span className="text-gray-400 text-sm">to</span>
                      <input type="time" value={range.end}
                        onChange={e => updateRange(activeDay, i, 'end', e.target.value)}
                        className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700
                                   focus:outline-none focus:ring-2 focus:ring-[#a3b8b4] bg-white w-32" />
                    </div>
                    <span className="text-xs text-gray-400 w-16 text-right shrink-0">
                      {generateSlots([range], duration).length} slots
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
                  className="mt-2 text-sm text-[#5a7f7a] hover:text-[#2d4a47] font-medium transition">
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
                    className="h-10 rounded-lg border border-[#b8ceca] bg-[#d4e4e1] text-[#2d4a47]
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

      {/* Info box */}
      <div className="mt-6 p-4 bg-[#f0f7f6] border border-[#b8ceca] rounded-xl">
        <p className="text-sm text-[#2d4a47] font-medium mb-1">How this works</p>
        <p className="text-xs text-[#5a7f7a] leading-relaxed">
          Your portfolio (Growth plan) shows the next 14 days with real available slots based on this schedule.
          When a client picks a slot and books, it's saved as an appointment and that slot is marked taken automatically.
        </p>
      </div>
    </div>
  )
}
