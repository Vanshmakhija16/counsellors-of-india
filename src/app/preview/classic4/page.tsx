import ClassicTemplate4 from '@/components/booking/templates/ClassicTemplate4'
import { getCurrentTenant } from '@/lib/tenants/server'
import { demoProfiles, demoBookedTimes } from '../demoData'

export const metadata = { title: 'Classic IV — Template Preview' }

type SearchParams = Promise<{ embed?: string; pc?: string }>

export default async function PreviewClassic4({ searchParams }: { searchParams: SearchParams }) {
  const { embed, pc } = await searchParams
  const tenant = await getCurrentTenant()
  const isEmbed = embed === '1'

  let profileContent = {}
  if (pc) { try { profileContent = JSON.parse(decodeURIComponent(pc)) } catch { /* ignore */ } }
  const profile = {
    ...demoProfiles.classic4,
    ...(tenant.id === 'us' ? {
      name: 'Margaret Hayes',
      credentials: 'Licensed Therapist',
      brandName: 'Counselors of America',
      currencySymbol: '$',
      isDemo: true,
      location: 'Washington, USA',
      city: 'Washington, USA',
      certifications: (demoProfiles.classic4.certifications ?? []).filter((item: string) => !/\bRCI\b/i.test(item)),
      image: '/images/demo/america/template4.png',
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
        <ClassicTemplate4 therapist={profile} bookedTimes={demoBookedTimes} hiddenSections={[]} />
      </div>
    </>
  )
}
