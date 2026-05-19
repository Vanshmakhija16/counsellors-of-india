import { MapPin, Clock, Calendar, ChevronRight } from 'lucide-react'
import { TherapistProfile, getColor } from '@/lib/template'

export default function ModernTemplate({ profile }: { profile: TherapistProfile }) {
  const color = getColor(profile.color_id ?? 'teal')

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Bold hero */}
      <div className="w-full py-16 px-6" style={{ backgroundColor: color.primary }}>
        <div className="max-w-2xl mx-auto flex items-center gap-8">

          <div
            className="w-28 h-28 rounded-2xl flex items-center justify-center
                       text-4xl font-bold bg-white shrink-0"
            style={{ color: color.primary }}
          >
            {profile.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>

          <div>
            <h1 className="text-3xl font-bold text-white">
              {profile.full_name}
            </h1>
            <p className="text-white opacity-80 mt-1">
              {profile.title ?? 'Counselling Psychologist'}
            </p>
            <div className="flex gap-4 mt-3 text-white opacity-70 text-sm">
              {profile.city && (
                <span className="flex items-center gap-1">
                  <MapPin size={13} /> {profile.city}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={13} /> {profile.session_duration_mins ?? 50} min sessions
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-4 pb-12">

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Per session', value: `₹${profile.fee_per_session?.toLocaleString() ?? '—'}`, isFee: true },
            { label: 'Duration', value: `${profile.session_duration_mins ?? 50} min`, isFee: false },
            { label: 'Mode', value: 'Online', isFee: false },
          ].map(stat => (
            <div key={stat.label}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className={`text-lg font-bold ${stat.isFee ? 'text-[#c9a96e]' : 'text-gray-900'}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              About
            </h2>
            <p className="text-gray-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {/* Specialties */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              I can help with
            </h2>
            <div className="space-y-2">
              {profile.specialties.map(s => (
                <div key={s}
                  className="flex items-center justify-between py-2 
                             border-b border-gray-50 last:border-0">
                  <span className="text-gray-700 text-sm">{s}</span>
                  <ChevronRight size={14} className="text-gray-300" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Book */}
        <button
          className="w-full py-4 rounded-xl text-white font-semibold
                     text-lg flex items-center justify-center gap-2 transition hover:opacity-90"
          style={{ backgroundColor: color.primary }}
        >
          <Calendar size={20} />
          Book a Session
        </button>
      </div>
    </div>
  )
}