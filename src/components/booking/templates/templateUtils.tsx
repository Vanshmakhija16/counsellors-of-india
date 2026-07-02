export interface Review {
  name: string
  text: string
  rating: number
}

// ── Name helpers ──────────────────────────────────────────────────────────
const HONORIFICS = new Set([
  'dr', 'mr', 'mrs', 'ms', 'miss', 'mx', 'prof', 'professor', 'sir', 'madam',
])

export function stripHonorific(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean)
  if (parts.length > 1 && HONORIFICS.has(parts[0].replace(/\./g, '').toLowerCase())) {
    return parts.slice(1).join(' ')
  }
  return parts.join(' ')
}

export function getFirstName(name: string): string {
  return stripHonorific(name).split(/\s+/)[0] ?? ''
}

export function getInitials(name: string): string {
  const parts = stripHonorific(name).split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '·'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ── Shared editable building blocks ──────────────────────────────────────

export interface EditableService {
  name: string
  desc: string
  price?: string
  tag?: string
  kind?: string
  code?: string
  forWhom?: string[]
}

export interface EditableFAQ {
  q: string
  a: string
}

// ── CT1 (Classic) ─────────────────────────────────────────────────────────

export interface CT1CarouselSlide {
  type: 'quote' | 'stats' | 'process' | 'testimonial'
  tag: string
  text?: string
  author?: string
  sub?: string
  headline?: string
  stats?: { val: string; label: string }[]
  steps?: { n: string; t: string; d: string }[]
  quote?: string
  name?: string
  role?: string
}

export interface CT1SocialLink {
  name: string
  url: string
}

export interface CT1Content {
  services?: EditableService[]
  carousel?: CT1CarouselSlide[]
  socials?: CT1SocialLink[]
}

// ── CT2 (Editorial) ───────────────────────────────────────────────────────

export interface CT2InsightItem {
  number: string
  category: string
  title: string
  excerpt: string
  readingTime: string
  date: string
}

export interface CT2Content {
  services?: EditableService[]
  insights?: CT2InsightItem[]
  faq?: EditableFAQ[]
}

// ── CT3 (Atelier) ─────────────────────────────────────────────────────────

export interface CT3Content {
  services?: EditableService[]
  faq?: EditableFAQ[]
}

// ── CT4 (Obsidian) ────────────────────────────────────────────────────────

export interface CT4TrustItem { label: string; value: string }

export interface CT4HeroQuote {
  quote: string
  quote_author: string
}

export interface CT4Content {
  hero?: {
    quote?: string
    quote_author?: string
    quotes?: CT4HeroQuote[]
  }
  ticker?: { items?: string[] }
  services?: EditableService[]
  faq?: EditableFAQ[]
  insights?: { trust_bar?: CT4TrustItem[] }
}

// ── CT5 (Sage & Stone) ────────────────────────────────────────────────────

export interface CT5Content {
  ticker?: { items?: string[] }
  services?: EditableService[]
  faq?: EditableFAQ[]
}

// ── Master profile_content shape ──────────────────────────────────────────

export interface ProfileContent {
  classic?: CT1Content
  classic2?: CT2Content
  classic3?: CT3Content
  classic4?: CT4Content
  classic5?: CT5Content
}

// ── TherapistProfile ──────────────────────────────────────────────────────

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
  availability?: AvailabilityData | null
  profile_content?: ProfileContent
  section_order?: string[]
}

// ── Availability types ────────────────────────────────────────────────────

