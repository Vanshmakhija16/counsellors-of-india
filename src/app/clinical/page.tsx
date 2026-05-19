'use client'

import Link from 'next/link'
import { Users, ClipboardList, Stethoscope, BookOpen, ArrowRight } from 'lucide-react'

const cards = [
  {
    title: 'Patients',
    desc: 'Add a new patient or open an existing chart.',
    href: '/clinical/patients',
    icon: Users,
  },
  {
    title: 'Intake forms',
    desc: 'Capture demographics, history, and presenting concern.',
    href: '/clinical/intake',
    icon: ClipboardList,
  },
  {
    title: 'Screening',
    desc: 'PHQ-9, GAD-7, and validated instruments.',
    href: '/clinical/screening',
    icon: Stethoscope,
  },
  {
    title: 'Resources',
    desc: 'Curated reading, worksheets, and assignments.',
    href: '/clinical/resources',
    icon: BookOpen,
  },
]

export default function ClinicalHomePage() {
  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-fraunces), serif' }}
        >
          Clinical workspace
        </h1>
        <p className="text-[#6b7280] mt-1">
          Manage patients, intake, screening, and resources in one place.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {cards.map(({ title, desc, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group bg-white rounded-xl border border-[#e8e4df] p-5 transition hover:border-[#b8ceca] hover:shadow-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center mb-4">
              <Icon size={18} />
            </div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1c1c1e]">{title}</h2>
              <ArrowRight
                size={16}
                className="text-[#6b7280] transition group-hover:translate-x-1 group-hover:text-[#2d4a47]"
              />
            </div>
            <p className="text-sm text-[#6b7280] mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
