import ClassicTemplate2 from '@/components/booking/templates/ClassicTemplate2'
import { demoProfiles, demoBookedTimes } from '../demoData'

export const metadata = { title: 'Classic II — Template Preview | Counsellors of India' }

export default async function PreviewClassic2({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>
}) {
  const { embed } = await searchParams
  const isEmbed = embed === '1'
  const profile = demoProfiles.classic2
  return (
    <>
      <style>{`
        body { margin: 0; padding: 0; }
        .preview-notice {
          position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
          background: #c9a35a; color: #0c0c0a;
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 7px 20px; text-align: center; font-weight: 600;
        }
        .preview-root-offset { padding-top: 32px; }
      `}</style>
      {/* {!isEmbed && (
        <div className="preview-notice">
        Preview Mode — Classic II · Counsellors of India
      </div>
      )} */}
      <div className={isEmbed ? '' : 'preview-root-offset'}>
        <ClassicTemplate2
          therapist={profile}
          bookedTimes={demoBookedTimes}
          hiddenSections={[]}
        />
      </div>
    </>
  )
}
