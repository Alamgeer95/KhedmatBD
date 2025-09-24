// app/api/apply/route.ts
import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { putJson, putFile } from '@/lib/storage'
import { sendMail } from '@/lib/email'
import { rateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set<string>([
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

function getClientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  const xri = req.headers.get('x-real-ip')
  return (xff?.split(',')[0] || xri || 'local').trim() || 'local'
}

// লোকাল/প্রিভিউতে বিস্তারিত error দেখাই, প্রডে নয়
function devDetail(err: unknown) {
  if (process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production') return undefined
  if (err && typeof err === 'object') {
    const any = err as any
    return {
      message: String(any?.message ?? any),
      code: any?.code,
      stack: any?.stack?.split('\n').slice(0, 3).join('\n'),
    }
  }
  return String(err)
}

export async function POST(req: Request) {
  // 0) rate limit
  try {
    const ip = getClientIp(req)
    const ok = await rateLimit(`apply:${ip}`, 5, 60_000)
    if (!ok) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
  } catch (e) {
    console.error('RATE_LIMIT_FAILED', e)
    return NextResponse.json({ error: 'Server error (rate-limit)', detail: devDetail(e) }, { status: 500 })
  }

  // 1) formData
  let formData: FormData
  try {
    formData = await req.formData()
  } catch (e) {
    console.error('FORMDATA_PARSE_FAILED', e)
    return NextResponse.json({ error: 'Server error (form-parse)', detail: devDetail(e) }, { status: 500 })
  }

  const jobSlug = (formData.get('jobSlug') as string | null)?.trim() || ''
  const name = (formData.get('name') as string | null)?.trim() || ''
  const email = (formData.get('email') as string | null)?.trim() || ''
  const coverLetter = (formData.get('coverLetter') as string | null)?.trim() || ''
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

  // 2) MIME check
  let mime = resumeFile.type || ''
  if (!ALLOWED.has(mime)) {
    const sniffed = sniffMimeByExt(resumeFile.name)
    if (sniffed && ALLOWED.has(sniffed)) mime = sniffed
    else return NextResponse.json({ error: 'Unsupported file type (PDF/DOC/DOCX only)' }, { status: 400 })
  }

  // 3) IDs/keys
  const id = randomUUID()
  const safeName = resumeFile.name.replace(/[^\w.\-]+/g, '_')
  const resumeKey = `resumes/${jobSlug}/${id}-${safeName}`

  // 4) upload file
  try {
    const buf = Buffer.from(await resumeFile.arrayBuffer())
    await putFile(resumeKey, buf, { contentType: mime })
  } catch (e) {
    console.error('UPLOAD_FAILED', { key: resumeKey, mime }, e)
    return NextResponse.json({ error: 'Server error (upload-failed)', detail: devDetail(e) }, { status: 500 })
  }

  // 5) persist submission
  const submission = {
    id, jobSlug, name, email, coverLetter, resumeKey,
    status: 'new' as const,
    submittedAt: new Date().toISOString(),
  }
  const submissionKey = `submissions/${jobSlug}/${id}.json`
  try {
    await putJson(submissionKey, submission)
  } catch (e) {
    console.error('SAVE_JSON_FAILED', { key: submissionKey }, e)
    return NextResponse.json({ error: 'Server error (save-json)', detail: devDetail(e) }, { status: 500 })
  }

  // 6) best-effort mails
  ;(async () => {
    try {
      await sendMail({
        to: process.env.ADMIN_EMAIL || 'admin@example.com',
        from: process.env.EMAIL_FROM || 'KhedmatBD <noreply@khedmatbd.com>',
        subject: `New Application — ${jobSlug}`,
        html: `<p><b>${name}</b> (${email}) applied to <b>${jobSlug}</b>.</p><p>Resume: <code>${resumeKey}</code></p><p>ID: <code>${id}</code></p>`,
      })
    } catch (e) {
      console.error('ADMIN_MAIL_FAILED', e)
    }
  })()

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
      console.error('ACK_MAIL_FAILED', e)
    }
  })()

  return NextResponse.json({ ok: true, id })
}
