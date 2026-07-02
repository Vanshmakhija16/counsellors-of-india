'use client'

import { useEditableTemplate } from './EditContext'
import type { TherapistProfile } from '../templateUtils'

interface EditableTextProps {
  /** Top-level TherapistProfile field this text is bound to. */
  field: keyof TherapistProfile
  /** Render the current value however the section normally would — e.g. wrapped in spans for styling/splitting. Receives the *live* (draft) value. */
  children: (value: string) => React.ReactNode
  /** 'input' for short single-line fields (name, tagline), 'textarea' for longer prose (bio). */
  as?: 'input' | 'textarea'
  placeholder?: string
  className?: string
}

/**
 * Wraps a single editable text field. Outside edit mode this is
 * completely invisible — it renders exactly what `children(value)`
 * returns, with zero extra DOM, so visitors and non-owners see the
 * normal page unchanged.
 *
 * In edit mode, hovering shows a dashed outline + pencil affordance;
 * clicking swaps the rendered content for a borderless input/textarea
 * pre-filled with the current value, auto-sized to roughly match
 * surrounding text. Blur or Escape exits back to the rendered view
 * (Escape discards the in-progress keystroke back to the last committed
 * draft value, Enter/blur commits it to the shared draft via setField).
 */
export default function EditableText({ field, children, as = 'input', placeholder, className }: EditableTextProps) {
  const { editMode, draft, setField } = useEditableTemplate()
  const value = (draft[field] as string) ?? ''

  if (!editMode) {
    return <>{children(value)}</>
  }

  const commonProps = {
    value,
    placeholder: placeholder ?? 'Click to edit…',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setField(field, e.target.value as TherapistProfile[typeof field]),
    className: [
      'w-full rounded-md border border-dashed border-[#ff9933] px-2 py-1 outline-none',
      'focus:border-solid focus:ring-2 focus:ring-[#ff9933]/30',
      className ?? '',
    ].join(' '),
  }

  return as === 'textarea' ? (
    <textarea {...commonProps} rows={4} />
  ) : (
    <input {...commonProps} type="text" />
  )
}
