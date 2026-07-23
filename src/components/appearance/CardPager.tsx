'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react'

interface Props<T> {
  items: T[]
  onChange: (items: T[]) => void
  newItem: () => T
  /** Short label shown in the header for the current card, e.g. the slide's title or "Untitled". */
  itemLabel: (item: T, index: number) => string
  /** The actual edit fields for one item. */
  renderItem: (item: T, update: (patch: Partial<T>) => void) => React.ReactNode
  maxItems?: number
  addButtonLabel?: string
  emptyLabel?: string
}

/**
 * Shows ONE item at a time with Prev / Next arrows, instead of dumping every
 * item's full form on the page at once. This is the fix for "it shows me
 * everything at the same time and it's confusing" — one card, one focus,
 * arrows to move between them, dots to jump directly.
 *
 * Kept deliberately compact (tight header, small dots row, snug card padding)
 * so a 2-3 field item fits on one screen without scrolling.
 */
export default function CardPager<T>({
  items, onChange, newItem, itemLabel, renderItem,
  maxItems = 8, addButtonLabel = 'Add another', emptyLabel = 'Nothing here yet',
}: Props<T>) {
  const [index, setIndex] = useState(0)
  const safeIndex = Math.min(index, Math.max(items.length - 1, 0))
  const current = items[safeIndex]

  function update(patch: Partial<T>) {
    onChange(items.map((it, i) => i === safeIndex ? { ...it, ...patch } : it))
  }

  function addOne() {
    const next = [...items, newItem()]
    onChange(next)
    setIndex(next.length - 1)
  }

  function removeCurrent() {
    const next = items.filter((_, i) => i !== safeIndex)
    onChange(next)
    setIndex(Math.max(0, safeIndex - 1))
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-6 rounded-lg border border-dashed border-[#d9d1c7] bg-white">
        <p className="text-sm text-[#9ca3af] mb-2">{emptyLabel}</p>
        <div className="flex justify-center">
          <button onClick={addOne} className={addBtn}><Plus size={13} /> {addButtonLabel}</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* ── Header: prev / label + counter + dots / next — one compact block ── */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <button
          type="button"
          onClick={() => setIndex(i => Math.max(0, i - 1))}
          disabled={safeIndex === 0}
          aria-label="Previous"
          className="h-7 w-7 shrink-0 rounded-lg border border-[#e8e4df] bg-white flex items-center justify-center text-[#6b7280] transition hover:bg-[#fff7ee] hover:border-[#FF9933] hover:text-[#C46800] disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-[#e8e4df] disabled:hover:text-[#6b7280]"
        >
          <ChevronLeft size={15} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-sm font-semibold text-[#1c1c1e] truncate leading-tight">{itemLabel(current, safeIndex)}</p>
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <span className="text-[10px] text-[#9ca3af] tabular-nums">{safeIndex + 1}/{items.length}</span>
            {items.length > 1 && (
              <div className="flex items-center gap-1">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to ${i + 1}`}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === safeIndex ? 14 : 5,
                      background: i === safeIndex ? '#FF9933' : '#e8e4df',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIndex(i => Math.min(items.length - 1, i + 1))}
          disabled={safeIndex === items.length - 1}
          aria-label="Next"
          className="h-7 w-7 shrink-0 rounded-lg border border-[#e8e4df] bg-white flex items-center justify-center text-[#6b7280] transition hover:bg-[#fff7ee] hover:border-[#FF9933] hover:text-[#C46800] disabled:opacity-30 disabled:hover:bg-white disabled:hover:border-[#e8e4df] disabled:hover:text-[#6b7280]"
        >
          <ChevronRight size={15} />
        </button>
      </div>

      {/* ── Current card ── */}
      <div className="rounded-lg border border-[#e8e4df] p-3 bg-white space-y-2">
        {renderItem(current, update)}
      </div>

      {/* ── Footer actions ── */}
      <div className="flex items-center gap-2 mt-2">
        <button type="button" onClick={removeCurrent}
          className="flex items-center gap-1.5 text-xs font-medium text-[#b45050] hover:text-red-600 transition px-2.5 py-1.5 shrink-0">
          <Trash2 size={13} /> Delete
        </button>
        {items.length < maxItems && (
          <button type="button" onClick={addOne} className={addBtn + ' flex-1'}>
            <Plus size={13} /> {addButtonLabel}
          </button>
        )}
      </div>
    </div>
  )
}

const addBtn = `flex items-center justify-center gap-1.5 text-xs font-medium text-[#5a7f7a]
  hover:text-[#3d5c58] border border-dashed border-[#b8ceca] rounded-lg
  px-3 py-1.5 hover:bg-[#f0f8f7] transition`
