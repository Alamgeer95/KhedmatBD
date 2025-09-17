// lib/ratelimit.ts

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()
let lastSweep = Date.now()

/**
 * খুব সিম্পল fixed-window রেট-লিমিট
 * @param key      ইউনিক কী (যেমন: "apply:IP")
 * @param limit    উইন্ডোতে সর্বোচ্চ সংখ্যা
 * @param windowMs উইন্ডোর সময় (মিলিসেকেন্ড)
 * @returns        true = allow, false = block
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const b = buckets.get(key)

  // periodic sweep (মেমরি ক্লিন)
  if (now - lastSweep > 60_000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k)
    lastSweep = now
  }

  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (b.count >= limit) return false
  b.count += 1
  return true
}
