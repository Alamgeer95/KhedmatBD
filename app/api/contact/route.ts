// app/api/contact/route.ts

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'


import { NextResponse } from 'next/server';
import { sendMail } from '@/lib/email';
import { rateLimit } from '@/lib/ratelimit';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!rateLimit(`contact:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    const to = process.env.EMAIL_TO || 'admin@example.com';
    const from = process.env.EMAIL_FROM || 'KhedmatBD <noreply@khedmatbd.com>';
    await sendMail({
      to, from,
      subject: `যোগাযোগ ফর্ম — ${name}`,
      html: `<p><b>নাম:</b> ${name}</p><p><b>ইমেইল:</b> ${email}</p><hr/>
             <pre style="white-space:pre-wrap">${String(message).replace(/[<>&]/g,(s)=>({ '<':'&lt;','>':'&gt;','&':'&amp;' } as any)[s])}</pre>`
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('contact POST', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
