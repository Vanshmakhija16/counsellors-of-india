'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthLayout from '@/components/layout/AuthLayout'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { loadDemo, clearDemo, type DemoProfile } from '@/lib/demoSession'
import { Camera, User, CheckCircle, XCircle, Loader, Sparkles } from 'lucide-react'

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

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  function handleUsernameChange(val: string) {
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setUsername(clean)
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
      setSuggestions([`${username}1`, `${username}2`, `${username}-therapy`, `${username}-care`])
    } else {
      setUsernameStatus('available')
      setSuggestions([])
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (usernameStatus === 'taken') { setError('Please choose a different username'); return }
    if (!username || username.length < 3) { setError('Username must be at least 3 characters'); return }

    setLoading(true)
    setError('')

    // Race-condition guard
    const { data: existing } = await supabase
      .from('therapists').select('username').eq('username', username).maybeSingle()
    if (existing) {
      setError('Username already taken. Please choose another.')
      setLoading(false)
      return
    }

    const displayName = prefix === 'None' ? fullName : `${prefix} ${fullName}`

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } },
    })

    if (signUpError) { setError(signUpError.message); setLoading(false); return }
    if (!data.user)  { setError('Signup failed. Please try again.'); setLoading(false); return }

    let photo_url = null
    if (photoFile) {
      const ext  = photoFile.name.split('.').pop()
      const path = `${data.user.id}/profile.${ext}`
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
      id:                  data.user.id,
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
      <div className="bg-white rounded-2xl border border-[#ece5d9] shadow-[0_20px_60px_-30px_rgba(31,28,24,0.25)] p-7 sm:p-8">
        {fromDemo && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[#F3D9B0] bg-[#FBF3E6] px-4 py-3">
            <Sparkles size={16} className="text-[#FF9933] mt-0.5 shrink-0" />
            <p className="text-xs text-[#7a5a1e] leading-relaxed">
              Your demo site is saved. Finish signing up and we&rsquo;ll set it up with the design and details you chose.
            </p>
          </div>
        )}
        <form onSubmit={handleSignup} className="space-y-5">

          {/* Photo upload */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <label className="cursor-pointer group">
              <div className="w-20 h-20 rounded-full bg-[#FBF3E6] border-2 border-[#F3D9B0] overflow-hidden flex items-center justify-center relative">
                {photoPreview
                  ? <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  : <User size={28} className="text-[#E0A85C]" />}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </div>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
            <p className="text-xs text-[#6b7280]">{photoPreview ? 'Photo selected ✓' : 'Upload profile photo'}</p>
          </div>

          {/* Prefix + Name */}
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1.5">Full Name</label>
            <div className="flex gap-2">
              <select
                value={prefix}
                onChange={e => setPrefix(e.target.value)}
                className="h-11 px-3 rounded-lg border border-[#e8e4df] text-[#1c1c1e] text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 shrink-0"
              >
                {PREFIXES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input
                type="text" required value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                className="flex-1 h-11 px-4 rounded-lg border border-[#e8e4df] text-[#1c1c1e] placeholder-[#6b7280] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-transparent"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-[#6b7280] mb-1.5">Your profile URL</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center px-3 py-2 sm:py-0 bg-[#f2f0ed] border border-[#e8e4df] rounded-lg text-sm text-[#6b7280] shrink-0 whitespace-nowrap overflow-hidden text-ellipsis">
                counsellorsofindia.com/
              </div>
              <div className="relative flex-1 min-w-0">
                <input
                  type="text" required value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  onBlur={checkUsername}
                  placeholder="yourname" minLength={3}
                  className={`w-full h-11 px-4 pr-10 rounded-lg border text-sm text-[#1c1c1e] placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#FF9933]/50 focus:border-transparent ${usernameBorder}`}
                />
                <div className="absolute right-3 top-3">
                  {usernameStatus === 'checking'  && <Loader      size={16} className="text-[#6b7280] animate-spin" />}
                  {usernameStatus === 'available' && <CheckCircle size={16} className="text-green-500" />}
                  {usernameStatus === 'taken'     && <XCircle     size={16} className="text-red-500" />}
                </div>
              </div>
            </div>

            {usernameStatus === 'available' && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <CheckCircle size={11} /> Available!
              </p>
            )}
            {usernameStatus === 'taken' && (
              <div className="mt-2">
                <p className="text-xs text-red-500 mb-1.5">❌ Username taken. Try one of these:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button
                      key={s} type="button"
                      onClick={() => { setUsername(s); setUsernameStatus('idle'); setSuggestions([]) }}
                      className="px-3 py-1 bg-[#FBF3E6] text-[#7a5a1e] border border-[#F3D9B0] rounded-full text-xs font-medium hover:bg-[#F7E6C8] transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-[#6b7280] mt-1.5">Only lowercase letters, numbers, and hyphens</p>
          </div>

          <Input
            label="Email Address" type="email" required value={email}
            onChange={e => setEmail(e.target.value)} placeholder="priya@example.com"
          />
          <Input
            label="Password" type="password" required minLength={6} value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Minimum 6 characters"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            fullWidth
            loading={loading}
            className="bg-[#FF9933]! hover:bg-[#E07A12]! text-white! h-12! rounded-xl! shadow-lg shadow-[#FF9933]/25"
          >
            Create free account
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-[#6E685F] mt-6">
        Already have an account?{' '}
        <Link href="/login" className="text-[#E07A12] font-medium hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
