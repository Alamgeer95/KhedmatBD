// app/auth/reset-password/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setDone(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null); setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
    } catch (e: any) {
      setErr(e?.message || 'রিসেট ব্যর্থ')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-3">পাসওয়ার্ড রিসেট</h1>
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New Password"
        className="w-full border p-2 rounded-xl"
      />
      {err && <p className="text-sm text-red-600 mt-2">{err}</p>}
      <button
        type="submit"
        disabled={saving || done}
        className="mt-3 w-full h-11 rounded-xl bg-emerald-600 text-white disabled:opacity-60"
      >
        {done ? 'Done' : saving ? 'Updating…' : 'Reset Password'}
      </button>
    </form>
  )
}
