// app/settings/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { putFile, getSignedUrlFor } from '@/lib/storage'

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

export type ActionState =
  | { ok: true; message: string; signedAvatar?: string | null }
  | { ok: false; error: string }

// ----- helpers -----
function languagesToJSON(input: string): Record<string, boolean> | null {
  const trimmed = (input || '').trim()
  if (!trimmed) return null
  const obj: Record<string, boolean> = {}
  trimmed
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .forEach(l => (obj[l] = true))
  return Object.keys(obj).length ? obj : null
}

function extFromMime(m?: string) {
  if (!m) return ''
  if (m === 'image/png') return '.png'
  if (m === 'image/jpeg') return '.jpg'
  if (m === 'image/webp') return '.webp'
  return ''
}

// ----- actions -----
export async function saveSettingsAction(
  _prev: ActionState | null,
  form: FormData
): Promise<ActionState> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { ok: false, error: 'লগইন প্রয়োজন' }

    const full_name   = (form.get('full_name') as string || '').trim() || null
    const headline    = (form.get('headline') as string || '').trim() || null
    const location    = (form.get('location') as string || '').trim() || null
    const about       = (form.get('about') as string || '').trim() || null
    const role        = (form.get('role') as string || '').trim() as Role
    const visibility  = (form.get('visibility') as string || '').trim() as Visibility
    const langs       = (form.get('languages') as string || '').trim()
    const languages   = languagesToJSON(langs)

    const avatarFile  = form.get('avatar') as File | null

    let avatar_key: string | undefined
    let avatar_url: string | undefined

    if (avatarFile && avatarFile.size > 0) {
      if (avatarFile.size > 2 * 1024 * 1024) {
        return { ok: false, error: 'অ্যাভাটার 2MB-এর কম দিন' }
      }
      const ext = extFromMime(avatarFile.type) || '.bin'
      const key = `avatars/${user.id}${ext}`
      const arrayBuffer = await avatarFile.arrayBuffer();
      await putFile(key, arrayBuffer, { contentType: avatarFile.type || 'application/octet-stream' })
      avatar_key = key

      try {
        avatar_url = await getSignedUrlFor(key, 60 * 60) // 1h
      } catch {
        avatar_url = null
      }
    }

    const payload: Partial<ProfileRow> = {
      id: user.id,
      full_name, headline, location, about,
      role: role || null,
      languages,
      visibility: visibility || null,
      ...(avatar_key !== undefined ? { avatar_key } : {}),
      ...(avatar_url !== undefined ? { avatar_url } : {}),
    }

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
    if (error) return { ok: false, error: error.message }

    revalidatePath('/profile')
    revalidatePath('/settings')

    return { ok: true, message: 'সেটিংস সেভ হয়েছে', signedAvatar: avatar_url ?? null }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'সেভ করতে সমস্যা হয়েছে' }
  }
}

export async function sendResetAction(): Promise<ActionState> {
  const supabase = createClient()
  const { data: { user} } = await supabase.auth.getUser()
  if (!user?.email) return { ok: false, error: 'ইমেইল পাওয়া যায়নি' }

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectTo = `${site}/auth/reset-password`
  const { error } = await supabase.auth.resetPasswordForEmail(user.email, { redirectTo })
  if (error) return { ok: false, error: error.message }
  return { ok: true, message: 'রিসেট লিংক ইমেইলে পাঠানো হয়েছে' }
}
