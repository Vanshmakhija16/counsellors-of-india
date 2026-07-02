'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, Settings, LogOut,
  Clock, Palette, ClipboardList, CreditCard,
  ChevronDown, ExternalLink, User, Zap,
} from 'lucide-react'
import Logo from '../ui/Logo'
import { createClient } from '@/lib/supabase'

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard, match: 'exact'  as const },
  { label: 'Templates',    href: '/dashboard/appearance',   icon: Palette,         match: 'exact'  as const },
  { label: 'Profile',      href: '/dashboard/settings',     icon: Settings,        match: 'exact'  as const },
  { label: 'Availability', href: '/dashboard/availability', icon: Clock,           match: 'exact'  as const },
  { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar,        match: 'exact'  as const },
  { label: 'My Clients',   href: '/clinical/patients',      icon: ClipboardList,   match: 'prefix' as const },
]

const NO_NAV_PREFIXES = ['/dashboard/appearance/live-preview']

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()

  const [gate,        setGate]        = useState<'checking' | 'ok'>('checking')
  const [profileOpen, setProfileOpen] = useState(false)
  const [therapist,   setTherapist]   = useState<{
    full_name?: string; username?: string; plan?: string
  } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const noNav = NO_NAV_PREFIXES.some(p => pathname.startsWith(p))

  /* ── Auth gate ─────────────────────────────────────────────────── */
  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data: { user }, error: userErr } = await supabase.auth.getUser()
      console.log('[DEBUG dashboard-gate] getUser', { userId: user?.id, userErr })
      if (!alive) return
      if (!user) { router.replace('/login?redirect=' + encodeURIComponent(pathname)); return }
      const { data, error: planErr } = await supabase
        .from('therapists')
        .select('plan, full_name, username')
        .eq('id', user.id)
        .maybeSingle()
      console.log('[DEBUG dashboard-gate] plan query', { data, planErr })
      if (!alive) return
      const plan    = data?.plan
      const hasPlan = !!plan && !['none', 'free', ''].includes(plan)
      console.log('[DEBUG dashboard-gate] result', { plan, hasPlan })
      if (hasPlan) { setTherapist(data); setGate('ok') }
      else router.replace('/pricing?redirect=' + encodeURIComponent(pathname))
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Close dropdown on outside click ──────────────────────────── */
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  useEffect(() => { setProfileOpen(false) }, [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(href: string, match: 'exact' | 'prefix') {
    return match === 'prefix'
      ? pathname === href || pathname.startsWith(href + '/')
      : pathname === href
  }

  /* ── Loading spinner ───────────────────────────────────────────── */
  if (gate === 'checking') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFCF8' }}>
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#FF9933', borderTopColor: 'transparent' }} />
    </div>
  )

  if (noNav) return <>{children}</>

  /* ── Derived display values ────────────────────────────────────── */
  const firstName = therapist?.full_name?.trim().split(/\s+/)[0] ?? 'Account'
  const initials  = therapist?.full_name
    ? therapist.full_name.trim().split(/\s+/).map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const planLabel = ({ growth: 'Growth', pro: 'Pro' } as Record<string, string>)[therapist?.plan ?? ''] ?? 'Starter'
  const isPro     = ['growth', 'pro'].includes(therapist?.plan ?? '')

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#FFFCF8', fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif" }}
    >
      {/* ════════════════════════════════════════════════════════════
          NAVBAR
      ════════════════════════════════════════════════════════════ */}
      <header
        className="sticky top-0 z-40 w-full"
        style={{
          background:   'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(31,26,20,0.07)',
        }}
      >
        {/* Inner row — same max-width as page content */}
        <div className="mx-auto flex items-center h-16 px-5 sm:px-8 max-w-6xl gap-5">

          {/* Logo */}
          <Link href="/dashboard" className="shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Divider */}
          <div className="hidden sm:block w-px h-5 shrink-0" style={{ background: 'rgba(31,26,20,0.10)' }} />

          {/* ── Nav links ─────────────────────────────────────── */}
          <nav className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-none min-w-0">
            {navItems.map(({ label, href, icon: Icon, match }) => {
              const active = isActive(href, match)
              return (
                <Link
                  key={href}
                  href={href}
                  className="relative flex items-center gap-2 px-3 h-10 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-150 shrink-0 group"
                  style={active
                    ? { background: 'rgba(255,153,51,0.10)', color: '#C46800' }
                    : { color: '#6b6560' }
                  }
                >
                  <Icon
                    size={14}
                    strokeWidth={active ? 2.3 : 1.9}
                    style={{ flexShrink: 0 }}
                  />
                  <span className="hidden sm:inline">{label}</span>

                  {/* Active underline dot */}
                  {active && (
                    <span
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: '#FF9933' }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* ── Right cluster ─────────────────────────────────── */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">

            {/* View live site — desktop */}
            {therapist?.username && (
              <a
                href={`/${therapist.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12px] font-semibold transition-all duration-150 hover:bg-[#f5f3f0]"
                style={{ color: '#7A7166', border: '1px solid rgba(31,26,20,0.09)' }}
              >
                <ExternalLink size={12} />
                My site
              </a>
            )}

            {/* Upgrade — only shown for non-pro users */}
            {!isPro && (
              <Link
                href="/pricing"
                className="hidden sm:flex items-center gap-1.5 h-9 px-3.5 rounded-xl text-[12px] font-bold transition-all duration-150 hover:brightness-95"
                style={{
                  background: 'rgba(255,153,51,0.09)',
                  color:      '#C46800',
                  border:     '1px solid rgba(255,153,51,0.22)',
                }}
              >
                <Zap size={12} />
                Upgrade
              </Link>
            )}

            {/* ── Profile pill / dropdown ──────────────────────── */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(o => !o)}
                className="flex items-center gap-2.5 h-10 pl-1.5 pr-3 rounded-xl transition-all duration-150"
                style={{
                  border:     '1px solid rgba(31,26,20,0.09)',
                  background: profileOpen ? '#FDF5EC' : 'rgba(255,255,255,0.8)',
                }}
              >
                {/* Avatar circle */}
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0 select-none"
                  style={{ background: 'linear-gradient(135deg,#FF9933,#E07A12)' }}
                >
                  {initials}
                </span>

                {/* Name */}
                <span className="hidden sm:block text-[13px] font-semibold max-w-[72px] truncate" style={{ color: '#2d2926' }}>
                  {firstName}
                </span>

                <ChevronDown
                  size={13}
                  className="transition-transform duration-200"
                  style={{ color: '#B3A998', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {/* ── Dropdown ──────────────────────────────────── */}
              {profileOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden shadow-2xl"
                  style={{
                    background:  '#fff',
                    border:      '1px solid rgba(31,26,20,0.08)',
                    boxShadow:   '0 8px 32px rgba(31,26,20,0.12), 0 2px 8px rgba(31,26,20,0.06)',
                  }}
                >
                  {/* Identity block */}
                  <div className="px-4 py-3.5" style={{ borderBottom: '1px solid rgba(31,26,20,0.07)' }}>
                    <p className="text-[13px] font-bold truncate" style={{ color: '#1c1c1e' }}>
                      {therapist?.full_name ?? 'Your account'}
                    </p>
                    <span
                      className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(255,153,51,0.12)', color: '#C46800' }}
                    >
                      {planLabel} plan
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="p-1.5 space-y-px">
                    {[
                      { label: 'Edit profile', href: '/dashboard/settings', icon: User },
                      ...(therapist?.username
                        ? [{ label: 'View my site', href: `/${therapist.username}`, icon: ExternalLink, external: true }]
                        : []),
                      ...(!isPro ? [{ label: 'Upgrade plan', href: '/pricing', icon: Zap }] : []),
                      ...(!isPro ? [] : []),
                    ].map(item => (
                      item.external ? (
                        <a
                          key={item.label}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors hover:bg-[#FDF5EC] w-full"
                          style={{ color: '#46403A' }}
                        >
                          <item.icon size={14} style={{ color: '#B3A998' }} />
                          {item.label}
                        </a>
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors hover:bg-[#FDF5EC] w-full"
                          style={{ color: '#46403A' }}
                        >
                          <item.icon size={14} style={{ color: '#B3A998' }} />
                          {item.label}
                        </Link>
                      )
                    ))}
                  </div>

                  {/* Logout — red, separated */}
                  <div className="p-1.5" style={{ borderTop: '1px solid rgba(31,26,20,0.07)' }}>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium w-full text-left transition-colors hover:bg-red-50"
                      style={{ color: '#b91c1c' }}
                    >
                      <LogOut size={14} style={{ color: '#b91c1c' }} />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════════
          PAGE CONTENT — centred, max-width matches navbar
      ════════════════════════════════════════════════════════════ */}
      <main className="flex-1 w-full">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
