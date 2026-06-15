'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Settings, LogOut, Clock, Palette,
  ClipboardList, Menu, X, CreditCard,
} from 'lucide-react'
import Logo from '../ui/Logo'
import { createClient } from '@/lib/supabase'

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard, match: 'exact' as const },
  { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar,        match: 'exact' as const },
  { label: 'My Clients',   href: '/clinical/patients',      icon: ClipboardList,   match: 'prefix' as const },
  { label: 'Settings',     href: '/dashboard/settings',     icon: Settings,        match: 'exact' as const },
  { label: 'Availability', href: '/dashboard/availability', icon: Clock,           match: 'exact' as const },
  { label: 'Appearance',   href: '/dashboard/appearance',   icon: Palette,         match: 'exact' as const },
  { label: 'Payments',     href: '/dashboard/payments',     icon: CreditCard,      match: 'exact' as const },
]

const upgradeItem = { label: 'Upgrade Plan', href: '/pricing', icon: CreditCard, match: 'exact' as const }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
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

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = prev }
    }
  }, [mobileOpen])

  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) { console.error('Logout failed:', error.message); return }
    router.push('/login')
  }

  function isActive(href: string, match: 'exact' | 'prefix') {
    return match === 'prefix'
      ? pathname === href || pathname.startsWith(href + '/')
      : pathname === href
  }

  if (gate === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFCF8' }}>
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#FF9933', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#FFFCF8', fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}>

      {/* ── Mobile top bar ───────────────────────────────────────── */}
      <header
        className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4"
        style={{ background: '#ffffff', borderBottom: '1px solid rgba(31,26,20,0.08)' }}
      >
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="h-9 w-9 rounded-lg flex items-center justify-center transition"
          style={{ color: '#46403A' }}
        >
          <Menu size={20} />
        </button>
        <Logo size="sm" />
        <div className="w-9" />
      </header>

      {/* ── Backdrop ─────────────────────────────────────────────── */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40"
          style={{ background: 'rgba(20,17,12,0.45)' }}
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`
          flex flex-col shrink-0
          fixed inset-y-0 left-0 z-50 w-64
          transform transition-transform duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:w-60
        `}
        style={{
          background: '#ffffff',
          borderRight: '1px solid rgba(31,26,20,0.08)',
        }}
      >
        {/* Logo row */}
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(31,26,20,0.08)' }}>
          <Logo size="sm" />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center transition"
            style={{ color: '#7A7166' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, match }) => {
            const active = isActive(href, match)
            return (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={active ? {
                  background: 'rgba(255,153,51,0.10)',
                  color: '#C46800',
                  borderLeft: '3px solid #FF9933',
                  paddingLeft: '9px',
                } : {
                  color: '#7A7166',
                  borderLeft: '3px solid transparent',
                  paddingLeft: '9px',
                }}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}

          {/* Divider */}
          <div className="my-3" style={{ height: '1px', background: 'rgba(31,26,20,0.07)' }} />

          {/* Upgrade */}
          <Link
            href={upgradeItem.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: 'rgba(255,153,51,0.07)',
              color: '#E07A12',
              border: '1px solid rgba(255,153,51,0.22)',
            }}
          >
            <upgradeItem.icon size={17} />
            {upgradeItem.label}
          </Link>
        </nav>

        {/* Logout */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(31,26,20,0.08)' }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold w-full transition-all"
            style={{ color: '#7A7166', background: 'transparent' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = '#FDF5EC'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#C46800'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#7A7166'
            }}
          >
            <LogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
