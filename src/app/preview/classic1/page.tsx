
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
}>

export default async function PreviewClassic1({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { embed, view } = await searchParams

  const isEmbed = embed === '1'
  const profile = demoProfiles.classic1

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
        html,
        body {
          margin: 0;
          padding: 0;
        }

        .preview-root-offset {
          padding-top: 32px;
        }

        .preview-stage {
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          background: #f5f5f5;
          padding: 24px;
        }

        .preview-device {
          background: #ffffff;
          overflow: hidden;
        }

        .preview-device--framed {
          border-radius: 20px;
          box-shadow:
            0 20px 60px rgba(0,0,0,0.12),
            0 8px 24px rgba(0,0,0,0.08);
        }
      `}</style>

      <div className={isEmbed ? '' : 'preview-root-offset'}>
        <div
          className={showDeviceFrame ? 'preview-stage' : ''}
        >
          <div
            className={`preview-device ${
              showDeviceFrame ? 'preview-device--framed' : ''
            }`}
            style={{
              width: previewWidth,
              maxWidth: '100%',
            }}
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
