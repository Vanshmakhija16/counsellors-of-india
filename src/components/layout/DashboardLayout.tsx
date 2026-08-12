'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Calendar, LogOut,
  Clock, User,
  ExternalLink, X, Menu,
  CreditCard, FileText, ChevronDown,
} from 'lucide-react'
import { useSupabaseClient } from '@/components/providers/TenantSupabaseProvider'

const NAV_MAIN = [
  { label: 'Dashboard',       href: '/dashboard',              icon: LayoutDashboard, match: 'exact'  as const },
  // 'Templates' used to be its own top-level nav item pointing straight at
  // /dashboard/appearance. That duplicated the "Template & Design" and
  // "Page Layout" tabs already inside Website Content, and having template
  // editing live in two disconnected places was confusing. The appearance
  // page still exists (linked from the Template tab as "live preview &
  // switcher" for people who want it) — it's just no longer a separate
  // top-level destination.
  // { label: 'Templates',    href: '/dashboard/appearance',   icon: Palette,         match: 'exact'  as const },
  { label: 'Website Content', href: '/dashboard/profile',      icon: User,            match: 'prefix' as const },
  { label: 'Bookings',        href: '/dashboard/appointments', icon: Calendar,        match: 'prefix' as const },
  { label: 'Availability',    href: '/dashboard/availability', icon: Clock,           match: 'prefix' as const },
]

const NAV_BOTTOM = [
  { label: 'Payments', href: '/dashboard/payments',  icon: CreditCard, match: 'prefix' as const },
  // { label: 'Notes',    href: '/dashboard/notes',     icon: FileText,   match: 'prefix' as const },
  // { label: 'Settings', href: '/dashboard/settings',  icon: Settings,   match: 'prefix' as const },
]

const SAFFRON = '#FF9933'
const INK     = '#1a1614'
const NO_NAV_PREFIXES = ['/dashboard/appearance/live-preview']

