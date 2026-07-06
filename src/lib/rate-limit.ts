import 'server-only'
import { NextRequest, NextResponse } from 'next/server'

interface Bucket {
  count: number
  resetAt: number
}

interface RateLimitOptions {
  keyPrefix: string
  limit: number
  windowMs: number
}

const buckets = new Map<string, Bucket>()

export function rateLimit(req: NextRequest, options: RateLimitOptions): NextResponse | null {
  const key = `${options.keyPrefix}:${clientIp(req)}`
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs })
    return null
  }

  bucket.count += 1
  if (bucket.count <= options.limit) return null

  const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfter) },
    },
  )
}

function clientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for')
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown'

  return req.headers.get('x-real-ip') ?? 'unknown'
}
