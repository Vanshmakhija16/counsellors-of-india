'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import Logo from '@/components/ui/Logo'
import Card from '@/components/ui/Card'
import StepIndicator from '@/components/onboarding/StepIndicator'
import Step1Profile from '@/components/onboarding/Step1Profile'
import Step2Practice from '@/components/onboarding/Step2Practice'
import Step3Availability from '@/components/onboarding/Step3Availability'

const STEPS = ['Profile', 'Practice', 'Availability']

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Pre-fill with whatever we already have from signup
  const [formData, setFormData] = useState<any>({
    full_name: '',
    title: '',
    city: '',
    bio: '',
    specialties: [],
    languages: ['English'],
    fee_per_session: '',
    session_duration_mins: 50,
    years_experience: '',
    session_mode: 'both',
    availability: [],
  })

  // Load existing data on mount
  useEffect(() => {
    async function loadExisting() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      setUserId(user.id)

      const { data: therapist } = await supabase
        .from('therapists')
        .select('*')
        .eq('id', user.id)
        .single()

      if (therapist) {
        // Pre-fill form with existing data
        setFormData((prev: any) => ({
          ...prev,
          full_name: therapist.full_name ?? '',
          title: therapist.title ?? '',
          city: therapist.city ?? '',
          bio: therapist.bio ?? '',
          specialties: therapist.specialties ?? [],
          languages: therapist.languages ?? ['English'],
          fee_per_session: therapist.fee_per_session ?? '',
          session_duration_mins: therapist.session_duration_mins ?? 50,
          years_experience: therapist.years_experience ?? '',
          session_mode: therapist.session_mode ?? 'both',
          photo_url: therapist.photo_url ?? '',
        }))
      }
    }
    loadExisting()
  }, [])

  async function handleSubmit() {
    if (!userId) return
    setLoading(true)

    try {
      // Upload photo if a new file was selected
      let photo_url = formData.photo_url ?? null

      if (formData.photo_file) {
        const ext = formData.photo_file.name.split('.').pop()
        const path = `${userId}/profile.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, formData.photo_file, { upsert: true })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(path)
          photo_url = urlData.publicUrl
        }
      }

      // Save all profile data to therapists table
      const { error: updateError } = await supabase
        .from('therapists')
        .update({
          full_name:            formData.full_name,
          title:                formData.title,
          city:                 formData.city,
          bio:                  formData.bio,
          specialties:          formData.specialties,
          languages:            formData.languages,
          fee_per_session:      Number(formData.fee_per_session),
          session_duration_mins: Number(formData.session_duration_mins),
          years_experience:     Number(formData.years_experience),
          session_mode:         formData.session_mode,
          photo_url:            photo_url,
          is_profile_complete:  true,
        })
        .eq('id', userId)

      if (updateError) {
        console.error('Profile save error:', updateError)
        setLoading(false)
        return
      }

      // Save availability slots
      if (formData.availability.length > 0) {
        // Delete old slots
        await supabase
          .from('slots')
          .delete()
          .eq('therapist_id', userId)

        // Insert new slots
        const slots = formData.availability.map((a: any) => ({
          therapist_id: userId,
          day_of_week:  a.dayOfWeek,
          start_time:   a.startTime,
          is_active:    true,
        }))

        const { error: slotsError } = await supabase
          .from('slots')
          .insert(slots)

        if (slotsError) {
          console.error('Slots save error:', slotsError)
        }
      }

      // ✅ Everything saved — go to dashboard
      router.push('/dashboard')

    } catch (err) {
      console.error('Onboarding error:', err)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fafaf9] px-4 py-12">
      <div className="max-w-xl mx-auto">

        <div className="text-center mb-10">
          <Logo size="md" centered />
          <p className="text-[#6b7280] text-sm mt-2">
            Set up your professional profile — takes 5 minutes
          </p>
        </div>

        <StepIndicator
          current={step}
          total={STEPS.length}
          steps={STEPS}
        />

        <Card padding="lg">
          <div className="mb-6">
            <p className="text-xs font-semibold text-[#a3b8b4] uppercase tracking-widest mb-1">
              Step {step} of {STEPS.length}
            </p>
            <h2
              className="text-2xl font-semibold text-[#1c1c1e]"
              style={{ fontFamily: 'var(--font-cormorant), serif' }}
            >
              {step === 1 && 'Your profile'}
              {step === 2 && 'Your practice'}
              {step === 3 && 'Your availability'}
            </h2>
            <p className="text-sm text-[#6b7280] mt-1">
              {step === 1 && 'This is what clients see first on your public page'}
              {step === 2 && 'Help clients understand your expertise and fees'}
              {step === 3 && 'Set when you are available for sessions'}
            </p>
          </div>

          {step === 1 && (
            <Step1Profile
              data={formData}
              onChange={setFormData}
              onNext={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2Practice
              data={formData}
              onChange={setFormData}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <Step3Availability
              data={formData}
              onChange={setFormData}
              onSubmit={handleSubmit}
              onBack={() => setStep(2)}
              loading={loading}
            />
          )}
        </Card>

        <p className="text-center text-xs text-[#6b7280] mt-6">
          You can edit all of this later from dashboard settings
        </p>

      </div>
    </main>
  )
}