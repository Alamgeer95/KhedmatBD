// app/api/apply/route.ts
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { putJson, putFile } from '@/lib/storage'
import { sendMail } from '@/lib/email'
import { rateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 5 * 1024 * 1024 // UI-র সাথে মিল রাখতে 5MB
const ALLOWED = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

function sniffMimeByExt(filename: string): string | undefined {
  const n = filename.toLowerCase()
  if (n.endsWith('.pdf')) return 'application/pdf'
  if (n.endsWith('.doc')) return 'application/msword'
  if (n.endsWith('.docx')) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  return undefined
}

export async function POST(req: Request) {
  // rate limit: 5 req / 60s per IP
  const ip = req.headers.get('x-forwarded-for') || 'local'
  if (!rateLimit(`apply:${ip}`, 5, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const formData = await req.formData()

    const jobSlug = (formData.get('jobSlug') as string || '').trim()
    const name = (formData.get('name') as string || '').trim()
    const email = (formData.get('email') as string || '').trim()
    const coverLetter = (formData.get('coverLetter') as string || '').trim()
    const resumeFile = formData.get('resume') as File | null

    if (!jobSlug || !name || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    if (!resumeFile || resumeFile.size === 0) {
      return NextResponse.json({ error: 'Resume required' }, { status: 400 })
    }
    if (resumeFile.size > MAX_BYTES) {
      return NextResponse.json({ error: 'File too large (max 5MB)' }, { status: 400 })
    }

    // --- MIME check: প্রথমে .type, না পেলে/না মিললে extension sniff ---
    let mime = resumeFile.type || ''
    if (!ALLOWED.has(mime)) {
      const sniffed = sniffMimeByExt(resumeFile.name)
      if (sniffed && ALLOWED.has(sniffed)) {
        mime = sniffed
      } else {
        return NextResponse.json({ error: 'Unsupported file type (PDF/DOC/DOCX only)' }, { status: 400 })
      }
    }

    const id = randomUUID()
    const safeName = resumeFile.name.replace(/[^\w.\-]+/g, '_')
    const resumeKey = `resumes/${jobSlug}/${id}-${safeName}`

    // আপলোড
    const buf = Buffer.from(await resumeFile.arrayBuffer())
    await putFile(resumeKey, buf, { contentType: mime })

    // সাবমিশন JSON রেখে দিন
    const submission = {
      id,
      jobSlug,
      name,
      email,
      coverLetter,
      resumeKey,
      status: 'new',
      submittedAt: new Date().toISOString(),
    }
    const submissionKey = `submissions/${jobSlug}/${id}.json`
    await putJson(submissionKey, submission)

    // Admin notify (fail করলেও অ্যাপ্লিকেশন সফল থাকবে)
    ;(async () => {
      try {
        await sendMail({
          to: process.env.ADMIN_EMAIL || 'admin@example.com',
          from: process.env.EMAIL_FROM || 'KhedmatBD <noreply@khedmatbd.com>',
          subject: `New Application — ${jobSlug}`,
          html: `<p><b>${name}</b> (${email}) applied to <b>${jobSlug}</b>.</p>`,
        })
      } catch (e) {
        console.error('Admin mail failed', e)
      }
    })()

    // Applicant ack (best-effort)
    ;(async () => {
      try {
        await sendMail({
          to: email,
          from: process.env.EMAIL_FROM || 'KhedmatBD <noreply@khedmatbd.com>',
          subject: `আপনার আবেদন গ্রহণ করা হয়েছে — ${jobSlug}`,
          html: `<p>আসসালামু আলাইকুম <b>${name}</b>,</p>
                 <p>আপনার আবেদন আমরা পেয়েছি। রেফারেন্স আইডি: <code>${id}</code></p>
                 <p>KhedmatBD টিম</p>`,
        })
      } catch (e) {
        console.error('Ack mail failed', e)
      }
    })()

    return NextResponse.json({ ok: true, id })
  } catch (err: any) {
    // লগে ডিটেইল দেখুন (Vercel → Deployments → Logs → Functions)
    console.error('Apply error:', err?.message || err, err?.stack)
    // ইউজারকে পরিষ্কার উত্তর
    return NextResponse.json(
      { error: 'Server error', hint: 'Contact support if this persists' },
      { status: 500 }
    )
  }
}
