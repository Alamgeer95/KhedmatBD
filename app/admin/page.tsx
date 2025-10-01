// app/admin/page.tsx
// Server: admin cookie guard + S3 থেকে ডেটা এনে Client-এ পাঠানো

import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { listPrefix, getObjectText } from '@/lib/storage'
import AdminClientComponent from './AdminClientComponent'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// --- Types shared with client ---
export type AppJson = {
  id: string
  jobSlug: string
  name: string
  email: string
  status?: 'new'|'reviewing'|'shortlisted'|'rejected'|'hired'|string
  resumeKey?: string
  submittedAt?: string
}

export type JobJson = {
  slug: string
  title: string
  datePosted?: string
  hiringOrganization?: { name?: string }
}

function todayISO() {
  const t = new Date()
  const y = t.getFullYear()
  const m = String(t.getMonth()+1).padStart(2,'0')
  const d = String(t.getDate()).padStart(2,'0')
  return `${y}-${m}-${d}`
}

export default async function AdminHome() {
  // ✅ Admin guard (Next 15: cookies() async-typed)
  const store = await cookies()
  const sess = store.get('admin_session')?.value
  if (!sess) redirect('/admin/login')

  // ---------- Applications ----------
  const subList = await listPrefix('submissions/') // list objects
  const appObjs = (subList || [])
    .filter(o => (o.Key || '').endsWith('.json'))
    .sort((a, b) => {
      const da = a.LastModified ? new Date(a.LastModified as any).getTime() : 0
      const db = b.LastModified ? new Date(b.LastModified as any).getTime() : 0
      return db - da
    })

  const LIMIT = 120
  const latestKeys = appObjs.slice(0, LIMIT).map(o => o.Key!).filter(Boolean)

  const apps: AppJson[] = []
  for (const key of latestKeys) {
    try {
      const txt = await getObjectText(key)
      if (!txt) continue
      apps.push(JSON.parse(txt) as AppJson)
    } catch { /* ignore bad rows */ }
  }

  const totalApps = appObjs.length
  const isoToday = todayISO()
  const todayApps = apps.filter(a => (a.submittedAt || '').slice(0,10) === isoToday).length
  const statusCounts = apps.reduce<Record<string, number>>((acc, a) => {
    const s = a.status || 'new'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  // ---------- Jobs ----------
  const jobsList = await listPrefix('jobs/')
  const jobJsonKeys = (jobsList || [])
    .map(o => o.Key || '')
    .filter(k => k.endsWith('/job.json'))
  const totalJobs = jobJsonKeys.length

  const recentJobs: JobJson[] = []
  for (const key of jobJsonKeys.slice(-20).reverse()) {
    try {
      const txt = await getObjectText(key)
      if (!txt) continue
      recentJobs.push(JSON.parse(txt) as JobJson)
    } catch { /* ignore */ }
  }

  return (
    <AdminClientComponent
      totals={{ totalApps, todayApps, totalJobs, statusCounts }}
      lists={{ apps, recentJobs }}
    />
  )
}
