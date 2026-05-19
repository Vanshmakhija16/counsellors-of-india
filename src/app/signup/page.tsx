'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import AuthLayout from '@/components/layout/AuthLayout'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Camera, User, CheckCircle, XCircle, Loader } from 'lucide-react'

const PREFIXES = ['Dr.', 'Prof.', 'Mr.', 'Ms.', 'Mrs.', 'None']

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [prefix, setPrefix] = useState('Dr.')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const [suggestions, setSuggestions] = useState<string[]>([])

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  // Clean username as user types
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
      // Generate suggestions
      setSuggestions([
        `${username}1`,
        `${username}2`,
        `${username}-therapy`,
        `${username}-care`,
      ])
    } else {
      setUsernameStatus('available')
      setSuggestions([])
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    if (usernameStatus === 'taken') {
      setError('Please choose a different username')
      return
    }
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    setLoading(true)
    setError('')

    // Final username check before submit
    const { data: existing } = await supabase
      .from('therapists')
      .select('username')
      .eq('username', username)
      .maybeSingle()

    if (existing) {
      setError('Username already taken. Please choose another.')
      setLoading(false)
      return
    }

    const displayName = prefix === 'None'
      ? fullName
      : `${prefix} ${fullName}`

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: displayName } }
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Signup failed. Please try again.')
      setLoading(false)
      return
    }

    // Upload photo if selected
    let photo_url = null
    if (photoFile) {
      const ext = photoFile.name.split('.').pop()
      const path = `${data.user.id}/profile.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, photoFile, { upsert: true })

      if (!uploadError) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(path)
        photo_url = urlData.publicUrl
      }
    }

    // Insert therapist row
    await supabase.from('therapists').upsert({
      id:         data.user.id,
      full_name:  displayName,
      email:      email,
      username:   username,
      photo_url:  photo_url,
      plan:       'free',
      is_active:  true,
      is_profile_complete: false,
    })

    router.push('/pricing')
  }

  return (
    <AuthLayout title="Create your free therapist account">
      <Card padding="lg">
        <form onSubmit={handleSignup} className="space-y-5">

          {/* Photo upload */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <label className="cursor-pointer group">
              <div className="w-20 h-20 rounded-full bg-[#d4e4e1]
                              border-2 border-[#b8ceca] overflow-hidden
                              flex items-center justify-center relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview"
                    className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-[#a3b8b4]" />
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0
                                group-hover:opacity-100 transition
                                flex items-center justify-center">
                  <Camera size={18} className="text-white" />
                </div>
              </div>
              <input type="file" accept="image/*"
                className="hidden"
                onChange={handlePhotoChange} />
            </label>
            <p className="text-xs text-[#6b7280]">
              {photoPreview ? 'Photo selected ✓' : 'Upload profile photo'}
            </p>
          </div>

          {/* Prefix + Name */}
          <div>
            <label className="block text-sm font-medium
                               text-[#6b7280] mb-1.5">
              Full Name
            </label>
            <div className="flex gap-2">
              <select
                value={prefix}
                onChange={e => setPrefix(e.target.value)}
                className="h-11 px-3 rounded-lg border border-[#e8e4df]
                           text-[#1c1c1e] text-sm bg-white
                           focus:outline-none focus:ring-2
                           focus:ring-[#a3b8b4] shrink-0"
              >
                {PREFIXES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Priya Sharma"
                className="flex-1 h-11 px-4 rounded-lg border border-[#e8e4df]
                           text-[#1c1c1e] placeholder-[#6b7280] text-sm
                           focus:outline-none focus:ring-2
                           focus:ring-[#a3b8b4] focus:border-transparent"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium
                               text-[#6b7280] mb-1.5">
              Your profile URL
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-[#f2f0ed]
                              border border-[#e8e4df] rounded-lg
                              text-sm text-[#6b7280] shrink-0">
                counsellorsofindia.com/
              </div>
              <div className="relative flex-1">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => handleUsernameChange(e.target.value)}
                  onBlur={checkUsername}
                  placeholder="yourname"
                  minLength={3}
                  className="w-full h-11 px-4 rounded-lg border text-sm
                             text-[#1c1c1e] placeholder-[#6b7280]
                             focus:outline-none focus:ring-2
                             focus:ring-[#a3b8b4] focus:border-transparent
                             pr-10
                             ${usernameStatus === 'taken'
                               ? 'border-red-300'
                               : usernameStatus === 'available'
                               ? 'border-green-300'
                               : 'border-[#e8e4df]'}"
                />
                {/* Status icon */}
                <div className="absolute right-3 top-3">
                  {usernameStatus === 'checking' && (
                    <Loader size={16} className="text-[#6b7280] animate-spin" />
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

            {/* Status messages */}
            {usernameStatus === 'available' && (
              <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
                <CheckCircle size={11} /> Available!
              </p>
            )}
            {usernameStatus === 'taken' && (
              <div className="mt-2">
                <p className="text-xs text-red-500 mb-1.5">
                  ❌ This username is taken. Try one of these:
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setUsername(s)
                        setUsernameStatus('idle')
                        setSuggestions([])
                      }}
                      className="px-3 py-1 bg-[#d4e4e1] text-[#2d4a47]
                                 rounded-full text-xs font-medium
                                 hover:bg-[#b8ceca] transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-[#6b7280] mt-1.5">
              Only lowercase letters, numbers, and hyphens
            </p>
          </div>

          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="priya@example.com"
          />

          {/* Password */}
          <Input
            label="Password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Minimum 6 characters"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50
                          px-4 py-2 rounded-lg">
              {error}
            </p>
          )}

          <Button type="submit" fullWidth loading={loading}>
            Create Free Account
          </Button>

        </form>
      </Card>

      <p className="text-center text-sm text-[#6b7280] mt-6">
        Already have an account?{' '}
        <Link href="/login"
          className="text-[#5a7f7a] font-medium hover:underline">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}