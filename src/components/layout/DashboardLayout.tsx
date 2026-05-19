'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, FileText, Settings, LogOut, Clock, Palette, ClipboardList } from 'lucide-react'
import Logo from '../ui/Logo'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const navItems = [
  { label: 'Dashboard',    href: '/dashboard',              icon: LayoutDashboard, match: 'exact' as const },
  { label: 'Appointments', href: '/dashboard/appointments', icon: Calendar,        match: 'exact' as const },
  { label: 'Patients',     href: '/clinical/patients',      icon: ClipboardList,   match: 'prefix' as const },
  { label: 'Notes',        href: '/dashboard/notes',        icon: FileText,        match: 'exact' as const },
  { label: 'Settings',     href: '/dashboard/settings',     icon: Settings,        match: 'exact' as const },
  { label: 'Availability', href: '/dashboard/availability', icon: Clock,           match: 'exact' as const },
  { label: 'Appearance',   href: '/dashboard/appearance',   icon: Palette,         match: 'exact' as const },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()


  async function handleLogout() {
  await supabase.auth.signOut()
  router.push('/login')
}

  return (
    <div className="flex h-screen bg-stone-50 overflow-hidden">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Logo size="sm" />
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ label, href, icon: Icon, match }) => {
            const active = match === 'prefix'
              ? pathname === href || pathname.startsWith(href + '/')
              : pathname === href
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition
                  ${active
                    ? 'bg-[#d4e4e1] text-[#2d4a47]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-gray-100">
          <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm 
                             font-medium text-gray-600 hover:bg-gray-50 w-full transition">
            Log out
          <LogOut size={18} />

          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

    </div>
  )
}