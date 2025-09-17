import { Suspense } from 'react'
import LoginClient from './LoginClient'

export const dynamic = 'force-dynamic' // auth page prerender এড়াই

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm">লোড হচ্ছে…</div>}>
      <LoginClient />
    </Suspense>
  )
}
