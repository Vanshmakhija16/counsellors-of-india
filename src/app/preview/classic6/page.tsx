import ClassicTemplate6 from '@/components/booking/templates/ClassicTemplate6'
import { demoProfiles, demoBookedTimes } from '../demoData'

export const metadata = { title: 'The Quiet Room — Template Preview | Counsellors of India' }

export default async function PreviewClassic6({
  searchParams,
}: {
  searchParams: Promise<{ embed?: string }>
}) {
  const { embed } = await searchParams
  const isEmbed = embed === '1'
  const profile = demoProfiles.classic6
  return (
    <>
      <style>{`body { margin: 0; padding: 0; }`}</style>
      <div className={isEmbed ? '' : ''}>
        <ClassicTemplate6
          therapist={profile}
          bookedTimes={demoBookedTimes}
          hiddenSections={[]}
        />
      </div>
    </>
  )
}
