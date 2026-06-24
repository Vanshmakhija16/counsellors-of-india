'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function AppearanceAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [gate, setGate] = useState<'checking' | 'ok'>('checking')

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!alive) return
      if (!user) { router.replace('/login?redirect=' + encodeURIComponent(pathname)); return }
      const { data } = await supabase.from('therapists').select('plan').eq('id', user.id).maybeSingle()
      if (!alive) return
      const plan = data?.plan
      const hasPlan = !!plan && !['none', 'free', ''].includes(plan)
      if (hasPlan) {
        setGate('ok')
      } else {
        router.replace('/pricing?redirect=' + encodeURIComponent(pathname))
      }
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (gate === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFCF8' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#FF9933', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return <>{children}</>
}
