import ResourcesClientPage from './ResourcesClientPage'

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ResourcesClientPage patientId={id} />
}
