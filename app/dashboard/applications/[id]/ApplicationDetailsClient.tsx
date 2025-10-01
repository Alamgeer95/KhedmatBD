// app/dashboard/application/[id]/ApplicationDetailsClient.tsx

'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import Seo from '@/components/Seo'
import { abs } from '@/utils/abs'

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const STATUS = ['new','reviewing','shortlisted','rejected','hired'] as const

export default function ApplicationDetailsClient({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = useSWR(`/api/admin/applications/${id}`, fetcher)

  const [status, setStatus] = useState<string>('new')
  const [notes, setNotes] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (data) {
      setStatus(data.status || 'new')
      setNotes(data.notes || '')
    }
  }, [data])

  async function downloadResume() {
    const res = await fetch(`/api/admin/applications/${id}/resume`)
    if (!res.ok) return alert('রিজিউম আনা যায়নি')
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  async function loadPreview() {
    const r = await fetch(`/api/admin/applications/${id}/resume`)
    if (!r.ok) return
    const j = await r.json()
    setPreviewUrl(j.url) // signed URL
  }

  async function saveMeta() {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      })
      if (!res.ok) throw new Error('সেভ ব্যর্থ')
      await mutate()
    } catch (e: any) {
      alert(e.message || 'সেভ ব্যর্থ')
    } finally {
      setSaving(false)
    }
  }

  const isPdf = useMemo(() => {
    const key: string | undefined = data?.resumeKey
    return key ? key.toLowerCase().endsWith('.pdf') : false
  }, [data])

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Seo
        title={`আবেদন #${id}`}
        description="আবেদনের ডিটেইলস"
        canonical={abs(`/dashboard/applications/${id}`)}
        noindex
      />

      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/dashboard/applications" className="hover:underline">← সব আবেদন</Link>
          <div className="font-semibold">আবেদন আইডি: <span className="font-mono">{id}</span></div>
          <div />
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 md:px-6 py-6">
        {isLoading && <div>লোড হচ্ছে…</div>}
        {error && <div className="text-red-600">ডাটা আনা যায়নি।</div>}
        {data && (
          <>
            {/* Quick toolbar */}
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              <a
                href={`mailto:${data.email}?subject=${encodeURIComponent('আপনার আবেদনের বিষয়ে')}`}
                className="px-3 h-9 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center"
              >
                ইমেইল রিপ্লাই
              </a>
              <button
                onClick={() => navigator.clipboard.writeText(data.email)}
                className="px-3 h-9 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ইমেইল কপি
              </button>
              <button
                onClick={downloadResume}
                className="px-3 h-9 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                রিজিউম ডাউনলোড
              </button>
              {isPdf && (
                <button
                  onClick={loadPreview}
                  className="px-3 h-9 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  PDF প্রিভিউ
                </button>
              )}
            </div>

            <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
              {/* Left: candidate & cover letter */}
              <article className="rounded-2xl border p-5 bg-white/80 dark:bg-slate-900/60">
                <h2 className="font-semibold mb-3">প্রার্থীর তথ্য</h2>
                <div className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-slate-500">নাম</div>
                    <div className="font-medium">{data.name}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">ইমেইল</div>
                    <div className="font-medium">{data.email}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">খেদমত</div>
                    <div className="font-medium">{data.jobSlug}</div>
                  </div>
                  <div>
                    <div className="text-slate-500">সময়</div>
                    <div className="font-medium">{new Date(data.submittedAt).toLocaleString('bn-BD')}</div>
                  </div>
                </div>

                <h3 className="font-semibold mt-6 mb-2">কভার লেটার</h3>
                <pre className="whitespace-pre-wrap text-[15px] leading-7">
                  {data.coverLetter || '—'}
                </pre>

                {previewUrl && isPdf && (
                  <div className="mt-6">
                    <h3 className="font-semibold mb-2">PDF প্রিভিউ</h3>
                    <div className="rounded-xl overflow-hidden border">
                      <iframe
                        src={previewUrl}
                        className="w-full h-[600px] bg-white"
                        title="Resume PDF"
                      />
                    </div>
                  </div>
                )}
              </article>

              {/* Right: status + notes */}
              <aside className="rounded-2xl border p-5 bg-white/80 dark:bg-slate-900/60 h-fit">
                <div className="font-semibold">রিভিউ</div>

                <label className="block text-sm mt-3 mb-1">স্ট্যাটাস</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-10 rounded-xl border px-3 bg-white/80 dark:bg-slate-900/60"
                >
                  {STATUS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                <label className="block text-sm mt-4 mb-1">নোটস</label>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-white/80 dark:bg-slate-900/60"
                  placeholder="ইন্টারনাল নোটস…"
                />

                <button
                  onClick={saveMeta}
                  disabled={saving}
                  className="mt-4 w-full h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? 'সেভ হচ্ছে…' : 'সেভ করুন'}
                </button>
              </aside>
            </div>
          </>
        )}
      </section>
    </main>
  )
}
