'use client'

/**
 * BookingWithPayment
 *
 * A drop-in replacement for the final step of any booking template.
 * After the booking record is created (pending), this pays the therapist
 * through whichever gateway the current tenant uses:
 *   - India (and any tenant on 'razorpay_payu'): Razorpay checkout,
 *     in-page, with an onComplete() callback on success.
 *   - US (and any tenant on 'paypal'): PayPal Multiparty — the browser
 *     navigates away to PayPal's hosted approval page, then back to
 *     /booking/paypal-return, which captures the order and confirms the
 *     appointment. There is no in-page onComplete() call for this branch;
 *     the booking flow's own useEffect-driven redirect handles it after
 *     the round trip, same shape as the existing plan-checkout PayPal flow
 *     in lib/paypal-client.ts.
 *
 * Usage:
 *   <BookingWithPayment
 *     therapistId="uuid"
 *     appointmentId="uuid"     // already created by /api/book
 *     amount={1500}            // in the current tenant's currency
 *     clientName="..."
 *     clientEmail="..."
 *     clientPhone="..."
 *     onComplete={() => setBooked(true)}
 *   />
 */

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Loader2, CreditCard } from 'lucide-react'
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout'
import { resolveTenantId, getTenantConfig } from '@/lib/tenants'
import Button from '@/components/ui/Button'

interface Props {
  therapistId:   string
  appointmentId: string
  amount:        number
  clientName:    string
  clientEmail:   string
  clientPhone:   string
  serviceName?:  string
  onComplete:    () => void
  onCancel?:     () => void
}

export default function BookingWithPayment({
  therapistId,
  appointmentId,
  amount,
  clientName,
  clientEmail,
  clientPhone,
  serviceName,
  onComplete,
  onCancel,
}: Props) {
  const [tenant] = useState(() =>
    getTenantConfig(resolveTenantId(typeof window !== 'undefined' ? window.location.hostname : undefined))
  )
  const isPaypal = tenant.paymentGateway === 'paypal'

  const { initiatePayment, paying, error: razorpayError } = useRazorpayCheckout()
  const [paid, setPaid] = useState(false)
  const [paypalStarting, setPaypalStarting] = useState(false)
  const [paypalError, setPaypalError] = useState('')

  const paying_ = isPaypal ? paypalStarting : paying
  const error = isPaypal ? paypalError : razorpayError

  const formattedAmount = amount.toLocaleString(tenant.currency === 'INR' ? 'en-IN' : 'en-US')

  async function handlePayRazorpay() {
    await initiatePayment({
      therapistId,
      appointmentId,
      amount,
      clientName,
      clientEmail,
      clientPhone,
      description: serviceName ?? 'Therapy Session',
      onSuccess: () => {
        setPaid(true)
        setTimeout(onComplete, 1500)
      },
      onFailure: () => {},   // error already shown via `error` state
    })
  }

  async function handlePayPaypal() {
    setPaypalError('')
    setPaypalStarting(true)
    try {
      const res = await fetch('/api/paypal/booking/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ therapist_id: therapistId, appointment_id: appointmentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to start PayPal checkout.')
      if (!data.approve_url) throw new Error('PayPal did not return an approval link.')

      window.location.href = data.approve_url
      // Browser navigates away here — nothing below runs on success; the
      // booking is confirmed after the round trip via /booking/paypal-return.
    } catch (err: unknown) {
      setPaypalError(err instanceof Error ? err.message : 'Payment error')
      setPaypalStarting(false)
    }
  }

  function handlePay() {
    if (isPaypal) return handlePayPaypal()
    return handlePayRazorpay()
  }

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-orange-600" />
        </div>
        <p className="text-lg font-semibold text-[#1c1c1e]">Payment successful!</p>
        <p className="text-sm text-[#6b7280]">Your session is confirmed. Check your email.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-[#f2f0ed] rounded-xl p-4 space-y-2 text-sm">
        {serviceName && (
          <div className="flex justify-between text-[#374151]">
            <span>Service</span>
            <span className="font-medium">{serviceName}</span>
          </div>
        )}
        <div className="flex justify-between text-[#374151] border-t border-[#e8e4df] pt-2">
          <span className="font-semibold">Total</span>
          <span className="font-bold text-[#1c1c1e]">
            {tenant.currencySymbol}{formattedAmount}
          </span>
        </div>
        <p className="text-xs text-[#9ca3af]">
          Paid directly to the therapist via {isPaypal ? 'PayPal' : 'Razorpay'}.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button onClick={handlePay} loading={paying_} fullWidth>
        {paying_ ? (
          <><Loader2 size={16} className="animate-spin mr-2" /> Processing…</>
        ) : (
          <><CreditCard size={16} className="mr-2" /> Pay {tenant.currencySymbol}{formattedAmount}</>
        )}
      </Button>

      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="w-full text-sm text-[#6b7280] hover:text-[#374151] transition py-1"
        >
          Cancel
        </button>
      )}
    </div>
  )
}
