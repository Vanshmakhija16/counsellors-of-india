import ClassicTemplate5 from '@/components/booking/templates/ClassicTemplate5'
import { getCurrentTenant } from '@/lib/tenants/server'
import { demoProfiles, demoBookedTimes } from '../demoData'

export const metadata = { title: 'Classic V — Template Preview' }

type SearchParams = Promise<{ embed?: string; pc?: string }>

export default async function PreviewClassic5({ searchParams }: { searchParams: SearchParams }) {
  const { embed, pc } = await searchParams
  const tenant = await getCurrentTenant()
  const isEmbed = embed === '1'

  let profileContent = {}
  if (pc) { try { profileContent = JSON.parse(decodeURIComponent(pc)) } catch { /* ignore */ } }
  const profile = {
    ...demoProfiles.classic5,
    ...(tenant.id === 'us' ? {
      name: 'Robert Bennett',
      credentials: 'Licensed Therapist',
      brandName: 'Counselors of America',
      currencySymbol: '$',
      isDemo: true,
      location: 'Washington, USA',
      city: 'Washington, USA',
      certifications: (demoProfiles.classic5.certifications ?? []).filter((item: string) => !/\bRCI\b/i.test(item)),
      image: '/images/demo/america/template5.png',
      languages: ['English', 'Spanish'],
    } : {}),
    profile_content: profileContent,
  }

  return (
    <>
      <style>{`body { margin: 0; padding: 0; } .preview-root-offset { padding-top: 32px; }`}</style>
      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('message', function(e) {
          if (e.data && e.data.type === 'PROFILE_CONTENT_UPDATE') {
            var base = window.location.href.split('?')[0];
            var params = new URLSearchParams(window.location.search);
            params.set('pc', encodeURIComponent(JSON.stringify(e.data.profileContent)));
            window.location.href = base + '?' + params.toString();
          }
        });
      `}} />
      <div className={isEmbed ? '' : 'preview-root-offset'}>
        <ClassicTemplate5 therapist={profile} bookedTimes={demoBookedTimes} hiddenSections={[]} />
      </div>
    </>
  )
}
