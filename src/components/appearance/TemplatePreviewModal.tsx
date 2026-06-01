'use client'

import { X } from 'lucide-react'
import { TemplateId, ColorId, getColor } from '@/lib/template'
import { SAMPLE_THERAPIST } from '@/components/booking/templates/templateUtils'
import ClassicTemplate from '@/components/booking/templates/ClassicTemplate'
import ClassicTemplate2 from '@/components/booking/templates/ClassicTemplate2'
import ClassicTemplate3 from '@/components/booking/templates/ClassicTemplate3'
import ClassicTemplate4 from '@/components/booking/templates/ClassicTemplate4'
import ClassicTemplate5 from '@/components/booking/templates/ClassicTemplate5'

interface Props {
  templateId: TemplateId
  colorId?: ColorId
  onClose: () => void
}

const TEMPLATE_NAMES: Record<TemplateId, string> = {
  classic:  'Warm & Simple',
  classic2: 'Dark & Bold',
  classic3: 'Elegant & Light',
  classic4: 'Premium Black',
  classic5: 'Calm & Natural',
}

function renderTemplate(id: TemplateId) {
  switch (id) {
    case 'classic' : return <ClassicTemplate therapist={SAMPLE_THERAPIST} />
    case 'classic2': return <ClassicTemplate2 therapist={SAMPLE_THERAPIST} />
    case 'classic3': return <ClassicTemplate3 therapist={SAMPLE_THERAPIST} />
    case 'classic4': return <ClassicTemplate4 therapist={SAMPLE_THERAPIST} />
    case 'classic5': return <ClassicTemplate5 therapist={SAMPLE_THERAPIST} />
    // default:         return <ClassicTemplate4 therapist={SAMPLE_THERAPIST} feedbacks={[]} />
  }
}

export default function TemplatePreviewModal({ templateId, colorId = 'teal', onClose }: Props) {
  const color = getColor(colorId)

  const brandVars = `
    --brand: ${color.primary};
    --brand-light: ${color.light};
    --brand-dark: ${color.dark};
    --warm-accent: ${color.primary};
    --teal: ${color.primary};
    --teal-mid: ${color.primary};
  `

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-gray-500 font-medium">
              Preview — {TEMPLATE_NAMES[templateId]}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable preview with brand color injected */}
        <div className="flex-1 overflow-y-auto"
          style={{ ['--warm-accent' as string]: color.primary, ['--teal' as string]: color.primary, ['--brand' as string]: color.primary }}>
          <style>{`:root { ${brandVars} }`}</style>
          {renderTemplate(templateId)}
        </div>
      </div>
    </div>
  )
}
