'use client'

/**
 * RazorpayConnect — therapist dashboard section for connecting their
 * own Razorpay account to the platform.
 *
 * OAuth-only: the therapist clicks "Connect with Razorpay", authorizes on
 * Razorpay's own consent screen, and we get back an access/refresh token
 * pair tied to their merchant account. No keys ever pass through our UI.
 * (The old manual Key ID / Key Secret entry path has been removed from
 * this screen — /api/razorpay/save-credentials still exists server-side
 * for any therapists who connected that way previously.)
 */

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  CheckCircle2, ShieldCheck, RefreshCw, Link2, Link2Off, AlertTriangle,
} from 'lucide-react'
import Button from '@/components/ui/Button'

interface OAuthStatus {
  connected:    boolean
  merchant_id:  string | null
  scope:        string | null
  connected_at: string | null
  health:       'unknown' | 'healthy' | 'broken'
  health_error: string | null
  health_checked_at: string | null
}

interface ConnectionStatus {
  key_id:           string | null
  payments_enabled: boolean
  webhook_verified: boolean
  is_test_mode:     boolean | null
  updated_at:       string | null
  oauth?:           OAuthStatus
}

const OAUTH_QUERY_MESSAGES: Record<string, { type: 'success' | 'error'; text: string }> = {
  connected:        { type: 'success', text: 'Razorpay connected via OAuth!' },
  denied:           { type: 'error',   text: 'Razorpay connection was cancelled.' },
  state_mismatch:   { type: 'error',   text: 'Connection could not be verified. Please try again.' },
  invalid_request:  { type: 'error',   text: 'Something went wrong starting the connection. Please try again.' },
  exchange_failed:  { type: 'error',   text: 'Could not complete the Razorpay connection. Please try again.' },
}

