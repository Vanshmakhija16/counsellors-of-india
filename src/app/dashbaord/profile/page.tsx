import { redirect } from 'next/navigation'

export default function MisspelledDashboardProfileRedirect() {
  redirect('/dashboard/profile')
}
