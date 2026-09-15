'use client'

/**
 * PayPalConnect — US-tenant equivalent of RazorpayConnect. Therapist
 * clicks "Connect with PayPal", authorizes on PayPal's own onboarding
 * screen (Partner Referrals flow), and PayPal routes future session
 * payments straight into their own PayPal account. No keys ever pass
 * through our UI, same as the Razorpay OAuth flow.
 *
 * Styled in Old Glory Blue / Red (see src/lib/tenants/us.ts primaryColor /
 * accentColor) rather than reusing India's saffron RazorpayConnect
 * palette, so the American portal's payments page reads as its own
 * tenant rather than a re-skinned copy.
 */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle2, ShieldCheck, RefreshCw, Link2, Link2Off, AlertTriangle,
} from 'lucide-react'
import Button from '@/components/ui/Button'

// Old Glory Blue / Red — matches usTenant.primaryColor / accentColor in
// src/lib/tenants/us.ts exactly, so this page's theme stays in sync with
// the rest of the American portal's branding instead of drifting.
const OG_BLUE = '#3C3B6E'
const OG_BLUE_DARK = '#2A2952'
const OG_BLUE_SOFT = '#C9C8E0'
const OG_RED = '#B22234'

interface PayPalStatus {
  connected: boolean
  merchant_id: string | null
  onboarding_status: string | null
  payments_receivable: boolean
  email_confirmed: boolean
  connected_at: string | null
}

export default function PayPalConnect() {
  const [status, setStatus] = useState<PayPalStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    loadStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Pick up the redirect back from PayPal's onboarding page.
  useEffect(() => {
    const paypalResult = searchParams.get('paypal')
    const paypalErrorParam = searchParams.get('paypal_error')
    if (paypalResult === 'return') {
      setSuccess('Welcome back — checking your PayPal connection…')
      loadStatus()
    }
    if (paypalErrorParam === 'onboard_failed') {
      setError('Could not start the PayPal connection. Please try again.')
    }
    if (paypalResult || paypalErrorParam) {
      const url = new URL(window.location.href)
      url.searchParams.delete('paypal')
      url.searchParams.delete('paypal_error')
      window.history.replaceState({}, '', url.toString())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function loadStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/paypal/connect/status')
      if (res.ok) {
        const data: PayPalStatus = await res.json()
        setStatus(data)
      }
    } catch {
      // Ignore — shows as "not connected"
    } finally {
      setLoading(false)
    }
  }

  function handleConnect() {
    setConnecting(true)
    // Full navigation — PayPal's onboarding page can't be reached via fetch().
    window.location.href = '/api/paypal/connect/onboard'
  }

  async function handleRefresh() {
    setRefreshing(true)
    setError('')
    setSuccess('')
    try {
      await loadStatus()
      setSuccess('Connection status refreshed.')
    } catch {
      setError('Could not refresh status. Please try again.')
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={20} className="animate-spin" style={{ color: OG_BLUE }} />
      </div>
    )
  }

  const isConnected = !!status?.connected
  const isPendingOnly = !!status?.onboarding_status && !isConnected

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-[#1c1c1e]">
          Payment Setup
        </h2>
        <p className="text-sm text-[#6b7280] mt-1">
          Connect your own PayPal account. Session payments go directly
          into your PayPal balance — the platform never touches your money.
        </p>
      </div>

      {/* Architecture note — blue tint instead of Razorpay's generic blue-50 */}
      <div
        className="flex gap-3 p-4 rounded-xl text-sm"
        style={{ background: OG_BLUE_SOFT + '55', border: `1px solid ${OG_BLUE_SOFT}`, color: OG_BLUE_DARK }}
      >
        <ShieldCheck size={18} className="shrink-0 mt-0.5" style={{ color: OG_BLUE }} />
        <div>
          <p className="font-semibold mb-1">Direct Settlement Architecture</p>
          <p>
            Each booking payment goes <strong>directly</strong> from the client
            into your PayPal account. Counsellors of America takes no
            platform fee on transactions.
          </p>
        </div>
      </div>

      {isPendingOnly && (
        <div className="flex gap-3 p-4 rounded-xl text-sm" style={{ background: '#FDECEC', border: `1px solid ${OG_RED}33`, color: '#8a1a29' }}>
          <AlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: OG_RED }} />
          <div>
            <p className="font-semibold mb-1">Onboarding not finished yet</p>
            <p>You started connecting PayPal but haven&apos;t completed every step on their side. Click below to pick up where you left off.</p>
          </div>
        </div>
      )}

      {/* Connect card */}
      <div className="border border-[#e8e4df] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
              style={{ background: isConnected ? '#DCFCE7' : isPendingOnly ? `${OG_RED}1A` : `${OG_BLUE}1A` }}
            >
              {isConnected ? (
                <Link2 size={22} className="text-green-600" />
              ) : isPendingOnly ? (
                <AlertTriangle size={22} style={{ color: OG_RED }} />
              ) : (
                <Link2Off size={22} style={{ color: OG_BLUE }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-[#1c1c1e]">
                {isConnected ? 'Connected with PayPal' : isPendingOnly ? 'Finish Connecting PayPal' : 'Connect with PayPal'}
              </p>
              <p className="text-xs text-[#6b7280] mt-0.5">
                {isConnected
                  ? `Merchant ID: ${status?.merchant_id}`
                  : isPendingOnly
                    ? 'A few steps remain on PayPal\'s side.'
                    : "Authorize once on PayPal's own onboarding screen. No keys to copy or store yourself."}
              </p>
            </div>
            {isConnected && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium shrink-0">
                <CheckCircle2 size={11} /> Active
              </span>
            )}
          </div>

          {isConnected ? (
            <Button variant="outline" onClick={handleRefresh} loading={refreshing} fullWidth>
              Refresh Connection Status
            </Button>
          ) : (
            <Button
              onClick={handleConnect}
              loading={connecting}
              fullWidth
              className="h-12! rounded-xl! text-white!"
              style={{ backgroundColor: isPendingOnly ? OG_RED : OG_BLUE, boxShadow: `0 10px 25px -8px ${isPendingOnly ? OG_RED : OG_BLUE}55` }}
            >
              {isPendingOnly ? 'Finish Connecting PayPal' : 'Connect with PayPal'}
            </Button>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}
          {success && (
            <p className="text-sm px-4 py-2 rounded-lg" style={{ color: OG_BLUE_DARK, background: OG_BLUE_SOFT + '55' }}>{success}</p>
          )}
        </div>
      </div>

      {/* Payment flow summary */}
      <div className="border border-[#e8e4df] rounded-xl overflow-hidden">
        <div className="px-4 py-3" style={{ background: `${OG_BLUE}0D` }}>
          <h3 className="text-sm font-semibold text-[#1c1c1e]">How it works</h3>
        </div>
        <div className="p-4">
          <ol className="space-y-2 text-sm text-[#374151]">
            {[
              'Client selects a service and booking slot on your profile page',
              'Your connected PayPal account creates a payment order',
              'Client pays via PayPal checkout (PayPal balance, card, or bank)',
              'Money goes directly into your PayPal account',
              'Booking is auto-confirmed and both parties receive an email',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${OG_RED}1A`, color: OG_RED }}
                >
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

    </div>
  )
}
