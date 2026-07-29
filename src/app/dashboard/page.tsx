'use client'

import { useTherapist } from '@/lib/useTherapist'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@/components/providers/TenantSupabaseProvider'
import { Fraunces } from 'next/font/google'
import {
  Calendar, Clock, ExternalLink, Copy,
  CheckCircle, ArrowRight, Sparkles,
  Palette, Globe, Share2, ChevronRight, AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const SetupWizard = dynamic(
  () => import('@/components/dashboard/SetupWizard'),
  { ssr: false }
)

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
})

// ── Design tokens ─────────────────────────────────────────────────
const SAFFRON      = '#FF9933'
const SAFFRON_DEEP = '#C2650A'
const INK          = '#171412'
const MUTED        = '#766c62'
const BORDER       = 'rgba(31,26,20,0.08)'
const SUCCESS      = '#1F7A54'
const INFO         = '#3E5C82'

// ── Helpers ───────────────────────────────────────────────────────
function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean)
    .filter(p => !/^(dr|mr|mrs|ms|miss|mx|prof)\.?$/i.test(p))
    .slice(0, 2).map(p => p[0]?.toUpperCase()).join('') || '?'
}

function inferState(therapist: any): 'no-template' | 'no-content' | 'unpublished' | 'live' {
  if (!therapist) return 'no-template'
  if (therapist.setup_complete) return 'live'
  if (therapist.is_profile_complete) return 'unpublished'
  if (therapist.full_name && therapist.bio) return 'no-content'
  return 'no-template'
}

