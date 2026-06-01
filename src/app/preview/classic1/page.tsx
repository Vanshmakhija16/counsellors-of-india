import ClassicTemplate from '@/components/booking/templates/ClassicTemplate'
import { demoProfiles, demoBookedTimes, demoFeedbacks } from '../demoData'

export const metadata = { title: 'Classic I — Template Preview | Counsellors of India' }

export default async function PreviewClassic1({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>
}) {
  const { embed } = await searchParams
  const isEmbed = embed === '1'
  const profile = demoProfiles.classic1
  return (
    <>
      <style>{`
        body { margin: 0; padding: 0; }
        /* Preview banner at top */
        .preview-notice {
          position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
          background: #c9a35a; color: #0c0c0a;
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 7px 20px; text-align: center; font-weight: 600;
        }
        /* Push template content below notice */
        .preview-root-offset { padding-top: 32px; }
      `}</style>
      {/* {!isEmbed && (
        <div className="preview-notice">
          Preview Mode — Classic I · Counsellors of India
          <a href="/try" style={{ marginLeft: 14, textDecoration: 'underline', color: '#0c0c0a' }}>
            Try with your details →
          </a>
        </div>
      )} */}
      <div className={isEmbed ? '' : 'preview-root-offset'}>
        <ClassicTemplate
          therapist={profile}
          bookedTimes={demoBookedTimes}
          feedbacks={demoFeedbacks}
          hiddenSections={[]}
        />
      </div>
    </>
  )
}
