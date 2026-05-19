import { TherapistProfile } from '@/lib/template'
import ClassicTemplate from '@/components/booking/templates/ClassicTemplate'
import ModernTemplate from '@/components/booking/templates/ModernTemplate'
import WarmTemplate from '@/components/booking/templates/WarmTemplate'
import PremiumTemplate from '@/components/booking/templates/PremiumTemplate'
import { TherapistProfile as TemplateTherapist, SAMPLE_THERAPIST } from '@/components/booking/templates/templateUtils'
import { X } from 'lucide-react'

interface Props {
  profile: TherapistProfile
  onClose: () => void
}

function toTemplateTherapist(p: TherapistProfile): TemplateTherapist {
  const initials = (p.full_name ?? '')
    .split(' ')
    .map(part => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
  return {
    ...SAMPLE_THERAPIST,
    name: p.full_name,
    initials: initials || SAMPLE_THERAPIST.initials,
    credentials: p.title ?? SAMPLE_THERAPIST.credentials,
    city: p.city ?? SAMPLE_THERAPIST.city,
    bio: p.bio ?? SAMPLE_THERAPIST.bio,
    fee: p.fee_per_session ?? SAMPLE_THERAPIST.fee,
    sessionDuration: p.session_duration_mins ?? SAMPLE_THERAPIST.sessionDuration,
    specialties: p.specialties ?? SAMPLE_THERAPIST.specialties,
    languages: p.languages ?? SAMPLE_THERAPIST.languages,
  }
}

function renderTemplate(profile: TherapistProfile) {
  switch (profile.template_id ?? 'classic') {
    case 'modern':  return <ModernTemplate profile={profile} />
    case 'warm':    return <WarmTemplate profile={profile} />
    case 'premium': return <PremiumTemplate profile={profile} />
    case 'classic':
    default:        return <ClassicTemplate therapist={toTemplateTherapist(profile)} />
  }
}

export default function LivePreview({ profile, onClose }: Props) {

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

      {/* Modal */}
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl
                      w-full max-w-md h-[85vh] flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3
                        border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-400 font-mono">
            counsellorsofindia.com/{profile.full_name?.split(' ')[0]?.toLowerCase()}
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Template preview — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {renderTemplate(profile)}
        </div>

      </div>
    </div>
  )
}