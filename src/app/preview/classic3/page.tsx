import ClassicTemplate3 from '@/components/booking/templates/ClassicTemplate3'
import { getCurrentTenant } from '@/lib/tenants/server'
import { demoProfiles, demoBookedTimes } from '../demoData'

export const metadata = { title: 'Classic III — Template Preview' }

type SearchParams = Promise<{ embed?: string; pc?: string }>

export default async function PreviewClassic3({ searchParams }: { searchParams: SearchParams }) {
  const { embed, pc } = await searchParams
  const tenant = await getCurrentTenant()
  const isEmbed = embed === '1'

  let profileContent = {}
  if (pc) { try { profileContent = JSON.parse(decodeURIComponent(pc)) } catch { /* ignore */ } }
  const profile = {
    ...demoProfiles.classic3,
    ...(tenant.id === 'us' ? {
      name: 'Daniel Brooks',
      credentials: 'Licensed Therapist',
      brandName: 'Counselors of America',
      currencySymbol: '$',
      isDemo: true,
      location: 'Washington, USA',
      city: 'Washington, USA',
      certifications: (demoProfiles.classic3.certifications ?? []).filter((item: string) => !/\bRCI\b/i.test(item)),
      image: '/images/demo/america/template3.png',
      languages: ['English', 'French'],
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
        <ClassicTemplate3 therapist={profile} bookedTimes={demoBookedTimes} hiddenSections={[]} />
      </div>
    </>
  )
}
