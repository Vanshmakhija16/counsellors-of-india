import { Suspense } from 'react'
import RazorpayConnect from '@/components/payments/RazorpayConnect'
import PayPalConnect from '@/components/payments/PayPalConnect'
import { getCurrentTenant } from '@/lib/tenants/server'

export default async function PaymentsPage() {
  const tenant = await getCurrentTenant()
  // Generic gateway check (matches BookingWithPayment.tsx) rather than
  // hardcoding tenant.id === 'us' — so this stays correct once CA/UK/AU
  // (also paymentGateway: 'stripe', not 'razorpay_payu') go live, instead
  // of silently showing them India's Razorpay-connect screen.
  const isPaypal = tenant.paymentGateway === 'paypal'

  return (
    <div className="p-8 max-w-2xl">
      {/* PayPalConnect/RazorpayConnect both read query params via
          useSearchParams, which requires a Suspense boundary in the App
          Router. */}
      <Suspense fallback={null}>
        {isPaypal ? <PayPalConnect /> : <RazorpayConnect />}
      </Suspense>
    </div>
  )
}
