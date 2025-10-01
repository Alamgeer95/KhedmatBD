// app/dashboard/DashboardClient.tsx
// Client-only UI: filters, CSV export, interactivity, charts (SVG)

'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  User as UserIcon,
  Briefcase,
  FileText,
  Settings as SettingsIcon,
  Send,
  ListChecks,
  ChevronRight,
  ShieldCheck,
  Filter as FilterIcon,
  BarChart2,
  CalendarDays,
  Download,
} from 'lucide-react'

type Role = 'candidate' | 'employer' | null

type JobJson = {
  slug: string
  title: string
  description?: string
  employmentType?: string
  datePosted?: string
  validThrough?: string
  hiringOrganization?: { name?: string; sameAs?: string; logo?: string }
  jobLocation?: { addressLocality?: string; addressRegion?: string; addressCountry?: string }
  baseSalary?: { currency?: string; value?: number; unitText?: string }
  contact?: { email?: string; applicationUrl?: string }
  attachments?: { jd?: string }
}

type ApplicationJson = {
  id: string
  jobSlug: string
  name: string
  email: string
  coverLetter?: string
  resumeKey?: string
  status?: 'new'|'reviewing'|'shortlisted'|'rejected'|'hired'|string
  submittedAt?: string
}

type Props = {
  userEmail: string
  profile: { full_name: string | null; role: Role }
  myJobs: JobJson[]
  myApps: ApplicationJson[]
  completion: number
  isAdmin: boolean
  appsSeries: { label: string; value: number }[]
  jobsSeries: { label: string; value: number }[]
}

