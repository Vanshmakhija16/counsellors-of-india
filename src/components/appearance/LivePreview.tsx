import { TherapistProfile, getColor } from '@/lib/template'
import TemplateCanvas from '@/components/booking/templates/TemplateCanvas'
import { X } from 'lucide-react'

interface Props {
  profile: TherapistProfile
  onClose: () => void
}

export default function LivePreview({ profile, onClose }: Props) {
  const color = getColor(profile.color_id ?? 'teal')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-md h-[85vh] flex flex-col">
        {/* Browser chrome */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-gray-400 font-mono">
            counsellorsofindia.com/{profile.full_name?.split(' ')[0]?.toLowerCase()}
          </span>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        {/* Color info bar */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 shrink-0"
          style={{ background: `${color.primary}10` }}>
          <div className="w-3 h-3 rounded-full" style={{ background: color.primary }} />
          <span className="text-xs font-medium" style={{ color: color.primary }}>
            {color.name} color applied
          </span>
        </div>

        {/* Template — rendered through the shared canvas */}
        <TemplateCanvas profile={profile} className="flex-1 overflow-y-auto" />
      </div>
    </div>
  )
}
