import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getColor } from '@/lib/template'
import ClassicTemplate  from '@/components/booking/templates/ClassicTemplate'
import ClassicTemplate2 from '@/components/booking/templates/ClassicTemplate2'
import ClassicTemplate3 from '@/components/booking/templates/ClassicTemplate3'
import ClassicTemplate4 from '@/components/booking/templates/ClassicTemplate4'
import ClassicTemplate5 from '@/components/booking/templates/ClassicTemplate5'
import ClassicTemplate6 from '@/components/booking/templates/ClassicTemplate6'

type SearchParams = Promise<{ embed?: string; pc?: string }>

export default async function LivePreviewPage({
  params,
  searchParams,
}: {
  params: SearchParams
  searchParams: SearchParams
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: therapist } = await supabase
    .from('therapists')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!therapist) redirect('/dashboard')

  const { template: templateSlug } = await (params as unknown as Promise<{ template: string }>)
  const { embed, pc }              = await searchParams

  let profileContent: Record<string, unknown> = therapist.profile_content ?? {}
  if (pc) {
    try {
      const parsed = JSON.parse(decodeURIComponent(pc))
      if (parsed && typeof parsed === 'object') profileContent = parsed
    } catch { /* malformed — fall back to saved */ }
  }

  const hiddenSections: string[] = therapist.hidden_sections ?? []
  const color = getColor(therapist.color_id ?? 'teal')

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
    id:              therapist.id,
    name:            therapist.full_name ?? '',
    credentials:     therapist.title ?? '',
    bio:             therapist.bio ?? '',
    image:           therapist.photo_url ?? '',
    location:        therapist.city ?? '',
    experience:      therapist.years_experience ?? 0,
    fee:             therapist.fee_per_session ?? 0,
    specialties:     therapist.specialties ?? [],
    languages:       therapist.languages ?? ['English'],
    sessionDuration: therapist.session_duration_mins ?? 50,
    sessionMode:     therapist.session_mode ?? 'both',
    phone:           therapist.phone ?? '',
    plan:            therapist.plan ?? 'free',
    whatsapp:        therapist.whatsapp ?? '',
    instagram:       therapist.instagram ?? '',
    linkedin:        therapist.linkedin ?? '',
    website:         therapist.website ?? '',
    tagline:         therapist.tagline ?? '',
    approach_text:   therapist.approach_text ?? '',
    education:       therapist.education ?? [],
    certifications:  therapist.certifications ?? [],
    availability:    therapist.availability ?? null,
    profile_content: profileContent,
  }

  const TemplateNode = (() => {
    switch (templateSlug) {
      case 'classic2': return <ClassicTemplate2 therapist={profile} bookedTimes={[]} hiddenSections={hiddenSections} />
      case 'classic3': return <ClassicTemplate3 therapist={profile} bookedTimes={[]} hiddenSections={hiddenSections} />
      case 'classic4': return <ClassicTemplate4 therapist={profile} bookedTimes={[]} hiddenSections={hiddenSections} />
      case 'classic5': return <ClassicTemplate5 therapist={profile} bookedTimes={[]} hiddenSections={hiddenSections} />
      case 'classic6': return <ClassicTemplate6 therapist={profile} bookedTimes={[]} hiddenSections={hiddenSections} />
      default:         return <ClassicTemplate  therapist={profile} bookedTimes={[]} feedbacks={[]} hiddenSections={hiddenSections} />
    }
  })()

  const isEmbed = embed === '1'

  return (
    <>
      {/* When embedded in iframe: hide ALL scrollbars — outer wrapper handles scroll */}
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          ${isEmbed ? 'overflow: hidden; height: 100%;' : ''}
        }
        ${isEmbed ? `
          /* Hide scrollbars in all browsers */
          ::-webkit-scrollbar { display: none; }
          * { scrollbar-width: none; -ms-overflow-style: none; }
        ` : ''}
      `}</style>
      <style>{brandStyle}</style>

      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('message', function(e) {
          if (e.data && e.data.type === 'PROFILE_CONTENT_UPDATE') {
            var base = window.location.href
              .replace(/[?&]pc=[^&]*/g, '')
              .replace(/&$/, '')
              .replace(/\\?$/, '');
            var sep = base.indexOf('?') === -1 ? '?' : '&';
            window.location.href = base + sep + 'pc=' + encodeURIComponent(JSON.stringify(e.data.profileContent));
          }
        });
      `}} />

      <div className={isEmbed ? '' : 'pt-8'}>
        {TemplateNode}
      </div>
    </>
  )
}
