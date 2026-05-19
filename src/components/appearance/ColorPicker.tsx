import { COLORS, ColorId } from '@/lib/template'
import { Check } from 'lucide-react'

interface Props {
  selected: ColorId
  onSelect: (id: ColorId) => void
}

export default function ColorPicker({ selected, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {COLORS.map(color => (
        <button
          key={color.id}
          onClick={() => onSelect(color.id)}
          className="flex flex-col items-center gap-2 group"
        >
          <div
            className={`
              w-10 h-10 rounded-full transition flex items-center justify-center
              border-4
              ${selected === color.id ? 'border-gray-300 scale-110' : 'border-transparent'}
            `}
            style={{ backgroundColor: color.primary }}
          >
            {selected === color.id && (
              <Check size={14} className="text-white" strokeWidth={3} />
            )}
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-700">
            {color.name}
          </span>
        </button>
      ))}
    </div>
  )
}