'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import Seo from '@/components/Seo'
import { abs } from '@/utils/abs'

const fetcher = (url: string) => fetch(url).then((r) => r.json())
const STATUS = ['new','reviewing','shortlisted','rejected','hired'] as const

export default function ApplicationsPage() {
  const { data, error, isLoading, mutate } = useSWR('/api/admin/applications', fetcher, {
    refreshInterval: 15000,
  })

  const [q, setQ] = useState('')
  const [job, setJob] = useState('')
  const [st, setSt] = useState('')

  const items: any[] = data?.items || []

  const jobOptions = useMemo(() => {
    const s = new Set<string>()
    items.forEach((r) => r.jobSlug && s.add(r.jobSlug))
    return Array.from(s).sort()
  }, [items])

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return items.filter((row) => {
      if (job && row.jobSlug !== job) return false
      if (st && (row.status || 'new') !== st) return false
      if (!qq) return true
      const hay = `${row.id} ${row.jobSlug} ${row.name} ${row.email} ${row.coverLetter || ''}`.toLowerCase()
      return hay.includes(qq)
    })
  }, [items, q, job, st])

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Seo
        title="ড্যাশবোর্ড — আবেদন তালিকা"
        description="অ্যাডমিন ড্যাশবোর্ডে সব খেদমত আবেদন তালিকা দেখুন, সার্চ/ফিল্টার করুন এবং CSV এক্সপোর্ট করুন।"
        canonical={abs('/dashboard/applications')}
        noindex
      />

      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 md:px-6 h-16 flex items-center justify-between">
          <h1 className="font-semibold">ড্যাশবোর্ড: আবেদন তালিকা</h1>
          <div className="flex items-center gap-2">
            <a
              href="/api/admin/applications.csv"
              className="h-9 px-4 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
            >
              CSV এক্সপোর্ট
            </a>
            <button
              onClick={() => mutate()}
              className="h-9 px-4 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm"
            >
              রিফ্রেশ
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 md:px-6 py-6">
        {/* Filters */}
        <div className="grid sm:grid-cols-4 gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="সার্চ (নাম/ইমেইল/কভার লেটার/আইডি)…"
            className="h-10 rounded-xl border px-3 bg-white/80 dark:bg-slate-900/60"
          />
          <select
            value={job}
            onChange={(e) => setJob(e.target.value)}
            className="h-10 rounded-xl border px-3 bg-white/80 dark:bg-slate-900/60"
          >
            <option value="">সব খেদমত</option>
            {jobOptions.map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
          <select
            value={st}
            onChange={(e) => setSt(e.target.value)}
            className="h-10 rounded-xl border px-3 bg-white/80 dark:bg-slate-900/60"
          >
            <option value="">সব স্ট্যাটাস</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              setQ('')
              setJob('')
              setSt('')
            }}
            className="h-10 rounded-xl border hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ক্লিয়ার ফিল্টার
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mt-4">
          {isLoading && <div>লোড হচ্ছে…</div>}
          {error && <div className="text-red-600">ডাটা আনা যায়নি।</div>}

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">আবেদন আইডি</th>
                <th className="py-2">খেদমত</th>
                <th className="py-2">নাম</th>
                <th className="py-2">ইমেইল</th>
                <th className="py-2">স্ট্যাটাস</th>
                <th className="py-2">সময়</th>
                <th className="py-2">ডিটেইল</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row: any) => (
                <tr key={row.id} className="border-b hover:bg-white/50 dark:hover:bg-slate-900/40">
                  <td className="py-2 font-mono">{row.id}</td>
                  <td className="py-2">{row.jobSlug}</td>
                  <td className="py-2">{row.name}</td>
                  <td className="py-2">
                    <a href={`mailto:${row.email}`} className="hover:underline">
                      {row.email}
                    </a>
                  </td>
                  <td className="py-2">
                    <span className="px-2 py-1 rounded-md border text-xs">
                      {row.status || 'new'}
                    </span>
                  </td>
                  <td className="py-2">
                    {new Date(row.submittedAt).toLocaleString('bn-BD')}
                  </td>
                  <td className="py-2">
                    <Link href={`/dashboard/applications/${row.id}`} className="text-emerald-700 hover:underline">
                      দেখুন →
                    </Link>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    কোনো মিল পাওয়া যায়নি।
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
