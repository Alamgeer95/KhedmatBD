// app/admin/AdminClientComponent.tsx
// Client: শুধুই UI/ইন্টার‌্যাকশন; কোনো server-only API নেই

'use client'

import Link from 'next/link'
import { UrlObject } from 'url';
import * as React from 'react'
import type { AppJson, JobJson } from './page'

function fmtDateTime(d?: string) {
  if (!d) return '—'
  try {
    const dt = new Date(d)
    return dt.toLocaleString('bn-BD', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
  } catch { return d }
}
function fmtDate(d?: string) {
  if (!d) return '—'
  try {
    const dt = new Date(d)
    return dt.toLocaleDateString('bn-BD', { year:'numeric', month:'short', day:'numeric' })
  } catch { return d }
}

export default function AdminClientComponent({
  totals,
  lists,
}: {
  totals: {
    totalApps: number
    todayApps: number
    totalJobs: number
    statusCounts: Record<string, number>
  }
  lists: {
    apps: AppJson[]
    recentJobs: JobJson[]
  }
}) {
  const { totalApps, todayApps, totalJobs, statusCounts } = totals
  const { apps, recentJobs } = lists

  return (
    <div
      className="min-h-[100svh] text-slate-100"
      style={{
        backgroundColor: '#052e2b',
        // Classical Islamic subtle pattern
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 13px 13px, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px, 24px 24px',
      }}
    >
      {/* Hero / Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-emerald-900/0 to-emerald-950" />
        <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14 relative z-10">
          <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-900/40 ring-1 ring-emerald-400/20 px-4 py-2 backdrop-blur">
            <div className="h-8 w-8 rounded-xl bg-emerald-700/40 ring-1 ring-emerald-300/30 grid place-items-center">
              <span className="font-semibold">🛡️</span>
            </div>
            <span className="tracking-wide text-emerald-200/90">অ্যাডমিন ড্যাশবোর্ড</span>
          </div>
          <h1 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight">
            পরিচালনা প্যানেল
          </h1>
          <p className="mt-3 max-w-2xl text-emerald-100/80 text-sm md:text-base leading-relaxed">
            এখানে থেকে আবেদন, খেদমত পোস্ট ও এক্সপোর্ট/রিপোর্টিং দ্রুত করা যাবে।
          </p>
        </div>
      </section>

      <main className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 pb-16">
        {/* Top tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Tile title="মোট আবেদন" value={String(totalApps)} hint="সকল সময়ের মোট" />
          <Tile title="আজকের আবেদন" value={String(todayApps)} hint={new Date().toLocaleDateString('bn-BD')} />
          <Tile title="মোট খেদমত" value={String(totalJobs)} hint="সক্রিয়/আর্কাইভ উভয়" />
          <Tile title="নতুন স্ট্যাটাস" value={String(statusCounts['new'] || 0)} hint="শেষ 120 রেকর্ড" />
        </div>

        {/* Quick actions + status + jobs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card heading="দ্রুত করণীয়">
            <div className="grid gap-2 text-sm">
              <ActionLink href="/dashboard/applications">সব আবেদন দেখুন</ActionLink>
              <ActionLink href="/api/admin/applications.csv">CSV এক্সপোর্ট (সব)</ActionLink>
              <ActionLink href="/post-job">নতুন খেদমত পোস্ট</ActionLink>
              <ActionLink href="/jobs">পাবলিক জব লিস্ট</ActionLink>
              <ActionLink href="/admin/login">অ্যাডমিন লগইন</ActionLink>
            </div>
          </Card>

          <Card heading="স্ট্যাটাসভিত্তিক সারাংশ">
            <ul className="text-sm space-y-2">
              {(['new','reviewing','shortlisted','rejected','hired'] as const).map(s => (
                <li key={s} className="flex items-center justify-between">
                  <span className="capitalize">{s}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-white/10">{statusCounts[s] || 0}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card heading="সাম্প্রতিক জব (২০)">
            {recentJobs.length ? (
              <ul className="text-sm space-y-2">
                {recentJobs.slice(0,8).map(j => (
                  <li key={j.slug} className="flex items-center justify-between">
                    <Link className="hover:underline" href={`/jobs/${j.slug}`}>{j.title}</Link>
                    <span className="text-emerald-100/70">{fmtDate(j.datePosted)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-emerald-100/70">কোনো সাম্প্রতিক জব পাওয়া যায়নি।</div>
            )}
          </Card>
        </div>

        {/* Recent applications */}
        <Card heading="সাম্প্রতিক আবেদন (১২০ থেকে সর্বশেষ)">
          {apps.length ? (
            <ul className="divide-y divide-white/10">
              {apps.slice(0, 12).map(a => (
                <li key={a.id} className="py-4 flex items-start gap-4 group">
                  <div className="h-10 w-10 rounded-xl bg-emerald-700/40 ring-1 ring-emerald-300/30 grid place-items-center group-hover:rotate-6 transition">
                    📨
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold">
                        {a.name} <span className="text-xs font-normal text-emerald-100/70">({a.email})</span>
                        <span className="ml-2 text-xs text-emerald-100/70">→ {a.jobSlug}</span>
                      </div>
                      <span className="rounded-lg bg-white/10 px-2 py-1 text-xs capitalize">
                        {a.status || 'new'}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-emerald-100/70">
                      সাবমিটেড: {fmtDateTime(a.submittedAt)}
                    </div>
                    <div className="mt-2">
                      <Link
                        href={`/dashboard/applications/${a.id}`}
                        className="inline-flex items-center gap-1 text-emerald-300/90 hover:text-emerald-200 text-sm"
                      >
                        বিস্তারিত দেখুন →
                      </Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-emerald-100/70">এখনো কোনো আবেদন পাওয়া যায়নি।</div>
          )}
        </Card>
      </main>

      {/* small style helpers */}
      <style jsx global>{`
        .tile {
          border-radius: 1rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          transition: transform .2s ease, background .2s ease;
          padding: 1rem;
        }
        .tile:hover { transform: translateY(-2px); background: rgba(255,255,255,0.10); }
        .card {
          border-radius: 1.25rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          padding: 1.25rem;
        }
        .action-link {
          display:flex; align-items:center; justify-content:space-between;
          padding:.6rem .8rem; border-radius:.75rem;
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12);
          transition:all .2s ease;
        }
        .action-link:hover { transform: translateY(-1px); background: rgba(255,255,255,.12); }
      `}</style>
    </div>
  )
}

/* ---------------- UI atoms ---------------- */

function Tile({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <div className="tile">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-extrabold">{value}</div>
      </div>
      <div className="mt-2 font-semibold">{title}</div>
      {hint && <div className="text-xs text-emerald-100/70 mt-1">{hint}</div>}
    </div>
  )
}

function Card({ heading, children }: { heading: string; children?: React.ReactNode }) {
  return (
    <section className="card">
      <div className="font-semibold mb-3">{heading}</div>
      {children}
    </section>
  )
}

function ActionLink({ href, children }: { href: string | UrlObject; children: React.ReactNode }) {
  const linkHref = typeof href === 'string' ? { pathname: href } : href;
  return (
    <Link href={linkHref} className="action-link">
      <span>{children}</span>
      <span>→</span>
    </Link>
  );
}


