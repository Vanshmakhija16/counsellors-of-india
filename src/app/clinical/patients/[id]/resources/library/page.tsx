import { redirect } from 'next/navigation'

// Full library browser is handled inline in the Resources page via tab.
// This route redirects back to the resources page with the library tab open.
export default async function ResourcesLibraryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/clinical/patients/${id}/resources`)
}
