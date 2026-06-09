import Link from 'next/link'

export const metadata = { title: 'Payment Successful | Counsellors of India' }

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; txnid?: string }>
}) {
  const { plan, txnid } = await searchParams
  const planLabel = plan ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'your'

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F6F3EE] px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-[#e8e1d6] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#f5f5e8] text-[#ff9933]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-2xl font-semibold text-[#1c1c1e]">Payment successful</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#6b6056]">
          You&apos;re now on the <span className="font-semibold text-[#1c1c1e]">{planLabel} plan</span>.
          {/* A confirmation has been recorded against your account. */}
        </p>
        {/* {txnid && (
          <p className="mt-4 font-mono text-xs text-[#9ca3af]">Txn: {txnid}</p>
        )} */}
        <Link
          href="/dashboard"
          className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#FF9933] px-6 text-sm font-semibold text-white transition hover:bg-[#f08a1f]"
        >
          Go to dashboard
        </Link>
      </div>
    </main>
  )
}
