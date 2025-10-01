// app/post-job/page.tsx
// Server Component (default) + Client Form (child)
// - S3-এ logo/jd ফাইল আপলোড
// - jobs/{slug}/job.json লিখে রাখে
// - সফল হলে /jobs/[slug] এ রিডাইরেক্ট
// - /jobs ও /jobs/[slug] রিভ্যালিডেট

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { putFile, putJson } from '@/lib/storage'
import PostJobForm from './PostJobForm'
import type { ActionState } from '@/types'

// এই পেজে ডাইনামিক সার্ভার কোড আছে (Server Action + S3), তাই:
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ---------- ছোট util ----------
function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 60)
}

function extFromMime(mime?: string) {
  if (!mime) return ''
  if (mime === 'application/pdf') return '.pdf'
  if (mime === 'image/png') return '.png'
  if (mime === 'image/jpeg') return '.jpg'
  if (mime === 'image/webp') return '.webp'
  if (mime === 'application/msword') return '.doc'
  if (mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '.docx'
  return ''
}

// ---------- Server Action ----------
async function createJobAction(_prevState: ActionState | null, formData: FormData): Promise<ActionState> {
  'use server'

  // 1) ইনপুট পড়া + ভ্যালিডেশন (min)
  const title = (formData.get('title') as string || '').trim()
  const description = (formData.get('description') as string || '').trim()
  const orgName = (formData.get('orgName') as string || '').trim()
  const orgWebsite = (formData.get('orgWebsite') as string || '').trim() || undefined
  const email = (formData.get('email') as string || '').trim() || undefined
  const city = (formData.get('city') as string || '').trim()
  const region = (formData.get('region') as string || '').trim() || undefined
  const country = (formData.get('country') as string || 'BD').trim() || 'BD'
  const employmentType = (formData.get('employmentType') as string || undefined) as
    | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY' | undefined
  const validThrough = (formData.get('validThrough') as string || '').trim() || undefined
  const applicationUrl = (formData.get('applicationUrl') as string || '').trim() || undefined

  const salaryValueRaw = (formData.get('salaryValue') as string || '').trim()
  const salaryCurrency = (formData.get('salaryCurrency') as string || 'BDT').trim() || 'BDT'
  const salaryUnit = (formData.get('salaryUnit') as string || 'MONTH') as 'MONTH' | 'WEEK' | 'DAY'

  if (title.length < 3) return { ok: false, error: 'শিরোনাম কমপক্ষে ৩ অক্ষর দিন' }
  if (description.length < 20) return { ok: false, error: 'বর্ণনা কমপক্ষে ২০ অক্ষর দিন' }
  if (orgName.length < 2) return { ok: false, error: 'প্রতিষ্ঠানের নাম দিন' }
  if (city.length < 2) return { ok: false, error: 'শহর/উপজেলা দিন' }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'অবৈধ ইমেইল' }
  if (applicationUrl && !/^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/.test(applicationUrl)) return { ok: false, error: 'অবৈধ URL' }

  // 2) ইউনিক slug
  const base = slugify(`${title}-${city}`)
  const slug = `${base}-${Date.now().toString(36).slice(-4)}`

  // 3) ফাইল (logo, jd) — Max 5MB
  const logo = formData.get('logoFile') as File | null
  const jd = formData.get('jdFile') as File | null

  let logoKey: string | undefined
  let jdKey: string | undefined

  async function maybeUpload(key: string, f: File | null) {
    if (!f || f.size === 0) return undefined
    if (f.size > 5 * 1024 * 1024) throw new Error('ফাইল ৫MB এর কম হতে হবে')
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(f.type)) throw new Error('অনুমোদিত ফাইল টাইপ নয়')
    const ext = extFromMime(f.type)
    const finalKey = ext ? `${key}${ext}` : key
    const arrayBuffer = await f.arrayBuffer()
    const res = await putFile(finalKey, arrayBuffer, { contentType: f.type || 'application/octet-stream' })
    return res.url
  }

  try {
    logoKey = await maybeUpload(`jobs/${slug}/logo`, logo)
  } catch (e: any) {
    return { ok: false, error: 'লোগো আপলোড ব্যর্থ: ' + e.message }
  }

  try {
    jdKey = await maybeUpload(`jobs/${slug}/jd`, jd)
  } catch (e: any) {
    return { ok: false, error: 'জব ডেসক্রিপশন ফাইল আপলোড ব্যর্থ: ' + e.message }
  }

  // 4) JSON তৈরি
  const salaryValue = salaryValueRaw ? parseInt(salaryValueRaw, 10) : undefined
  const job = {
    title,
    description,
    orgName,
    orgWebsite,
    email,
    location: { city, region, country },
    employmentType,
    validThrough,
    applicationUrl,
    salary: salaryValue ? { value: salaryValue, currency: salaryCurrency, unit: salaryUnit } : undefined,
    logo: logoKey,
    jdFile: jdKey,
    postedAt: new Date().toISOString(),
  }

  // 5) S3-এ লেখা
  try {
    await putJson(`jobs/${slug}/job.json`, job)
  } catch (e: any) {
    return { ok: false, error: 'জব তথ্য সংরক্ষণ ব্যর্থ: ' + e.message }
  }

  // 6) Revalidate
  revalidatePath('/jobs')

  // 7) রিডাইরেক্ট
  redirect(`/jobs/${slug}`)
}

export default function Page() {
  return <PostJobForm createJobAction={createJobAction} />
}