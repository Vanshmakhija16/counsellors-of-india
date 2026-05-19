'use client'

import { useTherapist } from '@/lib/useTherapist'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import {
  Calendar, Users, Clock,
  ExternalLink, Copy, CheckCircle,
  AlertCircle, ArrowRight
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { therapist, loading } = useTherapist()
  const supabase = createClient()
  const [appointments, setAppointments] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    today: 0,
  })

  useEffect(() => {
    if (!therapist) return

    async function fetchAppointments() {
      const { data } = await supabase
        .from('appointments')
        .select('*')
        .eq('therapist_id', therapist!.id)
        .order('scheduled_at', { ascending: true })
        .limit(5)

      if (data) {
        setAppointments(data)

        const today = new Date().toDateString()
        setStats({
          total:   data.length,
          pending: data.filter(a => a.status === 'pending').length,
          today:   data.filter(a =>
            new Date(a.scheduled_at).toDateString() === today
          ).length,
        })
      }
    }

    fetchAppointments()
  }, [therapist])

  function copyLink() {
    if (!therapist) return
    navigator.clipboard.writeText(
      `${window.location.origin}/${therapist.username}`
    )
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-64">
      <div className="animate-spin w-6 h-6 rounded-full border-2 
                      border-[#a3b8b4] border-t-transparent" />
    </div>
  )

  const profileComplete = therapist?.is_profile_complete

  return (
    <div className="p-8 max-w-5xl">

      {/* Welcome */}
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          Good morning, {therapist?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-[#6b7280] mt-1">
          Here's what's happening with your practice today.
        </p>
      </div>

      {/* Profile incomplete warning */}
      {!profileComplete && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200
                        rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-amber-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Complete your profile
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Your public page won't show until your profile is complete
              </p>
            </div>
          </div>
          <Link href="/onboarding"
            className="flex items-center gap-1.5 text-xs font-semibold
                       text-amber-700 hover:text-amber-900 transition">
            Complete now <ArrowRight size={13} />
          </Link>
        </div>
      )}

      {/* Booking link */}
      <div className="mb-8 p-5 bg-[#d4e4e1] rounded-xl border border-[#b8ceca]
                      flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#2d4a47] uppercase tracking-widest mb-1">
            Your booking link
          </p>
          <p className="text-sm font-medium text-[#2d4a47]">
            counsellorsofindia.com/{therapist?.username}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 px-3 py-2 bg-white
                       rounded-lg text-xs font-medium text-[#2d4a47]
                       hover:bg-[#b8ceca] transition border border-[#b8ceca]"
          >
            {copied
              ? <><CheckCircle size={13} /> Copied!</>
              : <><Copy size={13} /> Copy link</>}
          </button>
          <Link
            href={`/${therapist?.username}`}
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-2 bg-[#2d4a47]
                       rounded-lg text-xs font-medium text-white
                       hover:bg-[#1a2f2d] transition"
          >
            <ExternalLink size={13} /> View page
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Calendar, label: 'Total bookings', value: stats.total, color: 'bg-[#d4e4e1] text-[#2d4a47]' },
          { icon: Clock,    label: 'Today\'s sessions', value: stats.today, color: 'bg-amber-50 text-amber-700' },
          { icon: Users,    label: 'Pending confirmation', value: stats.pending, color: 'bg-blue-50 text-blue-700' },
        ].map(stat => (
          <div key={stat.label}
            className="bg-white rounded-xl border border-[#e8e4df] p-5">
            <div className={`w-9 h-9 rounded-lg ${stat.color} 
                            flex items-center justify-center mb-3`}>
              <stat.icon size={17} />
            </div>
            <p className="text-2xl font-bold text-[#1c1c1e]"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}>
              {stat.value}
            </p>
            <p className="text-xs text-[#6b7280] mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent appointments */}
      <div className="bg-white rounded-xl border border-[#e8e4df]">
        <div className="px-6 py-4 border-b border-[#e8e4df] flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#1c1c1e]">
            Upcoming appointments
          </h2>
          <Link href="/dashboard/appointments"
            className="text-xs text-[#5a7f7a] font-medium hover:underline">
            View all →
          </Link>
        </div>

        {appointments.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Calendar size={32} className="text-[#e8e4df] mx-auto mb-3" />
            <p className="text-sm font-medium text-[#6b7280]">
              No appointments yet
            </p>
            <p className="text-xs text-[#6b7280] mt-1">
              Share your booking link to get your first client
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#e8e4df]">
            {appointments.map(apt => (
              <div key={apt.id}
                className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#1c1c1e]">
                    {apt.client_name}
                  </p>
                  <p className="text-xs text-[#6b7280] mt-0.5">
                    {new Date(apt.scheduled_at).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <span className={`
                  text-xs font-medium px-2.5 py-1 rounded-full
                  ${apt.status === 'confirmed'
                    ? 'bg-[#d4e4e1] text-[#2d4a47]'
                    : apt.status === 'pending'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-gray-100 text-gray-500'}
                `}>
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