export interface TimeRange { start: string; end: string }
export interface DaySchedule { enabled: boolean; ranges: TimeRange[] }
export interface DateException { date: string; type: 'off' | 'custom'; ranges?: TimeRange[] }
export interface AvailabilityData {
  duration: number
  schedule: Record<string, DaySchedule>
  buffer?: number
  exceptions?: DateException[]
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const MIN_ADVANCE_HOURS = 4

export const DEFAULT_PROFILE_IMAGE = '/profiledemo2.png'

export function resolveImage(image?: string | null): string {
  return image && image.trim() !== '' ? image : DEFAULT_PROFILE_IMAGE
}

export function generateSlotsFromRanges(ranges: TimeRange[], durationMin: number, bufferMin = 0): string[] {
  const slots: string[] = []
  const step = durationMin + bufferMin
  for (const range of ranges) {
    const [startH, startM] = range.start.split(':').map(Number)
    const [endH, endM] = range.end.split(':').map(Number)
    let current = startH * 60 + startM
    const endTotal = endH * 60 + endM
    while (current + durationMin <= endTotal) {
      const h = Math.floor(current / 60); const m = current % 60
      const ampm = h >= 12 ? 'PM' : 'AM'
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
      slots.push(`${displayH}:${m.toString().padStart(2, '0')} ${ampm}`)
      current += step
    }
  }
  return slots
}

export function generateSlotsFromDuration(durationMin: number): string[] {
  return generateSlotsFromRanges([{ start: '09:00', end: '18:00' }], durationMin)
}

export interface AvailableDay {
  label: string; fullLabel: string; date: number; month: string
  dayName: string; dateObj: Date; slots: string[]
}

export function getAvailableDays(
  availability: AvailabilityData | null | undefined,
  durationMin: number,
  lookaheadDays = 14,
  bookedISO: string[] = [],
): AvailableDay[] {
  const bookedSet = new Set(bookedISO.map(t => new Date(t).toISOString()))
  const cutoff    = Date.now() + MIN_ADVANCE_HOURS * 60 * 60 * 1000

  const buffer = availability?.buffer ?? 0
  const exceptions = availability?.exceptions ?? []

  const results: AvailableDay[] = []
  for (let i = 0; i < lookaheadDays && results.length < 14; i++) {
    const d = new Date(); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0)
    const dayName = DAY_NAMES[d.getDay()]; let rawSlots: string[] = []

    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const exception = exceptions.find(e => e.date === isoDate)

    if (exception) {
      if (exception.type === 'off') continue
      rawSlots = generateSlotsFromRanges(exception.ranges ?? [], availability?.duration ?? durationMin, buffer)
    } else if (availability?.schedule) {
      const ds = availability.schedule[dayName]
      if (!ds?.enabled) continue
      if (ds.ranges.length > 0) rawSlots = generateSlotsFromRanges(ds.ranges, availability.duration ?? durationMin, buffer)
    } else { rawSlots = generateSlotsFromDuration(durationMin) }

    const slots = rawSlots.filter(label => {
      const iso = slotToISO(label, d)
      if (bookedSet.has(new Date(iso).toISOString())) return false
      if (new Date(iso).getTime() < cutoff)            return false
      return true
    })

    if (slots.length === 0) continue

    results.push({
      label:     i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_SHORT[d.getDay()],
      fullLabel: `${dayName}, ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`,
      date:      d.getDate(),
      month:     MONTH_NAMES[d.getMonth()],
      dayName,
      dateObj:   d,
      slots,
    })
  }
  return results
}

export function slotToISO(slotLabel: string, dateObj: Date): string {
  const [timePart, ampm] = slotLabel.split(' '); const [hoursStr, minutesStr] = timePart.split(':')
  let hours = parseInt(hoursStr); const minutes = parseInt(minutesStr)
  if (ampm === 'PM' && hours !== 12) hours += 12; if (ampm === 'AM' && hours === 12) hours = 0
  const slotDate = new Date(dateObj); slotDate.setHours(hours, minutes, 0, 0); return slotDate.toISOString()
}

// ── Month-aware availability (for calendar-grid pickers) ─────────────────────
// Unlike getAvailableDays (a flat lookahead list used by the day-strip
// pickers), this answers "for this specific calendar month, which dates
// have at least one open slot?" — the question a month-grid calendar needs
// to grey out / highlight the right cells. Returns one entry per day in the
// month (1..daysInMonth), each carrying its slot list (empty if none).

export interface MonthDayAvailability {
  date: number
  dateObj: Date
  isoDate: string
  dayOfWeek: number // 0=Sun..6=Sat
  isPast: boolean
  slots: string[]
}

