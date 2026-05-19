import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ComingSoonProps {
  title: string
  desc: string
  patientId: string
  icon: LucideIcon
}

export default function ComingSoon({ title, desc, patientId, icon: Icon }: ComingSoonProps) {
  return (
    <div className="bg-white rounded-xl border border-[#e8e4df] px-6 py-16 text-center">
      <div className="w-12 h-12 mx-auto rounded-full bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center mb-4">
        <Icon size={20} />
      </div>
      <h2
        className="text-xl font-semibold text-[#1c1c1e]"
        style={{ fontFamily: 'var(--font-fraunces), serif' }}
      >
        {title} — coming soon
      </h2>
      <p className="text-sm text-[#6b7280] mt-2 max-w-md mx-auto">{desc}</p>
      <Link
        href={`/clinical/patients/${patientId}`}
        className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-[#2d4a47] hover:underline"
      >
        <ArrowLeft size={13} />
        Back to overview
      </Link>
    </div>
  )
}
