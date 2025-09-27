// app/api/apply/route.ts
import { NextResponse } from 'next/server';
import { putFile, putJson } from '@/lib/storage';
import { sendMail } from '@/lib/email';

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const jobSlug = String(form.get('jobSlug') || '').trim();
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const coverLetter = String(form.get('coverLetter') || '').trim();
    const resume = form.get('resume') as File | null;

    if (!jobSlug || !name || !email || !resume) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate file
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowed.includes(resume.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }
    if (resume.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large' }, { status: 413 });
    }

    const arrayBuf = await resume.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;

    // Upload resume
    const ext =
      resume.type === 'application/pdf' ? 'pdf'
      : resume.type === 'application/msword' ? 'doc'
      : 'docx';

    const resumeKey = `resumes/${jobSlug}/${id}.${ext}`;
    await putFile(resumeKey, buffer, { contentType: resume.type });
    // Save submission JSON
    const submission = {
      id,
      jobSlug,
      name,
      email,
      coverLetter,
      resumeKey,
      submittedAt: new Date().toISOString()
    };
    const submissionKey = `submissions/${jobSlug}/${id}.json`;
    await putJson(submissionKey, submission);

    // Email notify (admin)
    const to = process.env.EMAIL_TO || 'admin@example.com';
    const from = process.env.EMAIL_FROM || 'KhedmatBD <noreply@khedmatbd.com>';
    const subject = `নতুন আবেদন (${jobSlug}) — ${name}`;
    const html = `
      <h2>নতুন আবেদন</h2>
      <p><b>খেদমত:</b> ${jobSlug}</p>
      <p><b>নাম:</b> ${name}</p>
      <p><b>ইমেইল:</b> ${email}</p>
      <p><b>আবেদন আইডি:</b> ${id}</p>
      <p><b>রিজিউম কী:</b> ${resumeKey}</p>
      <hr/>
      <pre style="white-space:pre-wrap">${coverLetter ? coverLetter.replace(/[<>&]/g, s => ({'<':'&lt;','>':'&gt;','&':'&amp;'} as any)[s]) : ''}</pre>
    `;
    await sendMail({ to, from, subject, html });

    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error('apply POST error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
