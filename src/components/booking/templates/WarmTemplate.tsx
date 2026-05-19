import { Heart, MapPin, Clock, Calendar, Smile } from 'lucide-react'
import { TherapistProfile, getColor } from '@/lib/template'

export default function WarmTemplate({ profile }: { profile: TherapistProfile }) {
  const color = getColor(profile.color_id ?? 'teal')

  return (
    <div className="min-h-screen font-sans" style={{ backgroundColor: color.light }}>

      <div className="max-w-lg mx-auto px-6 py-12">

        {/* Friendly header */}
        <div className="text-center mb-8">
          <div
            className="w-28 h-28 rounded-full mx-auto mb-4 flex items-center
                       justify-center text-4xl font-bold text-white shadow-md"
            style={{ backgroundColor: color.primary }}
          >
            {profile.full_name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>

          <h1 className="text-2xl font-bold text-gray-900">
            {profile.full_name}
          </h1>
          <p className="text-gray-500 mt-1">
            {profile.title ?? 'Counselling Psychologist'}
          </p>

          <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-400">
            {profile.city && (
              <span className="flex items-center gap-1">
                <MapPin size={13} /> {profile.city}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={13} /> {profile.session_duration_mins ?? 50} min
            </span>
          </div>

          {/* Warm tagline */}
          <div
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full text-sm font-medium"
            style={{ backgroundColor: color.primary, color: '#fff' }}
          >
            <Heart size={14} fill="white" />
            Here to help you heal
          </div>
        </div>

        {/* Bio card */}
        {profile.bio && (
          <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Smile size={16} style={{ color: color.primary }} />
              <span className="text-sm font-semibold text-gray-500">A little about me</span>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">{profile.bio}</p>
          </div>
        )}

        {/* Specialties */}
        {profile.specialties && profile.specialties.length > 0 && (
          <div className="bg-white rounded-3xl p-6 mb-4 shadow-sm">
            <p className="text-sm font-semibold text-gray-500 mb-3">I work with</p>
            <div className="flex flex-wrap gap-2">
              {profile.specialties.map(s => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-full text-sm font-medium border"
                  style={{
                    borderColor: color.primary,
                    color: color.primary,
                    backgroundColor: color.light,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fee + Book */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400">Session fee</p>
              <p className="text-2xl font-bold text-[#c9a96e]">
                ₹{profile.fee_per_session?.toLocaleString() ?? '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-lg font-semibold text-gray-700">
                {profile.session_duration_mins ?? 50} min
              </p>
            </div>
          </div>

          <button
            className="w-full py-3.5 rounded-2xl text-white font-semibold
                       flex items-center justify-center gap-2 transition hover:opacity-90"
            style={{ backgroundColor: color.primary }}
          >
            <Calendar size={18} />
            Book a Session
          </button>
        </div>

      </div>
    </div>
  )
}