import AppearanceAuthGate from '@/components/layout/AppearanceAuthGate'

export default function AppearanceLayout({ children }: { children: React.ReactNode }) {
  return <AppearanceAuthGate>{children}</AppearanceAuthGate>
}
