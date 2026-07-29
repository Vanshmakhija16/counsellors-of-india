import { Suspense } from 'react'
import RazorpayConnect from '@/components/payments/RazorpayConnect'

export default function PaymentsPage() {
  return (
    <div className="p-8 max-w-2xl">
      {/* RazorpayConnect reads the ?oauth=... query param via useSearchParams,
          which requires a Suspense boundary in the App Router. */}
      <Suspense fallback={null}>
        <RazorpayConnect />
      </Suspense>
    </div>
  )
}
