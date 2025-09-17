// app/api/apply/route.ts
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { putJson, putFile } from '@/lib/storage';
import { sendMail } from '@/lib/email';
import { rateLimit } from '@/lib/ratelimit';

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(req: Request) {
  // simple rate-limit: 5 req / 60s per IP
  const ip = req.headers.get('x-forwarded-for') || 'local';
  if (!rateLimit(`apply:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const jobSlug = (formData.get('jobSlug') as string || '').trim();
    const name = (formData.get('name') as string || '').trim();
    const email = (formData.get('email') as string || '').trim();
    const coverLetter = (formData.get('coverLetter') as string || '').trim();
    const resumeFile = formData.get('resume') as File | null;

    if (!jobSlug || !name || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const id = randomUUID();
    let resumeKey: string | null = null;

    if (resumeFile && resumeFile.size > 0) {
      if (resumeFile.size > MAX_BYTES) {
        return NextResponse.json({ error: 'File too large (max 8MB)' }, { status: 400 });
      }
      const type = resumeFile.type || '';
      if (!ALLOWED.includes(type)) {
        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
      }

      const buf = Buffer.from(await resumeFile.arrayBuffer());
      const safeName = resumeFile.name.replace(/[^\w.\-]+/g, '_');
      resumeKey = `resumes/${jobSlug}/${id}-${safeName}`;
      await putFile(resumeKey, buf, { contentType: type });
    }

    const submission = {
      id,
      jobSlug,
      name,
      email,
      coverLetter,
      resumeKey,
      status: 'new' as const,
      submittedAt: new Date().toISOString(),
    };

    const submissionKey = `submissions/${jobSlug}/${id}.json`;
    await putJson(submissionKey, submission);

    // notify admin (best-effort)
    try {
      await sendMail({
        to: process.env.ADMIN_EMAIL || 'admin@example.com',
        from: process.env.EMAIL_FROM || 'KhedmatBD <noreply@khedmatbd.com>',
        subject: `New Application — ${jobSlug}`,
        html: `<p><b>${name}</b> (${email}) applied to <b>${jobSlug}</b>.</p>`,
      });
    } catch (e) {
      console.error('Admin mail failed', e);
    }

    // ack applicant (best-effort)
    try {
      await sendMail({
        to: email,
        from: process.env.EMAIL_FROM || 'KhedmatBD <noreply@khedmatbd.com>',
        subject: `আপনার আবেদন গ্রহণ করা হয়েছে — ${jobSlug}`,
        html: `<p>আসসালামু আলাইকুম <b>${name}</b>,</p>
               <p>আপনার আবেদন আমরা পেয়েছি। রেফারেন্স আইডি: <code>${id}</code></p>
               <p>KhedmatBD টিম</p>`,
      });
    } catch (e) {
      console.error('Ack mail failed', e);
    }

    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error('apply POST error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
