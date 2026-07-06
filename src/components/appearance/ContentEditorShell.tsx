'use client'

import { ArrowLeft, ChevronRight } from 'lucide-react'
import type React from 'react'

type SectionOption<T extends string> = {
  id: T
  label: string
  meta?: string
  description?: string
}

interface Props<T extends string> {
  activeSection: T | null
  sections: SectionOption<T>[]
  onSelect: (section: T | null) => void
  children: React.ReactNode
  saveButton?: React.ReactNode
}

export default function ContentEditorShell<T extends string>({
  activeSection,
  sections,
  onSelect,
  children,
  saveButton,
}: Props<T>) {
  const active = sections.find(section => section.id === activeSection)

  if (!activeSection) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map(section => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            className="group flex min-h-32 flex-col justify-between rounded-lg border border-[#e8e4df] bg-white p-4 text-left transition hover:border-[#7a9994] hover:bg-[#fbfaf8] hover:shadow-sm"
          >
            <span>
              <span className="block text-sm font-semibold text-[#1c1c1e]">{section.label}</span>
              {section.description && (
                <span className="mt-2 block text-sm leading-5 text-[#766c62]">{section.description}</span>
              )}
            </span>
            <span className="mt-4 flex items-center justify-between gap-3">
              {section.meta && (
                <span className="rounded-full bg-[#f4f0ea] px-2.5 py-1 text-xs font-semibold text-[#6f665d]">
                  {section.meta}
                </span>
              )}
              <ChevronRight size={16} className="ml-auto text-[#b8b0a8] transition group-hover:text-[#5a7f7a]" />
            </span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full" style={{ maxHeight: 'calc(100vh - 220px)' }}>
      <div className="flex flex-col gap-2 border-b border-[#e8e4df] pb-3 flex-shrink-0">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-[#e8e4df] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5f564d] transition hover:border-[#b8ceca] hover:bg-[#fbfaf8]"
          >
            <ArrowLeft size={13} />
            All sections
          </button>
          {saveButton && <div className="sm:ml-auto">{saveButton}</div>}
        </div>

        <div>
          <p className="text-sm font-semibold text-[#1c1c1e]">{active?.label ?? 'Content section'}</p>
        </div>
      </div>

      <nav className="flex gap-1.5 overflow-x-auto py-2 flex-shrink-0" aria-label="Content sections">
        {sections.map(section => {
          const selected = section.id === activeSection

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              aria-current={selected ? 'page' : undefined}
              className={`shrink-0 rounded-lg border px-2.5 py-1.5 text-left transition ${
                selected
                  ? 'border-[#7a9994] bg-[#eef7f5] text-[#153f39] shadow-sm'
                  : 'border-[#e8e4df] bg-white text-[#38322d] hover:border-[#b8ceca] hover:bg-[#fbfaf8]'
              }`}
            >
              <span className="block text-xs font-semibold">{section.label}</span>
            </button>
          )
        })}
      </nav>

      <section className="min-w-0 rounded-lg border border-[#e8e4df] bg-[#fdfcfb] p-3 overflow-y-auto flex-1">
        {children}
      </section>
    </div>
  )
}
