import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In to Your Dashboard | Counsellors of India',
  description:
    'Sign in to your Counsellors of India dashboard to manage bookings, client notes, and your therapist profile.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
