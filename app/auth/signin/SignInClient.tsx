'use client'

import Link from 'next/link'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FaGoogle, FaFacebook, FaMicrosoft, FaApple } from 'react-icons/fa6'

const supabase = createClient() // ✅ একবারই

export default function SignInClient() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.href = '/dashboard'
    } catch (err: any) {
      alert(err?.message || 'Sign in failed')
    } finally {
      setBusy(false)
    }
  }

  async function social(provider: 'google' | 'facebook' | 'azure' | 'apple') {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${location.origin}/auth/callback` },
      })
      if (error) throw error
    } catch (err: any) {
      alert(err?.message || 'Social sign-in failed')
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">লগইন</h1>

      <form onSubmit={onSubmit} className="space-y-3">
        <input
          className="w-full border p-2 rounded-xl"
          placeholder="ইমেইল"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border p-2 rounded-xl"
          placeholder="পাসওয়ার্ড"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          disabled={busy}
          className="w-full px-4 py-2 rounded-xl bg-black text-white disabled:opacity-60"
        >
          {busy ? 'সাইন ইন হচ্ছে...' : 'Sign in'}
        </button>
      </form>

      <div className="flex items-center justify-between text-sm mt-3">
        <Link href="/auth/forgot-password" className="underline">
          Forgot password?
        </Link>
        <Link href="/auth/signup" className="underline">
          নতুন একাউন্ট
        </Link>
      </div>

      <div className="mt-6 space-y-2">
        <div className="text-center opacity-70 text-sm">অথবা সাইন ইন করুন</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => social('google')}
            className="border rounded-xl p-2 flex items-center justify-center gap-2"
          >
            <FaGoogle /> Google
          </button>
          <button
            onClick={() => social('facebook')}
            className="border rounded-xl p-2 flex items-center justify-center gap-2"
          >
            <FaFacebook /> Facebook
          </button>
          <button
            onClick={() => social('azure')}
            className="border rounded-xl p-2 flex items-center justify-center gap-2"
          >
            <FaMicrosoft /> Microsoft
          </button>
          <button
            onClick={() => social('apple')}
            className="border rounded-xl p-2 flex items-center justify-center gap-2"
          >
            <FaApple /> Apple
          </button>
        </div>
      </div>
    </div>
  )
}
