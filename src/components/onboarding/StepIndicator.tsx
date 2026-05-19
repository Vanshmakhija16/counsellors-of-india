interface Props {
  current: number
  total: number
  steps: string[]
}

export default function StepIndicator({ current, total, steps }: Props) {
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current

        return (
          <div key={label} className="flex items-center">

            {/* Circle */}
            <div className="flex flex-col items-center gap-2">
              <div className={`
                w-9 h-9 rounded-full flex items-center justify-center
                text-sm font-semibold transition-all
                ${done
                  ? 'bg-[#a3b8b4] text-white'
                  : active
                  ? 'bg-[#2d4a47] text-white ring-4 ring-[#d4e4e1]'
                  : 'bg-[#f2f0ed] text-[#6b7280] border border-[#e8e4df]'}
              `}>
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l3.5 3.5L12 3" stroke="white" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : num}
              </div>
              <span className={`
                text-xs font-medium whitespace-nowrap
                ${active ? 'text-[#2d4a47]' : 'text-[#6b7280]'}
              `}>
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < total - 1 && (
              <div className={`
                w-16 h-px mb-5 mx-2 transition-all
                ${done ? 'bg-[#a3b8b4]' : 'bg-[#e8e4df]'}
              `} />
            )}

          </div>
        )
      })}
    </div>
  )
}