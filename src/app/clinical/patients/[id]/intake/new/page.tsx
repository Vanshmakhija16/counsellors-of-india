import IntakeClientShell from '../IntakeClientShell'

export default async function NewIntakePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <IntakeClientShell patientId={id} />
}
