// app/post-job/page.tsx
// Server Component (default) + Client Form (child)
// - S3-এ logo/jd ফাইল আপলোড
// - jobs/{slug}/job.json লিখে রাখে
// - সফল হলে /jobs/[slug] এ রিডাইরেক্ট
// - /jobs ও /jobs/[slug] রিভ্যালিডেট

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { putFile, putJson } from '@/lib/storage'

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
type ActionState =
  | { ok: false; error: string }
  | { ok: true; slug: string }

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
  const salaryUnit = (formData.get('salaryUnit') as string || 'MONTH').trim() as 'MONTH'|'WEEK'|'DAY'

  if (title.length < 3) return { ok: false, error: 'শিরোনাম কমপক্ষে ৩ অক্ষর দিন' }
  if (description.length < 20) return { ok: false, error: 'বর্ণনা কমপক্ষে ২০ অক্ষর দিন' }
  if (orgName.length < 2) return { ok: false, error: 'প্রতিষ্ঠানের নাম দিন' }
  if (city.length < 2) return { ok: false, error: 'শহর/উপজেলা দিন' }

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

    const ext = extFromMime(f.type)
    const finalKey = ext ? `${key}${ext}` : key
    await putFile(finalKey, f, { contentType: f.type || 'application/octet-stream' })
    return finalKey
  }

  try {
    logoKey = await maybeUpload(`jobs/${slug}/logo`, logo)
    jdKey = await maybeUpload(`jobs/${slug}/jd`, jd)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'ফাইল আপলোডে ত্রুটি' }
  }

  // 4) job.json তৈরি
  const jobJson: any = {
    slug,
    title,
    description,
    employmentType,
    datePosted: new Date().toISOString().slice(0, 10),
    validThrough,
    hiringOrganization: {
      name: orgName,
      sameAs: orgWebsite,
      logo: logoKey, // S3 key (client-এ প্রি-সাইনড URL থেকে পড়াতে পারবেন)
    },
    jobLocation: {
      addressLocality: city,
      addressRegion: region,
      addressCountry: country,
    },
    baseSalary:
      salaryValueRaw && !Number.isNaN(Number(salaryValueRaw))
        ? {
            currency: salaryCurrency || 'BDT',
            value: Number(salaryValueRaw),
            unitText: salaryUnit || 'MONTH',
          }
        : undefined,
    contact: {
      email,
      applicationUrl,
    },
    attachments: {
      jd: jdKey,
    },
  }

  try {
    await putJson(`jobs/${slug}/job.json`, jobJson)
  } catch (e: any) {
    return { ok: false, error: e?.message || 'জব ডেটা সেভ করতে ব্যর্থ' }
  }

  // 5) রিভ্যালিডেট + রিডাইরেক্ট
  revalidatePath('/jobs')
  revalidatePath(`/jobs/${slug}`)
  redirect(`/jobs/${slug}`)
}

// ================== Client Form ==================
function PageShell() {
  return (
    <div
      className="min-h-[100svh] bg-emerald-950 text-slate-100"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 13px 13px, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px, 24px 24px',
      }}
    >
      <Hero />
      <div className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FormCard />
          </div>
          <aside className="hidden lg:block"><PreviewCard /></aside>
        </div>
      </div>
    </div>
  )
}

// ---- Hero (server) ----
function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-emerald-900/0 to-emerald-950" />
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-16">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-900/40 ring-1 ring-emerald-400/20 px-4 py-2 backdrop-blur">
          <div className="h-8 w-8 rounded-xl bg-emerald-700/40 ring-1 ring-emerald-300/30 grid place-items-center">
            <svg viewBox="0 0 24 24" className="h-4 w-4"><path fill="currentColor" d="M4 7h16v2H4zm0 4h16v8H4zM7 3h10v2H7z"/></svg>
          </div>
          <span className="tracking-wide text-emerald-200/90">খেদমত পোস্ট ফর্ম</span>
        </div>
        <h1 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight">
          ক্লাসিক ইসলামী ছোঁয়ায় <span className="text-amber-300">আধুনিক</span> পোস্টিং
        </h1>
        <p className="mt-3 max-w-2xl text-emerald-100/80 text-sm md:text-base leading-relaxed">
          তথ্য পূরণ করে সাবমিট করুন—ফাইল S3-এ যাবে, আর জব লিস্টে সাথে সাথে দেখা যাবে।
        </p>
      </div>
    </section>
  )
}

// ---- Client Form (client) ----
'use client'
import * as React from 'react'
import { useFormStatus, useFormState } from 'react-dom'

function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-amber-400 text-slate-900 font-semibold px-5 py-3 hover:translate-y-[-1px] hover:shadow-lg hover:bg-amber-300 active:translate-y-0 transition"
    >
      {pending ? 'জমা হচ্ছে…' : 'খেদমত সাবমিট করুন'}
    </button>
  )
}

