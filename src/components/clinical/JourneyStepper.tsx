'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, Stethoscope, BookOpen, User, Check } from 'lucide-react'

interface JourneyStepperProps {
  patientId: string
  completed?: Partial<Record<'intake' | 'screening' | 'diagnosis' | 'resources', boolean>>
}

export default function JourneyStepper({ patientId, completed = {} }: JourneyStepperProps) {
  const pathname = usePathname()
  const base = `/clinical/patients/${patientId}`

  const steps = [
    { key: 'overview', label: 'Overview', href: base, icon: User, done: true },
    { key: 'intake', label: 'Intake', href: `${base}/intake`, icon: ClipboardList, done: !!completed.intake },
    { key: 'screening', label: 'Screening', href: `${base}/screening`, icon: Stethoscope, done: !!completed.screening },
    { key: 'diagnosis', label: 'Diagnosis', href: `${base}/diagnosis`, icon: ClipboardList, done: !!completed.diagnosis },
    { key: 'resources', label: 'Resources', href: `${base}/resources`, icon: BookOpen, done: !!completed.resources },
  ]

  return (
    <nav
      aria-label="Patient journey"
      className="bg-white rounded-xl border border-[#e8e4df] p-2 flex items-center gap-1 overflow-x-auto"
    >
      {steps.map((step) => {
        const active = pathname === step.href
        const Icon = step.icon
        return (
          <Link
            key={step.key}
            href={step.href}
            className={`group inline-flex items-center gap-2 px-3 h-10 rounded-lg text-sm font-medium transition shrink-0 ${
              active
                ? 'bg-[#d4e4e1] text-[#2d4a47]'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step.done
                  ? 'bg-[#2d4a47] text-white'
                  : active
                  ? 'bg-white text-[#2d4a47] border border-[#2d4a47]'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {step.done ? <Check size={11} strokeWidth={3} /> : <Icon size={11} />}
            </span>
            {step.label}
          </Link>
        )
      })}
    </nav>
  )
}
