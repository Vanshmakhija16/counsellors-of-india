'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface Pos { x: number; y: number }

/**
 * A floating, draggable cluster of action buttons — like the Next.js dev
 * indicator. The user can grab the handle and move it anywhere; position is
 * remembered in localStorage. Clicks on the buttons still fire normally
 * (a drag is only registered after the pointer moves a few px).
 *
 * Position is tracked as { x, y } = top-left coordinates in the viewport.
 * If no saved position exists, it centers itself horizontally within the
 * nearest ancestor with [data-dock-bounds] (falls back to the viewport),
 * at a configurable distance from the top.
 */
export default function DraggableDock({
  storageKey = 'appearance-dock-pos',
  defaultTop = 16,
  children,
}: {
  storageKey?: string
  defaultTop?: number
  children: ReactNode
}) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<Pos | null>(null)
  const [dragging, setDragging] = useState(false)
  const dragState = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(null)

  // On mount: restore saved position, or compute a default that centers the
  // dock horizontally within its bounding container (e.g. the header row).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) { setPos(JSON.parse(raw)); return }
    } catch { /* ignore */ }

    const el = wrapperRef.current
    const bounds = el?.closest('[data-dock-bounds]') as HTMLElement | null
    const rect = bounds?.getBoundingClientRect()
    const width = el?.offsetWidth ?? 260

    if (rect) {
      setPos({ x: rect.left + rect.width / 2 - width / 2, y: rect.top + defaultTop })
    } else {
      setPos({ x: window.innerWidth / 2 - width / 2, y: defaultTop })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  function onPointerDown(e: React.PointerEvent) {
    // Only start a drag from the handle (elements marked data-drag-handle).
    if (!(e.target as HTMLElement).closest('[data-drag-handle]')) return
    if (!pos) return
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    dragState.current = { startX: e.clientX, startY: e.clientY, origX: pos.x, origY: pos.y, moved: false }
    setDragging(true)
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragState.current
    if (!d) return
    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) d.moved = true
    const el = wrapperRef.current
    const width = el?.offsetWidth ?? 260
    const height = el?.offsetHeight ?? 48
    const next = {
      x: Math.max(8, Math.min(window.innerWidth - width - 8,  d.origX + dx)),
      y: Math.max(8, Math.min(window.innerHeight - height - 8, d.origY + dy)),
    }
    setPos(next)
  }

  function onPointerUp() {
    const d = dragState.current
    if (d?.moved && pos) {
      try { localStorage.setItem(storageKey, JSON.stringify(pos)) } catch { /* ignore */ }
    }
    dragState.current = null
    setDragging(false)
  }

  return (
    <div
      ref={wrapperRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="fixed z-[60] select-none"
      style={{
        left: pos?.x ?? 0,
        top: pos?.y ?? 0,
        visibility: pos ? 'visible' : 'hidden',
        cursor: dragging ? 'grabbing' : undefined,
        touchAction: 'none',
      }}
    >
      {children}
    </div>
  )
}
