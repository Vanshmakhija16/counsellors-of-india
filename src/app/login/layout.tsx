import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In to Your Dashboard',
  description:
    'Sign in to your therapist dashboard to manage bookings, client notes, and your profile.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
