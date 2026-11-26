import type { Metadata } from 'next'
import { createServerSupabaseClient, createServiceSupabaseClientForTenant } from '@/lib/supabase-server'
import { getCurrentTenant } from '@/lib/tenants/server'
import { localizeCounselorSpelling } from '@/lib/counselorSpelling'
import { notFound } from 'next/navigation'
import { getColor } from '@/lib/template'
import StaticProfile from '@/components/booking/templates/StaticProfile'
import ClassicTemplate from '@/components/booking/templates/ClassicTemplate'
import ClassicTemplate2 from '@/components/booking/templates/ClassicTemplate2'
import ClassicTemplate3 from '@/components/booking/templates/ClassicTemplate3'
import ClassicTemplate4 from '@/components/booking/templates/ClassicTemplate4'
import ClassicTemplate5 from '@/components/booking/templates/ClassicTemplate5'
import ClassicTemplate6 from '@/components/booking/templates/ClassicTemplate6'
import ClassicTemplate7 from '@/components/booking/templates/ClassicTemplate7'
import ClassicTemplate8 from '@/components/booking/templates/ClassicTemplate8'

// Columns the public profile page reads from `therapists`. The US project does
// not have tagline / approach_text / education / certifications, and selecting
// a missing column makes the whole query fail (which used to surface as a 404),
// so the US lookup leaves them out. India's select is unchanged.
const THERAPIST_PAGE_COLUMNS_US =
  'id, full_name, title, bio, photo_url, city, years_experience, fee_per_session, total_sessions, specialties, languages, session_duration_mins, session_mode, phone, email, plan, hidden_sections, color_id, template_id, username, availability, profile_content, whatsapp, website, instagram, linkedin'
const THERAPIST_PAGE_COLUMNS =
  THERAPIST_PAGE_COLUMNS_US + ', tagline, approach_text, education, certifications'

