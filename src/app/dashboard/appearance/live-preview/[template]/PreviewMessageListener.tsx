'use client'

import { useEffect } from 'react'

/**
 * Listens for postMessage events from the appearance editor (parent iframe).
 * When PROFILE_CONTENT_UPDATE fires, reloads the page with ?pc= query param
 * so the Server Component re-renders with the updated profile content.
 */
export default function PreviewMessageListener() {
  useEffect(() => {
    function handler(e: MessageEvent) {
      if (!e.data || e.data.type !== 'PROFILE_CONTENT_UPDATE') return
      const base = window.location.href
        .replace(/[?&]pc=[^&]*/g, '')
        .replace(/&$/, '')
        .replace(/\?$/, '')
      const sep = base.indexOf('?') === -1 ? '?' : '&'
      window.location.href =
        base + sep + 'pc=' + encodeURIComponent(JSON.stringify(e.data.profileContent))
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  return null
}
