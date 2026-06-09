import Link from 'next/link'

export const metadata = { title: 'Payment Failed | Counsellors of India' }

const REASONS: Record<string, string> = {
  invalid_signature: 'We could not verify the payment response. No charge was applied.',
  bad_plan: 'The selected plan was invalid. No charge was applied.',
  db_error: 'Your payment went through but we hit a problem activating the plan. Please contact support.',
  server_error: 'Something went wrong while processing the payment.',
  direct_access: 'This page is reached after a payment. Please start from the pricing page.',
  failure: 'The payment was not completed.',
  failed: 'The payment was not completed.',
  cancel: 'The payment was cancelled.',
}

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; txnid?: string }>
}) {
  const { reason, txnid } = await searchParams
  const message = (reason && REASONS[reason]) || 'The payment could not be completed.'

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F6F3EE] px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#e8e1d6] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#fdecea] text-[#c0392b]">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-[#1c1c1e]">Payment not completed</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6b6056]">{message}</p>
        {txnid && (
          <p className="mt-4 font-mono text-xs text-[#9ca3af]">Txn: {txnid}</p>
        )}
        <div className="mt-7 flex flex-col gap-3">
          <Link
            href="/pricing"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#FF9933] px-6 text-sm font-semibold text-white transition hover:bg-[#f08a1f]"
          >
            Try again
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-[#e8e1d6] px-6 text-sm font-medium text-[#6b6056] transition hover:bg-[#faf7f2]"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  )
}
