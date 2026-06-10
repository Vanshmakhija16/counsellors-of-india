'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { loadDemo, clearDemo, type DemoProfile } from '@/lib/demoSession'
import { Camera, User, CheckCircle, XCircle, Loader, Sparkles } from 'lucide-react'
import { Eye, EyeOff } from 'lucide-react'

const PREFIXES = ['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.', 'None']

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthLayout title="Create your free account"><div className="bg-white rounded-2xl border border-[#ece5d9] shadow-sm p-8"><div className="h-64" /></div></AuthLayout>}>
      <SignupForm />
    </Suspense>
  )
}

function SignupForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const supabase     = createClient()

  // Honour ?redirect so we can chain: signup → pricing → onboarding
  const redirectTo = searchParams.get('redirect') ?? '/pricing'
  const fromDemo   = searchParams.get('from') === 'demo'

  const [prefix, setPrefix]       = useState('Dr.')
  const [fullName, setFullName]   = useState('')
  const [username, setUsername]   = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  // The demo the user built on /try, carried into their real account.
  const [demo, setDemo]           = useState<DemoProfile | null>(null)
  const [showPassword, setShowPassword] = useState(false)

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
    if (d.photo_url && !photoPreview) setPhotoPreview(d.photo_url)
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

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handleUsernameChange(val: string) {
    // Accept the username exactly as typed — no filtering or lowercasing.
    setUsername(val)
    setUsernameStatus('idle')
    setSuggestions([])
  }

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

  function validateForm(): string | null {
    if (!fullName.trim()) return 'Please enter your name'
    if (usernameStatus === 'taken') return 'Please choose a different username'
    if (!username || username.length < 3) return 'Username must be at least 3 characters'
    // Basic shape check; the OTP step proves the inbox actually exists.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email address'
    return validatePassword(password)
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
    const { data: emailRow } = await supabase
      .from('therapists').select('id').eq('email', email).maybeSingle()
    if (emailRow) {
      setError('An account with this email already exists. Please sign in instead.')
      setLoading(false)
      return
    }

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
    const { error: pwErr } = await supabase.auth.updateUser({ password })
    if (pwErr) {
      setOtpError(`Could not set your password: ${pwErr.message}`)
      setLoading(false)
      return
    }

    await finishSignup(data.user.id)
  }

  // Shared: upload photo, write the therapist profile, redirect to pricing.
  async function finishSignup(userId: string) {
    const displayName = prefix === 'None' ? fullName : `${prefix} ${fullName}`

    let photo_url = null
    if (photoFile) {
      const ext  = photoFile.name.split('.').pop()
      const path = `${userId}/profile.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, photoFile, { upsert: true })
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
        photo_url = urlData.publicUrl
      }
    }

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

    await supabase.from('therapists').upsert({
      id:                  userId,
      full_name:           displayName,
      email,
      username,
      photo_url,
      plan:                'none',   // unpaid — must choose & pay a plan before dashboard
      is_active:           true,
      is_profile_complete: false,
      ...demoFields,
    })

    if (demo) clearDemo()

    // After signup always go to pricing so they can choose a plan
    router.push(redirectTo)
  }

  const usernameBorder =
    usernameStatus === 'taken'     ? 'border-red-300'   :
    usernameStatus === 'available' ? 'border-green-300' :
    'border-[#e8e4df]'

return ( 


<AuthLayout title="Create your free account">



   <div
   className="
     w-full
     max-w-[680px]
     mx-auto
     bg-white
     rounded-2xl
     border
     border-[#ece5d9]
     shadow-[0_20px_60px_-30px_rgba(31,28,24,0.25)]
     p-5
     sm:p-7
     lg:p-8
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
        We sent a 6-digit code to <span className="font-medium text-[#1F1C18]">{email}</span>.
        Enter it below to finish creating your account.
      </p>
    </div>

    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
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
          className="w-11 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold text-[#1F1C18] caret-[#FF9933] bg-white rounded-xl border-2 border-[#e8e4df] focus:border-[#FF9933] focus:ring-2 focus:ring-[#FF9933]/20 focus:outline-none transition-colors"
        />
      ))}
    </div>

    {otpError && (
      <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{otpError}</p>
    )}

    <Button
      type="submit"
      fullWidth
      loading={loading}
      className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-12! rounded-xl! shadow-lg shadow-[#FF9933]/25"
    >
      Verify & create account
    </Button>

    <div className="flex items-center justify-between text-sm">
      <button
        type="button"
        onClick={() => { setStep('form'); setError(''); setOtpError('') }}
        className="text-[#6E685F] hover:underline"
      >
        ← Change details
      </button>
      <button
        type="button"
        disabled={resendIn > 0 || otpSending}
        onClick={async () => {
          setOtpSending(true); setOtpError('')
          const { error: rErr } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
          if (rErr) setOtpError(rErr.message); else setResendIn(45)
          setOtpSending(false)
        }}
        className="text-[#E07A12] font-medium hover:underline disabled:opacity-40 disabled:no-underline"
      >
        {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
      </button>
    </div>
  </form>
) : (
  <form onSubmit={handleSendOtp} className="space-y-5">

    {/* Photo */}
    <div className="flex flex-col items-center gap-3 pb-4">
      <label className="cursor-pointer group">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#FBF3E6] border-2 border-[#F3D9B0] overflow-hidden flex items-center justify-center relative">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={28} className="text-[#E0A85C]" />
          )}

          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <Camera size={18} className="text-white" />
          </div>
        </div>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </label>

      <p className="text-xs text-[#6b7280]">
        {photoPreview ? 'Photo selected ✓' : 'Upload profile photo'}
      </p>
    </div>

    {/* Full Name */}
    <div>
      <label className="block text-sm font-medium text-[#6b7280] mb-1.5">
        Full Name
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] gap-2">
<div className="relative">
  <select
    value={prefix}
    onChange={(e) => setPrefix(e.target.value)}
    className="
      h-11
      w-full
      sm:w-[110px]
      px-3
      pr-10
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
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Karan Sharma"
          className="
            h-11
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

    {/* Username */}
    <div>
      <label className="block text-sm font-medium text-[#6b7280] mb-1.5">
        Your profile URL
      </label>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-2">
        <div
          className="
            h-11
            flex
            items-center
            px-3
            rounded-lg
            border
            border-[#e8e4df]
            bg-[#f2f0ed]
            text-sm
            text-[#6b7280]
            overflow-hidden
          "
        >
          counsellorsofindia.com/
        </div>

        <div className="relative">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            onBlur={checkUsername}
            placeholder="yourname"
            minLength={3}
            className={`w-full h-11 px-4 pr-10 rounded-lg border text-sm text-[#1c1c1e] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-transparent ${usernameBorder}`}
          />

          <div className="absolute right-3 top-3">
            {usernameStatus === 'checking' && (
              <Loader size={16} className="animate-spin text-[#6b7280]" />
            )}

            {usernameStatus === 'available' && (
              <CheckCircle size={16} className="text-green-500" />
            )}

            {usernameStatus === 'taken' && (
              <XCircle size={16} className="text-red-500" />
            )}
          </div>
        </div>
      </div>

      {usernameStatus === 'available' && (
        <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
          <CheckCircle size={11} />
          Available!
        </p>
      )}

      {usernameStatus === 'taken' && (
        <div className="mt-2">
          <p className="text-xs text-red-500 mb-1.5">
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

      {/* <p className="text-xs text-[#6b7280] mt-1.5">
        Only lowercase letters, numbers, and hyphens
      </p> */}
    </div>

    <Input
      label="Email Address"
      type="email"
      required
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      placeholder="priya@example.com"
    />

<div>
  <label className="block text-sm font-medium text-[#6b7280] mb-1.5">
    Password
  </label>

  <div className="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      required
      minLength={8}
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      placeholder="Minimum 8 characters"
      className="
        w-full
        h-11
        px-4
        pr-12
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

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="
        absolute
        right-3
        top-1/2
        -translate-y-1/2
        text-[#6b7280]
        hover:text-[#1c1c1e]
        transition-colors
      "
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? (
        <EyeOff size={18} />
      ) : (
        <Eye size={18} />
      )}
    </button>
  </div>
  <p className="text-xs text-[#6b7280] mt-1.5">
    At least 8 characters, with an uppercase &amp; lowercase letter, a number, and a symbol.
  </p>
</div>

    {error && (
      <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
        {error}
      </p>
    )}

<Button
  type="submit"
  fullWidth
  loading={loading}
  className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-12! rounded-xl! shadow-lg shadow-[#FF9933]/25"
>
  Create account
</Button>

<button
  type="button"
  onClick={() => router.back()}
  className="
    w-full
    mt-3
    text-center
    text-sm
    font-medium
    text-[#E07A12]
    hover:text-[#C96B10]
    hover:underline
    transition-colors
  "
>
  ← Go Back
</button>
  </form>
)}
</div>

<p className="text-center text-sm text-[#6E685F] mt-6">
  Already have an account?{' '}
  <Link
    href="/login"
    className="text-[#E07A12] font-medium hover:underline"
  >
    Sign in
  </Link>
</p>

  </AuthLayout>
)

}
