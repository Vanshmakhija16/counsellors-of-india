import { Template, ColorId, COLORS } from '@/lib/template'
import { Check, Lock } from 'lucide-react'

interface Props {
  template: Template
  color: ColorId
  selected: boolean
  onSelect: () => void
}

const thumbnails: Record<string, string> = {
  classic:  'bg-white border-t-4',
  classic2: 'bg-[#0b0d0e]',
  classic3: 'bg-[#f5f0e8]',
  classic4: 'bg-[#080808]',
  classic5: 'bg-[#080808]',
  modern:   'bg-gray-800',
  warm:     'bg-orange-50',
  premium:  'bg-gray-950',
}

export default function TemplateCard({ template, color, selected, onSelect }: Props) {
  const c = COLORS.find(x => x.id === color) ?? COLORS[0]

  return (
    <button
      onClick={onSelect}
      className={`
        relative rounded-xl border-2 overflow-hidden text-left transition
        ${selected ? 'border-[#a3b8b4] shadow-md' : 'border-gray-200 hover:border-gray-300'}
      `}
    >
      {/* Mini thumbnail */}
      <div className={`h-28 w-full relative ${thumbnails[template.id]}`}
        style={template.id === 'classic' ? { borderTopColor: c.primary } : {}}>

        {/* Simulated UI elements */}
        <div className="absolute inset-0 p-2.5 flex flex-col gap-1.5">
          {template.id === 'classic' && (
            <>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-7 h-7 rounded-full"
                  style={{ backgroundColor: c.primary }} />
                <div className="space-y-1">
                  <div className="h-1.5 w-14 bg-gray-200 rounded" />
                  <div className="h-1 w-10 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="h-1 w-full bg-gray-100 rounded mt-1" />
              <div className="h-1 w-4/5 bg-gray-100 rounded" />
              <div className="h-5 w-full rounded mt-auto"
                style={{ backgroundColor: c.primary }} />
            </>
          )}
          {template.id === 'classic2' && (
            <>
              <div className="flex items-center justify-between mt-1">
                <div className="w-6 h-6 border" style={{ borderColor: '#c9a35a' }} />
                <div className="h-1 w-10 rounded" style={{ background: '#ece5d7', opacity: 0.7 }} />
              </div>
              <div
                className="h-3 w-3/4 mt-1 italic"
                style={{ background: '#c9a35a', borderRadius: 1 }}
              />
              <div className="h-1 w-full rounded" style={{ background: '#2a2f33' }} />
              <div className="h-1 w-2/3 rounded" style={{ background: '#2a2f33' }} />
              <div
                className="h-5 w-full mt-auto"
                style={{ background: '#c9a35a', borderRadius: 1 }}
              />
            </>
          )}
          {template.id === 'classic3' && (
            <>
              <div className="flex items-center justify-between mt-1">
                <div
                  className="w-5 h-5 italic"
                  style={{ border: '1px solid #8b6f47', color: '#8b6f47' }}
                />
                <div className="h-1 w-8 rounded" style={{ background: '#8b6f47', opacity: 0.7 }} />
              </div>
              <div className="h-px w-full" style={{ background: '#d8cdb8' }} />
              <div
                className="h-3 w-3/4 mt-1"
                style={{ background: '#1a1612', borderRadius: 1 }}
              />
              <div className="h-1 w-2/3 rounded" style={{ background: '#8b6f47' }} />
              <div className="h-1 w-full rounded" style={{ background: '#d8cdb8' }} />
              <div
                className="h-5 w-full mt-auto"
                style={{ background: '#1a1612', borderRadius: 1 }}
              />
            </>
          )}
          {template.id === 'classic4' && (
            <>
              {/* Gold nav bar */}
              <div className="flex items-center justify-between mt-0.5">
                <div
                  className="w-5 h-5 flex items-center justify-center"
                  style={{ border: '1px solid #D4AF37', color: '#D4AF37', fontSize: 8, fontStyle: 'italic' }}
                >
                  P
                </div>
                <div className="h-0.5 w-12 rounded" style={{ background: '#D4AF37', opacity: 0.4 }} />
              </div>
              {/* Thin gold rule */}
              <div className="h-px w-full" style={{ background: '#D4AF37', opacity: 0.2 }} />
              {/* Hero name area — large serif */}
              <div
                className="h-4 w-2/3 mt-1"
                style={{ background: '#E8E8E8', opacity: 0.9, borderRadius: 0 }}
              />
              <div
                className="h-2.5 w-1/2"
                style={{ background: '#D4AF37', opacity: 0.6, borderRadius: 0 }}
              />
              {/* Bio line */}
              <div className="h-1 w-full rounded" style={{ background: '#2a2a2a' }} />
              {/* Gold CTA */}
              <div
                className="h-5 w-full mt-auto"
                style={{ background: '#D4AF37', borderRadius: 0 }}
              />
            </>
          )}
          {template.id === 'modern' && (
            <>
              <div className="h-10 w-full rounded"
                style={{ backgroundColor: c.primary }} />
              <div className="h-1.5 w-3/4 bg-gray-600 rounded" />
              <div className="h-1 w-1/2 bg-gray-700 rounded" />
              <div className="h-5 w-full bg-gray-700 rounded mt-auto" />
            </>
          )}
          {template.id === 'warm' && (
            <>
              <div className="flex flex-col items-center gap-1 pt-1">
                <div className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: c.primary }} />
                <div className="h-1.5 w-16 bg-gray-200 rounded" />
                <div className="h-1 w-10 bg-gray-100 rounded" />
              </div>
              <div className="h-5 w-full rounded-xl mt-auto"
                style={{ backgroundColor: c.primary }} />
            </>
          )}
          {template.id === 'premium' && (
            <>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: c.primary }} />
                <div className="space-y-1">
                  <div className="h-1.5 w-14 bg-gray-600 rounded" />
                  <div className="h-1 w-10 bg-gray-700 rounded" />
                </div>
              </div>
              <div className="h-1 w-full bg-gray-800 rounded mt-1" />
              <div className="h-1 w-4/5 bg-gray-800 rounded" />
              <div className="h-5 w-full rounded mt-auto"
                style={{ backgroundColor: c.primary }} />
            </>
          )}
        </div>
      </div>

      {/* Label */}
      <div className="px-3 py-2.5 bg-white border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900">
            {template.name}
          </span>
          {template.plan === 'growth' && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
              Growth
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>
      </div>

      {/* Selected check */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#a3b8b4]
                        flex items-center justify-center">
          <Check size={11} className="text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  )
}
