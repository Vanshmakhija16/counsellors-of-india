'use client'

import { Mail, Phone, MapPin } from 'lucide-react'
import { calculateAge, formatPatientName, type Patient, type PatientStatus } from '@/lib/clinical/patients'

const statusStyles: Record<PatientStatus, string> = {
  active: 'bg-[#d4e4e1] text-[#2d4a47]',
  archived: 'bg-gray-100 text-gray-600',
  discharged: 'bg-amber-50 text-amber-700',
}

export default function PatientHeader({ patient }: { patient: Patient }) {
  return (
    <div className="bg-white rounded-xl border border-[#e8e4df] p-6">
      <div className="flex items-start gap-5">
        <div className="w-14 h-14 rounded-full bg-[#d4e4e1] text-[#2d4a47] flex items-center justify-center text-base font-semibold shrink-0">
          {patient.first_name.charAt(0)}
          {patient.last_name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1
                className="text-2xl font-semibold text-[#1c1c1e]"
                style={{ fontFamily: 'var(--font-fraunces), serif' }}
              >
                {formatPatientName(patient)}
              </h1>
              <p className="text-sm text-[#6b7280] mt-1">
                {(() => {
                  const age = calculateAge(patient.dob)
                  return age !== null ? `${age} yrs` : 'Age not set'
                })()}
                {patient.gender ? ` · ${patient.gender}` : ''}
                {patient.pronouns ? ` · ${patient.pronouns}` : ''}
              </p>
            </div>
            <span
              className={`text-[10px] font-medium px-2 py-1 rounded-full uppercase tracking-wide ${statusStyles[patient.status]}`}
            >
              {patient.status}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#6b7280]">
            {patient.email && (
              <span className="inline-flex items-center gap-1.5">
                <Mail size={13} /> {patient.email}
              </span>
            )}
            {patient.phone && (
              <span className="inline-flex items-center gap-1.5">
                <Phone size={13} /> {patient.phone}
              </span>
            )}
            {patient.address && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} /> {patient.address}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
