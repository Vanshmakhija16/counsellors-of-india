'use client'

import { useEditableTemplate } from './EditContext'

/**
 * Floating control shown only to the logged-in owner viewing their own
 * public page. Toggles inline editing on/off and, once there are unsaved
 * changes, shows a "Save changes" / "Discard" bar.
 *
 * Rendered at the root of ClassicTemplate so it stays fixed to the
 * viewport regardless of scroll position within the page.
 */
export default function EditToggle() {
  const { isOwner, editMode, setEditMode, dirty, saving, saveError, save, discard } = useEditableTemplate()

  if (!isOwner) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-[999] flex flex-col items-end gap-2"
      style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}
    >
      {editMode && dirty && (
        <div className="flex items-center gap-2 rounded-full bg-[#1f1b16] px-3 py-2 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)]">
          {saveError && <span className="max-w-[220px] truncate text-[12px] text-red-300">{saveError}</span>}
          <button
            onClick={discard}
            disabled={saving}
            className="rounded-full px-3 py-1.5 text-[12.5px] font-medium text-[#efe7d6]/70 transition hover:text-[#efe7d6] disabled:opacity-50"
          >
            Discard
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-full bg-[#ff9933] px-4 py-1.5 text-[12.5px] font-semibold text-[#1f1b16] transition hover:bg-[#ffb35c] disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}

      <button
        onClick={() => setEditMode(!editMode)}
        className={[
          'flex h-12 items-center gap-2 rounded-full px-5 text-[13px] font-semibold shadow-[0_10px_30px_-8px_rgba(0,0,0,0.45)] transition',
          editMode
            ? 'bg-[#ff9933] text-[#1f1b16]'
            : 'bg-[#1f1b16] text-[#efe7d6] hover:bg-black',
        ].join(' ')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
        </svg>
        {editMode ? 'Edit Mode - click text to change it' : 'Edit my page'}
      </button>
    </div>
  )
}
