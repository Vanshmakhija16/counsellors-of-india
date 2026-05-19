import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import StaticProfile from '@/components/booking/templates/StaticProfile'
import ClassicTemplate from '@/components/booking/templates/ClassicTemplate'

export default async function TherapistPublicPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createServerSupabaseClient()

  const { data: therapist } = await supabase
    .from('therapists')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (!therapist) notFound()

  // Map DB row → TherapistProfile
  const profile = {
    id:               therapist.id,
    name:             therapist.full_name ?? '',
    credentials:      therapist.title ?? '',
    bio:              therapist.bio ?? '',
    image:            therapist.photo_url ?? '',
    location:         therapist.city ?? '',
    experience:       therapist.years_experience ?? 0,
    fee:              therapist.fee_per_session ?? 0,
    specialties:      therapist.specialties ?? [],
    languages:        therapist.languages ?? ['English'],
    sessionDuration:  therapist.session_duration_mins ?? 50,
    sessionMode:      therapist.session_mode ?? 'both',
    phone:            therapist.phone ?? '',
    plan:             therapist.plan ?? 'free',
    whatsapp:         therapist.whatsapp ?? '',
    instagram:        therapist.instagram ?? '',
    linkedin:         therapist.linkedin ?? '',
    website:          therapist.website ?? '',
    tagline:          therapist.tagline ?? '',
    approach_text:    therapist.approach_text ?? '',
    education:        therapist.education ?? [],
    certifications:   therapist.certifications ?? [],
    // Availability schedule for Growth plan
    availability:     therapist.availability ?? null,
  }

  if (therapist.plan === 'free') {
    return <StaticProfile therapist={profile} />
  }

  // Growth / Pro — fetch booked appointments to mark slots as taken
  const { data: booked } = await supabase
    .from('appointments')
    .select('scheduled_at')
    .eq('therapist_id', therapist.id)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', new Date().toISOString())

  // Published client feedback
  const { data: feedbacks } = await supabase
    .from('feedbacks')
    .select('id, client_name, client_role, rating, text, created_at')
    .eq('therapist_id', therapist.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <ClassicTemplate
      therapist={profile}
      bookedTimes={booked?.map(b => b.scheduled_at) ?? []}
      feedbacks={feedbacks ?? []}
    />
  )
}
