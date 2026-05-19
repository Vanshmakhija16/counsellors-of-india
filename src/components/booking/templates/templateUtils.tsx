export interface Review {
  name: string
  text: string
  rating: number
}

export interface TherapistProfile {
  id?: string
  name: string
  initials?: string
  credentials: string
  city?: string
  bio: string
  fee: number
  sessionDuration: number
  rating?: number
  totalReviews?: number
  specialties: string[]
  languages: string[]
  experience?: number
  reviews?: Review[]
  // Extended profile fields
  tagline?: string
  approach_text?: string
  education?: string[]
  certifications?: string[]
  phone?: string
  whatsapp?: string
  instagram?: string
  linkedin?: string
  website?: string
  image?: string
  location?: string
  sessionMode?: string
  plan?: string
  // Availability JSON
  availability?: AvailabilityData | null
}

export interface TimeRange {
  start: string  // "09:00"
  end: string    // "17:00"
}

export interface DaySchedule {
  enabled: boolean
  ranges: TimeRange[]
}

export interface AvailabilityData {
  duration: number
  schedule: Record<string, DaySchedule>
}

// ── Day name helpers ──────────────────────────────────────────────────────
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

// ── Generate time slots from ranges + duration ────────────────────────────
export function generateSlotsFromRanges(
  ranges: TimeRange[],
  durationMin: number
): string[] {
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

// ── Fallback: generate slots 9am–6pm ─────────────────────────────────────
export function generateSlotsFromDuration(durationMin: number): string[] {
  return generateSlotsFromRanges(
    [{ start: '09:00', end: '18:00' }],
    durationMin
  )
}

// ── Get next N available days based on therapist's schedule ──────────────
export interface AvailableDay {
  label: string     // "Today", "Mon", "Tue" etc
  fullLabel: string // "Monday, 12 Jan"
  date: number
  month: string
  dayName: string   // "Monday"
  dateObj: Date
  slots: string[]   // generated time slots for this day
}

export function getAvailableDays(
  availability: AvailabilityData | null | undefined,
  durationMin: number,
  lookaheadDays = 14
): AvailableDay[] {
  const results: AvailableDay[] = []

  // Default schedule if no availability set
  const defaultRanges: TimeRange[] = [{ start: '09:00', end: '18:00' }]

  for (let i = 0; i < lookaheadDays && results.length < 14; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    d.setHours(0, 0, 0, 0)

    const dayName = DAY_NAMES[d.getDay()]
    let slots: string[] = []

    if (availability?.schedule) {
      const daySched = availability.schedule[dayName]
      if (daySched?.enabled && daySched.ranges.length > 0) {
        slots = generateSlotsFromRanges(daySched.ranges, availability.duration ?? durationMin)
      }
      // If day not enabled — skip it (no slots = no entry)
      if (!daySched?.enabled) continue
    } else {
      // No availability set — show all days with default 9-6
      slots = generateSlotsFromDuration(durationMin)
    }

    results.push({
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_SHORT[d.getDay()],
      fullLabel: `${dayName}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
      date: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
      dayName,
      dateObj: d,
      slots,
    })
  }

  return results
}

// ── Convert slot label + date to ISO string ───────────────────────────────
export function slotToISO(slotLabel: string, dateObj: Date): string {
  const [timePart, ampm] = slotLabel.split(' ')
  const [hoursStr, minutesStr] = timePart.split(':')
  let hours = parseInt(hoursStr)
  const minutes = parseInt(minutesStr)
  if (ampm === 'PM' && hours !== 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  const slotDate = new Date(dateObj)
  slotDate.setHours(hours, minutes, 0, 0)
  return slotDate.toISOString()
}

// ── Legacy helper (kept for backward compat) ──────────────────────────────
export function getNext7Days() {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    days.push({
      label: i === 0 ? 'Today' : DAY_SHORT[d.getDay()],
      date: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
    })
  }
  return days
}

export const UNAVAILABLE = ['10:30 AM', '1:00 PM', '3:30 PM']

export const SAMPLE_THERAPIST: TherapistProfile = {
  name: 'Dr. Vansh Makhija',
  credentials: 'M.Phil Clinical Psychology · RCI Licensed',
  city: 'Mumbai',
  bio: `I'm a licensed clinical psychologist with over 8 years of experience helping individuals navigate anxiety, depression, relationship challenges, and life transitions.`,
  fee: 1500,
  sessionDuration: 50,
  rating: 4.9,
  totalReviews: 127,
  specialties: ['Anxiety', 'Depression', 'Relationships', 'Grief', 'Self-Esteem', 'Work Stress'],
  languages: ['English', 'Hindi', 'Marathi'],
  experience: 8,
  reviews: [
    { name: 'A.M.', rating: 5, text: 'Dr. Priya helped me through one of the hardest years of my life.' },
    { name: 'R.V.', rating: 5, text: 'I was nervous about online therapy but she made it feel completely natural.' },
    { name: 'S.P.', rating: 5, text: 'Very professional, empathetic, and non-judgmental.' },
  ],
}
