import ClassicTemplate2 from '@/components/booking/templates/ClassicTemplate2'
import { getCurrentTenant } from '@/lib/tenants/server'
import { demoProfiles, demoBookedTimes } from '../demoData'

export const metadata = { title: 'Classic II — Template Preview' }

type SearchParams = Promise<{ embed?: string; pc?: string }>

export default async function PreviewClassic2({ searchParams }: { searchParams: SearchParams }) {
  const { embed, pc } = await searchParams
  const tenant = await getCurrentTenant()
  const isEmbed = embed === '1'

  let profileContent = {}
  if (pc) { try { profileContent = JSON.parse(decodeURIComponent(pc)) } catch { /* ignore */ } }
  const profile = {
    ...demoProfiles.classic2,
    ...(tenant.id === 'us' ? {
      name: 'Lauren Mitchell',
      credentials: 'Licensed Therapist',
      brandName: 'Counselors of America',
      currencySymbol: '$',
      isDemo: true,
      location: 'Washington, USA',
      city: 'Washington, USA',
      certifications: (demoProfiles.classic2.certifications ?? []).filter((item: string) => !/\bRCI\b/i.test(item)),
      image: '/images/demo/america/template2.png',
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
        <ClassicTemplate2 therapist={profile} bookedTimes={demoBookedTimes} hiddenSections={[]} />
      </div>
    </>
  )
}
