// lib/storage.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const {
  S3_ENDPOINT,
  S3_REGION = 'auto',
  S3_BUCKET,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
} = process.env as Record<string, string | undefined>

if (!S3_BUCKET) {
  console.warn('⚠️ S3_BUCKET not set. Uploads will fail until configured.')
}

const s3 = new S3Client({
  region: S3_REGION,
  endpoint: S3_ENDPOINT,
  credentials:
    S3_ACCESS_KEY_ID && S3_SECRET_ACCESS_KEY
      ? { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY }
      : undefined,
  // অনেক S3-compatible (R2/MinIO) এ path-style দরকার হয়
  forcePathStyle: !!S3_ENDPOINT,
})

export async function uploadBuffer(key: string, body: Buffer, contentType: string) {
  if (!S3_BUCKET) throw new Error('S3_BUCKET missing')
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
<<<<<<< HEAD
=======
      
>>>>>>> f2f0c39 (feat: multiple page updates)
      
    }),
  )
  return { key }
}

export async function putJson(key: string, data: any) {
  const buf = Buffer.from(JSON.stringify(data, null, 2))
  return uploadBuffer(key, buf, 'application/json')
}

export async function listPrefix(prefix: string) {
  if (!S3_BUCKET) throw new Error('S3_BUCKET missing')
  const out = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, Prefix: prefix }))
  return out.Contents || []
}

export async function getObjectText(key: string) {
  if (!S3_BUCKET) throw new Error('S3_BUCKET missing')
  const res = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }))
  const body = await (res.Body as any)?.transformToString?.('utf-8')
  return body ?? ''
}

export async function getSignedUrlFor(key: string, expiresInSec = 60 * 5) {
  if (!S3_BUCKET) throw new Error('S3_BUCKET missing')
  const cmd = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key })
  return getSignedUrl(s3, cmd, { expiresIn: expiresInSec })
}

// ---------- putFile ----------
export type PutFileInput =
  | File
  | Blob
  | ArrayBuffer
  | Buffer
  | NodeJS.ReadableStream

export type PutFileOptions = {
  /** override contentType; File/Blob হলে default নেয়া হবে */
  contentType?: string
}

/** Blob/File/Buffer/ArrayBuffer/Stream ➜ Buffer */
async function toBuffer(
  data: PutFileInput
): Promise<{ buf: Buffer; contentType?: string }> {
  // Browser: File/Blob
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    const arrayBuffer = await data.arrayBuffer()
    const t = (data as Blob).type
    const contentType = t && t.length > 0 ? t : undefined
    return { buf: Buffer.from(arrayBuffer), contentType }
  }

  // Node Buffer
  if (typeof Buffer !== 'undefined' && Buffer.isBuffer(data)) {
    return { buf: data }
  }

  // ArrayBuffer
  if (data instanceof ArrayBuffer) {
    return { buf: Buffer.from(data) }
  }

  // Node Readable stream
  if (typeof (data as any)?.pipe === 'function') {
    const stream = data as NodeJS.ReadableStream
    const chunks: Buffer[] = []
    await new Promise<void>((resolve, reject) => {
      stream
        .on('data', (chunk: any) => {
          if (typeof chunk === 'string') chunks.push(Buffer.from(chunk))
          else if (chunk instanceof ArrayBuffer) chunks.push(Buffer.from(chunk))
          else chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        })
        .on('end', resolve)
        .on('error', reject)
    })
    return { buf: Buffer.concat(chunks) }
  }

  throw new Error('Unsupported data type for putFile')
}

/** S3 তে ফাইল আপলোড */
export async function putFile(
  key: string,
  data: PutFileInput,
  opts: PutFileOptions = {}
) {
  const { buf, contentType: fromData } = await toBuffer(data)
  const contentType = opts.contentType || fromData || 'application/octet-stream'
  return uploadBuffer(key, buf, contentType)
}
