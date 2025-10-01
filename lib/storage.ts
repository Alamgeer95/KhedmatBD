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
type Listed = { Key: string; Size?: number; LastModified?: Date }

function toBuffer(input: Buffer | Uint8Array | ArrayBuffer) {
  if (input instanceof Buffer) return input
  if (input instanceof Uint8Array) return Buffer.from(input)
  return Buffer.from(input)
}

function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (c: Buffer) => chunks.push(c))
      .on('end', () => resolve(Buffer.concat(chunks)))
      .on('error', reject)
  })
}

const s3 = new S3Client({
  region: process.env.S3_REGION || 'auto',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: (process.env.S3_FORCE_PATH_STYLE || 'false') === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
})

function requireBucket(): string {
  const b = process.env.S3_BUCKET
  if (!b) throw new Error('Missing S3_BUCKET environment variable')
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
    })
  )
  return { url: `s3://${Bucket}/${key}`, etag: res.ETag }
}

export async function putJson(key: string, data: unknown) {
  const buf = Buffer.from(JSON.stringify(data))
  return putFile(key, buf, { contentType: 'application/json' })
}

/* ---------- READ ---------- */
export async function getObject(key: string): Promise<GetResult> {
  const Bucket = requireBucket()
  const res = await s3.send(new GetObjectCommand({ Bucket, Key: key }))
  const body = await streamToBuffer(res.Body as Readable)
  const contentType = res.ContentType
  return { body, contentType }
}
export const getFile = getObject

export async function getJson<T = any>(key: string): Promise<T> {
  const { body } = await getObject(key)
  return JSON.parse(body.toString('utf8')) as T
}

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

export async function listObjectsWithMeta(prefix: string): Promise<Listed[]> {
  const Bucket = requireBucket()
  let ContinuationToken: string | undefined
  const out: Listed[] = []

  do {
    const res = await s3.send(
      new ListObjectsV2Command({ Bucket, Prefix: prefix, ContinuationToken })
    )
    ;(res.Contents as _Object[] | undefined)?.forEach((o) => {
      if (o.Key) out.push({ Key: o.Key!, Size: o.Size, LastModified: o.LastModified })
    })
    ContinuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (ContinuationToken)

  return out
}

export const list = listObjects
export const listPrefix = listObjectsWithMeta

/* ---------- SIGNED URL ---------- */
export async function getSignedReadUrl(key: string, expiresInSeconds = 600) {
  const Bucket = requireBucket()
  const cmd = new GetObjectCommand({ Bucket, Key: key })
  return _getSignedUrl(s3, cmd, { expiresIn: expiresInSeconds })
}
export const getSignedUrl = getSignedReadUrl
export const getSignedUrlFor = getSignedReadUrl