'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Props = { slug: string }

const ALLOWED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_BYTES = 5 * 1024 * 1024 // 5MB

export default function ApplyFormClient({ slug }: Props) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [cover, setCover] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!file) {
      setError('দয়া করে আপনার সিভি (PDF/DOC) আপলোড করুন।')
      return
    }
    if (!ALLOWED.includes(file.type)) {
      setError('Invalid file type')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('File too large (max 5MB)')
      return
    }

    const fd = new FormData()
    fd.append('jobSlug', slug)
    fd.append('name', name)
    fd.append('email', email)
    fd.append('coverLetter', cover)
    fd.append('resume', file)

    try {
      setSubmitting(true)
      const res = await fetch('/api/apply', { method: 'POST', body: fd })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'আবেদন সাবমিট করা যায়নি।')
      }
      const data = await res.json()
      router.push(`/apply/${slug}/success?id=${encodeURIComponent(data.id)}`)
    } catch (err: any) {
      setError(err?.message || 'সার্ভারে সমস্যা হয়েছে।')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/jobs" className="text-sm hover:underline">সব চাকরি</Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 md:px-6 py-8">
        <h1 className="text-2xl md:text-3xl font-semibold">আবেদন করুন</h1>
        <p className="text-slate-600 dark:text-slate-300 mt-1">খেদমত: <span className="font-medium">{slug}</span></p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4 max-w-2xl">
          <div>
            <label className="block text-sm mb-1">পূর্ণ নাম</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white/80 dark:bg-slate-900/60"
              placeholder="আপনার নাম"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">ইমেইল</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white/80 dark:bg-slate-900/60"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">কভার লেটার</label>
            <textarea
              rows={5}
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white/80 dark:bg-slate-900/60"
              placeholder="সংক্ষিপ্তভাবে নিজের পরিচয় ও আগ্রহ লিখুন…"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">সিভি আপলোড (PDF/DOC/DOCX, সর্বোচ্চ 5MB)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:px-3 file:py-2 file:bg-emerald-50 file:border-emerald-200 file:text-emerald-800 hover:file:bg-emerald-100"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? 'সাবমিট হচ্ছে…' : 'সাবমিট করুন'}
            </button>
            <Link href={`/jobs/${slug}`} className="px-5 h-11 rounded-xl border border-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center">
              খেদমত ডিটেইল
            </Link>
          </div>
        </form>
      </section>
    </main>
  )
}
