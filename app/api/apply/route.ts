// /app/api/apply/route.ts
import { NextResponse } from 'next/server'
import { putFile } from '@/lib/storage'
import { rateLimit } from '@/lib/ratelimit'
import { sendMail } from '@/lib/email'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function safeName(name: string) {
  return name
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '_')
    .slice(0, 60)
}

function guessMime(file: File): string {
  if (file.type) return file.type
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  if (ext === 'pdf') return 'application/pdf'
  if (ext === 'doc') return 'application/msword'
  if (ext === 'docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  return 'application/octet-stream'
}

function errJson(status: number) {
  return NextResponse.json(
    { error: 'Server error', hint: 'Contact support if this persists' },
    { status }
  )
}

export async function POST(req: Request) {
  let stage: string = 'parse'
  try {
    // 0) rate limit
    await rateLimit('apply')
    // 1) parse
    const form = await req.formData()
    const name = String(form.get('name') || '').trim()
    const email = String(form.get('email') || '').trim()
    const cover = String(form.get('cover') || '').trim()
    const slug = String(form.get('slug') || '').trim()
    const resume = form.get('resume')

    if (!name || !email || !slug || !(resume instanceof File)) {
      console.error('[apply]', { stage, reason: 'missing-fields' })
      return errJson(400)
    }

    // 2) size limit
    stage = 'limit'
    if (resume.size > 5 * 1024 * 1024) {
      console.error('[apply]', { stage, reason: 'too-large', size: resume.size })
      return NextResponse.json({ error: 'ফাইলটি ৫MB-এর বেশি' }, { status: 400 })
    }

    // 3) mime allowlist
    stage = 'mime'
    const contentType = guessMime(resume)
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!allowed.includes(contentType)) {
      console.error('[apply]', { stage, reason: 'bad-mime', contentType })
      return NextResponse.json({ error: 'শুধু PDF/DOC/DOCX দিন' }, { status: 400 })
    }

    // 4) upload to S3
    stage = 's3'
    const key = `applications/${slug}/${Date.now()}-${safeName(resume.name)}`
    await putFile(key, resume, { contentType })

    // 5) notify by email (optional – ফেইলে গেলে ফর্ম ফেল করাবেন কি না আপনি ঠিক করুন)
    stage = 'email'
    try {
      await sendMail({
        to: process.env.ADMIN_EMAIL || 'admin@example.com',
        subject: `New application for ${slug}`,
        text: `Name: ${name}\nEmail: ${email}\nCover:\n${cover}\n\nFile: s3://${process.env.S3_BUCKET}/${key}`,
      })
    } catch (e) {
      // ইমেইল ফেল করলে লগ করুন কিন্তু ইউজারকে ফেল দেখাবেন কি না—এখানে সফলই রাখলাম
      console.error('[apply]', { stage, emailError: String((e as any)?.message || e) })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[apply]', { stage, error: String((e as any)?.message || e) })
    return errJson(500)
  }
}
