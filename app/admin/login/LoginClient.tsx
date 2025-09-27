'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginClient() {
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/dashboard/applications' // ডিফল্ট রাউট

  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const t = await res.json().catch(() => ({}))
        throw new Error(t?.error || 'লগইন ব্যর্থ')
      }
      // next কে Route হিসেবে নিশ্চিত করতে টাইপ কাস্টিং
      router.replace(next as any) // temporary fix, see solution 2 for better approach
      router.refresh()
    } catch (e: any) {
      setErr(e.message || 'লগইন ব্যর্থ')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.refresh();
  }

  return (
    <main className="min-h-[70vh] grid place-items-center bg-slate-50 dark:bg-slate-950 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border p-6 bg-white/80 dark:bg-slate-900/60">
        <h1 className="text-xl font-semibold">অ্যাডমিন লগইন</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">প্রোটেক্টেড এরিয়ায় যেতে পাসওয়ার্ড দিন।</p>

        <label className="block text-sm mt-4 mb-1">পাসওয়ার্ড</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-11 rounded-xl border px-3 bg-white/80 dark:bg-slate-900/60"
          placeholder="••••••••"
        />

        {err && <div className="text-sm text-red-600 mt-3">{err}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-4 w-full h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? 'লগইন হচ্ছে…' : 'লগইন'}
        </button>

        <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="mt-3 inline-block text-sm text-slate-600 hover:underline">
          লগআউট (কুকি ক্লিয়ার)
        </a>
      </form>
    </main>
  )
}