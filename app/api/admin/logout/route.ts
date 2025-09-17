// app/api/admin/logout/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const base = `${url.protocol}//${url.host}`;
  const res = NextResponse.redirect(`${base}/admin/login`);

  // ✅ delete একটাই আর্গুমেন্ট নেয় — options অবজেক্টে name + path দিন
  res.cookies.delete({ name: 'admin_session', path: '/' });

  return res;
}
