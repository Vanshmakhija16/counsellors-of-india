import ClassicTemplate7 from '@/components/booking/templates/ClassicTemplate7'
import { demoProfiles, demoBookedTimes } from '../demoData'

export const metadata = { title: 'The Atrium — Template Preview | Counsellors of India' }

type SearchParams = Promise<{ embed?: string; pc?: string }>

export default async function PreviewClassic7({ searchParams }: { searchParams: SearchParams }) {
  const { embed, pc } = await searchParams
  const isEmbed = embed === '1'

  let profileContent = {}
  if (pc) { try { profileContent = JSON.parse(decodeURIComponent(pc)) } catch { /* ignore */ } }
  const profile = { ...demoProfiles.classic7, profile_content: profileContent }

  return (
    <>
      <style>{`body { margin: 0; padding: 0; }`}</style>
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
      <div className={isEmbed ? '' : ''}>
        <ClassicTemplate7 therapist={profile} bookedTimes={demoBookedTimes} hiddenSections={[]} />
      </div>
    </>
  )
}
