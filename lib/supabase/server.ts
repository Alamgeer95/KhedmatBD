// lib/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/** Server/SSR/Route Handler থেকে ব্যবহার করুন: const supabase = createClient() */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }

  // Next 15 এ কিছু কনটেক্সটে cookies() Promise টাইপ দেখায়—assert করে কনক্রিট স্টোর নিচ্ছি
  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        const store = cookies() as unknown as {
          get: (n: string) => { value?: string } | undefined
        }
        return store.get(name)?.value
      },
      set(name: string, value: string, options?: CookieOptions) {
        const store = cookies() as unknown as {
          set: (n: string, v: string, o?: CookieOptions) => void
        }
        store.set(name, value, options)
      },
      remove(name: string, options?: CookieOptions) {
        const store = cookies() as unknown as {
          delete: (n: string, o?: CookieOptions) => void
        }
        store.delete(name, options)
      },
    },
  })
}
