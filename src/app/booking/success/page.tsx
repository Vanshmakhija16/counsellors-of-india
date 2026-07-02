import Link from 'next/link'

export default function BookingSuccessPage() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#fafaf8', padding: '2rem', textAlign: 'center',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: '#1a1a18', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: '1.5rem', fontSize: 28,
      }}>
        ✓
      </div>
      <h1 style={{ fontSize: 32, fontWeight: 300, color: '#1a1a18', margin: '0 0 0.75rem' }}>
        Session Confirmed
      </h1>
      <p style={{ fontSize: 15, color: '#6b6056', maxWidth: 400, lineHeight: 1.7, margin: '0 0 2rem' }}>
        Your booking is confirmed and payment received. A confirmation email and WhatsApp message have been sent to you. The meeting link will be shared the day before your session.
      </p>
      <Link href="/" style={{
        display: 'inline-block', padding: '0.75rem 2rem',
        background: '#1a1a18', color: '#fff', borderRadius: 8,
        textDecoration: 'none', fontSize: 13, letterSpacing: '0.06em',
      }}>
        Back to Home
      </Link>
    </main>
  )
}
