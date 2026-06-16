'use client'

import { useTherapist } from '@/lib/useTherapist'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Calendar, Users, Clock,
  ExternalLink, Copy, CheckCircle,
  AlertCircle, ArrowRight, Palette, Sparkles,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { therapist, loading } = useTherapist()
  const supabase = createClient()
  const [appointments, setAppointments] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ total: 0, pending: 0, today: 0 })

  useEffect(() => {
    if (!therapist) return
    async function fetchAppointments() {
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
          pending: data.filter(a => a.status === 'rescheduled').length,
          today:   data.filter(a => new Date(a.scheduled_at).toDateString() === today).length,
        })
      }
    }
    fetchAppointments()
  }, [therapist])

  function copyLink() {
    if (!therapist) return
    navigator.clipboard.writeText(`${window.location.origin}/${therapist.username}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-64" style={{ background: '#FFFCF8' }}>
      <div
        className="w-6 h-6 rounded-full border-2 animate-spin"
        style={{ borderColor: '#FF9933', borderTopColor: 'transparent' }}
      />
    </div>
  )

  const profileComplete = therapist?.is_profile_complete

  // Greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  // Drop any honorific (Dr/Mr/Mrs/Ms/Prof…) and show just the first name.
  const nameParts = (therapist?.full_name ?? '').trim().split(/\s+/).filter(Boolean)
  const firstName = nameParts.length > 1 &&
    /^(dr|mr|mrs|ms|miss|mx|prof|professor|sir|madam)\.?$/i.test(nameParts[0])
    ? nameParts[1]
    : (nameParts[0] ?? '')

  return (
    <div
      className="min-h-full px-5 sm:px-8 py-8 max-w-5xl"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >

      {/* ── Welcome ────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#FF9933' }}>
          {greeting}
        </p>
        <h1 className="text-3xl font-bold" style={{ color: '#1F1A14', letterSpacing: '-0.02em' }}>
          {firstName} <span style={{ color: '#46403A', fontWeight: 500 }}></span>
        </h1>
      </div>

      {/* ── Profile incomplete warning ─────────────────────────── */}
      {!profileComplete && (
        <div
          className="mb-6 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          style={{
            background: 'rgba(255,153,51,0.07)',
            border: '1px solid rgba(255,153,51,0.28)',
          }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle size={17} style={{ color: '#E07A12', flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1F1A14' }}>
                Complete your profile
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#7A7166' }}>
                Your public page won't be visible until your profile is complete
              </p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="flex items-center gap-1.5 text-xs font-semibold transition"
            style={{ color: '#E07A12' }}
          >
            Complete now <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* ── Booking link banner ────────────────────────────────── */}
      <div
        className="mb-8 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{
          background: 'linear-gradient(135deg, #1F1A14 0%, #2e2519 100%)',
          border: '1px solid rgba(255,153,51,0.18)',
        }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#FF9933' }}>
            Your booking link
          </p>
          <p className="text-sm font-medium break-all" style={{ color: '#FDF5EC' }}>
            counsellorsofindia.com/<span style={{ color: '#FF9933' }}>{therapist?.username}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition"
            style={{
              background: 'rgba(255,153,51,0.12)',
              color: '#FF9933',
              border: '1px solid rgba(255,153,51,0.28)',
            }}
          >
            {copied ? <><CheckCircle size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
          </button>
          <Link
            href={`/${therapist?.username}`}
            target="_blank"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition"
            style={{ background: '#FF9933', color: '#1F1A14' }}
          >
            <ExternalLink size={13} /> View page
          </Link>
        </div>
      </div>

      {/* ── Customize your website ─────────────────────────────── */}
      <Link
        href="/dashboard/appearance"
        className="group mb-8 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition hover:shadow-md"
        style={{
          background: '#ffffff',
          border: '1px solid rgba(255,153,51,0.30)',
        }}
      >
        <div className="flex items-center gap-4">
          {/* <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,153,51,0.10)' }}
          >
            <Palette size={22} style={{ color: '#FF9933' }} />
          </div> */}
          <div>
            <p className="text-sm font-bold flex items-center gap-1.5" style={{ color: '#1F1A14' }}>
              Design your website
              <Sparkles size={14} style={{ color: '#FF9933' }} />
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#7A7166' }}>
              Pick a template, preview it live, and edit your text & photos, all in one place.
            </p>
          </div>
        </div>
        <span
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition group-hover:gap-2.5"
          style={{ background: '#FF9933', color: '#1F1A14' }}
        >
          Customize <ArrowRight size={14} />
        </span>
      </Link>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          {
            icon: Calendar,
            label: 'Total bookings',
            value: stats.total,
            accent: '#FF9933',
            bg: 'rgba(255,153,51,0.08)',
          },
          {
            icon: Clock,
            label: "Today's sessions",
            value: stats.today,
            accent: '#2d7a5a',
            bg: 'rgba(45,122,90,0.08)',
          },
          {
            icon: Users,
            label: 'Rescheduled',
            value: stats.pending,
            accent: '#4a6fa5',
            bg: 'rgba(74,111,165,0.08)',
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="rounded-2xl p-5"
            style={{ background: '#ffffff', border: '1px solid rgba(31,26,20,0.08)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
              style={{ background: stat.bg }}
            >
              <stat.icon size={17} style={{ color: stat.accent }} />
            </div>
            <p className="text-3xl font-bold mb-1" style={{ color: '#1F1A14', letterSpacing: '-0.03em' }}>
              {stat.value}
            </p>
            <p className="text-xs font-medium" style={{ color: '#7A7166' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Upcoming appointments ─────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: '#ffffff', border: '1px solid rgba(31,26,20,0.08)' }}
      >
        <div
          className="px-5 sm:px-6 py-4 flex items-center justify-between gap-2"
          style={{ borderBottom: '1px solid rgba(31,26,20,0.07)' }}
        >
          <h2 className="text-sm font-bold" style={{ color: '#1F1A14' }}>
            Upcoming appointments
          </h2>
          <Link
            href="/dashboard/appointments"
            className="text-xs font-semibold transition"
            style={{ color: '#E07A12' }}
          >
            View all →
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255,153,51,0.07)' }}
            >
              <Calendar size={22} style={{ color: '#FF9933' }} />
            </div>
            <p className="text-sm font-semibold mb-1" style={{ color: '#1F1A14' }}>
              No appointments yet
            </p>
            <p className="text-xs" style={{ color: '#7A7166' }}>
              Share your booking link to get your first client
            </p>
          </div>
        ) : (
          <div>
            {appointments.map((apt, i) => (
              <div
                key={apt.id}
                className="px-5 sm:px-6 py-4 flex items-center justify-between gap-3"
                style={i < appointments.length - 1 ? { borderBottom: '1px solid rgba(31,26,20,0.06)' } : {}}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1F1A14' }}>
                    {apt.client_name}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#7A7166' }}>
                    {new Date(apt.scheduled_at).toLocaleDateString('en-IN', {
                      weekday: 'short', day: 'numeric', month: 'short',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={apt.status === 'upcoming'
                    ? { background: 'rgba(255,153,51,0.10)', color: '#C46800' }
                    : apt.status === 'rescheduled'
                    ? { background: 'rgba(74,111,165,0.10)', color: '#4a6fa5' }
                    : { background: 'rgba(45,122,90,0.10)', color: '#2d7a5a' }
                  }
                >
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