export default function DashboardClient({
  userEmail, profile, myJobs, myApps, completion, isAdmin, appsSeries, jobsSeries,
}: Props) {
  return (
    <div
      className="min-h-[100svh] bg-emerald-950 text-slate-100"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 13px 13px, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px, 24px 24px',
      }}
    >
      <Header fullName={profile.full_name} email={userEmail} role={profile.role || 'candidate'} />

      <main className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 pb-16">
        {/* Top tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Tile
            icon={<UserIcon className="h-5 w-5" />}
            title="প্রোফাইল কমপ্লিশন"
            value={`${pct(completion)}%`}
            href="/settings"
            hint="সেটিংসে গিয়ে ডিটেইল পূরণ করুন"
          />
          <Tile
            icon={<Briefcase className="h-5 w-5" />}
            title="আপনার খেদমত"
            value={String(myJobs.length)}
            href="/jobs"
            hint="আপনার পোস্ট করা জব"
          />
          <Tile
            icon={<FileText className="h-5 w-5" />}
            title="আপনার আবেদন"
            value={String(myApps.length)}
            href="/dashboard/applications"
            hint="আপনার সাবমিট"
          />
          <Tile
            icon={<SettingsIcon className="h-5 w-5" />}
            title="সেটিংস"
            value="খুলুন"
            href="/settings"
            hint="অ্যাভাটার/বায়ো/ভিজিবিলিটি"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ChartCard
            title="আবেদন ট্রেন্ড (শেষ 8 সপ্তাহ)"
            subtitle="প্রতি সপ্তাহে মোট আবেদন সংখ্যা"
            series={appsSeries}
            icon={<BarChart2 className="h-4 w-4" />}
          />
          <ChartCard
            title="জব পোস্ট ট্রেন্ড (শেষ 8 সপ্তাহ)"
            subtitle="প্রতি সপ্তাহে পোস্ট"
            series={jobsSeries}
            color="amber"
            icon={<CalendarDays className="h-4 w-4" />}
          />
          <CompletionCard completion={pct(completion)} profile={profile} />
        </div>

        {/* Lists + Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-6">
            <Card
              heading="আপনার পোস্ট করা খেদমত"
              icon={<Briefcase className="h-4 w-4" />}
              emptyText={profile.role === 'employer'
                ? 'আপনি এখনো কোনো খেদমত পোস্ট করেননি।'
                : 'আপনি employer নন; চাইলে Post Job ব্যবহার করতে পারেন।'}
              cta={profile.role === 'employer' ? { href: '/post-job', label: 'নতুন খেদমত পোস্ট' } : undefined}
            >
              <JobsPanel jobs={myJobs} />
            </Card>

            <ApplicationsPanel apps={myApps} />
          </section>

          <aside className="space-y-6">
            {isAdmin && (
              <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5">
                <div className="font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> অ্যাডমিন মোড
                </div>
                <p className="text-sm text-emerald-100/80 mt-1">দ্রুত লিংক:</p>
                <div className="grid grid-cols-1 gap-2 text-sm mt-3">
                  <Link className="link-tile" href="/admin/login">অ্যাডমিন লগইন</Link>
                  <Link className="link-tile" href="/dashboard/applications">ড্যাশবোর্ড আবেদন</Link>
                  <Link className="link-tile" href="/admin">অ্যাডমিন হোম</Link>
                </div>
              </div>
            )}

            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5">
              <div className="font-semibold mb-3">কুইক লিংক</div>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <Link className="link-tile" href="/jobs">খেদমতসমূহ</Link>
                <Link className="link-tile" href="/post-job">খেদমত পোস্ট করুন</Link>
                <Link className="link-tile" href="/dashboard/applications">আমার আবেদন</Link>
                <Link className="link-tile" href="/settings">প্রোফাইল সেটিংস</Link>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <style jsx global>{`
        .link-tile {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(6px);
          transition: all .2s ease;
        }
        .link-tile:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.10);
        }
      `}</style>
    </div>
  )
}

/* ------------------------------ Client-only panels ------------------------------ */

function csvEscape(v: any) {
  if (v === null || v === undefined) return ''
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}
function downloadCSV(filename: string, rows: string[][]) {
  const csv = rows.map(r => r.map(csvEscape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function parseDateInput(s?: string) {
  if (!s) return null
  const d = new Date(s)
  if (isNaN(+d)) return null
  d.setHours(0,0,0,0)
  return d
}
function parseDateEnd(s?: string) {
  if (!s) return null
  const d = new Date(s)
  if (isNaN(+d)) return null
  d.setHours(23,59,59,999)
  return d
}
function within(dISO?: string, from?: string, to?: string) {
  if (!dISO) return false
  const d = new Date(dISO)
  if (isNaN(+d)) return false
  const a = parseDateInput(from)
  const b = parseDateEnd(to)
  if (a && d < a) return false
  if (b && d > b) return false
  return true
}

// Applications (status + dates + CSV)
function ApplicationsPanel({ apps }: { apps: ApplicationJson[] }) {
  const [status, setStatus] = React.useState<string>('all')
  const [from, setFrom] = React.useState<string>('')
  const [to, setTo] = React.useState<string>('')

  const filtered = React.useMemo(
    () => apps.filter(a => {
      const okStatus = status === 'all' ? true : (a.status || 'new') === status
      const okDate = (!from && !to) ? true : within(a.submittedAt, from, to)
      return okStatus && okDate
    }),
    [apps, status, from, to]
  )

  const counts = React.useMemo(() => {
    const c: Record<string, number> = {}
    for (const a of apps) c[a.status || 'new'] = (c[a.status || 'new'] || 0) + 1
    return c
  }, [apps])

  function exportCSV() {
    const rows: string[][] = [
      ['id','jobSlug','name','email','status','submittedAt','resumeKey'],
      ...filtered.map(a => [
        a.id, a.jobSlug, a.name, a.email, a.status || 'new', a.submittedAt || '', a.resumeKey || ''
      ])
    ]
    const fname = `applications${from?`_${from}`:''}${to?`_${to}`:''}${status!=='all'?`_${status}`:''}.csv`
    downloadCSV(fname, rows)
  }

  function clearFilters() { setStatus('all'); setFrom(''); setTo('') }

  return (
    <Card
      heading="আপনার আবেদন (ফিল্টার + CSV)"
      icon={<FileText className="h-4 w-4" />}
      emptyText="এই ফিল্টারে কোনো রেজাল্ট নেই।"
      cta={{ href: '/jobs', label: 'খেদমত খুঁজুন' }}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <FilterIcon className="h-4 w-4 opacity-70" /> ফিল্টার:
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="h-9 px-3 rounded-lg bg-white/90 text-slate-900 ring-1 ring-slate-300"
        >
          <option value="all">All</option>
          <option value="new">new ({counts['new']||0})</option>
          <option value="reviewing">reviewing ({counts['reviewing']||0})</option>
          <option value="shortlisted">shortlisted ({counts['shortlisted']||0})</option>
          <option value="rejected">rejected ({counts['rejected']||0})</option>
          <option value="hired">hired ({counts['hired']||0})</option>
        </select>

        <span className="opacity-70">তারিখ:</span>
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="h-9 px-3 rounded-lg bg-white/90 text-slate-900 ring-1 ring-slate-300" />
        <span>—</span>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="h-9 px-3 rounded-lg bg-white/90 text-slate-900 ring-1 ring-slate-300" />

        <button onClick={clearFilters} className="h-9 px-3 rounded-lg bg-white/10 ring-1 ring-white/15 hover:bg-white/15">Clear</button>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300"
          title="Export filtered applications as CSV"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {filtered.length > 0 ? (
        <ul className="divide-y divide-white/10">
          {filtered.map((app) => (
            <li key={app.id} className="py-4 flex items-start gap-4 group">
              <div className="h-10 w-10 rounded-xl bg-emerald-700/40 ring-1 ring-emerald-300/30 grid place-items-center group-hover:rotate-6 transition">
                <Send className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold">
                    {app.jobSlug} <span className="text-xs font-normal text-emerald-100/70">({app.id.slice(0, 8)})</span>
                  </div>
                  <span className="rounded-lg bg-white/10 px-2 py-1 text-xs">
                    {app.status || 'new'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-emerald-100/70">
                  সাবমিটেড: {fmtDateTime(app.submittedAt)}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-emerald-100/70">এই ফিল্টারে কোনো রেজাল্ট নেই।</div>
      )}
    </Card>
  )
}

// Jobs (date filter + CSV)
function JobsPanel({ jobs }: { jobs: JobJson[] }) {
  const [from, setFrom] = React.useState<string>('')
  const [to, setTo] = React.useState<string>('')

  const filtered = React.useMemo(
    () => jobs.filter(j => (!from && !to) ? true : within(j.datePosted, from, to)),
    [jobs, from, to]
  )

  function exportCSV() {
    const rows: string[][] = [
      ['slug','title','org','city','region','country','employmentType','datePosted','validThrough'],
      ...filtered.map(j => [
        j.slug,
        j.title,
        j.hiringOrganization?.name || '',
        j.jobLocation?.addressLocality || '',
        j.jobLocation?.addressRegion || '',
        j.jobLocation?.addressCountry || '',
        j.employmentType || '',
        j.datePosted || '',
        j.validThrough || '',
      ])
    ]
    const fname = `jobs${from?`_${from}`:''}${to?`_${to}`:''}.csv`
    downloadCSV(fname, rows)
  }

  function clearFilters() { setFrom(''); setTo('') }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
        <FilterIcon className="h-4 w-4 opacity-70" /> তারিখ:
        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="h-9 px-3 rounded-lg bg-white/90 text-slate-900 ring-1 ring-slate-300" />
        <span>—</span>
        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="h-9 px-3 rounded-lg bg-white/90 text-slate-900 ring-1 ring-slate-300" />
        <button onClick={clearFilters} className="h-9 px-3 rounded-lg bg-white/10 ring-1 ring-white/15 hover:bg-white/15">Clear</button>

        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-amber-400 text-slate-900 font-semibold hover:bg-amber-300"
          title="Export filtered jobs as CSV"
        >
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {filtered.length > 0 ? (
        <ul className="divide-y divide-white/10">
          {filtered.map((job) => (
            <li key={job.slug} className="py-4 flex items-start gap-4 group">
              <div className="h-10 w-10 rounded-xl bg-emerald-700/40 ring-1 ring-emerald-300/30 grid place-items-center group-hover:rotate-6 transition">
                <Briefcase className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/jobs/${job.slug}`} className="font-semibold hover:underline">
                    {job.title}
                  </Link>
                  <Link href={`/jobs/${job.slug}`} className="inline-flex items-center gap-1 text-emerald-300/90 hover:text-emerald-200">
                    দেখুন <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
                <div className="text-sm text-emerald-100/80">
                  {job.hiringOrganization?.name || '—'} • {fmtLoc(job.jobLocation)}
                </div>
                <div className="mt-1 text-xs text-emerald-100/70">
                  পোস্টেড: {fmtDate(job.datePosted)} {job.validThrough ? `• ডেডলাইন: ${fmtDate(job.validThrough)}` : ''}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-emerald-100/70">এই রেঞ্জে কোনো জব নেই।</div>
      )}
    </>
  )
}

/* ------------------------------ UI atoms ------------------------------ */

function Header({ fullName, email, role }: { fullName: string | null; email: string; role: Role }) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-emerald-900/0 to-emerald-950" />
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-900/40 ring-1 ring-emerald-400/20 px-4 py-2 backdrop-blur">
          <div className="h-8 w-8 rounded-xl bg-emerald-700/40 ring-1 ring-emerald-300/30 grid place-items-center">
            <UserIcon className="h-4 w-4" />
          </div>
          <span className="tracking-wide text-emerald-200/90">ড্যাশবোর্ড</span>
        </div>
        <h1 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight">
          আসসালামু আলাইকুম, <span className="text-amber-300">{fullName || email}</span>
        </h1>
        <p className="mt-3 max-w-2xl text-emerald-100/80 text-sm md:text-base leading-relaxed">
          আপনার ভূমিকা: <b className="text-emerald-200">{role || 'candidate'}</b> — এখান থেকে খেদমত পোস্ট/আবেদন ট্র্যাক/প্রোফাইল আপডেট করতে পারবেন।
        </p>
      </div>
    </section>
  )
}

function Tile({
  icon, title, value, hint, href,
}: { icon: React.ReactNode; title: string; value: string; hint?: string; href?: string }) {
  const inner = (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-4 hover:translate-y-[-2px] hover:shadow-lg transition">
      <div className="flex items-center justify-between">
        <div className="h-9 w-9 rounded-xl bg-emerald-700/40 ring-1 ring-emerald-300/30 grid place-items-center">
          {icon}
        </div>
        <div className="text-2xl font-extrabold">{value}</div>
      </div>
      <div className="mt-2 font-semibold">{title}</div>
      {hint && <div className="text-xs text-emerald-100/70 mt-1">{hint}</div>}
    </div>
  )
  const linkHref = href ? { pathname: href } : undefined;
  return href ? <Link href={linkHref}>{inner}</Link> : inner;
}

function Card({
  heading, icon, emptyText, cta, children,
}: {
  heading: string
  icon?: React.ReactNode
  emptyText?: string
  cta?: { href: string; label: string }
  children?: React.ReactNode
}) {
  return (
    <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="font-semibold flex items-center gap-2">
          {icon} {heading}
        </div>
        {cta && (
          <Link href={cta.href ? { pathname: cta.href } : undefined} className="inline-flex items-center gap-1 text-emerald-300/90 hover:text-emerald-200 text-sm">
            {cta.label} <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="mt-4">
        {children ? (
          children
        ) : (
          <div className="text-sm text-emerald-100/70">{emptyText || '—'}</div>
        )}
      </div>
    </div>
  )
}

function CompletionCard({ completion, profile }: { completion: number; profile: { full_name: string | null; role: Role } }) {
  return (
    <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5">
      <div className="flex items-center justify-between">
        <div className="font-semibold flex items-center gap-2">
          <ListChecks className="h-4 w-4" /> প্রোফাইল কমপ্লিশন
        </div>
        <span className="text-sm">{completion}%</span>
      </div>
      <div className="mt-3 h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div className="h-full bg-amber-400" style={{ width: `${pct(completion)}%` }} />
      </div>
      <ul className="mt-4 text-sm space-y-1 text-emerald-100/80">
        {completionTips(profile).map((t) => <li key={t}>• {t}</li>)}
      </ul>
      <Link href="/settings" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-400 text-slate-900 font-semibold px-4 py-2 hover:bg-amber-300 transition">
        সেটিংস খুলুন <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

/* ------------------------------ Charts + helpers ------------------------------ */

function ChartCard({
  title, subtitle, series, color = 'emerald', icon
}: {
  title: string
  subtitle?: string
  series: { label: string; value: number }[]
  color?: 'emerald'|'amber'
  icon?: React.ReactNode
}) {
  const max = Math.max(1, ...series.map(s => s.value))
  const barW = 22
  const gap = 12
  const height = 120
  const width = series.length * barW + (series.length - 1) * gap

  const fill = color === 'amber' ? '#fbbf24' : '#34d399'
  const bg = 'rgba(255,255,255,0.08)'

  return (
    <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5">
      <div className="flex items-center justify-between">
        <div className="font-semibold flex items-center gap-2">
          {icon} {title}
        </div>
        <div className="text-xs opacity-75">শেষ 8 সপ্তাহ</div>
      </div>
      {subtitle && <div className="mt-1 text-sm text-emerald-100/80">{subtitle}</div>}
      <div className="mt-4 overflow-x-auto">
        <svg width={width} height={height}>
          <rect x={0} y={0} width={width} height={height} rx={10} fill={bg} />
          {series.map((s, i) => {
            const h = Math.round((s.value / max) * (height - 24))
            const x = i * (barW + gap) + 10
            const y = height - h - 10
            return (
              <g key={s.label}>
                <rect x={x} y={y} width={barW} height={h} rx={6} fill={fill} />
                <text x={x + barW / 2} y={height - 2} textAnchor="middle" fontSize="10" fill="#e5e7eb">
                  {s.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

function pct(n: number) {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}
function fmtDate(d?: string) {
  if (!d) return '—'
  try {
    const dt = new Date(d)
    return dt.toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric' })
  } catch { return d }
}
function fmtDateTime(d?: string) {
  if (!d) return '—'
  try {
    const dt = new Date(d)
    return dt.toLocaleString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return d }
}
function fmtLoc(loc?: JobJson['jobLocation']) {
  if (!loc) return '—'
  return [loc.addressLocality, loc.addressRegion, loc.addressCountry].filter(Boolean).join(', ')
}
function completionTips(p: { full_name: string | null; role: Role }) {
  const out: string[] = []
  if (!p.full_name) out.push('পূর্ণ নাম দিন')
  out.push('হেডলাইন দিন (সেটিংসে)')
  out.push('লোকেশন সেট করুন')
  out.push('“আমার সম্পর্কে” অংশটি পূরণ করুন')
  out.push('রোল/ভিজিবিলিটি ঠিক করুন')
  return out.slice(0, 5)
}
