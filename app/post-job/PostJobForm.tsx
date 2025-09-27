'use client'

import * as React from 'react'
import { useFormStatus, useFormState } from 'react-dom'

// ---- Client Form (client) ----
function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-6 w-full h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
    >
      {pending ? 'জমা দিচ্ছে...' : 'জমা দিন'}
    </button>
  )
}

function PostJobForm({ createJobAction }: { createJobAction: (prevState: ActionState | null, formData: FormData) => Promise<ActionState> }) {
  const [state, formAction] = useFormState(createJobAction, null)
  const [title, setTitle] = React.useState('')
  const [org, setOrg] = React.useState('')
  const [city, setCity] = React.useState('')
  const [salary, setSalary] = React.useState('')

  React.useEffect(() => {
    if (state?.ok) {
      redirect(`/jobs/${state.slug}`)
    }
  }, [state])

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
    <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-emerald-900/20 to-emerald-500/10">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form action={formAction} className="space-y-6">
          <h1 className="text-3xl font-bold text-slate-900">জব পোস্ট করুন</h1>
          <p className="text-slate-600">সকল ফিল্ড ঠিকমতো পূরণ করুন।</p>

          <div>
            <Label>শিরোনাম *</Label>
            <Input name="title" required placeholder="যেমন: সফটওয়্যার ইঞ্জিনিয়ার" />
          </div>

          <div>
            <Label>বর্ণনা *</Label>
            <Textarea name="description" rows={8} required placeholder="জবের বিস্তারিত বর্ণনা দিন" />
          </div>

          <div>
            <Label>প্রতিষ্ঠানের নাম *</Label>
            <Input name="orgName" required placeholder="যেমন: আপনার কোম্পানি লিমিটেড" />
          </div>

          <div>
            <Label>প্রতিষ্ঠানের ওয়েবসাইট</Label>
            <Input name="orgWebsite" placeholder="https://example.com" />
          </div>

          <div>
            <Label>যোগাযোগের ইমেইল</Label>
            <Input name="email" type="email" placeholder="আবেদনের জন্য ইমেইল" />
          </div>

          <div>
            <Label>শহর/উপজেলা *</Label>
            <Input name="city" required placeholder="যেমন: ঢাকা" />
          </div>

          <div>
            <Label>জেলা/বিভাগ</Label>
            <Input name="region" placeholder="যেমন: ঢাকা" />
          </div>

          <div>
            <Label>দেশ</Label>
            <Select name="country" defaultValue="BD">
              <option value="BD">বাংলাদেশ</option>
              {/* অন্যান্য দেশ যোগ করুন */}
            </Select>
          </div>

          <div>
            <Label>চাকরির ধরণ</Label>
            <Select name="employmentType">
              <option value="">নির্বাচন করুন</option>
              <option value="FULL_TIME">ফুল টাইম</option>
              <option value="PART_TIME">পার্ট টাইম</option>
              <option value="CONTRACT">কন্ট্রাক্ট</option>
              <option value="INTERNSHIP">ইন্টার্নশিপ</option>
              <option value="TEMPORARY">টেম্পোরারি</option>
            </Select>
          </div>

          <div>
            <Label>আবেদনের শেষ তারিখ</Label>
            <Input name="validThrough" type="date" />
          </div>

          <div>
            <Label>আবেদনের লিঙ্ক</Label>
            <Input name="applicationUrl" placeholder="যেমন: https://example.com/apply" />
          </div>

          <div>
            <Label>সম্মানী</Label>
            <div className="flex gap-2">
              <Input name="salaryValue" type="number" placeholder="যেমন: 50000" />
              <Select name="salaryCurrency" defaultValue="BDT">
                <option value="BDT">BDT</option>
                {/* অন্যান্য কারেন্সি */}
              </Select>
              <Select name="salaryUnit" defaultValue="MONTH">
                <option value="MONTH">মাস</option>
                <option value="WEEK">সপ্তাহ</option>
                <option value="DAY">দিন</option>
              </Select>
            </div>
          </div>

          <div>
            <Label>লোগো ফাইল</Label>
            <FileInput name="logoFile" accept="image/*" />
          </div>

          <div>
            <Label>জব ডেসক্রিপশন ফাইল (PDF/DOC)</Label>
            <FileInput name="jdFile" accept=".pdf,.doc,.docx" />
          </div>

          {state && !state.ok && <div className="text-red-600">{state.error}</div>}

          <SubmitBtn />
        </form>

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
      </div>
    </main>
  )
}

export default PostJobForm

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