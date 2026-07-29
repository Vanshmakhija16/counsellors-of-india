'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSupabaseClient } from '@/components/providers/TenantSupabaseProvider'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import CountryCodeSelect, { dialCodeOf } from '@/components/ui/CountryCodeSelect'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { loadDemo, clearDemo, type DemoProfile } from '@/lib/demoSession'
import JourneyProgress from '@/components/journey/JourneyProgress'
import { CheckCircle, XCircle, Loader, Sparkles, ArrowLeft, Lock, Clock } from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'

const PREFIXES = ['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.', 'None']

export interface SignupPageClientProps {
  /** ISO 3166-1 alpha-2 code, e.g. 'IN', 'US' — which country's dial code
   *  the mobile number field defaults to, based on which tenant portal
   *  this page was opened on. The person can still search and pick any
   *  other country. */
  defaultCountryIso: string
  /** Domain shown in the "your public web address will be ___/username"
   *  preview, e.g. 'counsellorsofindia.com/', tenant-specific. */
  domainDisplay: string
  /** Tenant brand name/tagline for the AuthLayout branding panel, e.g.
   *  'Counsellors of India' vs 'Counsellors of America'. */
  brandName: string
  tagline: string
  /** Path to the tenant's real logo image (e.g. '/coi.png'), if one exists.
   *  Undefined for tenants without a logo asset yet — AuthLayout falls
   *  back to a monogram/wordmark in that case. */
  logoPath?: string
}

export default function SignupPageClient(props: SignupPageClientProps) {
  return (
    <Suspense fallback={<AuthLayout title="Create your account" brandName={props.brandName} tagline={props.tagline} logoPath={props.logoPath}><div className="bg-white rounded-2xl border border-[#ece5d9] shadow-sm p-8"><div className="h-64" /></div></AuthLayout>}>
      <SignupForm {...props} />
    </Suspense>
  )
}

