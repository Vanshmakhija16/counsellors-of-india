import ClassicTemplate5 from '@/components/booking/templates/ClassicTemplate5'
import { demoProfiles, demoBookedTimes } from '../demoData'

export const metadata = { title: 'Classic V — Template Preview | Counsellors of India' }

export default async function PreviewClassic5({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>
}) {
  const { embed } = await searchParams
  const isEmbed = embed === '1'
  const profile = demoProfiles.classic5
  return (
    <>
      <style>{`
        body { margin: 0; padding: 0; }
        .preview-notice {
          position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
          background: #2D4A32; color: #F7F4EF;
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 7px 20px; text-align: center; font-weight: 600;
        }
        .preview-root-offset { padding-top: 32px; }
      `}</style>
      {/* {!isEmbed && (
        <div className="preview-notice">
        Preview Mode — Classic V · Counsellors of India
      </div>
      )} */}
      <div className={isEmbed ? '' : 'preview-root-offset'}>
        <ClassicTemplate5
          therapist={profile}
          bookedTimes={demoBookedTimes}
          hiddenSections={[]}
        />
      </div>
    </>
  )
}
