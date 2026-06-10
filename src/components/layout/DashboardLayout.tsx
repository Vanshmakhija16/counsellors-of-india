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
  { label: 'Upgrade Plan',     href: '/pricing',     icon: CreditCard,      match: 'exact' as const },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)
  // Payment gate: 'checking' until we know the plan; 'ok' if paid; otherwise we
  // redirect to /pricing. The dashboard never renders for an unpaid user.
  const [gate, setGate] = useState<'checking' | 'ok'>('checking')

  // Hard gate — the dashboard requires an active paid plan.
  useEffect(() => {
    let alive = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!alive) return
      if (!user) { router.replace('/login?redirect=' + encodeURIComponent(pathname)); return }
      const { data } = await supabase.from('therapists').select('plan').eq('id', user.id).maybeSingle()
      if (!alive) return
      // A plan exists (anything other than the unpaid placeholders) → dashboard.
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

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [mobileOpen])

async function handleLogout() {
  console.log('Logout clicked')

  const { error } = await supabase.auth.signOut()

  console.log('Signout response:', error)

  if (error) {
    console.error('Logout failed:', error.message)
    return
  }

  console.log('Logout success')

  router.push('/login')
}

  function isActive(href: string, match: 'exact' | 'prefix') {
    return match === 'prefix'
      ? pathname === href || pathname.startsWith(href + '/')
      : pathname === href
  }

  // While verifying the plan (or redirecting an unpaid user), show nothing but
  // a spinner — never flash the dashboard to someone who hasn't paid.
  if (gate === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F3EE]">
        <div className="w-6 h-6 border-2 border-[#FF9933] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">
      {/* ── Mobile top bar with hamburger ───────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="h-10 w-10 rounded-lg flex items-center justify-center text-gray-700 hover:bg-gray-100 transition"
        >
          <Menu size={20} />
        </button>
        <Logo size="sm" />
        <div className="w-10" /> {/* spacer to keep logo centered */}
      </header>

      {/* ── Backdrop (mobile only, when drawer is open) ─────────────── */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────────
        Desktop: static column, always visible.
        Mobile:  fixed drawer, slides in/out from the left. */}
      <aside
        className={`
          bg-white border-r border-gray-100 flex flex-col shrink-0
          fixed inset-y-0 left-0 z-50 w-64
          transform transition-transform duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 lg:w-60
        `}
      >
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <Logo size="sm" />
          {/* Close button — mobile only */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ label, href, icon: Icon, match }) => {
            const active = isActive(href, match)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${active
                    ? 'bg-[#d4e4e1] text-[#2d4a47]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t  border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center bg-red-700 gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white hover:bg-red-600 w-full transition"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  )
}
