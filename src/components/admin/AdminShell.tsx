'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Users, PenLine, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import type { AdminUser } from '@/lib/admin'

const NAV = [
  { href: '/admin',            label: 'Overview',   icon: LayoutGrid },
  { href: '/admin/therapists', label: 'Therapists',  icon: Users },
  { href: '/admin/blog',       label: 'Blog',        icon: PenLine },
] as const

export default function AdminShell({ admin, children }: { admin: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  function handleGoToDashboard(e: React.MouseEvent) {
    e.preventDefault()
    if (window.confirm('Do you really want to go to the dashboard?')) {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen bg-[#101012]">
      {/* Sidebar — fixed to the viewport so its height never changes and the
          bottom user block is always visible without scrolling, regardless
          of how tall the page content on the right gets. Collapses to a
          slim icon-only rail via the toggle button in the header. */}
      <aside className={`hidden md:flex md:fixed md:inset-y-0 md:left-0 shrink-0 flex-col border-r border-white/[0.07] bg-[#18181B] h-screen z-30 transition-[width] duration-200 ${collapsed ? 'w-16' : 'w-56'}`}>
        <div className={`h-14 flex items-center border-b border-white/[0.08] ${collapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
          {!collapsed && (
            <span className="text-[15px] font-bold tracking-wide text-[#F5F1EA] truncate" style={{ fontFamily: "'Fraunces','Instrument Serif',serif" }}>
              COI <span style={{ color: '#FF9933' }}>Admin</span>
            </span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md text-[#7A7568] hover:text-[#F5F1EA] hover:bg-white/[0.06] transition"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>
        </div>
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center gap-2.5 h-10 px-3 rounded-md text-[14.5px] font-medium tracking-wide transition ${collapsed ? 'justify-center px-0' : ''} ${
                  active ? 'bg-[#FF9933]/[0.14] text-[#F5F1EA]' : 'text-[#9C9385] hover:bg-white/[0.05] hover:text-[#F5F1EA]'
                }`}
              >
                <Icon size={16} strokeWidth={active ? 2.4 : 2} color={active ? '#FF9933' : undefined} />
                {!collapsed && label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-white/[0.08] p-3 shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2.5 px-2 py-1.5">
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#F5F1EA] tracking-wide truncate">{admin.full_name ?? 'Admin'}</p>
                <p className="text-[12.5px] text-[#7A7568] tracking-wide truncate">{admin.email}</p>
              </div>
            </div>
          )}
          <Link
            href="/dashboard"
            onClick={handleGoToDashboard}
            title={collapsed ? 'Go to dashboard' : undefined}
            className={`mt-1 flex items-center gap-2.5 h-9 px-2 rounded-md text-[13.5px] font-medium tracking-wide text-[#7A7568] hover:bg-white/[0.05] hover:text-[#FF9933] transition ${collapsed ? 'justify-center px-0' : ''}`}
          >
            <LogOut size={14} />
            {!collapsed && 'Go to dashboard'}
          </Link>
        </div>
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-0 inset-x-0 z-20 h-12 flex items-center gap-1 px-3 bg-[#18181B] border-b border-white/[0.07] overflow-x-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-md text-[12.5px] font-medium ${
                active ? 'bg-[#FF9933]/[0.14] text-[#F5F1EA]' : 'text-[#9C9385]'
              }`}
            >
              <Icon size={13} color={active ? '#FF9933' : undefined} /> {label}
            </Link>
          )
        })}
      </div>

      <div className={`flex-1 min-w-0 pt-12 md:pt-0 text-[#F5F1EA] transition-[margin] duration-200 ${collapsed ? 'md:ml-16' : 'md:ml-56'}`}>
        {children}
      </div>
    </div>
  )
}
