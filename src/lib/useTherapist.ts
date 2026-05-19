'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export interface Therapist {
  id: string
  full_name: string
  email: string
  username: string
  title: string | null
  bio: string | null
  city: string | null
  phone: string | null
  photo_url: string | null
  specialties: string[]
  languages: string[]
  fee_per_session: number | null
  session_duration_mins: number
  years_experience: number | null
  session_mode: string
  plan: string
  is_profile_complete: boolean
}

export function useTherapist() {
  const supabase = createClient()
  const [therapist, setTherapist] = useState<Therapist | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTherapist() {
      // Wait for session first
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.user) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('therapists')
        .select('*')
        .eq('id', session.user.id)
        .single()

      if (error) {
        console.error('Therapist fetch error:', error.message)
      } else {
        setTherapist(data)
      }

      setLoading(false)
    }

    fetchTherapist()
  }, [])

  return { therapist, loading }
}