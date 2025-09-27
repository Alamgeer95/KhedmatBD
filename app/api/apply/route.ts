import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { putFile as putJson } from '@/lib/storage';
import { sendMail } from '@/lib/email'
import { rateLimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
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

export async function POST(req: Request) {
  // 0) rate limit: 5 req / 60s per IP
  const ip = getClientIp(req)
  const ok = await rateLimit(`apply:${ip}`, 5, 60_000)
  if (!ok) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const formData = await req.formData()

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

    // MIME check: file.type; না মিললে extension sniff
    let mime = resumeFile.type || ''
    if (!ALLOWED.has(mime)) {
      const sniffed = sniffMimeByExt(resumeFile.name)
      if (sniffed && ALLOWED.has(sniffed)) mime = sniffed
      else return NextResponse.json({ error: 'Unsupported file type (PDF/DOC/DOCX only)' }, { status: 400 })
    }

    // Storage keys
    const id = randomUUID()
    const safeName = resumeFile.name.replace(/[^\w.\-]+/g, '_')
    const resumeKey = `resumes/${jobSlug}/${id}-${safeName}`

    // Upload to R2
    const buf = Buffer.from(await resumeFile.arrayBuffer())
    await putFile(resumeKey, buf, { contentType: mime })

    // Persist submission
    const submission = {
      id,
      jobSlug,
      name,
      email,
      coverLetter,
      resumeKey,
      status: 'new' as const,
      submittedAt: new Date().toISOString(),
      ip,
    }
    const submissionKey = `submissions/${jobSlug}/${id}.json`
    await putJson(submissionKey, submission)

    // Best-effort admin mail
    ;(async () => {
      try {
        await sendMail({
          to: process.env.ADMIN_EMAIL || 'admin@example.com',
          from: process.env.EMAIL_FROM || 'KhedmatBD <noreply@khedmatbd.com>',
          subject: `New Application — ${jobSlug}`,
          html: `<p><b>${name}</b> (${email}) applied to <b>${jobSlug}</b>.</p>
                 <p>Resume: <code>${resumeKey}</code></p>
                 <p>ID: <code>${id}</code></p>`,
        })
      } catch (e) {
        console.error('Admin mail failed', e)
      }
    })()

    // Best-effort applicant ack
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
    console.error('Apply error:', err?.message || err, err?.stack)
    return NextResponse.json(
      { error: 'Server error', hint: 'Contact support if this persists' },
      { status: 500 }
    )
  }
}