export function getAvailabilityForMonth(
  availability: AvailabilityData | null | undefined,
  durationMin: number,
  year: number,
  month: number, // 0-indexed, matches JS Date — 0=Jan
  bookedISO: string[] = [],
): MonthDayAvailability[] {
  const bookedSet = new Set(bookedISO.map(t => new Date(t).toISOString()))
  const cutoff    = Date.now() + MIN_ADVANCE_HOURS * 60 * 60 * 1000

  const buffer = availability?.buffer ?? 0
  const exceptions = availability?.exceptions ?? []
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const results: MonthDayAvailability[] = []

  for (let date = 1; date <= daysInMonth; date++) {
    const d = new Date(year, month, date); d.setHours(0, 0, 0, 0)
    const dayName = DAY_NAMES[d.getDay()]
    const isoDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const isPast = d.getTime() < new Date().setHours(0, 0, 0, 0)

    let rawSlots: string[] = []
    const exception = exceptions.find(e => e.date === isoDate)

    if (exception) {
      if (exception.type !== 'off') {
        rawSlots = generateSlotsFromRanges(exception.ranges ?? [], availability?.duration ?? durationMin, buffer)
      }
    } else if (availability?.schedule) {
      const ds = availability.schedule[dayName]
      if (ds?.enabled && ds.ranges.length > 0) {
        rawSlots = generateSlotsFromRanges(ds.ranges, availability.duration ?? durationMin, buffer)
      }
    } else if (!isPast) {
      rawSlots = generateSlotsFromDuration(durationMin)
    }

    const slots = isPast ? [] : rawSlots.filter(label => {
      const iso = slotToISO(label, d)
      if (bookedSet.has(new Date(iso).toISOString())) return false
      if (new Date(iso).getTime() < cutoff)            return false
      return true
    })

    results.push({ date, dateObj: d, isoDate, dayOfWeek: d.getDay(), isPast, slots })
  }

  return results
}

export function getNext7Days() {
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i)
    days.push({ label: i === 0 ? 'Today' : DAY_SHORT[d.getDay()], date: d.getDate(), month: MONTH_NAMES[d.getMonth()] })
  }
  return days
}

export const UNAVAILABLE = ['10:30 AM', '1:00 PM', '3:30 PM']

