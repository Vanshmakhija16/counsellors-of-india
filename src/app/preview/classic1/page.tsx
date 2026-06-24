
import ClassicTemplate from '@/components/booking/templates/ClassicTemplate'
import {
  demoProfiles,
  demoBookedTimes,
  demoFeedbacks,
} from '../demoData'

export const metadata = {
  title: 'Classic I — Template Preview | Counsellors of India',
}

type SearchParams = Promise<{
  embed?: string
  view?: 'mobile' | 'tablet'
  pc?: string   // JSON-encoded ProfileContent from the dashboard editor
}>

export default async function PreviewClassic1({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { embed, view, pc } = await searchParams

  const isEmbed = embed === '1'

  // Merge live editor content (if any) into the demo profile so edits reflect here.
  let profileContent = {}
  if (pc) {
    try { profileContent = JSON.parse(decodeURIComponent(pc)) } catch { /* ignore */ }
  }
  const profile = { ...demoProfiles.classic1, profile_content: profileContent }

  const previewWidth =
    view === 'mobile'
      ? 390
      : view === 'tablet'
      ? 768
      : '100%'

  const showDeviceFrame = !!view

  return (
    <>
      <style>{`
        html, body { margin: 0; padding: 0; }
        .preview-root-offset { padding-top: 32px; }
        .preview-stage {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          background: #f5f5f5;
          padding: 24px;
        }
        .preview-device { background: #ffffff; overflow: hidden; }
        .preview-device--framed {
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08);
        }
      `}</style>

      {/* postMessage listener — receives live editor updates and refreshes without full reload */}
      <script dangerouslySetInnerHTML={{ __html: `
        window.addEventListener('message', function(e) {
          if (e.data && e.data.type === 'PROFILE_CONTENT_UPDATE') {
            window.location.href = window.location.href.replace(/[?&]pc=[^&]*/g, '').replace(/&$/, '').replace(/\\?$/, '')
              + (window.location.search ? '&' : '?') + 'pc=' + encodeURIComponent(JSON.stringify(e.data.profileContent));
          }
        });
      `}} />

      <div className={isEmbed ? '' : 'preview-root-offset'}>
        <div className={showDeviceFrame ? 'preview-stage' : ''}>
          <div
            className={`preview-device ${showDeviceFrame ? 'preview-device--framed' : ''}`}
            style={{ width: previewWidth, maxWidth: '100%' }}
          >
            <ClassicTemplate
              therapist={profile}
              bookedTimes={demoBookedTimes}
              feedbacks={demoFeedbacks}
              hiddenSections={[]}
            />
          </div>
        </div>
      </div>
    </>
  )
}
