'use client'

import { createContext, useContext } from 'react'
import type { TherapistProfile } from '../templateUtils'

/**
 * Live-site inline editing context for template owners.
 *
 * Architecture:
 * -----------------------------------------------------------------------
 * When the logged-in owner views their own public profile page, they see
 * a floating "Edit" toggle. Turning it on lets them click any piece of
 * text on the page and change it directly, in place — no separate
 * dashboard form. Changes are held in local React state (`draft`) and
 * only written to Supabase when they press "Save changes".
 *
 * `draft` starts as a deep-ish copy of the server-rendered `therapist`
 * prop. Every section component reads field values through this context
 * instead of directly off the original `therapist` prop, so edits show
 * up live before saving. `setField` updates a top-level TherapistProfile
 * key; `setNestedField` updates something inside profile_content (e.g.
 * a single service's description) via a dot-path-free updater function.
 */

export interface EditContextValue {
  isOwner: boolean
  editMode: boolean
  setEditMode: (v: boolean) => void
  draft: TherapistProfile
  setField: <K extends keyof TherapistProfile>(key: K, value: TherapistProfile[K]) => void
  /** Generic updater for anything nested under draft.profile_content */
  updateProfileContent: (updater: (current: NonNullable<TherapistProfile['profile_content']>) => NonNullable<TherapistProfile['profile_content']>) => void
  dirty: boolean
  saving: boolean
  saveError: string | null
  save: () => Promise<void>
  discard: () => void
}

export const EditContext = createContext<EditContextValue | null>(null)

/**
 * Safe to call from any section component. Returns a context with
 * editMode always false when there is no provider above it (e.g. the
 * /preview/* template-preview routes, which intentionally never wrap
 * their templates in an EditProvider) — so every section component can
 * unconditionally call this hook without needing to know whether editing
 * is even possible on the page it's rendered in.
 */
export function useEditableTemplate(): EditContextValue {
  const ctx = useContext(EditContext)
  if (ctx) return ctx
  return {
    isOwner: false,
    editMode: false,
    setEditMode: () => {},
    draft: {} as TherapistProfile,
    setField: () => {},
    updateProfileContent: () => {},
    dirty: false,
    saving: false,
    saveError: null,
    save: async () => {},
    discard: () => {},
  }
}
