// lib/email.ts
import type { Options as SMTPOptions } from 'nodemailer/lib/smtp-transport'
import nodemailer from 'nodemailer'
import { Resend } from 'resend'

type MailInput = {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

/**
 * RESEND_API_KEY থাকলে Resend ব্যবহার হবে,
 * না থাকলে SMTP (SMTP_URL বা HOST/USER/PASS)
 * সবই না থাকলে কনসোলে লগ করে "ok: true" রিটার্ন (ডেভ মোড)
 */
export async function sendMail({ to, subject, html, text, from }: MailInput) {
  const defaultFrom = process.env.EMAIL_FROM || 'KhedmatBD <noreply@khedmatbd.com>'
  const toArr = Array.isArray(to) ? to : [to]

  // 1) Resend
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (RESEND_API_KEY) {
    const resend = new Resend(RESEND_API_KEY)
    const res = await resend.emails.send({
      from: from || defaultFrom,
      to: toArr,
      subject,
      html: html ?? undefined,
      text: text ?? undefined,
    })
    if (res.error) throw new Error(res.error.message)
    return { ok: true, id: res.data?.id }
  }

  // 2) SMTP
  const SMTP_URL = process.env.SMTP_URL
  const SMTP_HOST = process.env.SMTP_HOST
  const SMTP_PORT = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const SMTP_USER = process.env.SMTP_USER
  const SMTP_PASS = process.env.SMTP_PASS
  const SMTP_SECURE = process.env.SMTP_SECURE === 'true'

  let transport
  if (SMTP_URL) {
    transport = nodemailer.createTransport(SMTP_URL)
  } else if (SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_PORT) {
    transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    } as SMTPOptions)
  }

  if (transport) {
    const info = await transport.sendMail({
      from: from || defaultFrom,
      to: toArr.join(','),
      subject,
      html,
      text,
    })
    return { ok: true, id: info.messageId }
  }

  // 3) Fallback: dev log
  console.warn('sendMail fallback (no RESEND/SMTP configured):', {
    to, subject, preview: (html ?? text ?? '').slice(0, 200),
  })
  return { ok: true, id: 'dev-fallback' }
}
