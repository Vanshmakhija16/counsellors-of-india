import CoiLoader from '@/components/ui/CoiLoader'

// Next.js shows this automatically (wrapped in a Suspense boundary) while
// a route segment is loading — e.g. the root page.tsx resolving the
// tenant via headers(), or any client-side navigation into a page that
// suspends. Replaces the default blank-screen flash with the brand mark.
export default function Loading() {
  return <CoiLoader />
}