function FormCard() {
  const [state, action] = useFormState(createJobAction as any, null)

  return (
    <div className="group rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 md:p-6">
      <form action={action} className="grid grid-cols-1 md:grid-cols-2 gap-5" autoComplete="off">
        {/* Title */}
        <div className="md:col-span-2">
          <Label>খেদমতের শিরোনাম</Label>
          <Input name="title" placeholder="উদাহরণ: আরবি শিক্ষক (হিফজ বিভাগ)" required />
        </div>

        {/* Employment Type */}
        <div>
          <Label>চাকরির ধরন</Label>
          <Select name="employmentType" defaultValue="">
            <option value="">নির্বাচন করুন</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="CONTRACT">Contract</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="TEMPORARY">Temporary</option>
          </Select>
        </div>

        {/* Deadline */}
        <div>
          <Label>আবেদন শেষ তারিখ</Label>
          <Input type="date" name="validThrough" />
        </div>

        {/* Org */}
        <div>
          <Label>প্রতিষ্ঠানের নাম</Label>
          <Input name="orgName" placeholder="উদাহরণ: আন-নূর মাদরাসা" required />
        </div>
        <div>
          <Label>প্রতিষ্ঠানের ওয়েবসাইট (ঐচ্ছিক)</Label>
          <Input name="orgWebsite" placeholder="https://example.org" />
        </div>

        {/* Contact */}
        <div>
          <Label>যোগাযোগ ইমেইল (ঐচ্ছিক)</Label>
          <Input name="email" placeholder="hr@example.org" />
        </div>
        <div>
          <Label>আবেদন লিংক (ঐচ্ছিক)</Label>
          <Input name="applicationUrl" placeholder="https://example.org/apply" />
        </div>

        {/* Location */}
        <div>
          <Label>শহর/উপজেলা</Label>
          <Input name="city" placeholder="ঢাকা" required />
        </div>
        <div>
          <Label>জেলা/বিভাগ (ঐচ্ছিক)</Label>
          <Input name="region" placeholder="ঢাকা বিভাগ" />
        </div>
        <input type="hidden" name="country" value="BD" />

        {/* Salary */}
        <div>
          <Label>সম্মানী (সংখ্যা)</Label>
          <Input name="salaryValue" placeholder="35000" inputMode="numeric" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>কারেন্সি</Label>
            <Input name="salaryCurrency" defaultValue="BDT" />
          </div>
          <div>
            <Label>ইউনিট</Label>
            <Select name="salaryUnit" defaultValue="MONTH">
              <option value="MONTH">মাসিক</option>
              <option value="WEEK">সাপ্তাহিক</option>
              <option value="DAY">দৈনিক</option>
            </Select>
          </div>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <Label>খেদমতের বর্ণনা</Label>
          <Textarea
            name="description"
            rows={6}
            placeholder="দায়িত্ব, যোগ্যতা, সুবিধা ইত্যাদি বিস্তারিত লিখুন…"
            required
          />
        </div>

        {/* Files */}
        <div>
          <Label>প্রতিষ্ঠানের লোগো (ঐচ্ছিক)</Label>
          <FileInput name="logoFile" accept="image/*" />
        </div>
        <div>
          <Label>Job Description PDF (ঐচ্ছিক)</Label>
          <FileInput name="jdFile" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
        </div>

        <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
          <SubmitBtn />
          {state && !('slug' in state) && !state?.ok && (
            <span className="text-sm text-rose-300">{state.error}</span>
          )}
        </div>
      </form>
    </div>
  )
}

// ---- Preview (client-side tiny) ----
function PreviewCard() {
  const [title, setTitle] = React.useState('')
  const [org, setOrg] = React.useState('')
  const [city, setCity] = React.useState('')
  const [salary, setSalary] = React.useState('')

  // ইনপুটগুলো থেকে লাইভ প্রিভিউ (ডিবাউন্স)
  React.useEffect(() => {
    const handler = (e: Event) => {
      const t = e.target as HTMLInputElement | HTMLTextAreaElement
      if (!t || !t.name) return
      if (t.name === 'title') setTitle(t.value)
      if (t.name === 'orgName') setOrg(t.value)
      if (t.name === 'city') setCity(t.value)
      if (t.name === 'salaryValue') setSalary(t.value)
    }
    document.addEventListener('input', handler, true)
    return () => document.removeEventListener('input', handler, true)
  }, [])

  return (
    <div className="sticky top-24">
      <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 backdrop-blur group">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-700/40 ring-1 ring-emerald-300/30 grid place-items-center group-hover:rotate-6 transition">
            <svg viewBox="0 0 24 24" className="h-5 w-5"><path fill="currentColor" d="M4 7h16v2H4zm0 4h16v8H4zM7 3h10v2H7z"/></svg>
          </div>
          <div>
            <div className="text-sm text-emerald-200/80">লাইভ প্রিভিউ</div>
            <div className="text-lg font-bold">{title || 'শিরোনাম'}</div>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="opacity-90">{org || 'প্রতিষ্ঠান'}</div>
          <div className="opacity-90">{city || 'শহর/উপজেলা'}, বাংলাদেশ</div>
          <div className="opacity-90">{salary ? `BDT ${salary} / মাস` : 'সম্মানী উল্লেখ নেই'}</div>
        </div>
        <div className="mt-5 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="mt-4 text-xs text-emerald-200/70">
          সাবমিট করলে জবটি সাথে সাথে লিস্টে যুক্ত হবে।
        </div>
      </div>
    </div>
  )
}

// ---- Small styled controls (client) ----
function Label({ children }: { children: React.ReactNode }) {
  return <label className="flex items-center gap-2 text-sm mb-2">{children}</label>
}
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'w-full rounded-xl bg-white/90 text-slate-900 px-4 py-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-emerald-500 transition ' +
        (props.className || '')
      }
    />
  )
}
function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={
        'w-full rounded-xl bg-white/90 text-slate-900 px-4 py-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-emerald-500 transition ' +
        (props.className || '')
      }
    />
  )
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={
        'w-full rounded-xl bg-white/90 text-slate-900 px-4 py-3 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-emerald-500 transition ' +
        (props.className || '')
      }
    />
  )
}
function FileInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="file"
      {...props}
      className={
        'block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white hover:file:bg-emerald-700 cursor-pointer rounded-xl bg-white/90 text-slate-900 ring-1 ring-slate-300 ' +
        (props.className || '')
      }
    />
  )
}

export default function Page() {
  return <PageShell />
}
