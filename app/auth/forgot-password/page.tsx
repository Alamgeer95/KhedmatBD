'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setSending(true)
    try {
      const redirectTo = `${location.origin}/auth/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
      if (error) throw error
      setSent(true)
    } catch (e: any) {
      setErr(e?.message || 'কিছু ভুল হয়েছে')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">পাসওয়ার্ড রিসেট</h1>

      {sent ? (
        <p>ইমেইলে রিসেট লিংক পাঠানো হয়েছে।</p>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input
            className="w-full border p-2 rounded-xl"
            placeholder="আপনার ইমেইল"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {err && <p className="text-red-600 text-sm">{err}</p>}
          <button
            disabled={sending}
            className="w-full px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
          >
            {sending ? 'পাঠানো হচ্ছে…' : 'Send reset link'}
          </button>
        </form>
      )}
    </div>
  )
}
