// lib/storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

type PutOptions = { contentType?: string }

function toBuffer(input: Buffer | Uint8Array | ArrayBuffer) {
  if (input instanceof Buffer) return input
  if (input instanceof Uint8Array) return Buffer.from(input)
  return Buffer.from(input as ArrayBuffer)
}

const s3 = new S3Client({
  // R2-এর জন্য region 'auto' রাখুন
  region: process.env.S3_REGION || 'auto',
  // উদাহরণ: https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  endpoint: process.env.S3_ENDPOINT || undefined,
  // R2-তে সাধারণত path-style দরকার হয় না; তবু env দিয়ে কন্ট্রোল রাখলাম
  forcePathStyle: (process.env.S3_FORCE_PATH_STYLE || 'false') === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
})

export async function putFile(
  key: string,
  body: Buffer | Uint8Array | ArrayBuffer,
  opts: PutOptions = {}
) {
  const Bucket = process.env.S3_BUCKET
  if (!Bucket) throw new Error('Missing S3_BUCKET')

  // ⚠️ R2-তে ACL ব্যবহার করবেন না
  const res = await s3.send(new PutObjectCommand({
    Bucket,
    Key: key,
    Body: toBuffer(body),
    ContentType: opts.contentType,
  }))

  return { url: `s3://${Bucket}/${key}`, etag: (res as any)?.ETag }
}

export async function putJson(key: string, data: unknown) {
  const buf = Buffer.from(JSON.stringify(data))
  return putFile(key, buf, { contentType: 'application/json' })
}
