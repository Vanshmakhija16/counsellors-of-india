'use client'

/**
 * BookingWithPayment
 *
 * A drop-in replacement for the final step of any booking template.
 * After the booking record is created (pending), it opens Razorpay
 * checkout using the therapist's own credentials, then marks the
 * appointment as paid on success.
 *
 * Usage:
 *   <BookingWithPayment
 *     therapistId="uuid"
 *     appointmentId="uuid"     // already created by /api/book
 *     amount={1500}             // INR
 *     clientName="..."
 *     clientEmail="..."
 *     clientPhone="..."
 *     onComplete={() => setBooked(true)}
 *   />
 */

import { useState } from 'react'
import { CheckCircle2, AlertTriangle, Loader2, CreditCard } from 'lucide-react'
import { useRazorpayCheckout } from '@/hooks/useRazorpayCheckout'
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
  const { initiatePayment, paying, error } = useRazorpayCheckout()
  const [paid, setPaid] = useState(false)

  async function handlePay() {
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

  if (paid) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 size={28} className="text-green-600" />
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
            ₹{amount.toLocaleString('en-IN')}
          </span>
        </div>
        <p className="text-xs text-[#9ca3af]">
          Paid directly to the therapist via Razorpay.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button onClick={handlePay} loading={paying} fullWidth>
        {paying ? (
          <><Loader2 size={16} className="animate-spin mr-2" /> Processing…</>
        ) : (
          <><CreditCard size={16} className="mr-2" /> Pay ₹{amount.toLocaleString('en-IN')}</>
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
