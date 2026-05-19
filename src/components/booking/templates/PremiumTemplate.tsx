import { MapPin, Clock, Calendar, Award, Shield } from 'lucide-react'
import { TherapistProfile, getColor } from '@/lib/template'

export default function PremiumTemplate({ profile }: { profile: TherapistProfile }) {
  const color = getColor(profile.color_id ?? 'teal')

  return (
    <div className="min-h-screen bg-gray-950 font-sans">

      {/* Dark hero */}
      <div className="relative px-6 py-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundColor: color.primary }}
        />
        <div className="relative max-w-2xl mx-auto flex items-center gap-8">

          <div
            className="w-32 h-32 rounded-2xl flex items-center justify-center
                       text-4xl font-bold text-white border-2 shrink-0"
            style={{ backgroundColor: color.primary, borderColor: color.dark }}
          >
            {profile.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>

          <div>
            <div
              className="inline-flex items-center gap-1.5 text-xs font-semibold
                         px-3 py-1 rounded-full mb-3"
              style={{ backgroundColor: color.primary, color: '#fff' }}
            >
              <Award size={11} />
              Senior Practitioner
            </div>
            <h1 className="text-3xl font-bold text-white">
              {profile.full_name}
            </h1>
            <p className="mt-1" style={{ color: color.primary }}>
              {profile.title ?? 'Counselling Psychologist'}
            </p>
            <div className="flex gap-4 mt-3 text-gray-400 text-sm">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {profile.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={13} /> {profile.session_duration_mins ?? 50} min
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-12">

        {/* Bio */}
        {profile.bio && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: color.primary }}>
              About
            </h2>
            <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Specialties */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: color.primary }}>
              Areas of expertise
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map(s => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-700 text-gray-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fee + Book */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-500">Investment per session</p>
              <p className="text-3xl font-bold text-[#c9a96e] mt-1">
                ₹{profile.fee_per_session?.toLocaleString() ?? '—'}
              </p>
            </div>
            <div
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
              style={{ backgroundColor: color.primary + '22', color: color.primary }}
            >
              <Shield size={12} />
              Verified
            </div>
          </div>

          <button
            className="w-full py-4 rounded-xl text-white font-semibold text-lg
                       flex items-center justify-center gap-2 transition hover:opacity-90"
            style={{ backgroundColor: color.primary }}
          >
            <Calendar size={20} />
            Book a Session
          </button>
        </div>
      </div>
    </div>
  )
}