function SignupForm({ defaultCountryIso, domainDisplay, brandName, tagline, logoPath }: SignupPageClientProps) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = useSupabaseClient()

  // Honour ?redirect so we can chain: signup → wherever it points.
  // Default final destination (after they pick a plan) is the homepage.
  // finishSignup() below always routes through /pricing first, carrying this
  // as the pricing page's own ?redirect, so pricing's X/cancel button lands
  // them back here.
  const redirectTo = searchParams.get('redirect') ?? '/'
  const fromDemo   = searchParams.get('from') === 'demo'

  const [prefix, setPrefix]       = useState('Dr.')
  const [fullName, setFullName]   = useState('')
  const [username, setUsername]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [countryIso, setCountryIso] = useState(defaultCountryIso)
  const [phone, setPhone]         = useState('')
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  // The demo the user built on /try, carried into their real account.
  const [demo, setDemo]           = useState<DemoProfile | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  // Two-part form: fill in details first, then set a password on its own
  // screen (with the strength meter) before hitting the real submit.
  const [formStep, setFormStep] = useState<'details' | 'password'>('details')

  // When arriving from the demo, prefill what we can so the form was never wasted.
  useEffect(() => {
    if (!fromDemo) return
    const d = loadDemo()
    setDemo(d)
    if (d.full_name && !fullName) {
      // Split an optional "Dr." prefix off the demo name.
      const match = PREFIXES.find(p => p !== 'None' && d.full_name!.startsWith(p + ' '))
      if (match) { setPrefix(match); setFullName(d.full_name.slice(match.length + 1)) }
      else { setFullName(d.full_name) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDemo])

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [suggestions, setSuggestions] = useState<string[]>([])

  // ── Email OTP verification ──────────────────────────────────────────────
  // Step 'form'  → user fills details, we email a 6-digit code.
  // Step 'otp'   → user enters the code; verifyOtp proves the inbox is real
  //                AND returns a live session so they go straight to pricing.
  const [step, setStep]           = useState<'form' | 'otp'>('form')
  const [otp, setOtp]             = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpError, setOtpError]   = useState('')
  const [resendIn, setResendIn]   = useState(0)

  // Resend cooldown ticker
  useEffect(() => {
    if (resendIn <= 0) return
    const t = setTimeout(() => setResendIn(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [resendIn])

  // ── 6-box OTP input behaviour ───────────────────────────────────────────
  // `otp` is a clean digit string (0–6 chars). Each box reads otpChars[i].
  const OTP_LEN = 6
  const otpBoxRefs = useRef<Array<HTMLInputElement | null>>([])
  const otpChars = Array.from({ length: OTP_LEN }, (_, i) => otp[i] ?? '')

  function setOtpDigit(i: number, val: string) {
    const digit = val.replace(/\D/g, '').slice(-1) // last digit typed
    const arr = [...otpChars]
    arr[i] = digit
    setOtp(arr.join('').trimEnd())
    setOtpError('')
    if (digit && i < OTP_LEN - 1) otpBoxRefs.current[i + 1]?.focus()
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const arr = [...otpChars]
      if (arr[i]) { arr[i] = '' }                                  // clear current box
      else if (i > 0) { arr[i - 1] = ''; otpBoxRefs.current[i - 1]?.focus() } // step back
      setOtp(arr.join('').trimEnd())
      setOtpError('')
    } else if (e.key === 'ArrowLeft' && i > 0) {
      otpBoxRefs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < OTP_LEN - 1) {
      otpBoxRefs.current[i + 1]?.focus()
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN)
    if (!pasted) return
    setOtp(pasted)
    setOtpError('')
    otpBoxRefs.current[Math.min(pasted.length, OTP_LEN - 1)]?.focus()
  }

  // Auto-detect country code while typing a mobile number.
  // Only reliable when the person types/pastes a FULL international number
  // (leading '+' or '00', e.g. '+14155552671') — a bare national number like
  // '9876543210' matches many countries' patterns and can't be guessed
  // safely, so those are left alone and just filtered to digits as before.
  function handlePhoneChange(raw: string) {
    const trimmed = raw.trim()
    if (/^\+/.test(trimmed) || /^00\d/.test(trimmed)) {
      const normalized = trimmed.replace(/^00/, '+')
      const parsed = parsePhoneNumberFromString(normalized)
      if (parsed?.country) {
        setCountryIso(parsed.country)
        setPhone(parsed.nationalNumber.slice(0, 14))
        return
      }
    }
    setPhone(raw.replace(/\D/g, '').slice(0, 14))
  }

  function handleUsernameChange(val: string) {
    // No spaces allowed in the public web address — strip them as typed
    // (e.g. "Vansh Makhija" → "VanshMakhija") instead of rejecting on submit.
    setUsername(val.replace(/\s+/g, ''))
    setUsernameStatus('idle')
    setSuggestions([])
  }

  // Live availability check while typing — debounced 500ms after the last
  // keystroke so we're not firing a query per character. onBlur below still
  // covers the case where someone tabs away before the debounce fires.
  useEffect(() => {
    if (!username || username.length < 3) return
    const t = setTimeout(() => { checkUsername() }, 500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username])

  async function checkUsername() {
    if (!username || username.length < 3) return
    setUsernameStatus('checking')
    const { data } = await supabase
      .from('therapists')
      .select('username')
      .eq('username', username)
      .maybeSingle()
    if (data) {
      setUsernameStatus('taken')

      // Build a pool of candidates, then keep only the ones genuinely free.
      const candidates = [
        `${username}1`, `${username}2`, `${username}3`,
        `${username}-therapy`, `${username}-care`,
        `${username}-counsel`, `the-${username}`, `${username}-co`,
      ]
      // Single batched query: which of these candidates already exist?
      const { data: takenRows } = await supabase
        .from('therapists')
        .select('username')
        .in('username', candidates)
      const taken = new Set((takenRows ?? []).map(r => r.username))

      const available = candidates.filter(c => !taken.has(c)).slice(0, 4)
      setSuggestions(available)
    } else {
      setUsernameStatus('available')
      setSuggestions([])
    }
  }

  // Mirrors the Supabase project password policy so we reject weak passwords
  // up front (before sending the OTP) instead of after verification.
  function validatePassword(pw: string): string | null {
    if (pw.length < 8) return 'Password must be at least 8 characters'
    if (!/[a-z]/.test(pw)) return 'Password must contain a lowercase letter'
    if (!/[A-Z]/.test(pw)) return 'Password must contain an uppercase letter'
    if (!/[0-9]/.test(pw)) return 'Password must contain a number'
    if (!/[!@#$%^&*()_+\-=[\]{};':"|<>?,./`~]/.test(pw))
      return 'Password must contain a symbol (e.g. !@#$%)'
    return null
  }

  function validateDetails(): string | null {
    if (!fullName.trim()) return 'Please enter your name'
    if (usernameStatus === 'taken') return 'Please choose a different username'
    if (!username || username.length < 3) return 'Username must be at least 3 characters'
    // Basic shape check; the OTP step proves the inbox actually exists.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address'
    // Generic length check — international numbers vary from ~6 to 14
    // digits, so we can't apply India's fixed 10-digit rule globally.
    if (!phone.trim() || !/^\d{4,14}$/.test(phone.replace(/\s/g, ''))) return 'Please enter a valid mobile number'
    return null
  }

  function validateForm(): string | null {
    const detailsError = validateDetails()
    if (detailsError) return detailsError
    return validatePassword(password)
  }

  // ── Advance from the details screen to the password screen ──────────────
  function handleNext(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const invalid = validateDetails()
    if (invalid) { setError(invalid); return }
    setFormStep('password')
  }

  // ── STEP 1: validate, then email a 6-digit verification code ────────────
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const invalid = validateForm()
    if (invalid) { setError(invalid); return }

    setLoading(true)

    // Race-condition guard — username still free?
    const { data: existing } = await supabase
      .from('therapists').select('username').eq('username', username).maybeSingle()
    if (existing) {
      setError('Username already taken. Please choose another.')
      setLoading(false)
      return
    }

    // Email must not already belong to an account — otherwise signInWithOtp
    // would silently log them into the existing one instead of signing up.
    // NOTE: a therapists row is now only ever created in finishSignup(),
    // AFTER verifyOtp succeeds (see migration fix_premature_therapist_row_
    // and_add_signup_attempts.sql) — so finding one here reliably means a
    // real, verified account, never an abandoned/unverified attempt.
    const { data: emailRow } = await supabase
      .from('therapists').select('id').eq('email', email).maybeSingle()
    if (emailRow) {
      setError('An account with this email already exists. Please sign in instead.')
      setLoading(false)
      return
    }

    // Log the attempt so an abandoned signup (closed tab, hit back, etc.)
    // isn't a lost lead — purely a follow-up log, never read by any
    // duplicate/account-exists check, so it can never block a retry.
    // Fire-and-forget: a failure here must never stop the real signup flow.
    supabase.from('signup_attempts').insert({
      email,
      phone: phone.trim() ? `${dialCodeOf(countryIso)} ${phone.replace(/\s/g, '')}` : null,
      full_name: prefix === 'None' ? fullName : `${prefix} ${fullName}`,
      username,
    }).then(({ error: logErr }) => {
      if (logErr) console.warn('signup_attempts log failed (non-blocking):', logErr.message)
    })

    // Sends a 6-digit OTP to the email. shouldCreateUser:true lets the user be
    // created on verify. If the email is fake/undeliverable it simply never
    // arrives, so an invalid inbox can never complete signup.
    const { error: otpErr } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })

    // A rate-limit / "already registered" error here means a code was ALREADY
    // emailed (e.g. the user hit back and retried) and an unconfirmed auth user
    // exists — that user can't log in and isn't a real account. Don't dead-end:
    // move to the OTP screen so the still-valid code can be entered. The
    // therapists-row guard above already blocks genuinely completed accounts.
    const alreadySent =
      otpErr &&
      (otpErr.status === 429 ||
        /already|rate|seconds|exceeded/i.test(otpErr.message))

    if (otpErr && !alreadySent) { setError(otpErr.message); setLoading(false); return }

    setStep('otp')
    setOtp('')
    setOtpError('')
    if (alreadySent) {
      setOtpError('A code was already sent to your email. Enter it below, or wait to resend.')
    }
    setResendIn(45)
    setLoading(false)
  }

  // ── STEP 2: verify the code → live session → create profile → pricing ───
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setOtpError('')
    if (otp.trim().length < 6) { setOtpError('Enter the 6-digit code from your email.'); return }

    setLoading(true)

    const { data, error: verifyErr } = await supabase.auth.verifyOtp({
      email,
      token: otp.trim(),
      type: 'email',
    })

    if (verifyErr || !data.user || !data.session) {
      setOtpError(verifyErr?.message ?? 'Invalid or expired code. Please try again.')
      setLoading(false)
      return
    }

    // Email proven + live session in hand. Set the chosen password on the
    // now-verified account so they can log in normally later. If this fails the
    // account would have NO password and every future login returns "Invalid
    // credentials" — so surface the error instead of completing silently.
    // "should be different from the old password" means the password is ALREADY
    // set to what the user chose (e.g. a retry) — that's success, not an error.
    const { error: pwErr } = await supabase.auth.updateUser({ password })
    if (pwErr && !/different from the old password/i.test(pwErr.message)) {
      setOtpError(`Could not set your password: ${pwErr.message}`)
      setLoading(false)
      return
    }

    await finishSignup(data.user.id)
  }

  // Shared: write the therapist profile, redirect to pricing.
  // Photo is collected once, later, in SetupWizard — not duplicated here.
  async function finishSignup(userId: string) {
    const displayName = prefix === 'None' ? fullName : `${prefix} ${fullName}`

    // Carry the demo's design + details into the real profile so the site
    // they built on /try becomes their actual starting point.
    const demoFields = demo ? {
      template_id: demo.template_id,
      color_id:    demo.color_id,
      ...(demo.title  ? { title: demo.title } : {}),
      ...(demo.city   ? { city: demo.city } : {}),
      ...(demo.bio    ? { bio: demo.bio } : {}),
      ...(typeof demo.fee === 'number' ? { fee_per_session: demo.fee } : {}),
      ...(demo.specialties?.length ? { specialties: demo.specialties } : {}),
    } : {}

    // Store the full international number (dial code + local number) so it's
    // unambiguous regardless of which country the therapist signed up from.
    const fullPhone = phone.trim() ? `${dialCodeOf(countryIso)} ${phone.replace(/\s/g, '')}` : null

    await supabase.from('therapists').upsert({
      id:                  userId,
      full_name:           displayName,
      email,
      username,
      phone:               fullPhone,
      plan:                'none',
      is_active:           true,
      is_profile_complete: false,
      ...demoFields,
    })

    if (demo) clearDemo()

    // After signup, show pricing first. Pricing's close/cancel button (X)
    // reads this same ?redirect and falls back to it (defaulting to home)
    // if the user backs out without picking a plan.
    router.push(`/pricing?redirect=${encodeURIComponent(redirectTo)}`)
  }

  const usernameBorder =
    usernameStatus === 'taken'     ? 'border-red-300'   :
    usernameStatus === 'available' ? 'border-[#FF9933]' :
    'border-[#e8e4df]'

return ( 


<AuthLayout
  title="Create your account"
  brandName={brandName}
  tagline={tagline}
  logoPath={logoPath}
  journeySlot={<JourneyProgress current="account" />}
  topLink={
    <span>
      Already have an account?{' '}
      <Link href="/login" className="text-[#E07A12] font-semibold hover:underline">
        Sign in
      </Link>
    </span>
  }
>

   <div
   className="
     w-full
     max-w-[680px]
     mx-auto
     bg-white
     rounded-2xl
     border
     border-[#ece5d9]
     shadow-[0_25px_70px_-25px_rgba(31,28,24,0.35)]
     p-6
     sm:p-8
   "
 >
{fromDemo && ( <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#F3D9B0] bg-[#FBF3E6] px-4 py-3"> <Sparkles size={16} className="text-[#FF9933] mt-0.5 shrink-0" /> <p className="text-xs text-[#7a5a1e] leading-relaxed">
Your demo site is saved. Finish signing up and we'll set it up
with the design and details you chose. </p> </div>
)}

{step === 'otp' ? (
  /* ── OTP verification view ── */
  <form onSubmit={handleVerifyOtp} className="space-y-5">
    <div className="text-center">
      <h3 className="text-lg font-semibold text-[#1F1C18]">Verify your email</h3>
      <p className="text-sm text-[#6E685F] mt-1">
        Code sent to <span className="font-medium text-[#1F1C18]">{email}</span>.
      </p>
    </div>

    <div className="flex justify-center gap-2.5 sm:gap-3" onPaste={handleOtpPaste}>
      {otpChars.map((char, i) => (
        <input
          key={i}
          ref={el => { otpBoxRefs.current[i] = el }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={char}
          onChange={e => setOtpDigit(i, e.target.value)}
          onKeyDown={e => handleOtpKeyDown(i, e)}
          onFocus={e => e.target.select()}
          aria-label={`Digit ${i + 1}`}
          className={`w-12 h-14 sm:w-13 sm:h-16 text-center text-2xl font-bold rounded-xl border-2 caret-[#FF9933] focus:outline-none focus:ring-4 focus:ring-[#FF9933]/15 focus:border-[#FF9933] focus:scale-105 transition-all duration-150 shadow-sm ${
            char
              ? 'text-[#1F1C18] bg-[#FFF6EC] border-[#FF9933]'
              : 'text-[#1F1C18] bg-white border-[#e8e4df]'
          }`}
        />
      ))}
    </div>

    {otpError && (
      <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{otpError}</p>
    )}

    <div className="flex items-center gap-3 mt-1">
      <button
        type="button"
        onClick={() => { setStep('form'); setFormStep('details'); setError(''); setOtpError('') }}
        aria-label="Change details"
        className="
          h-12
          w-12
          flex
          items-center
          justify-center
          rounded-xl
          border
          border-[#e8e4df]
          text-[#3D3A33]
          shadow-sm
          hover:bg-[#FAF8F5]
          hover:border-[#d8d2c6]
          hover:shadow
          transition-all
          shrink-0
        "
      >
        <ArrowLeft size={18} strokeWidth={2.2} />
      </button>

      <Button
        type="submit"
        fullWidth
        loading={loading}
        className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-12! rounded-xl! shadow-lg shadow-[#FF9933]/25"
      >
        Verify & create account
      </Button>
    </div>

    <div className="flex items-center justify-center text-sm">
      <button
        type="button"
        disabled={resendIn > 0 || otpSending}
        onClick={async () => {
          setOtpSending(true); setOtpError('')
          const { error: rErr } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
          if (rErr) setOtpError(rErr.message); else setResendIn(45)
          setOtpSending(false)
        }}
        className={`inline-flex items-center gap-1.5 font-medium transition-colors ${
          resendIn > 0
            ? 'text-[#B3ABA0] cursor-default'
            : 'text-[#E07A12] hover:underline disabled:opacity-40'
        }`}
      >
        {resendIn > 0 ? (
          <>
            <Clock size={13} strokeWidth={2.2} />
            Resend code in {String(Math.floor(resendIn / 60)).padStart(1, '0')}:{String(resendIn % 60).padStart(2, '0')}
          </>
        ) : (
          'Resend code'
        )}
      </button>
    </div>
  </form>
) : formStep === 'details' ? (
  <form onSubmit={handleNext} className="space-y-5">

    {/* Full Name */}
    <div>
      <label className="block text-sm font-medium text-[#6E685F] mb-1.5">
        Full Name
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-2">
<div className="relative">
  <select
    value={prefix}
    onChange={(e) => setPrefix(e.target.value)}
    className="
      h-10
      w-full
      sm:w-[100px]
      px-3
      pr-9
      rounded-lg
      border
      border-[#e8e4df]
      bg-white
      text-[#1c1c1e]
      text-sm
      font-medium
      appearance-none
      cursor-pointer
      focus:outline-none
      focus:ring-2
      focus:ring-[#FF9933]/50
    "
  >
    {PREFIXES.map((p) => (
      <option key={p} value={p}>
        {p}
      </option>
    ))}
  </select>

  <svg
    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
</div>

        <input
          type="text"
          required
          autoFocus
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Karan Sharma"
          className="
            h-10
            px-4
            rounded-lg
            border
            border-[#e8e4df]
            text-sm
            text-[#1c1c1e]
            placeholder-[#6b7280]
            focus:outline-none
            focus:ring-2
            focus:ring-[#FF9933]/50
          "
        />
      </div>
    </div>

    {/* Username / public web address — a single flat field styled exactly
        like the rest of the form (no tinted callout card), with the fixed
        domain shown as a plain, non-editable prefix inside one bordered
        row so it reads as ONE field, not a separate box bolted on. */}
    <div>
      <label className="block text-sm font-medium text-[#6E685F] mb-1.5">
        Choose your public web address
      </label>

      <div className={`flex items-stretch h-11 rounded-lg border overflow-hidden focus-within:ring-2 focus-within:ring-[#FF9933]/50 ${usernameBorder}`}>
        <span className="flex items-center pl-4 pr-1 text-sm font-medium text-[#6E685F] bg-[#FAFAF8] border-r border-[#e8e4df] whitespace-nowrap select-none">
          {domainDisplay}
        </span>
        <div className="relative flex-1">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            onBlur={checkUsername}
            placeholder="yourname"
            minLength={3}
            className="w-full h-full px-3 pr-9 text-sm text-[#1c1c1e] placeholder-[#9ca3af] focus:outline-none"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full transition-colors duration-200"
            style={{
              background:
                usernameStatus === 'checking'  ? '#F3F1EE' :
                usernameStatus === 'available' ? '#FFF1DF' :
                usernameStatus === 'taken'     ? '#FDECEC' : 'transparent',
            }}
          >
            {usernameStatus === 'checking' && (
              <Loader size={13} className="animate-spin text-[#9C9388]" strokeWidth={2.5} />
            )}
            {usernameStatus === 'available' && (
              <CheckCircle size={14} className="text-[#FF9933]" strokeWidth={2.5} />
            )}
            {usernameStatus === 'taken' && (
              <XCircle size={14} className="text-red-500" strokeWidth={2.5} />
            )}
          </div>
        </div>
      </div>

      {usernameStatus === 'taken' && (
        <div className="mt-1.5">
          <p className="text-xs text-red-500 mb-1">
            Username taken. Try one of these:
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setUsername(s)
                  setUsernameStatus('idle')
                  setSuggestions([])
                }}
                className="px-3 py-1 bg-[#FBF3E6] text-[#7a5a1e] border border-[#F3D9B0] rounded-full text-xs font-medium hover:bg-[#F7E6C8] transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>

    <Input
      label="Email Address"
      type="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="priya@example.com"
      className="h-10!"
    />

    {/* Phone — country-code picker defaults to the current portal's
        country (e.g. +1 on the America portal) but the person can search
        and pick any of ~195 countries. */}
    <div>
      <label className="block text-sm font-medium text-[#6E685F] mb-1.5">
        Mobile Number
      </label>
      <div className="flex gap-2">
        <CountryCodeSelect value={countryIso} onChange={(iso) => setCountryIso(iso)} />
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          placeholder="Mobile number, or +country code"
          inputMode="tel"
          maxLength={16}
          className="flex-1 h-10 px-4 rounded-lg border border-[#e8e4df] text-sm text-[#1c1c1e] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50"
        />
      </div>
    </div>

    {error && (
      <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
        {error}
      </p>
    )}

<div className="flex items-center gap-3 mt-1">
  <button
    type="button"
    onClick={() => router.back()}
    aria-label="Go back"
    className="
      h-11
      w-11
      flex
      items-center
      justify-center
      rounded-xl
      border
      border-[#e8e4df]
      text-[#3D3A33]
      shadow-sm
      hover:bg-[#FAF8F5]
      hover:border-[#d8d2c6]
      hover:shadow
      transition-all
      shrink-0
    "
  >
    <ArrowLeft size={18} strokeWidth={2.2} />
  </button>

  <Button
    type="submit"
    fullWidth
    className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-11! rounded-xl! shadow-lg shadow-[#FF9933]/25"
  >
    Next
  </Button>
</div>
  </form>
) : (
  <form onSubmit={handleSendOtp} className="space-y-5">

<div>
  <label className="block text-sm font-medium text-[#6E685F] mb-1.5">
    Password
  </label>

  <div className="relative group">
    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#B3ABA0] group-focus-within:text-[#FF9933] transition-colors pointer-events-none">
      <Lock size={16} strokeWidth={2} />
    </span>

    <input
      type={showPassword ? 'text' : 'password'}
      required
      autoFocus
      minLength={8}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      onFocus={() => setPasswordFocused(true)}
      onBlur={() => setPasswordFocused(false)}
      placeholder="Minimum 8 characters"
      className="
        w-full
        h-12
        pl-11
        pr-12
        rounded-xl
        border
        border-[#e8e4df]
        bg-white
        text-[15px]
        text-[#1c1c1e]
        placeholder-[#9C9388]
        shadow-[0_1px_2px_rgba(31,28,24,0.04)]
        transition-all
        duration-150
        focus:outline-none
        focus:border-[#FF9933]
        focus:ring-4
        focus:ring-[#FF9933]/12
        focus:shadow-[0_2px_8px_rgba(255,153,51,0.1)]
      "
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="
        absolute
        right-2.5
        top-1/2
        -translate-y-1/2
        flex
        items-center
        justify-center
        w-8
        h-8
        rounded-lg
        text-[#9C9388]
        hover:text-[#3D3A33]
        hover:bg-[#F7F4EF]
        transition-colors
      "
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <EyeOff size={17} />
      ) : (
        <Eye size={17} />
      )}
    </button>
  </div>
  {(passwordFocused || password.length > 0) && (() => {
    const rules = [
      { label: '8+ characters', pass: password.length >= 8 },
      { label: 'Uppercase letter', pass: /[A-Z]/.test(password) },
      { label: 'Lowercase letter', pass: /[a-z]/.test(password) },
      { label: 'A number',      pass: /[0-9]/.test(password) },
      { label: 'A symbol',      pass: /[!@#$%^&*()_+\-=[\]{};':"|<>?,./`~]/.test(password) },
    ]
    const passedCount = rules.filter(r => r.pass).length
    const strength =
      passedCount <= 1 ? { label: 'Weak',   color: '#D64545' } :
      passedCount <= 3 ? { label: 'Fair',   color: '#D68A1A' } :
      passedCount === 4 ? { label: 'Good',  color: '#3E8E5A' } :
                          { label: 'Strong', color: '#1F7A42' }

    return (
      <div className="mt-3">
        {/* Single continuous strength meter, MNC-checkout style — a thin
            track that fills proportionally, with a quiet text label
            instead of colorful segmented/chip UI. */}
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-[#9C9388]">Password strength</span>
          <span className="text-[11px] font-semibold" style={{ color: strength.color }}>{strength.label}</span>
        </div>
        <div className="h-[3px] w-full rounded-full bg-[#EDE9E2] overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(passedCount / rules.length) * 100}%`, background: strength.color }}
          />
        </div>

        {/* Clean vertical checklist — monochrome text that darkens and
            gets a subtle check when satisfied, no colored pill chrome. */}
        <ul className="mt-2.5 grid grid-cols-2 gap-x-4 gap-y-1">
          {rules.map(rule => (
            <li key={rule.label} className="flex items-center gap-1.5 text-[11.5px]">
              <CheckCircle
                size={12}
                strokeWidth={2.5}
                className={rule.pass ? 'text-[#1F7A42]' : 'text-[#D9D3C7]'}
              />
              <span className={rule.pass ? 'text-[#3D3A33] font-medium' : 'text-[#B3ABA0]'}>
                {rule.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    )
  })()}
</div>

    {error && (
      <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
        {error}
      </p>
    )}

<div className="flex items-center gap-3 mt-1">
  <button
    type="button"
    onClick={() => { setFormStep('details'); setError('') }}
    aria-label="Go back"
    className="
      h-11
      w-11
      flex
      items-center
      justify-center
      rounded-xl
      border
      border-[#e8e4df]
      text-[#3D3A33]
      shadow-sm
      hover:bg-[#FAF8F5]
      hover:border-[#d8d2c6]
      hover:shadow
      transition-all
      shrink-0
    "
  >
    <ArrowLeft size={18} strokeWidth={2.2} />
  </button>

  <Button
    type="submit"
    fullWidth
    loading={loading}
    className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-11! rounded-xl! shadow-lg shadow-[#FF9933]/25"
  >
    Create account
  </Button>
</div>
  </form>
)}
</div>

  </AuthLayout>
)

}