export const SAMPLE_THERAPIST: TherapistProfile = {
  name: 'Dr. Vansh Makhija', credentials: 'M.Phil Clinical Psychology · RCI Licensed', city: 'Mumbai',
  bio: `I'm a licensed clinical psychologist with over 8 years of experience helping individuals navigate anxiety, depression, relationship challenges, and life transitions.`,
  fee: 1500, sessionDuration: 50, rating: 4.9, totalReviews: 127,
  specialties: ['Anxiety', 'Depression', 'Relationships', 'Grief', 'Self-Esteem', 'Work Stress'],
  languages: ['English', 'Hindi', 'Marathi'], experience: 8,
  reviews: [
    { name: 'A.M.', rating: 5, text: 'Dr. Karan helped me through one of the hardest years of my life.' },
    { name: 'R.V.', rating: 5, text: 'I was nervous about online therapy but she made it feel completely natural.' },
    { name: 'S.P.', rating: 5, text: 'Very professional, empathetic, and non-judgmental.' },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// Default content per template
// ═══════════════════════════════════════════════════════════════════════════

export const DEFAULT_CT1_CONTENT: Required<CT1Content> & { socials: CT1SocialLink[] } = {
  services: [
    { code: 'S/01', name: 'Counselling Psychology', kind: 'Individual Therapy', desc: 'One-to-one psychotherapy for adults navigating anxiety, depression, self-worth, identity, burnout, and life transitions — grounded in CBT, ACT, and somatic work.', forWhom: ['Anxiety', 'Burnout', 'Self-Esteem', 'Life Transitions'] },
    { code: 'S/02', name: 'Relationship Counselling', kind: 'Couple & Partners', desc: 'Structured sessions for couple and partners working through communication breakdowns, attachment patterns, conflict, intimacy, and rebuilding trust.', forWhom: ['Couple', 'Communication', 'Attachment', 'Trust'] },
    { code: 'S/03', name: 'Trauma & EMDR', kind: 'Trauma-Informed Care', desc: 'Specialist trauma work using EMDR and somatic methods, at your pace — helping you process difficult experiences while restoring safety in your body.', forWhom: ['PTSD', 'EMDR', 'Somatic', 'Recovery'] },
    { code: 'S/04', name: 'Career & Identity', kind: 'Personal Direction', desc: 'Reflective psychotherapy for professionals questioning purpose, identity, or major career inflection points — clarity-focused and non-prescriptive.', forWhom: ['Direction', 'Meaning', 'Purpose', 'Mid-Career'] },
  ],
  carousel: [
    { type: 'quote', tag: 'Guiding Philosophy', text: '"The curious paradox is that when I accept myself just as I am, then I can change."', author: '- Carl Rogers' },
    // { type: 'stats', tag: 'By The Numbers', headline: 'Proven Results', stats: [{ val: '94%', label: 'Report reduced anxiety after 8 sessions' }, { val: '87%', label: 'Clients return for continued growth' }, { val: '500+', label: 'Sessions delivered' }] },
    { type: 'process', tag: 'The Process', headline: 'How We Work Together', steps: [{ n: '01', t: 'Free Consultation', d: 'A 15 min call to understand your needs and answer your questions.' }, { n: '02', t: 'Tailored Plan', d: 'We co-create a therapy approach matched to your goals.' }, { n: '03', t: 'Weekly Sessions', d: 'Consistent, focused 50-minute sessions online or in-person.' }] },
    // { type: 'testimonial', tag: 'Client Stories', quote: '"I came in feeling completely lost. Six months later I have language for my feelings, tools for hard days, and a relationship with myself I never thought possible."', name: 'Karan M.', role: 'Client — 2024' },
  ],
  socials: [],
}

export const DEFAULT_CT2_CONTENT: Required<CT2Content> = {
  services: [
    { code: '01', name: 'Individual psychotherapy', kind: 'One-to-one · weekly', desc: 'Long-form work for adults navigating anxiety, depression, identity, and the residue of difficult early life — patient, reflective, and unhurried.', forWhom: ['Anxiety', 'Depression', 'Self-worth', 'Burnout'] },
    { code: '02', name: 'Trauma & EMDR', kind: 'Specialist · paced', desc: 'Trauma-informed work using EMDR and somatic methods. We move only at the speed your nervous system allows — never the other way around.', forWhom: ['PTSD', 'EMDR', 'Somatic work', 'Recovery'] },
    { code: '03', name: 'Couple & relational', kind: 'Two-people work', desc: 'Structured sessions for couple re-learning how to fight fairly, listen well, and choose each other again — even after rupture.', forWhom: ['Couple', 'Conflict', 'Attachment', 'Repair'] },
    { code: '04', name: 'Career & meaning', kind: 'Reflective work', desc: 'Psychotherapy for professionals questioning purpose, identity, or the cost of their ambition. Clarity-focused, never prescriptive.', forWhom: ['Direction', 'Meaning', 'Mid-career', 'Transition'] },
  ],
  insights: [
    { number: '001', category: 'On anxiety', title: 'The anxiety underneath your productivity', excerpt: 'When ambition is fuelled by avoidance, achievement starts to feel like relief instead of joy. A note on the difference.', readingTime: '6 min read', date: 'May 2026' },
    { number: '002', category: 'On grief', title: 'Grief without a vocabulary', excerpt: "Some losses don't arrive with a name — the friendship that quietly thinned, the version of yourself you outgrew. They are still grief.", readingTime: '8 min read', date: 'Apr 2026' },
    { number: '003', category: 'On relationships', title: 'Why repair matters more than rupture', excerpt: "Conflict isn't the threat to intimacy that we think it is. Unrepaired conflict is. A short piece on returning to each other.", readingTime: '5 min read', date: 'Mar 2026' },
  ],
  faq: [
    { q: 'Do you offer a first consultation?', a: 'Yes, a 20 minute introductory call, complimentary, so we can both feel out whether we are the right fit. There is no obligation to continue after that conversation.' },
    { q: 'Online or in-person sessions?', a: 'Both are available. Most clients work online for the practical flexibility it offers; some prefer the containment of an in-person room. We will choose what suits the work.' },
    { q: 'How long do people usually stay in therapy?', a: 'It varies. Some clients come for a focused 8–12 sessions around a specific theme. Others stay for longer, deeper work that unfolds over months or years. We will revisit this together every few months.' },
    { q: 'What are your fees, and do you offer concessions?', a: 'Standard fees are listed on the booking page. A limited number of reduced-fee slots are reserved each year for clients in genuine financial difficulty — please ask if relevant.' },
    { q: 'What happens if I need to cancel a session?', a: 'Cancellations made 48 hours or more before the session are free. Within 48 hours, the full fee applies — this protects the time held for you and the rhythm of the work.' },
    { q: 'Is everything I say confidential?', a: 'Yes, with the standard clinical exceptions — risk to self or others, court orders, or supervision (anonymised). I will explain all of this in detail at our first session.' },
  ],
}

export const DEFAULT_CT3_CONTENT: Required<CT3Content> = {
  services: [
    { code: '01', name: 'Individual psychotherapy', kind: 'One-to-one · weekly', desc: 'Long-form work for adults navigating anxiety, depression, identity, and the residue of difficult early life — patient, reflective, and unhurried.', forWhom: ['Anxiety', 'Depression', 'Self-worth', 'Burnout'] },
    { code: '02', name: 'Trauma & EMDR', kind: 'Specialist · paced', desc: 'Trauma-informed work using EMDR and somatic methods. We move only at the speed your nervous system allows — never the other way around.', forWhom: ['PTSD', 'EMDR', 'Somatic', 'Recovery'] },
    { code: '03', name: 'Couple & relational', kind: 'Two-people work', desc: 'Structured sessions for couple re-learning how to fight fairly, listen well, and choose each other again — even after rupture.', forWhom: ['Couple', 'Conflict', 'Attachment', 'Repair'] },
    { code: '04', name: 'Career & meaning', kind: 'Reflective work', desc: 'Psychotherapy for professionals questioning purpose, identity, or the cost of their ambition. Clarity-focused, never prescriptive.', forWhom: ['Direction', 'Meaning', 'Mid-career', 'Transition'] },
  ],
  faq: [
    { q: 'Do you offer a first consultation?', a: 'Yes, a 20 minute introductory call, complimentary, so we can both feel out whether we are the right fit. There is no obligation to continue after that conversation.' },
    { q: 'Online or in-person sessions?', a: 'Both are available. Most clients work online for the practical flexibility it offers; some prefer the containment of an in-person room. We will choose what suits the work.' },
    { q: 'How long do people usually stay in therapy?', a: 'It varies. Some clients come for a focused 8 to 12 sessions around a specific theme. Others stay for longer, deeper work that unfolds over months or years. We will revisit this together every few months.' },
    { q: 'What are your fees, and do you offer concessions?', a: 'Standard fees are listed on the booking page. A limited number of reduced-fee slots are reserved each year for clients in genuine financial difficulty — please ask if relevant.' },
    { q: 'What happens if I need to cancel?', a: 'Cancellations made 48 hours or more before the session are free. Within 48 hours, the full fee applies — this protects the time held for you and the rhythm of the work.' },
    { q: 'Is everything I say confidential?', a: 'Yes, with the standard clinical exceptions — risk to self or others, court orders, or supervision (anonymised). I will explain all of this in detail at our first session.' },
  ],
}

export const DEFAULT_CT4_CONTENT = {
  hero: {
    quote: 'The curious paradox is that when I accept myself just as I am, then I can change.',
    quote_author: 'Carl R. Rogers',
    quotes: [
      { quote: 'The curious paradox is that when I accept myself just as I am, then I can change.', quote_author: 'Carl R. Rogers' },
      { quote: "You don't have to control your thoughts. You just have to stop letting them control you.", quote_author: 'Dan Millman' },
      { quote: "There is no timestamp on trauma. There isn't a formula that you follow to heal.", quote_author: 'Tom Zuba' },
    ] as CT4HeroQuote[],
  },
  ticker: { items: ['Licensed Practitioner', 'Confidential Sessions', 'Evidence-Based Practice', 'Online & In-Person', 'RCI Accredited', 'Integrative Approach', 'First Session Diagnostic', 'Free Cancellation 48h'] },
  services: [
    { name: 'Individual Psychotherapy', desc: 'One-on-one sessions tailored to your unique history, needs, and goals. Evidence-based modalities in a confidential, non-judgmental space.', price: '1500' },
    { name: 'Couple Therapy',           desc: 'Restoring connection, communication, and mutual understanding between partners — from conflict navigation to deeper intimacy.', price: '2000' },
    { name: 'Anxiety & Stress',         desc: 'Cognitive, somatic, and mindfulness-based tools to break cycles of rumination, worry, and overwhelm.', price: '1500' },
    { name: 'Grief & Loss',             desc: 'Compassionate support through bereavement, major life transitions, and the complex terrain of what it means to lose.', price: '1200' },
    { name: 'Identity & Self-Esteem',   desc: 'Deepening self-awareness and cultivating an authentic, grounded sense of self — free from self-criticism and comparison.', price: '1200' },
    { name: 'Burnout & Recovery',       desc: 'Rebuilding energy, boundaries, and meaning for high-achieving individuals navigating chronic professional exhaustion.', price: '1800' },
  ] as EditableService[],
  faq: [
    { q: 'How is the first session structured?', a: 'The first session (typically 60 minutes) is primarily an intake — I want to understand your history, what has brought you here, and what you hope to gain from our work together. By the end, we will have co-created a loose roadmap for our sessions.' },
    { q: 'Do you offer online sessions?', a: 'Yes. All sessions are available online via a secure, HIPAA-friendly video platform. Many clients actually prefer the comfort and privacy of attending from their own space. In-person sessions are also available on request.' },
    { q: 'How many sessions will I need?', a: 'This depends entirely on your goals and the nature of what you are working through. Some find significant relief within 8–12 sessions; others choose to continue for a year or more. We will periodically review progress and adjust our approach together.' },
    { q: 'What is your cancellation policy?', a: 'Please cancel or reschedule at least 48 hours before your session to avoid a charge. I understand life is unpredictable — emergencies are always considered individually.' },
    { q: 'Is everything I share confidential?', a: 'Absolutely. Confidentiality is both an ethical and legal obligation. The only exceptions are those required by law: imminent risk to yourself or others, or disclosure in cases of child or elder abuse.' },
  ] as EditableFAQ[],
  insights: { trust_bar: [{ label: 'Approach', value: 'Integrative · Psychodynamic' }, { label: 'Accredited By', value: 'RCI · ICP' }, { label: 'Confidentiality', value: 'APA Ethics Code' }, { label: 'Availability', value: 'Online · In-Person' }] as CT4TrustItem[] },
}

export const DEFAULT_CT5_CONTENT: Required<CT5Content> = {
  ticker: { items: ['Evidence-Based Therapy', 'Compassionate Care', 'Online & In-Person', 'Anxiety & Depression', 'Relationships', 'Trauma-Informed', 'Confidential Sessions', 'RCI Licensed', 'Personalised Approach'] },
  services: [
    { name: 'Individual Therapy',   desc: 'One-on-one sessions tailored entirely to your unique needs, challenges, and goals.', tag: 'Core Service' },
    { name: 'Anxiety & Stress',     desc: 'Learn to recognise patterns, regulate responses, and build sustainable calm in your life.', tag: 'Speciality' },
    { name: 'Depression Support',   desc: 'Compassionate, structured support to help you rediscover energy, purpose, and connection.', tag: 'Speciality' },
    { name: 'Relationship Therapy', desc: 'Improving communication, resolving conflicts, and deepening intimacy in your relationships.', tag: 'Couple & Ind.' },
    { name: 'Grief & Loss',         desc: 'A gentle, non-judgemental space to process loss and find a path forward at your own pace.', tag: 'Speciality' },
    { name: 'Life Transitions',     desc: 'Career changes, relocation, identity shifts — navigating change with clarity and resilience.', tag: 'Coaching' },
  ],
  faq: [
    { q: 'How is the first session structured?', a: 'The first session (typically 60 minutes) is primarily an intake — I want to understand your history, what has brought you here, and what you hope to gain from our work together. By the end, we will have co-created a loose roadmap for our sessions.' },
    { q: 'Do you offer online sessions?', a: 'Yes. All sessions are available online via a secure, HIPAA-friendly video platform. Many clients actually prefer the comfort and privacy of attending from their own space. In-person sessions are also available on request.' },
    { q: 'How many sessions will I need?', a: 'This depends entirely on your goals and the nature of what you are working through. Some find significant relief within 8–12 sessions; others choose to continue for a year or more. We will periodically review progress and adjust our approach together.' },
    { q: 'What is your cancellation policy?', a: 'Please cancel or reschedule at least 48 hours before your session to avoid a charge. I understand life is unpredictable — emergencies are always considered individually.' },
    { q: 'Is everything I share confidential?', a: 'Absolutely. Confidentiality is both an ethical and legal obligation. The only exceptions are those required by law: imminent risk to yourself or others, or disclosure in cases of child or elder abuse.' },
  ],
}

// ── Resolve helpers ───────────────────────────────────────────────────────
// CRITICAL: use Array.isArray — NOT .length — to distinguish "user saved an
// empty list" from "field was never set". An empty [] means the user deleted
// everything intentionally; it must render as empty, NOT fall back to defaults.

export function resolveCT1Content(saved?: CT1Content): Required<CT1Content> {
  return {
    services: Array.isArray(saved?.services) ? saved!.services : DEFAULT_CT1_CONTENT.services,
    carousel: Array.isArray(saved?.carousel) ? saved!.carousel : DEFAULT_CT1_CONTENT.carousel,
    socials:  Array.isArray(saved?.socials)  ? saved!.socials  : [],
  }
}

export function resolveCT2Content(saved?: CT2Content): Required<CT2Content> {
  return {
    services: Array.isArray(saved?.services) ? saved!.services : DEFAULT_CT2_CONTENT.services,
    insights: Array.isArray(saved?.insights) ? saved!.insights : DEFAULT_CT2_CONTENT.insights,
    faq:      Array.isArray(saved?.faq)      ? saved!.faq      : DEFAULT_CT2_CONTENT.faq,
  }
}

export function resolveCT3Content(saved?: CT3Content): Required<CT3Content> {
  return {
    services: Array.isArray(saved?.services) ? saved!.services : DEFAULT_CT3_CONTENT.services,
    faq:      Array.isArray(saved?.faq)      ? saved!.faq      : DEFAULT_CT3_CONTENT.faq,
  }
}

export function resolveCT4Content(saved?: CT4Content) {
  return {
    hero:     { ...DEFAULT_CT4_CONTENT.hero, ...(saved?.hero ?? {}) },
    ticker:   { items: saved?.ticker?.items ?? DEFAULT_CT4_CONTENT.ticker.items },
    services: Array.isArray(saved?.services)                    ? saved!.services                   : DEFAULT_CT4_CONTENT.services,
    faq:      Array.isArray(saved?.faq)                         ? saved!.faq                        : DEFAULT_CT4_CONTENT.faq,
    insights: { trust_bar: Array.isArray(saved?.insights?.trust_bar) ? saved!.insights!.trust_bar! : DEFAULT_CT4_CONTENT.insights.trust_bar },
  }
}

export function resolveCT5Content(saved?: CT5Content): Required<CT5Content> {
  return {
    ticker:   { items: saved?.ticker?.items ?? DEFAULT_CT5_CONTENT.ticker.items },
    services: Array.isArray(saved?.services) ? saved!.services : DEFAULT_CT5_CONTENT.services,
    faq:      Array.isArray(saved?.faq)      ? saved!.faq      : DEFAULT_CT5_CONTENT.faq,
  }
}
