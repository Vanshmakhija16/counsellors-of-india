'use client'

/**
 * RazorpayConnect — therapist dashboard section for connecting their
 * own Razorpay account to the platform.
 *
 * Security model:
 *  - Key Secret is submitted over HTTPS and immediately encrypted server-side
 *  - Key Secret is NEVER stored in component state after the save request
 *  - Only Key ID (public) is shown in the UI after saving
 */

import { useEffect, useRef, useState } from 'react'
import {
  CreditCard, Eye, EyeOff, CheckCircle2, AlertCircle,
  Trash2, RefreshCw, ExternalLink, ShieldCheck, Wifi, WifiOff,
  TestTube2, Zap,
} from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

interface ConnectionStatus {
  key_id:           string | null
  payments_enabled: boolean
  webhook_verified: boolean
  is_test_mode:     boolean | null
  updated_at:       string | null
}

export default function RazorpayConnect() {
  const [status, setStatus]       = useState<ConnectionStatus | null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [removing, setRemoving]   = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  // Form fields — secret is immediately cleared from state after save
  const [keyId,     setKeyId]     = useState('')
  const [keySecret, setKeySecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const secretRef = useRef<HTMLInputElement>(null)

  // ── Load current status on mount ─────────────────────────────────
  useEffect(() => { loadStatus() }, [])

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

  // ── Save credentials ──────────────────────────────────────────────
  async function handleSave() {
    if (!keyId.trim() || !keySecret.trim()) {
      setError('Both Key ID and Key Secret are required.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/razorpay/save-credentials', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ key_id: keyId.trim(), key_secret: keySecret.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Failed to save credentials.')
        return
      }

      // ⚠ Clear the secret from state immediately after server confirms receipt
      setKeySecret('')
      setKeyId('')
      setSuccess('Razorpay account connected successfully!')
      await loadStatus()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // ── Remove credentials ────────────────────────────────────────────
  async function handleRemove() {
    if (!confirm('Remove your Razorpay credentials? Clients will no longer be able to pay online.')) return
    setRemoving(true)
    setError('')
    try {
      const res = await fetch('/api/razorpay/save-credentials', { method: 'DELETE' })
      if (res.ok) {
        setStatus(null)
        setSuccess('Razorpay credentials removed.')
        await loadStatus()
      }
    } catch {
      setError('Failed to remove credentials.')
    } finally {
      setRemoving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={20} className="animate-spin text-[#a3b8b4]" />
      </div>
    )
  }

  const isConnected = status?.payments_enabled && status?.key_id

  return (
    <div className="space-y-6">

      {/* ── Header ────────────────────────────────────────────────── */}
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

      {/* ── Architecture note ─────────────────────────────────────── */}
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

      {/* ── Connection status badge ───────────────────────────────── */}
      <div className="flex items-center gap-3 p-4 bg-[#f2f0ed] rounded-xl border border-[#e8e4df]">
        {isConnected ? (
          <>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1c1c1e]">
                Razorpay Connected
              </p>
              <p className="text-xs text-[#6b7280] font-mono truncate mt-0.5">
                {status?.key_id}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {status?.is_test_mode ? (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                  <TestTube2 size={11} /> Test mode
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                  <Zap size={11} /> Live mode
                </span>
              )}
              <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                status?.webhook_verified
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {status?.webhook_verified
                  ? <><Wifi size={11} /> Webhook active</>
                  : <><WifiOff size={11} /> Webhook pending</>
                }
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
              <CreditCard size={20} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1c1c1e]">Not connected</p>
              <p className="text-xs text-[#6b7280] mt-0.5">
                Add your Razorpay credentials below to start accepting payments.
              </p>
            </div>
          </>
        )}
      </div>

      {/* ── Credential form ───────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard size={16} className="text-[#6b7280]" />
          <h3 className="text-sm font-semibold text-[#1c1c1e]">
            {isConnected ? 'Update Credentials' : 'Enter Razorpay Credentials'}
          </h3>
        </div>

        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-800 space-y-1">
          <p className="font-semibold">How to find your credentials:</p>
          <ol className="list-decimal list-inside space-y-0.5">
            <li>Log in to your Razorpay Dashboard</li>
            <li>Go to Settings → API Keys</li>
            <li>Generate or copy your Key ID and Key Secret</li>
            <li>Use <strong>Test</strong> keys to verify the integration first</li>
          </ol>
          <a
            href="https://dashboard.razorpay.com/app/website-app-settings/api-keys"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium underline mt-1"
          >
            Open Razorpay Dashboard <ExternalLink size={10} />
          </a>
        </div>

        <Input
          label="Razorpay Key ID"
          value={keyId}
          onChange={e => setKeyId(e.target.value)}
          placeholder="rzp_test_xxxxxxxxxxxx or rzp_live_xxxxxxxxxxxx"
          autoComplete="off"
          spellCheck={false}
        />

        <div className="relative">
          <Input
            label="Razorpay Key Secret"
            ref={secretRef}
            value={keySecret}
            onChange={e => setKeySecret(e.target.value)}
            type={showSecret ? 'text' : 'password'}
            placeholder="Your secret key (encrypted before storage)"
            autoComplete="new-password"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => setShowSecret(v => !v)}
            className="absolute right-3 top-9 text-[#a3b8b4] hover:text-[#5a7f7a] transition"
          >
            {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <p className="text-xs text-[#6b7280] flex items-start gap-1.5">
          <ShieldCheck size={13} className="shrink-0 mt-0.5 text-[#a3b8b4]" />
          Your secret key is encrypted with AES-256-GCM before being stored.
          It is never visible in the UI or sent to the browser again.
        </p>

        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-green-700">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={saving} fullWidth>
            {isConnected ? 'Update Credentials' : 'Connect Razorpay'}
          </Button>
          {isConnected && (
            <Button
              variant="danger"
              onClick={handleRemove}
              loading={removing}
            >
              <Trash2 size={15} />
            </Button>
          )}
        </div>
      </div>

      {/* ── Webhook setup instructions ─────────────────────────────── */}
      <div className="border border-[#e8e4df] rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-[#f2f0ed] flex items-center gap-2">
          <Wifi size={15} className="text-[#5a7f7a]" />
          <h3 className="text-sm font-semibold text-[#1c1c1e]">Webhook Configuration</h3>
          {status?.webhook_verified && (
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 font-medium flex items-center gap-1">
              <CheckCircle2 size={11} /> Verified
            </span>
          )}
        </div>
        <div className="p-4 space-y-3 text-sm text-[#374151]">
          <p>
            For automatic booking confirmation, configure this URL in your
            Razorpay Dashboard under <strong>Settings → Webhooks</strong>:
          </p>
          <div className="flex items-center gap-2 bg-[#1c1c1e] text-green-400 rounded-lg px-3 py-2 font-mono text-xs overflow-x-auto">
            <span className="select-all break-all">
              https://counsellorsofindia.com/api/payment/webhook
            </span>
          </div>
          <p className="text-xs text-[#6b7280]">
            Enable these events: <code className="bg-gray-100 px-1 rounded">payment.captured</code>{' '}
            <code className="bg-gray-100 px-1 rounded">payment.failed</code>{' '}
            <code className="bg-gray-100 px-1 rounded">refund.processed</code>
          </p>
          <p className="text-xs text-[#6b7280]">
            Use the <strong>same secret key</strong> you entered above as the
            Webhook Secret in Razorpay — do not generate a separate webhook secret.
          </p>
          <a
            href="https://dashboard.razorpay.com/app/website-app-settings/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[#5a7f7a] font-medium text-xs hover:underline"
          >
            Configure webhooks in Razorpay <ExternalLink size={11} />
          </a>
        </div>
      </div>

      {/* ── Payment flow summary ───────────────────────────────────── */}
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
                <span className="w-5 h-5 rounded-full bg-[#d4e4e1] text-[#2d4a47] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
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
