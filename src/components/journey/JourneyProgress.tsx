'use client'

import { Check } from 'lucide-react'

const BRAND = '#FF9933'

export type JourneyStep = 'account' | 'plan' | 'payment' | 'build'

const STEPS: { id: JourneyStep; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'plan',    label: 'Plan'    },
  { id: 'payment', label: 'Payment' },
  { id: 'build',   label: 'Build site' },
]

interface Props {
  current: JourneyStep
  className?: string
}

/**
 * Shared progress strip carried across signup → pricing → payment success,
 * so the four screens read as ONE flow instead of separate pages.
 * The 4th step ("Build site") lights up as done once the user reaches the
 * dashboard's SetupWizard — link that page's onComplete to a similar visual
 * if you ever surface this strip inside the wizard too.
 */
export default function JourneyProgress({ current, className = '' }: Props) {
  const currentIndex = STEPS.findIndex(s => s.id === current)

  return (
    <div className={`w-full max-w-md mx-auto mb-8 ${className}`}>
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done   = i < currentIndex
          const active = i === currentIndex
          const last   = i === STEPS.length - 1

          return (
            <div key={step.id} className={`flex items-center ${last ? '' : 'flex-1'}`}>
              {/* Circle + label */}
              <div className="flex flex-col items-center shrink-0">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: done ? '#22c55e' : active ? BRAND : '#F5E9D9',
                    boxShadow: active ? `0 0 0 4px ${BRAND}22` : 'none',
                  }}
                >
                  {done ? (
                    <Check size={13} color="#fff" strokeWidth={2.5} />
                  ) : (
                    <span
                      className="text-[11px] font-bold"
                      style={{ color: active ? '#fff' : '#C2A87A' }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
                <span
                  className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide whitespace-nowrap"
                  style={{ color: done ? '#22c55e' : active ? BRAND : '#C2A87A' }}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector */}
              {!last && (
                <div
                  className="h-0.5 flex-1 mx-2 rounded-full transition-all duration-500 -translate-y-2.5"
                  style={{ background: i < currentIndex ? '#22c55e' : '#F0E2CC' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
