import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { getColor } from '@/lib/template'
import StaticProfile from '@/components/booking/templates/StaticProfile'
import ClassicTemplate from '@/components/booking/templates/ClassicTemplate'
import ClassicTemplate2 from '@/components/booking/templates/ClassicTemplate2'
import ClassicTemplate3 from '@/components/booking/templates/ClassicTemplate3'
import ClassicTemplate4 from '@/components/booking/templates/ClassicTemplate4'
import ClassicTemplate5 from '@/components/booking/templates/ClassicTemplate5'

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

  const hiddenSections: string[] = therapist.hidden_sections ?? []
  const color = getColor(therapist.color_id ?? 'teal')

  // CSS variable injection — overrides :root defaults in every template's stylesheet
  const brandStyle = `
    :root {
      --brand: ${color.primary};
      --brand-light: ${color.light};
      --brand-dark: ${color.dark};
      --warm-accent: ${color.primary};
      --teal: ${color.primary};
      --teal-mid: ${color.primary};
    }
  `

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
    availability:     therapist.availability ?? null,
    profile_content:  therapist.profile_content ?? {},
  }

  if (therapist.plan === 'free') {
    return (
      <>
        <style>{brandStyle}</style>
        <StaticProfile therapist={profile} />
      </>
    )
  }

  const { data: booked } = await supabase
    .from('appointments')
    .select('scheduled_at')
    .eq('therapist_id', therapist.id)
    .in('status', ['pending', 'confirmed'])
    .gte('scheduled_at', new Date().toISOString())

  const { data: feedbacks } = await supabase
    .from('feedbacks')
    .select('id, client_name, client_role, rating, text, created_at')
    .eq('therapist_id', therapist.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const bookedTimes = booked?.map(b => b.scheduled_at) ?? []

  const Template = (() => {
    switch (therapist.template_id) {
      case 'classic2': return <ClassicTemplate2 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} />
      case 'classic3': return <ClassicTemplate3 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} />
      case 'classic4': return <ClassicTemplate4 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} />
      case 'classic5': return <ClassicTemplate5 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} />
      default:         return <ClassicTemplate  therapist={profile} bookedTimes={bookedTimes} feedbacks={feedbacks ?? []} hiddenSections={hiddenSections} />
    }
  })()

  return (
    <>
      <style>{brandStyle}</style>
      {Template}
    </>
  )
}