export default function RazorpayConnect() {
  const [status, setStatus]   = useState<ConnectionStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const [oauthConnecting, setOauthConnecting] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const searchParams = useSearchParams()

  // ── Load current status on mount ─────────────────────────────────
  useEffect(() => {
    loadStatus().then(() => {
      // A real health check, not just "does merchant_id exist" -- runs
      // once per dashboard visit so a broken connection surfaces here
      // proactively instead of only being discovered from a failed
      // booking days later. Silent -- doesn't show a spinner, just
      // updates the badge if something's wrong.
      fetch('/api/razorpay/oauth/health', { method: 'POST' }).then(loadStatus).catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Pick up ?oauth=... after the callback redirect lands us back here ──
  useEffect(() => {
    const oauthResult = searchParams.get('oauth')
    if (!oauthResult) return
    const message = OAUTH_QUERY_MESSAGES[oauthResult]
    if (message) {
      if (message.type === 'success') setSuccess(message.text)
      else setError(message.text)
    }
    if (oauthResult === 'connected') loadStatus()
    // Clean the query param out of the URL without a full navigation.
    const url = new URL(window.location.href)
    url.searchParams.delete('oauth')
    window.history.replaceState({}, '', url.toString())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  async function loadStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/razorpay/save-credentials')
      if (res.ok) {
        const data: ConnectionStatus = await res.json()
        setStatus(data)
      }
    } catch {
      // Ignore — connection status will show as "not connected"
    } finally {
      setLoading(false)
    }
  }

  // ── Start OAuth connect flow ───────────────────────────────
  function handleOAuthConnect() {
    setOauthConnecting(true)
    // Full navigation, not fetch — /api/razorpay/oauth/connect redirects to
    // Razorpay's own consent screen, which fetch() can't follow usefully.
    window.location.href = '/api/razorpay/oauth/connect'
  }

  // ── Manually re-check / refresh OAuth connection health ─────────
  async function handleCheckConnection() {
    setCheckingConnection(true)
    setError('')
    try {
      const res = await fetch('/api/razorpay/oauth/health', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not check the Razorpay connection.')
        return
      }
      if (data.health === 'healthy') {
        setSuccess('Razorpay connection is healthy.')
      } else if (data.health === 'broken') {
        setError('') // the broken banner below shows the real reason -- no need to duplicate here
      }
      await loadStatus()
    } catch {
      setError('Network error while checking the connection.')
    } finally {
      setCheckingConnection(false)
    }
  }

  // ── Disconnect a broken/stale connection so "Connect with Razorpay" can start fresh ──
  // Also used for a voluntary disconnect of a HEALTHY connection (e.g. switching
  // to a different Razorpay account) -- same endpoint, `confirmFirst` just gates
  // that path behind a confirmation since it's not recovering from an error.
  async function handleDisconnect(confirmFirst = false) {
    if (confirmFirst) {
      const ok = window.confirm(
        'Disconnect your Razorpay account? New bookings will fail until you reconnect. This does not affect bookings already made.'
      )
      if (!ok) return
    }
    setDisconnecting(true)
    setError('')
    try {
      const res = await fetch('/api/razorpay/oauth/disconnect', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not disconnect. Please try again.')
        return
      }
      setSuccess('Disconnected. You can reconnect whenever you\'re ready.')
      await loadStatus()
    } catch {
      setError('Network error while disconnecting.')
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={20} className="animate-spin text-[#FF9933]" />
      </div>
    )
  }

  const isOAuthConnected = !!status?.oauth?.connected
  const isBroken = isOAuthConnected && status?.oauth?.health === 'broken'

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2
          className="text-2xl font-semibold text-[#1c1c1e]"
          style={{ fontFamily: 'var(--font-cormorant), serif' }}
        >
          Payment Setup
        </h2>
        <p className="text-sm text-[#6b7280] mt-1">
          Connect your own Razorpay account. All payments go directly
          into your bank account — the platform never touches your money.
        </p>
      </div>

      {/* Architecture note */}
      <div className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
        <ShieldCheck size={18} className="shrink-0 mt-0.5 text-blue-500" />
        <div>
          <p className="font-semibold mb-1">Direct Settlement Architecture</p>
          <p>
            Each booking payment goes <strong>directly</strong> from the client
            into your Razorpay account and straight to your bank.
            Counsellors of India is not a payment intermediary and takes no
            platform fee on transactions.
          </p>
        </div>
      </div>

      {/* Broken-connection banner — shown ABOVE the connect card so it's
          impossible to miss, with the real reason (not a generic "error")
          and a numbered fix, right here in the dashboard, not something the
          therapist has to be told about after a client's booking fails. */}
      {isBroken && (
        <div className="border border-red-200 bg-red-50 rounded-2xl overflow-hidden">
          <div className="p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800">Your Razorpay connection is broken</p>
                <p className="text-sm text-red-700 mt-1">
                  {status?.oauth?.health_error ?? 'Razorpay rejected the stored connection.'}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  Bookings for this profile will fail until this is fixed.
                  {status?.oauth?.health_checked_at && (
                    <> Last checked {new Date(status.oauth.health_checked_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}.</>
                  )}
                </p>
              </div>
            </div>

            <div className="bg-white border border-red-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-[#1c1c1e] mb-2">How to fix it</p>
              <ol className="space-y-1.5 text-xs text-[#374151]">
                {[
                  'Click "Disconnect" below to clear this broken connection.',
                  'Click "Connect with Razorpay" and sign in to your Razorpay account.',
                  'If Razorpay asks you to re-approve access, accept it — this is expected after a revoke or account change.',
                  'Once reconnected, click "Check Connection" to confirm it\'s working before taking new bookings.',
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#FFEFD9] text-[#9A5200] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Button variant="outline" onClick={() => handleDisconnect(false)} loading={disconnecting} fullWidth className="border-red-300! text-red-700! hover:bg-red-100!">
              Disconnect
            </Button>
          </div>
        </div>
      )}

      {/* Connect card */}
      <div className="border border-[#e8e4df] rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
              isBroken ? 'bg-red-100' : isOAuthConnected ? 'bg-green-100' : 'bg-[#FFF3E4]'
            }`}>
              {isBroken ? (
                <AlertTriangle size={22} className="text-red-600" />
              ) : isOAuthConnected ? (
                <Link2 size={22} className="text-green-600" />
              ) : (
                <Link2Off size={22} className="text-[#FF9933]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-[#1c1c1e]">
                {isBroken ? 'Razorpay Connection Broken' : isOAuthConnected ? 'Connected with Razorpay' : 'Connect with Razorpay'}
              </p>
              <p className="text-xs text-[#6b7280] mt-0.5">
                {isBroken
                  ? 'See the details above to fix this.'
                  : isOAuthConnected
                    ? `Merchant ID: ${status?.oauth?.merchant_id}`
                    : "Authorize once on Razorpay's own screen. No keys to copy or store yourself."}
              </p>
            </div>
            {isOAuthConnected && !isBroken && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium shrink-0">
                <CheckCircle2 size={11} /> Active
              </span>
            )}
            {isBroken && (
              <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium shrink-0">
                <AlertTriangle size={11} /> Broken
              </span>
            )}
          </div>

          {isOAuthConnected && !isBroken ? (
            <div className="space-y-2">
              <Button variant="outline" onClick={handleCheckConnection} loading={checkingConnection} fullWidth>
                Check Connection
              </Button>
              <button
                type="button"
                onClick={() => handleDisconnect(true)}
                disabled={disconnecting}
                className="w-full text-center text-xs text-[#9ca3af] hover:text-red-600 transition-colors py-1 disabled:opacity-50"
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect this Razorpay account'}
              </button>
            </div>
          ) : !isOAuthConnected ? (
            <Button
              onClick={handleOAuthConnect}
              loading={oauthConnecting}
              fullWidth
              className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-12! rounded-xl! shadow-lg shadow-[#FF9933]/25"
            >
              Connect with Razorpay
            </Button>
          ) : null}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">{success}</p>
          )}
        </div>
      </div>

      {/* Payment flow summary */}
      <div className="border border-[#e8e4df] rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-[#f2f0ed]">
          <h3 className="text-sm font-semibold text-[#1c1c1e]">How it works</h3>
        </div>
        <div className="p-4">
          <ol className="space-y-2 text-sm text-[#374151]">
            {[
              'Client selects a service and booking slot on your portfolio page',
              'Your Razorpay account creates a payment order',
              'Client pays via Razorpay checkout (UPI, card, netbanking, wallets)',
              'Money goes directly into your Razorpay account → your bank',
              'Booking is auto-confirmed and both parties receive an email',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#FFEFD9] text-[#9A5200] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
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
