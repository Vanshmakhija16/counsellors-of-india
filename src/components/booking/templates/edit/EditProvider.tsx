'use client'

import { useCallback, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { EditContext, type EditContextValue } from './EditContext'
import type { TherapistProfile, ProfileContent } from '../templateUtils'

interface EditProviderProps {
  isOwner: boolean
  therapist: TherapistProfile
  children: React.ReactNode
}

/**
 * Maps TherapistProfile keys (the camelCase shape components render from)
 * to the actual `therapists` table column names in Supabase. Only fields
 * that are simple scalars/arrays stored directly on the row go here —
 * profile_content is handled separately since it's a single jsonb column
 * holding several nested template-specific shapes.
 */
const FIELD_TO_COLUMN: Partial<Record<keyof TherapistProfile, string>> = {
  name: 'full_name',
  credentials: 'title',
  bio: 'bio',
  tagline: 'tagline',
  approach_text: 'approach_text',
  location: 'city',
  specialties: 'specialties',
  languages: 'languages',
  certifications: 'certifications',
  education: 'education',
  phone: 'phone',
  whatsapp: 'whatsapp',
  instagram: 'instagram',
  linkedin: 'linkedin',
  website: 'website',
  fee: 'fee_per_session',
  sessionDuration: 'session_duration_mins',
}

export default function EditProvider({ isOwner, therapist, children }: EditProviderProps) {
  const [editMode, setEditModeState] = useState(false)
  const [draft, setDraft] = useState<TherapistProfile>(therapist)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const setField = useCallback<EditContextValue['setField']>((key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
    setDirty(true)
  }, [])

  const updateProfileContent = useCallback<EditContextValue['updateProfileContent']>((updater) => {
    setDraft((prev) => ({
      ...prev,
      profile_content: updater(prev.profile_content ?? {}) as ProfileContent,
    }))
    setDirty(true)
  }, [])

  const setEditMode = useCallback((v: boolean) => {
    setEditModeState(v)
    // Turning edit mode off without saving discards any unsaved draft —
    // matches the "Save changes" button being the only persistence path.
    if (!v) {
      setDraft(therapist)
      setDirty(false)
      setSaveError(null)
    }
  }, [therapist])

  const discard = useCallback(() => {
    setDraft(therapist)
    setDirty(false)
    setSaveError(null)
  }, [therapist])

  const save = useCallback(async () => {
    if (!draft.id) {
      setSaveError('Missing profile id — cannot save.')
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      const supabase = createClient()

      const update: Record<string, unknown> = {
        profile_content: draft.profile_content ?? {},
      }
      for (const [profileKey, column] of Object.entries(FIELD_TO_COLUMN)) {
        update[column] = (draft as Record<string, unknown>)[profileKey] ?? null
      }

      const { error } = await supabase.from('therapists').update(update).eq('id', draft.id)
      if (error) {
        throw new Error(error.message ?? error.details ?? error.hint ?? 'Failed to save changes.')
      }
      setDirty(false)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }, [draft])

  const value = useMemo<EditContextValue>(() => ({
    isOwner,
    editMode,
    setEditMode,
    draft,
    setField,
    updateProfileContent,
    dirty,
    saving,
    saveError,
    save,
    discard,
  }), [isOwner, editMode, setEditMode, draft, setField, updateProfileContent, dirty, saving, saveError, save, discard])

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>
}