function SideLink({
  label, href, active, icon: Icon, onClick,
}: {
  label: string; href: string; active: boolean
  icon: React.ElementType; onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3.5 px-4 py-3 text-[15px] font-semibold transition-colors duration-150 rounded-lg"
      style={active
        ? { color: SAFFRON, background: 'rgba(255,153,51,0.07)' }
        : { color: '#6b6560' }
      }
    >
      <Icon
        size={17}
        strokeWidth={active ? 2.2 : 1.8}
        style={{ flexShrink: 0, color: active ? SAFFRON : '#a09890' }}
      />
      {label}
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = useSupabaseClient()

  const [gate,       setGate]       = useState<'checking' | 'ok'>('checking')
  const [therapist,  setTherapist]  = useState<{ full_name?: string; username?: string; plan?: string; email?: string } | null>(null)
  const [planExpired, setPlanExpired] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const profileBtnRef = useRef<HTMLButtonElement>(null)

  const noNav = NO_NAV_PREFIXES.some(p => pathname.startsWith(p))

  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!alive) return
      if (!user) { router.replace('/login?redirect=' + encodeURIComponent(pathname)); return }
      const { data } = await supabase.from('therapists').select('plan, full_name, username').eq('id', user.id).maybeSingle()
      if (!alive) return
      const plan    = data?.plan
      const hasPlan = !!plan && !['none', 'free', ''].includes(plan)
      if (hasPlan) {
        setTherapist({ ...data, email: user.email ?? undefined })
        setGate('ok')

        // Lazy expiry check -- fire-and-forget, doesn't block rendering.
        // If the plan just expired, this downgrades it server-side and we
        // reflect that in the UI (banner + sidebar) without a reload.
        fetch('/api/subscription/check-expiry', { method: 'POST' })
          .then(res => res.json())
          .then(result => {
            if (!alive) return
            if (result?.expired) {
              setPlanExpired(true)
              setTherapist(prev => prev ? { ...prev, plan: 'starter' } : prev)
            }
          })
          .catch(err => console.error('[DashboardLayout] check-expiry failed:', err))
      }
      else router.replace('/pricing?redirect=' + encodeURIComponent(pathname))
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { setMobileOpen(false); setProfileMenuOpen(false) }, [pathname])

  useEffect(() => {
    if (!profileMenuOpen) return
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (dropdownRef.current?.contains(target)) return
      if (profileBtnRef.current?.contains(target)) return
      setProfileMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [profileMenuOpen])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  function isActive(href: string, match: 'exact' | 'prefix') {
    return match === 'prefix'
      ? pathname === href || pathname.startsWith(href + '/')
      : pathname === href
  }

  if (gate === 'checking') return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#fff' }}>
      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: SAFFRON, borderTopColor: 'transparent' }} />
    </div>
  )

  if (noNav) return <>{children}</>

  const firstName = therapist?.full_name?.trim().split(/\s+/)
    .filter(p => !/^(dr|mr|mrs|ms|miss|mx|prof)\.?$/i.test(p))[0] ?? 'Account'
  const initials = therapist?.full_name
    ? therapist.full_name.trim().split(/\s+/)
        .filter((p: string) => !/^(dr|mr|mrs|ms)\.?$/i.test(p))
        .map((w: string) => w[0]?.toUpperCase()).slice(0, 2).join('')
    : '?'
  const planLabel = ({ growth: 'Growth', pro: 'Pro', starter: 'Starter' } as Record<string, string>)[therapist?.plan ?? ''] ?? 'Starter'
  const isPro     = ['growth', 'pro'].includes(therapist?.plan ?? '')

  const SidebarContent = ({ onClose }: { onClose?: () => void }) => (
    <div className="flex flex-col h-full bg-white">

      {/* Brand */}
      <div className="px-5 pt-7 pb-5">
        {onClose && (
          <button onClick={onClose} className="float-right p-1 text-[#bbb] hover:text-[#555] transition">
            <X size={16} />
          </button>
        )}
        <p className="text-[19px] font-black tracking-tight leading-tight" style={{ color: INK }}>
          Dashboard
        </p>
        <p className="text-[12px] mt-0.5" style={{ color: '#9a9188' }}>
          Manage your practice
        </p>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="space-y-0.5">
          {NAV_MAIN.map(item => (
            <SideLink
              key={item.href}
              {...item}
              active={isActive(item.href, item.match)}
              onClick={onClose}
            />
          ))}
        </div>

        <div className="mt-1 space-y-0.5">
          {NAV_BOTTOM.map(item => (
            <SideLink
              key={item.href}
              {...item}
              active={isActive(item.href, item.match)}
              onClick={onClose}
            />
          ))}
          {therapist?.username && (
            <a
              href={`/${therapist.username}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="flex items-center gap-3.5 px-4 py-3 text-[15px] font-semibold transition-colors duration-150 rounded-lg"
              style={{ color: '#6b6560' }}
            >
              <ExternalLink size={17} strokeWidth={1.8} style={{ flexShrink: 0, color: '#a09890' }} />
              View live site
            </a>
          )}
        </div>
      </nav>

      {/* Profile + logout — click the profile row to reveal actions */}
      <div className="relative border-t px-4 py-4" style={{ borderColor: '#f0ece6' }}>
        <button
          ref={profileBtnRef}
          onClick={() => setProfileMenuOpen(o => !o)}
          aria-expanded={profileMenuOpen}
          className="flex items-center gap-3 w-full rounded-lg -mx-1.5 px-1.5 py-1 text-left transition hover:bg-[#f7f4f0]"
        >
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#FF9933,#C2650A)' }}
          >
            {initials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold truncate" style={{ color: INK }}>{firstName}</p>
            {therapist?.email ? (
              <p className="text-[11px] truncate" style={{ color: '#9a9188' }} title={therapist.email}>{therapist.email}</p>
            ) : (
              <p className="text-[11px]" style={{ color: '#9a9188' }}>{planLabel} plan</p>
            )}
          </div>
          {!isPro ? (
            <Link
              href="/pricing"
              onClick={e => e.stopPropagation()}
              className="shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white transition hover:brightness-95"
              style={{ background: SAFFRON }}
            >
              Upgrade
            </Link>
          ) : (
            <ChevronDown
              size={15}
              className="shrink-0 transition-transform"
              style={{ color: '#a09890', transform: profileMenuOpen ? 'rotate(180deg)' : 'none' }}
            />
          )}
        </button>

        {profileMenuOpen && (
          <div
            ref={dropdownRef}
            className="absolute left-4 right-4 bottom-[calc(100%-4px)] mb-1 space-y-0.5 rounded-lg border bg-white p-1.5 shadow-lg"
            style={{ borderColor: '#ede8e2' }}
          >
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-2 py-2 rounded-lg text-[13px] font-semibold text-left transition hover:bg-red-50 text-red-600"
            >
              <LogOut size={15} style={{ color: '#f87171' }} /> Log out
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#f7f4f0', fontFamily: "'Plus Jakarta Sans','Inter',system-ui,sans-serif" }}
    >
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block fixed top-0 left-0 h-screen w-[260px] z-30 border-r"
        style={{ borderColor: '#ede8e2' }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="fixed top-0 left-0 h-screen w-[260px] z-50 lg:hidden border-r"
            style={{ borderColor: '#ede8e2' }}
          >
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 lg:pl-[260px]">

        {/* Mobile top bar */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 h-14 bg-white border-b"
          style={{ borderColor: '#ede8e2' }}
        >
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg transition hover:bg-[#f7f4f0]"
            style={{ color: '#555' }}
          >
            <Menu size={20} />
          </button>
          <p className="text-[14px] font-black" style={{ color: INK }}>Dashboard</p>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-5 sm:px-8 py-8">
            {planExpired && (
              <div
                className="mb-6 flex flex-col items-start justify-between gap-3 rounded-xl border px-5 py-4 sm:flex-row sm:items-center"
                style={{ borderColor: '#FBD9AE', background: '#FFF6EA' }}
              >
                <div>
                  <p className="text-[14px] font-bold" style={{ color: INK }}>Your plan has expired</p>
                  <p className="mt-0.5 text-[13px]" style={{ color: '#7a6f63' }}>
                    Your subscription ran out and your account has moved to the free Starter plan. Renew to get your features back.
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className="shrink-0 rounded-lg px-4 py-2 text-[13px] font-bold text-white transition hover:brightness-95"
                  style={{ background: SAFFRON }}
                >
                  View plans
                </Link>
              </div>
            )}
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
