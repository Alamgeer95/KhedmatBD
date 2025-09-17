import Link from 'next/link'
import type { Metadata } from 'next'

type SlugParams = { slug: string }
type SearchParams = { [key: string]: string | string[] | undefined }

export default async function Page(
  { params, searchParams }: {
    params: Promise<SlugParams>,
    searchParams: Promise<SearchParams>
  }
) {
  const { slug } = await params
  const sp = await searchParams
  const rawId = sp.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-semibold">KhedmatBD</Link>
          <Link href="/jobs" className="text-sm hover:underline">সব চাকরি</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 md:px-6 py-12">
        <h1 className="text-2xl md:text-3xl font-semibold">আবেদন গ্রহণ করা হয়েছে ✅</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-2">
          খেদমত: <span className="font-medium">{slug}</span>
        </p>
        {id && (
          <p className="mt-2">
            রেফারেন্স আইডি: <code className="px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800">{id}</code>
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Link
            href={`/jobs/${slug}`}
            className="px-5 h-11 rounded-xl border border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center"
          >
            খেদমত ডিটেইল
          </Link>
          <Link
            href="/jobs"
            className="px-5 h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center"
          >
            আরও চাকরি দেখুন
          </Link>
        </div>
      </section>
    </main>
  )
}

export async function generateMetadata(
  { params, searchParams }: {
    params: Promise<SlugParams>,
    searchParams: Promise<SearchParams>
  }
): Promise<Metadata> {
  const { slug } = await params
  const sp = await searchParams
  const rawId = sp.id
  const id = Array.isArray(rawId) ? rawId[0] : rawId

  return {
    title: id ? `Application received — ${slug} (${id})` : `Application received — ${slug}`,
    description: `Your application for ${slug} has been received.`,
  }
}
