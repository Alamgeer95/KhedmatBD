// app/settings/page.tsx
'use client'

import * as React from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Settings, Shield, Globe2, User as UserIcon } from 'lucide-react'
import { saveSettingsAction, sendResetAction, type ActionState } from './actions'
import { createClient } from '@/lib/supabase/client'

type Role = 'candidate' | 'employer'
type Visibility = 'public' | 'private'

type ProfileRow = {
  id: string
  role: Role | null
  full_name: string | null
  headline: string | null
  location: string | null
  languages: Record<string, boolean> | null
  about: string | null
  visibility: Visibility | null
  avatar_key: string | null
  avatar_url: string | null
}

export default function SettingsPage() {
  // ✅ ক্লায়েন্টে ইউজার/প্রোফাইল লোড
  const supabase = createClient()
  const [loading, setLoading] = React.useState(true)
  const [email, setEmail] = React.useState('')
  const [form, setForm] = React.useState({
    full_name: '',
    headline: '',
    location: '',
    about: '',
    role: 'candidate' as Role,
    visibility: 'public' as Visibility,
    languages: '',
    avatar: '' as string | null,
  })

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = '/auth/signin?next=/settings'
          return
        }
        if (!mounted) return
        setEmail(user.email || '')

        const { data } = await supabase
          .from('profiles')
          .select('full_name, headline, location, about, role, languages, visibility, avatar_url')
          .eq('id', user.id)
          .maybeSingle<ProfileRow>()

        if (data && mounted) {
          setForm({
            full_name : data.full_name   || '',
            headline  : data.headline    || '',
            location  : data.location    || '',
            about     : data.about       || '',
            role      : (data.role || 'candidate') as Role,
            visibility: (data.visibility || 'public') as Visibility,
            languages : data.languages ? Object.keys(data.languages).join(', ') : '',
            avatar    : data.avatar_url || '',
          })
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [supabase])

  const [state, action] = useFormState<ActionState, FormData>(saveSettingsAction, null)
  const [preview, setPreview] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (state?.ok && state.signedAvatar) {
      // সার্ভার সাইডে নতুন সাইনড URL এলে প্রিভিউতে সেট করি
      setPreview(state.signedAvatar)
    }
  }, [state])

  function pickAvatar(file?: File) {
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  if (loading) {
    return (
      <div className="min-h-[70svh] grid place-items-center text-slate-500">
        লোড হচ্ছে…
      </div>
    )
  }

  return (
    <div
      className="min-h-[100svh] bg-emerald-950 text-slate-100"
      style={{
        backgroundImage:
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(circle at 13px 13px, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px, 24px 24px',
      }}
    >
      <Header />

      <main className="relative z-10 mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Form */}
          <section className="lg:col-span-2">
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 md:p-6">
              <form
                action={action}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
                autoComplete="off"
                encType="multipart/form-data"
              >
                {/* Avatar */}
                <div className="md:col-span-2 flex items-center gap-5">
                  <div className="relative h-20 w-20 rounded-2xl overflow-hidden ring-1 ring-white/15 bg-white/10">
                    {preview || form.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={preview || form.avatar || ''} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full grid place-items-center text-emerald-200/70">
                        <UserIcon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-2">অ্যাভাটার (ঐচ্ছিক, সর্বোচ্চ 2MB)</label>
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={(e) => pickAvatar(e.currentTarget.files?.[0] || undefined)}
                      className="block text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white hover:file:bg-emerald-700 cursor-pointer rounded-xl bg-white/90 text-slate-900 ring-1 ring-slate-300"
                    />
                  </div>
                </div>

                <Field label="পূর্ণ নাম">
                  <Input name="full_name" value={form.full_name} onChange={e=>setForm(f=>({...f,full_name:e.target.value}))} placeholder="আপনার নাম" />
                </Field>
                <Field label="হেডলাইন">
                  <Input name="headline" value={form.headline} onChange={e=>setForm(f=>({...f,headline:e.target.value}))} placeholder="যেমন: Arabic Teacher | Hifz" />
                </Field>

                <Field label="লোকেশন">
                  <Input name="location" value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} placeholder="ঢাকা, বাংলাদেশ" />
                </Field>
                <Field label="ভিজিবিলিটি">
                  <Select name="visibility" value={form.visibility} onChange={e=>setForm(f=>({...f,visibility:e.target.value as Visibility}))}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </Select>
                </Field>

                <Field label="রোল">
                  <Select name="role" value={form.role} onChange={e=>setForm(f=>({...f,role:e.target.value as Role}))}>
                    <option value="candidate">Candidate</option>
                    <option value="employer">Employer</option>
                  </Select>
                </Field>
                <Field label="ভাষা (কমা-সেপারেটেড)">
                  <Input name="languages" value={form.languages} onChange={e=>setForm(f=>({...f,languages:e.target.value}))} placeholder="বাংলা, English, العربية" />
                </Field>

                <div className="md:col-span-2">
                  <Field label="আমার সম্পর্কে">
                    <Textarea name="about" rows={5} value={form.about} onChange={e=>setForm(f=>({...f,about:e.target.value}))} placeholder="সংক্ষেপে নিজের সম্পর্কে লিখুন…" />
                  </Field>
                </div>

                {/* Email (readonly) */}
                <div className="md:col-span-2">
                  <label className="text-sm mb-2 block">লগইন ইমেইল</label>
                  <input readOnly value={email} className="w-full rounded-xl bg-white/60 text-slate-900 px-4 py-3 ring-1 ring-slate-300" />
                </div>

                <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
                  <SubmitBtn />
                  {state && !state.ok && <span className="text-sm text-rose-300">{state.error}</span>}
                  {state && state.ok && <span className="text-sm text-emerald-300">{state.message}</span>}
                </div>
              </form>
            </div>

            {/* Security */}
            <SecurityCard />
          </section>

          {/* RIGHT: Tips */}
          <aside>
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-5 sticky top-24">
              <h3 className="font-semibold flex items-center gap-2"><Globe2 className="h-4 w-4" /> টিপস</h3>
              <ul className="mt-3 space-y-2 text-sm text-emerald-100/80 list-disc list-inside">
                <li>Public করলে প্রোফাইল সার্চে দেখাবে।</li>
                <li>ভাষা কমা দিয়ে লিখুন—যেমন: বাংলা, English, العربية</li>
                <li>অ্যাভাটার ১:১ রেশিও দিন, 2MB এর কম।</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

/* ------------- UI bits ------------- */
function Header() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 via-emerald-900/0 to-emerald-950" />
      <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-14">
        <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-900/40 ring-1 ring-emerald-400/20 px-4 py-2 backdrop-blur">
          <div className="h-8 w-8 rounded-xl bg-emerald-700/40 ring-1 ring-emerald-300/30 grid place-items-center">
            <Settings className="h-4 w-4" />
          </div>
          <span className="tracking-wide text-emerald-200/90">প্রোফাইল সেটিংস</span>
        </div>
        <h1 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight">
          ক্লাসিক ইসলামী ছোঁয়ায় <span className="text-amber-300">আধুনিক</span> সেটিংস
        </h1>
        <p className="mt-3 max-w-2xl text-emerald-100/80 text-sm md:text-base leading-relaxed">
          তথ্য আপডেট করুন—অ্যাভাটার S3-এ সেভ হবে, বাকি তথ্য Supabase-এর <code className="px-1 rounded bg-black/30">profiles</code> টেবিলে।
        </p>
      </div>
    </section>
  )
}

function SecurityCard() {
  const [msg, setMsg] = React.useState<string | null>(null)
  const [err, setErr] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)

  async function onReset() {
    setBusy(true); setMsg(null); setErr(null)
    try {
      // server action–কে সরাসরি <form action> হিসেবে ব্যবহার করা সিম্পল,
      // তবে এখানে programmatic কল দেখানো হলো:
      const res = await sendResetAction()
      if (res.ok === true) {
  setMsg(res.message)
} else {
  setErr(res.error)
}
    } catch (e: any) {
      setErr(e?.message || 'রিসেট পাঠানো যায়নি')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-6 rounded-3xl bg-rose-900/20 ring-1 ring-rose-300/20 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4" /> সিকিউরিটি</h4>
          <p className="text-sm text-rose-100/80">পাসওয়ার্ড পরিবর্তন করতে রিসেট লিংক নিন।</p>
        </div>
        <button
          onClick={onReset}
          disabled={busy}
          className="rounded-xl bg-rose-400 text-rose-950 font-semibold px-4 py-2 hover:bg-rose-300 transition"
        >
          {busy ? 'পাঠানো হচ্ছে…' : 'রিসেট লিংক পাঠান'}
        </button>
      </div>
      {msg && <div className="mt-3 text-sm text-emerald-300">{msg}</div>}
      {err && <div className="mt-3 text-sm text-rose-300">{err}</div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm mb-2 block">{label}</span>
      {children}
    </label>
  )
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
function SubmitBtn() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-xl bg-amber-400 text-slate-900 font-semibold px-5 py-3 hover:translate-y-[-1px] hover:shadow-lg hover:bg-amber-300 active:translate-y-0 transition"
    >
      {pending ? 'সেভ হচ্ছে…' : 'সেভ করুন'}
    </button>
  )
}
