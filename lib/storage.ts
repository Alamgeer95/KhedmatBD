// lib/storage.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  _Object,
} from '@aws-sdk/client-s3'
import { getSignedUrl as _getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { Readable } from 'stream'

type PutOptions = { contentType?: string }
type GetResult = { body: Buffer; contentType?: string | undefined }

function toBuffer(input: Buffer | Uint8Array | ArrayBuffer) {
  if (input instanceof Buffer) return input
  if (input instanceof Uint8Array) return Buffer.from(input)
  return Buffer.from(input as ArrayBuffer)
}

function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: any[] = []
    ;(stream as Readable)
      .on('data', (c) => chunks.push(c))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .on('error', reject)
  })
}

const s3 = new S3Client({
  region: process.env.S3_REGION || 'auto', // R2 → 'auto'
  endpoint: process.env.S3_ENDPOINT || undefined, // https://<ACCOUNT_ID>.r2.cloudflarestorage.com
  forcePathStyle: (process.env.S3_FORCE_PATH_STYLE || 'false') === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
})

function requireBucket(): string {
  const b = process.env.S3_BUCKET
  if (!b) throw new Error('Missing S3_BUCKET')
  return b
}

/* ---------- WRITE ---------- */
export async function putFile(
  key: string,
  body: Buffer | Uint8Array | ArrayBuffer,
  opts: PutOptions = {}
) {
  const Bucket = requireBucket()
  const res = await s3.send(
    new PutObjectCommand({
      Bucket,
      Key: key,
      Body: toBuffer(body),
      ContentType: opts.contentType,
      // R2-এ ACL ব্যবহার করবেন না
    })
  )
  return { url: `s3://${Bucket}/${key}`, etag: (res as any)?.ETag }
}

export async function putJson(key: string, data: unknown) {
  const buf = Buffer.from(JSON.stringify(data))
  return putFile(key, buf, { contentType: 'application/json' })
}

/* ---------- READ ---------- */
export async function getObject(key: string): Promise<GetResult> {
  const Bucket = requireBucket()
  const res = await s3.send(new GetObjectCommand({ Bucket, Key: key }))
  const body = await streamToBuffer(res.Body as any)
  const contentType = res.ContentType
  return { body, contentType }
}
export const getFile = getObject

export async function getJson<T = any>(key: string): Promise<T> {
  const { body } = await getObject(key)
  return JSON.parse(body.toString('utf8')) as T
}

/** অ্যালিয়াস: getObjectText */
export async function getObjectText(key: string, encoding: BufferEncoding = 'utf8') {
  const { body } = await getObject(key)
  return body.toString(encoding)
}

/* ---------- LIST ---------- */
export async function listObjects(prefix: string): Promise<string[]> {
  const Bucket = requireBucket()
  let ContinuationToken: string | undefined
  const keys: string[] = []

  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken })
    )
    ;(res.Contents as _Object[] | undefined)?.forEach((o) => {
      if (o.Key) keys.push(o.Key)
    })
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (ContinuationToken)

  return keys
}
export const list = listObjects
/** অ্যালিয়াস: listPrefix */
export const listPrefix = listObjects

/* ---------- SIGNED URL ---------- */
export async function getSignedReadUrl(key: string, expiresInSeconds = 600) {
  const Bucket = requireBucket()
  const cmd = new GetObjectCommand({ Bucket, Key: key })
  return _getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds })
}
export const getSignedUrl = getSignedReadUrl
/** অ্যালিয়াস: getSignedUrlFor */
export const getSignedUrlFor = getSignedReadUrl
