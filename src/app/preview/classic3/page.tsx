import ClassicTemplate3 from '@/components/booking/templates/ClassicTemplate3'
import { demoProfiles, demoBookedTimes } from '../demoData'

export const metadata = { title: 'Classic III — Template Preview | Counsellors of India' }

export default async function PreviewClassic3({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>
}) {
  const { embed } = await searchParams
  const isEmbed = embed === '1'
  const profile = demoProfiles.classic3
  return (
    <>
      <style>{`
        body { margin: 0; padding: 0; }
        .preview-notice {
          position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
          background: #3D7A6A; color: #fff;
          font-family: 'DM Mono', monospace; font-size: 10px;
          letter-spacing: 0.2em; text-transform: uppercase;
          padding: 7px 20px; text-align: center; font-weight: 600;
        }
        .preview-root-offset { padding-top: 32px; }
      `}</style>
      {/* {!isEmbed && (
        <div className="preview-notice">
        Preview Mode — Classic III · Counsellors of India
      </div>
      )} */}
      <div className={isEmbed ? '' : 'preview-root-offset'}>
        <ClassicTemplate3
          therapist={profile}
          bookedTimes={demoBookedTimes}
          hiddenSections={[]}
        />
      </div>
    </>
  )
}
