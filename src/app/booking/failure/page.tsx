'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function FailureContent() {
  const params = useSearchParams()
  const txnid  = params.get('txnid') ?? ''
  const [href, setHref] = useState<string | null>(null)

  useEffect(() => {
    if (!txnid) return
    // Fetch the appointment by txnid to get therapist username
    fetch(`/api/booking/lookup?txnid=${encodeURIComponent(txnid)}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.username) setHref(`/${d.username}#book`) })
      .catch(() => {})
  }, [txnid])

  function handleRetry() {
    if (href) { window.location.href = href }
    else       { window.history.back() }
  }

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#fafaf8', padding: '2rem', textAlign: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#b85050', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: '1.5rem', fontSize: 28, color: '#fff',
      }}>
        ✕
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 300, color: '#1a1a18', margin: '0 0 0.75rem' }}>
        Payment Unsuccessful
      </h1>
      <p style={{ fontSize: 15, color: '#6b6056', maxWidth: 400, lineHeight: 1.7, margin: '0 0 2rem' }}>
        Your payment did not go through and the slot has been released. No charge was made. Please go back and try again, your slot will be available.
      </p>
      <button
        onClick={handleRetry}
        style={{
          display: 'inline-block', padding: '0.75rem 2rem',
          background: '#1a1a18', color: '#fff', borderRadius: 8,
          border: 'none', cursor: 'pointer', fontSize: 13, letterSpacing: '0.06em',
        }}
      >
        Go Back & Retry
      </button>
    </main>
  )
}

export default function BookingFailurePage() {
  return (
    <Suspense>
      <FailureContent />
    </Suspense>
  )
}