/* ── Dynamic OG metadata per therapist profile ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const tenant = await getCurrentTenant()
  // COA revokes anonymous reads from `therapists`; use its tenant-scoped
  // service client for this server-side, explicitly selected public metadata.
  const supabase = tenant.id === 'us'
    ? await createServiceSupabaseClientForTenant()
    : await createServerSupabaseClient()

  const raw = decodeURIComponent(username).trim()
  const candidates = [...new Set([raw, raw.replace(/^@+/, ''), `@${raw.replace(/^@+/, '')}`])]

  let therapist = null
  for (const candidate of candidates) {
    let query = supabase
      .from('therapists')
      .select('full_name, title, city, specialties, photo_url, bio, username')
      .eq('username', candidate)
    if (tenant.id === 'us') query = query.eq('is_active', true).eq('is_profile_complete', true)
    const { data } = await query.maybeSingle()
    if (data) { therapist = data; break }
  }

  if (!therapist) {
    return { title: `Therapist Not Found | ${tenant.brandName}` }
  }

  const name       = therapist.full_name ?? 'Therapist'
  const specialty  = Array.isArray(therapist.specialties) && therapist.specialties.length > 0
    ? therapist.specialties[0]
    : 'Counselling'
  const city       = therapist.city ?? tenant.countryName
  const title      = localizeCounselorSpelling(therapist.title ?? 'Therapist', tenant.id === 'us')
  const photo      = therapist.photo_url ?? `${tenant.siteUrl}/og-image.png`
  const profileUrl = `${tenant.siteUrl}/${therapist.username}`

  const imageAlt   = `${name} – ${specialty} therapist in ${city} | ${tenant.brandName}`
  // The root metadata template appends the current tenant brand to this title.
  const pageTitle  = `${name} | ${title} in ${city}`
  const description = therapist.bio
    ? therapist.bio.slice(0, 155)
    : `Book a session with ${name}, ${title} in ${city}. Online therapy & counselling on ${tenant.brandName}.`

  return {
    title: pageTitle,
    description,
    alternates: { canonical: profileUrl },
    openGraph: {
      type: 'profile',
      url: profileUrl,
      siteName: tenant.brandName,
      title: pageTitle,
      description,
      images: [
        {
          url: photo,
          width: 800,
          height: 800,
          alt: imageAlt,
        },
      ],
      locale: tenant.ogLocale,
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [{ url: photo, alt: imageAlt }],
    },
  }
}

/* ── Page component ── */
export default async function TherapistPublicPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const tenant = await getCurrentTenant()
  // COA revokes anonymous reads from `therapists`; keep India on its existing
  // cookie-authenticated read path.
  const supabase = tenant.id === 'us'
    ? await createServiceSupabaseClientForTenant()
    : await createServerSupabaseClient()

  const raw = decodeURIComponent(username).trim()
  const candidates = [...new Set([raw, raw.replace(/^@+/, ''), `@${raw.replace(/^@+/, '')}`])]

  // `any`: the select string is chosen at runtime (US vs India columns), so
  // Supabase can't infer the row type from it.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let therapist: any = null
  for (const candidate of candidates) {
    let query = supabase
      .from('therapists')
      .select(tenant.id === 'us' ? THERAPIST_PAGE_COLUMNS_US : THERAPIST_PAGE_COLUMNS)
      .eq('username', candidate)
    if (tenant.id === 'us') query = query.eq('is_active', true).eq('is_profile_complete', true)
    const { data } = await query.maybeSingle()
    if (data) { therapist = data; break }
  }

  if (!therapist) notFound()

  // ── Determine if the logged-in visitor is this profile's owner ──────────
  const authClient = await createServerSupabaseClient()
  const { data: { user } } = await authClient.auth.getUser()
  const isOwner = !!user && user.id === therapist.id

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
    id:               therapist.id,
    brandName:        tenant.brandName,
    currencySymbol:   tenant.currencySymbol,
    name:             therapist.full_name ?? '',
    credentials:      localizeCounselorSpelling(therapist.title ?? '', tenant.id === 'us'),
    bio:              therapist.bio ?? '',
    image:            therapist.photo_url ?? '',
    location:         therapist.city ?? tenant.countryName,
    experience:       therapist.years_experience ?? 0,
    fee:              therapist.fee_per_session ?? 0,
    totalReviews:     therapist.total_sessions ?? undefined,
    specialties:      therapist.specialties ?? [],
    languages:        therapist.languages ?? ['English'],
    sessionDuration:  therapist.session_duration_mins ?? 50,
    sessionMode:      therapist.session_mode ?? 'both',
    phone:            therapist.phone ?? '',
    email:            therapist.email ?? '',
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

  const now = new Date().toISOString()

  // Fetch booked slots, excluding:
  // - cancelled / payment_failed / expired statuses
  // - pending_payment holds whose hold_until has already passed (stale holds)
  //   These slots are effectively free again and should show as available.
  const { data: booked } = await authClient
    .from('appointments')
    .select('scheduled_at, status, hold_until')
    .eq('therapist_id', therapist.id)
    .not('status', 'in', '("cancelled","payment_failed","expired")')
    .gte('scheduled_at', now)

  const bookedTimes = (booked ?? [])
    .filter(b => {
      // Keep confirmed/upcoming slots always
      if (b.status !== 'pending_payment') return true
      // For pending_payment: only block the slot if the hold is still active
      if (!b.hold_until) return true
      return new Date(b.hold_until).getTime() > Date.now()
    })
    .map(b => b.scheduled_at)

  const { data: feedbacks } = await authClient
    .from('feedbacks')
    .select('id, client_name, client_role, rating, text, created_at')
    .eq('therapist_id', therapist.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const Template = (() => {
    switch (therapist.template_id) {
      case 'classic2': return <ClassicTemplate2 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} />
      case 'classic3': return <ClassicTemplate3 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} />
      case 'classic4': return <ClassicTemplate4 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} />
      case 'classic5': return <ClassicTemplate5 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} />
      case 'classic6': return <ClassicTemplate6 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} feedbacks={feedbacks ?? []} />
      case 'classic7': return <ClassicTemplate7 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} feedbacks={feedbacks ?? []} />
      case 'classic8': return <ClassicTemplate8 therapist={profile} bookedTimes={bookedTimes} hiddenSections={hiddenSections} />
      default:         return <ClassicTemplate  therapist={profile} bookedTimes={bookedTimes} feedbacks={feedbacks ?? []} hiddenSections={hiddenSections} isOwner={isOwner} brandName={tenant.brandName} />
    }
  })()

  return (
    <>
      <style>{brandStyle}</style>
      {Template}
    </>
  )
}
