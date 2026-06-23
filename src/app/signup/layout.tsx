import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Your Therapist Profile – Sign Up | Counsellors of India',
  description:
    'Create your free therapist profile in under 10 minutes. Add credentials, pick a template & start accepting bookings from clients across India.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
