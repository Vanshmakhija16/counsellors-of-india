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