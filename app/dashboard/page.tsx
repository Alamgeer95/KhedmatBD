// app/dashboard/page.tsx
// Server Component: Supabase auth + S3 reads happen here.
// UI/filters/CSV live in the client component: DashboardClient.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listPrefix, getObjectText } from '@/lib/storage'
import DashboardClient from './DashboardClient'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

type ProfileRow = {
  id: string
  full_name: string | null
  role: Role
  headline: string | null
  location: string | null
  about: string | null
  visibility: 'public' | 'private' | null
  avatar_key: string | null
}

function pct(n: number) {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, Math.round(n)))
}

function computeProfileCompletion(p?: ProfileRow | null) {
  if (!p) return 20
  let done = 0
  if (p.full_name) done++
  if (p.headline) done++
  if (p.location) done++
  if (p.about) done++
  if (p.role) done++
  if (p.visibility) done++
  if (p.avatar_key) done++
  const total = 7
  return pct((done / total) * 100)
}

function bucketByWeek(isoDates: string[]) {
  const now = new Date()
  const weeks: { label: string; start: Date; end: Date }[] = []
  for (let i = 7; i >= 0; i--) {
    const end = new Date(now)
    end.setDate(end.getDate() - i * 7)
    end.setHours(23,59,59,999)
    const start = new Date(end)
    start.setDate(start.getDate() - 6)
    start.setHours(0,0,0,0)
    weeks.push({ label: `W-${8 - i}`, start, end })
  }
  return weeks.map(w => {
    let c = 0
    for (const d of isoDates) {
      if (!d) continue
      const x = new Date(d)
      if (x >= w.start && x <= w.end) c++
    }
    return { label: w.label, value: c }
  })
}

async function readYourJobs(userEmail: string): Promise<JobJson[]> {
  const list = await listPrefix('jobs/')
  const jobKeys = list
    .map(o => o.Key || '')
    .filter(k => k.endsWith('/job.json'))
    .slice(-1000)
  const out: JobJson[] = []
  for (const key of jobKeys.reverse()) {
    try {
      const txt = await getObjectText(key)
      if (!txt) continue
      const j = JSON.parse(txt) as JobJson
      if (j?.contact?.email && j.contact.email.toLowerCase() === userEmail.toLowerCase()) {
        out.push(j)
      }
      if (out.length >= 50) break
    } catch { /* ignore */ }
  }
  out.sort((a,b)=>(b.datePosted||'').localeCompare(a.datePosted||''))
  return out
}

async function readYourApplications(userEmail: string): Promise<ApplicationJson[]> {
  const list = await listPrefix('submissions/')
  const keys = list
    .map(o => o.Key || '')
    .filter(k => k.endsWith('.json'))
    .slice(-2000)

  const out: ApplicationJson[] = []
  for (const key of keys.reverse()) {
    try {
      const txt = await getObjectText(key)
      if (!txt) continue
      const j = JSON.parse(txt) as ApplicationJson
      if (j?.email && j.email.toLowerCase() === userEmail.toLowerCase()) {
        out.push(j)
      }
      if (out.length >= 200) break
    } catch { /* ignore */ }
  }
  out.sort((a,b)=>(b.submittedAt||'').localeCompare(a.submittedAt||''))
  return out
}

export default async function Page() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin?next=/dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, full_name, role, headline, location, about, visibility, avatar_key')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>()

  const userEmail = user.email || ''
  const [myJobs, myApps] = await Promise.all([
    readYourJobs(userEmail),
    readYourApplications(userEmail),
  ])

  const completion = computeProfileCompletion(profile || null)
  const isAdmin =
    !!process.env.ADMIN_EMAIL &&
    userEmail.toLowerCase() === String(process.env.ADMIN_EMAIL).toLowerCase()

  const appsSeries = bucketByWeek(myApps.map(a => a.submittedAt || ''))
  const jobsSeries = bucketByWeek(myJobs.map(j => j.datePosted || ''))

  return (
    <DashboardClient
      userEmail={userEmail}
      profile={{
        full_name: profile?.full_name ?? null,
        role: profile?.role ?? 'candidate',
      }}
      myJobs={myJobs}
      myApps={myApps}
      completion={completion}
      isAdmin={isAdmin}
      appsSeries={appsSeries}
      jobsSeries={jobsSeries}
    />
  )
}
