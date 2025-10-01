// app/dashboard/application/[id]/page.tsx
import ApplicationDetailsClient from './ApplicationDetailsClient'

type IdParams = { id: string }

export default async function Page(
  { params }: { params: Promise<IdParams> }
) {
  const { id } = await params
  return <ApplicationDetailsClient id={id} />
}
