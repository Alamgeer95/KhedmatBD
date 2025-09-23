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

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

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
      setError('দয়া করে আপনার সিভি (PDF/DOC/DOCX) আপলোড করুন।')
      return
    }
    if (!ALLOWED.includes(file.type)) {
      setError('সঠিক ফাইল টাইপ নয়—শুধু PDF/DOC/DOCX গ্রহণযোগ্য।')
      return
    }
    if (file.size > MAX_BYTES) {
      setError('ফাইলটি বড় (সর্বোচ্চ 5MB অনুমোদিত)।')
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
    <main className="min-h-screen bg-[#0e1a30] text-[#f0f5ff] overflow-x-hidden">
      {/* Background geometric glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-[-20rem] left-[-20rem] w-[50rem] h-[50rem] bg-[#b88a4e]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[-25rem] right-[-15rem] w-[45rem] h-[45rem] bg-[#4e8a8a]/5 rounded-full blur-3xl" />
      </div>

      {/* Minimal header */}
      <header className="border-b border-white/10 bg-[#0e1a30]/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/jobs" className="text-sm font-semibold text-[#b88a4e] hover:underline">
            ← সব খেদমত
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 md:px-6 py-10">
        {/* Title Card */}
        <div className="rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20 p-6">
          <h1 className="text-3xl md:text-4xl font-bold">আবেদন করুন</h1>
          <p className="mt-2 text-[#a1b2d4]">
            খেদমত: <span className="font-semibold text-[#f0f5ff]">{slug}</span>
          </p>
        </div>

        {/* Form Card */}
        <form
          onSubmit={onSubmit}
          className="mt-6 grid gap-5 max-w-2xl rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 shadow-lg shadow-black/20 p-6"
        >
          <div>
            <label className="block text-sm mb-1 text-[#a1b2d4]">পূর্ণ নাম</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-12 px-3 rounded-xl border border-white/15 bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#b88a4e]"
              placeholder="আপনার নাম"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#a1b2d4]">ইমেইল</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-3 rounded-xl border border-white/15 bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#b88a4e]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#a1b2d4]">কভার লেটার</label>
            <textarea
              rows={5}
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              className="w-full px-3 py-3 rounded-2xl border border-white/15 bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#b88a4e]"
              placeholder="সংক্ষিপ্তভাবে নিজের পরিচয় ও আগ্রহ লিখুন…"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-[#a1b2d4]">
              সিভি আপলোড (PDF/DOC/DOCX, সর্বোচ্চ 5MB)
            </label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              required
              className="block w-full text-sm file:mr-3 file:rounded-xl file:border file:px-4 file:py-2 file:bg-[#b88a4e]/10 file:border-[#b88a4e]/40 file:text-[#f0f5ff] hover:file:bg-[#b88a4e]/20 border border-white/15 rounded-xl bg-white/5"
            />
            {file && (
              <div className="mt-2 text-xs text-[#a1b2d4]">
                নির্বাচিত: <span className="text-[#f0f5ff]">{file.name}</span> • {formatBytes(file.size)}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-6 h-12 rounded-full bg-[#b88a4e] text-[#0e1a30] font-semibold shadow-lg hover:-translate-y-0.5 transition-all duration-300 hover:bg-[#c29660] disabled:opacity-60"
            >
              {submitting ? 'সাবমিট হচ্ছে…' : 'সাবমিট করুন'}
            </button>
            <Link
              href={`/jobs/${slug}`}
              className="px-6 h-12 rounded-full border border-white/15 bg-white/5 hover:border-[#b88a4e]/50 transition flex items-center justify-center"
            >
              খেদমত ডিটেইল
            </Link>
          </div>

          <p className="text-xs text-[#a1b2d4]">
            আপনার তথ্য গোপন রাখা হবে এবং শুধুমাত্র নিয়োগ প্রক্রিয়ার জন্য ব্যবহৃত হবে।
          </p>
        </form>
      </section>
    </main>
  )
}
