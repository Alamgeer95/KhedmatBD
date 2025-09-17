// app/apply/[slug]/page.tsx
import type { Metadata } from 'next'
import ApplyFormClient from './ApplyFormClient'

type SlugParams = { slug: string }

export default async function Page(
  { params }: { params: Promise<SlugParams> }
) {
  const { slug } = await params
  return <ApplyFormClient slug={slug} />
}

export async function generateMetadata(
  { params }: { params: Promise<SlugParams> }
): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Apply — ${slug} | KhedmatBD`,
    description: `Apply for ${slug} at KhedmatBD`,
  }
}
