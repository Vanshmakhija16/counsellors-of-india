import CoiLoader from '@/components/ui/CoiLoader'

// Route-level loading state for anything under /dashboard. The
// DashboardLayout also shows CoiLoader during its client-side auth
// check, so between the two, both the initial navigation and the
// subsequent auth gate use the same animated mark.
export default function Loading() {
  return <CoiLoader />
}
