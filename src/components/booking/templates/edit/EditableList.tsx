'use client'

import { useEditableTemplate } from './EditContext'
import type { TherapistProfile } from '../templateUtils'

interface EditableListProps {
  /** TherapistProfile field holding a string[] (e.g. languages, certifications, specialties). */
  field: keyof TherapistProfile
  children: (value: string[]) => React.ReactNode
  placeholder?: string
}

/**
 * Same idea as EditableText but for simple string[] fields (languages,
 * certifications, specialties). Edited as one comma-separated input —
 * matches how these are already joined for display everywhere in the
 * template (e.g. `languages.join(', ')`), so there's no new mental model
 * for the owner to learn.
 */
export default function EditableList({ field, children, placeholder }: EditableListProps) {
  const { editMode, draft, setField } = useEditableTemplate()
  const value = (draft[field] as string[] | undefined) ?? []

  if (!editMode) {
    return <>{children(value)}</>
  }

  return (
    <input
      type="text"
      value={value.join(', ')}
      placeholder={placeholder ?? 'Comma-separated list…'}
      onChange={(e) => {
        const next = e.target.value.split(',').map((s) => s.trim()).filter(Boolean)
        setField(field, next as TherapistProfile[typeof field])
      }}
      className="w-full rounded-md border border-dashed border-[#ff9933] px-2 py-1 text-[13px] outline-none focus:border-solid focus:ring-2 focus:ring-[#ff9933]/30"
    />
  )
}
