// middleware.ts
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(_req: NextRequest) {
  return NextResponse.next()
}

// _next assets/ইমেজ/ফ্যাভিকন বাদে সব রাউটে প্রযোজ্য
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