// ── Main ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { therapist, loading } = useTherapist()
  const supabase = useSupabaseClient()

  const [appointments, setAppointments] = useState<any[]>([])
  const [stats, setStats]   = useState({ total: 0, today: 0, pending: 0 })
  const [copied, setCopied] = useState(false)
  const [showWizard,     setShowWizard]     = useState(false)
  const [wizardChecked,  setWizardChecked]  = useState(false)
  const [justPublished,  setJustPublished]  = useState(false)
  const [bookingLimit,   setBookingLimit]   = useState<{ reached: boolean; used: number; limit: number } | null>(null)

  // ── Auto-open wizard if setup not done ──────────────────────────
  useEffect(() => {
    if (!therapist) return
    const localDone = localStorage.getItem(`coi_setup_done_${therapist.id}`)
    if (localDone) { setWizardChecked(true); return }
    if (!(therapist as any).setup_complete) setShowWizard(true)
    setWizardChecked(true)
  }, [therapist])

  // ── Just-published celebration (one-time) ───────────────────────
  useEffect(() => {
    if (!therapist) return
    const key = `coi_just_published_${therapist.id}`
    if (localStorage.getItem(key)) {
      setJustPublished(true)
      localStorage.removeItem(key)
    }
  }, [therapist])

  // ── Appointments ────────────────────────────────────────────────
  useEffect(() => {
    if (!therapist) return
    async function load() {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', therapist!.id)
        .in('status', ['upcoming', 'rescheduled'])
        .order('scheduled_at', { ascending: true })
        .limit(5)
      if (data) {
        setAppointments(data)
        const today = new Date().toDateString()
        setStats({
          total:   data.length,
          today:   data.filter(a => new Date(a.scheduled_at).toDateString() === today).length,
          pending: data.filter(a => a.status === 'rescheduled').length,
        })
      }
    }
    load()
  }, [therapist])

  // ── Monthly booking-limit status (Starter plan) ─────────────────────────
  useEffect(() => {
    if (!therapist) return
    const planKey = ((therapist as any).plan ?? 'starter').toLowerCase()
    if (planKey === 'pro') { setBookingLimit(null); return }
    const LIMIT = 10
    async function loadLimit() {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
      const { count } = await supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('therapist_id', therapist!.id)
        .gte('created_at', monthStart)
        .lt('created_at', monthEnd)
        .not('status', 'in', '("cancelled","payment_failed","expired")')
      const used = count ?? 0
      setBookingLimit({ reached: used >= LIMIT, used, limit: LIMIT })
    }
    loadLimit()
  }, [therapist])

  function copyLink() {
    if (!therapist) return
    navigator.clipboard.writeText(`${window.location.origin}/${therapist.username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function shareLink() {
    if (!therapist) return
    const url = `${window.location.origin}/${therapist.username}`
    if (navigator.share) {
      try { await navigator.share({ title: 'My booking page', url }) } catch { /* cancelled */ }
    } else { copyLink() }
  }

  // ── Loading ──────────────────────────────────────────────────────
  if (loading || !wizardChecked) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: SAFFRON, borderTopColor: 'transparent' }} />
    </div>
  )

  // ── Setup wizard ─────────────────────────────────────────────────
  if (showWizard && therapist) {
    return (
      <SetupWizard
        therapistId={therapist.id}
        username={therapist.username ?? ''}
        existingName={therapist.full_name ?? ''}
        existingPhoto={(therapist as any).photo_url ?? ''}
        existingBio={therapist.bio ?? ''}
        existingFee={String((therapist as any).fee_per_session ?? '')}
        onComplete={() => setShowWizard(false)}
      />
    )
  }

  // ── Derived values ───────────────────────────────────────────────
  const state     = inferState(therapist)
  const setupDone = state === 'live'
  const hour      = new Date().getHours()
  const greeting  = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const nameParts = (therapist?.full_name ?? '').trim().split(/\s+/).filter(Boolean)
  const firstName = nameParts.length > 1 &&
    /^(dr|mr|mrs|ms|miss|mx|prof)\.?$/i.test(nameParts[0])
    ? nameParts[1] : (nameParts[0] ?? '')
  const publicUrl = therapist?.username
    ? `counsellorsofindia.com/${therapist.username}`
    : null
  const hasBookings = stats.total > 0

  // ── State-aware next action ──────────────────────────────────────
  const nextAction = {
    'no-template': {
      label: 'Choose your template',
      desc:  'Pick how your booking page looks — takes 30 seconds.',
      href:  '/dashboard/appearance',
      cta:   'Choose template',
      icon:  Palette,
    },
    'no-content': {
      label: 'Add your content',
      desc:  'Fill in your name, photo, bio and fee so clients know who you are.',
      href:  '/dashboard/profile',
      cta:   'Add your info',
      icon:  Sparkles,
    },
    'unpublished': {
      label: 'Publish your site',
      desc:  "Everything looks good — hit publish and you'll be live instantly.",
      href:  '/dashboard/appearance',
      cta:   'Publish now',
      icon:  Globe,
    },
    'live': {
      label: 'Your site is live',
      desc:  'Share your link below to start getting bookings.',
      href:  null,
      cta:   null,
      icon:  CheckCircle,
    },
  }[state]

  return (
    <div className={`w-full space-y-5 ${fraunces.variable}`}
      style={{ fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif" }}>

      {/* ── Greeting ── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-1"
          style={{ color: SAFFRON_DEEP }}>
          {greeting}
        </p>
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight"
          style={{ fontFamily: 'var(--font-fraunces),Georgia,serif', color: INK }}>
          {firstName ? `${firstName}.` : 'Your dashboard.'}
        </h1>
      </div>

      {/* ── Just-published banner ── */}
      {justPublished && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle size={16} /> Your website is live — share it to get your first booking!
          </div>
          <button onClick={() => setJustPublished(false)}
            className="text-xs text-emerald-600 font-semibold shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {/* ── Monthly booking-limit reached banner (Starter plan) ── */}
      {bookingLimit?.reached && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-200 bg-amber-50 text-sm text-amber-900">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">
              This therapist has reached their monthly booking limit of 10 sessions on the Starter plan. Please contact them directly to book.
            </p>
            <p className="text-xs mt-1 text-amber-700">
              New online bookings are paused until next month. Upgrade to Pro for unlimited bookings.
            </p>
          </div>
        </div>
      )}

      {/* ── TOP SECTION: next action + public link ── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">

        {/* Next action card */}

        {/* Public link card */}
        <div className="rounded-2xl border border-[#ded8ce] bg-white p-5 flex flex-col gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: MUTED }}>
              Your booking link
            </p>
            {publicUrl ? (
              <p className="text-sm font-bold break-all" style={{ color: SAFFRON_DEEP }}>
                {publicUrl}
              </p>
            ) : (
              <p className="text-sm" style={{ color: MUTED }}>
                Publish your site to get a public link
              </p>
            )}
          </div>

          {publicUrl && (
            <div className="flex flex-wrap gap-2">
              <button onClick={copyLink}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-semibold transition"
                style={{ borderColor: BORDER, color: INK }}>
                {copied ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
              <button onClick={shareLink}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl border text-xs font-semibold transition"
                style={{ borderColor: BORDER, color: INK }}>
                <Share2 size={13} /> Share
              </button>
              <a href={`/${therapist?.username}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold text-white transition hover:brightness-95"
                style={{ background: INK }}>
                <ExternalLink size={13} /> View site
              </a>
            </div>
          )}

          {/* Quick links */}
          <div className="border-t pt-4 space-y-1" style={{ borderColor: BORDER }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
              style={{ color: MUTED }}>Quick actions</p>
            {[
              { label: 'Edit website content', href: '/dashboard/appearance', icon: Palette },
              { label: 'Set availaibility ', href: '/dashboard/availability', icon: Clock },
              { label: 'View all bookings', href: '/dashboard/appointments', icon: Calendar },
            ].map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href}
                className="flex items-center justify-between gap-2 px-2 py-2 rounded-lg text-sm font-semibold transition hover:bg-[#f6f2ec]"
                style={{ color: '#342e28' }}>
                <span className="flex items-center gap-2">
                  <Icon size={14} style={{ color: SAFFRON }} /> {label}
                </span>
                <ChevronRight size={14} style={{ color: '#b0a89e' }} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats — only when there's real data ── */}
      {hasBookings && (
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Upcoming bookings', value: stats.total,   color: INFO    },
            { label: "Today's sessions",  value: stats.today,   color: SUCCESS },
            { label: 'Rescheduled',       value: stats.pending, color: SAFFRON_DEEP },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-[#ded8ce] bg-white p-5">
              <p className="text-3xl font-bold tabular-nums tracking-tight" style={{ color: INK }}>
                {value}
              </p>
              <p className="text-sm mt-1" style={{ color: MUTED }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Bookings pipeline ── */}
      <div className="rounded-2xl border border-[#ded8ce] bg-white overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-5 py-4 border-b"
          style={{ borderColor: BORDER }}>
          <h2 className="text-sm font-bold" style={{ color: INK }}>Upcoming appointments</h2>
          <Link href="/dashboard/appointments"
            className="text-xs font-semibold transition"
            style={{ color: SAFFRON_DEEP }}>
            View all →
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: `${SAFFRON}10` }}>
              <Calendar size={22} style={{ color: SAFFRON }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: INK }}>No appointments yet</p>
            <p className="text-xs mb-4" style={{ color: MUTED }}>
              Share your booking link to get your first client
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Link href="/dashboard/availability"
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl text-xs font-bold text-white"
                style={{ background: INK }}>
                <Clock size={13} /> Set hours first
              </Link>
              {publicUrl && (
                <button onClick={copyLink}
                  className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border text-xs font-semibold transition"
                  style={{ borderColor: BORDER, color: INK }}>
                  <Copy size={13} /> Copy my link
                </button>
              )}
            </div>
          </div>
        ) : (
          <div>
            {appointments.map((apt, i) => (
              <div key={apt.id}
                className="flex items-center gap-3 px-5 py-4"
                style={i < appointments.length - 1 ? { borderBottom: `1px solid ${BORDER}` } : {}}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  style={{ background: `${SAFFRON}15`, color: SAFFRON_DEEP }}>
                  {initials(apt.client_name ?? '?')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: INK }}>
                    {apt.client_name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: MUTED }}>
                    {new Date(apt.scheduled_at).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
                  style={apt.status === 'upcoming'
                    ? { background: `${SAFFRON}15`, color: SAFFRON_DEEP }
                    : apt.status === 'rescheduled'
                    ? { background: 'rgba(62,92,130,0.10)', color: INFO }
                    : { background: 'rgba(31,122,84,0.10)', color: SUCCESS }}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
