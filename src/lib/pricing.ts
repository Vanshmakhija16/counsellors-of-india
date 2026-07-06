import 'server-only'

type JsonRecord = Record<string, unknown>

export const PLAN_RANK: Record<string, number> = {
  free: 0,
  starter: 1,
  growth: 1,
  pro: 2,
}

const DEFAULT_DEV_PLAN_PRICES: Record<string, number> = {
  starter: 1499,
  // growth: 999,
  pro: 2499,
}

const PLAN_PRICE_ENV: Record<string, string | undefined> = {
  starter: process.env.PLAN_PRICE_STARTER_INR,
  growth: process.env.PLAN_PRICE_GROWTH_INR,
  pro: process.env.PLAN_PRICE_PRO_INR,
}

export function normalizePlan(plan: unknown): 'starter' | 'growth' | 'pro' | null {
  if (plan === 'starter' || plan === 'growth' || plan === 'pro') return plan
  return null
}

export function getPlanPriceInr(plan: 'starter' | 'growth' | 'pro'): number {
  const configured = Number(PLAN_PRICE_ENV[plan])
  if (Number.isFinite(configured) && configured > 0) return configured

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`Missing production price for ${plan}. Set PLAN_PRICE_${plan.toUpperCase()}_INR.`)
  }

  return DEFAULT_DEV_PLAN_PRICES[plan]
}

export function highestPlan(currentPlan: string | null | undefined, targetPlan: string): string {
  const current = currentPlan ?? 'free'
  return (PLAN_RANK[targetPlan] ?? 0) > (PLAN_RANK[current] ?? 0) ? targetPlan : current
}

export interface TherapistPricingConfig {
  fee_per_session?: number | string | null
  session_duration_mins?: number | string | null
  profile_content?: unknown
  template_id?: string | null
}

export interface ResolvedBookingPrice {
  serviceName: string | null
  priceInr: number | null
  durationMins: number
  priceSource: 'service' | 'therapist_fee' | 'missing'
}

export function resolveBookingPrice(
  therapist: TherapistPricingConfig,
  requestedServiceName?: unknown,
  requestedDurationMins?: unknown,
): ResolvedBookingPrice {
  const serviceName = typeof requestedServiceName === 'string' && requestedServiceName.trim()
    ? requestedServiceName.trim()
    : null
  const durationMins = resolveDuration(requestedDurationMins, therapist.session_duration_mins)

  const service = serviceName
    ? findConfiguredService(therapist.profile_content, therapist.template_id, serviceName)
    : null

  const servicePrice = parsePrice(service?.price)
  if (servicePrice != null) {
    return {
      serviceName: readString(service?.name) ?? serviceName,
      priceInr: servicePrice,
      durationMins,
      priceSource: 'service',
    }
  }

  const fallbackPrice = parsePrice(therapist.fee_per_session)
  return {
    serviceName,
    priceInr: fallbackPrice,
    durationMins,
    priceSource: fallbackPrice == null ? 'missing' : 'therapist_fee',
  }
}

function resolveDuration(requested: unknown, configured: unknown): number {
  const requestedNumber = Number(requested)
  if (Number.isFinite(requestedNumber) && requestedNumber > 0 && requestedNumber <= 360) {
    return Math.round(requestedNumber)
  }

  const configuredNumber = Number(configured)
  if (Number.isFinite(configuredNumber) && configuredNumber > 0 && configuredNumber <= 360) {
    return Math.round(configuredNumber)
  }

  return 50
}

function parsePrice(value: unknown): number | null {
  if (typeof value === 'number') {
    return Number.isFinite(value) && value >= 0 ? value : null
  }

  if (typeof value !== 'string') return null

  const normalized = value.trim()
  if (/^free$/i.test(normalized)) return 0
  if (normalized && !/[a-zA-Z]/.test(normalized)) {
    const numericText = normalized.replace(/[^\d.]/g, '')
    const numericPrice = Number(numericText)
    if (Number.isFinite(numericPrice) && numericPrice >= 0) return numericPrice
  }

  const cleaned = value.replace(/[₹,\s]/g, '')
  if (!cleaned || /^(free|varies|na|n\/a)$/i.test(cleaned)) return null

  const parsed = Number(cleaned)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
}

function findConfiguredService(
  profileContent: unknown,
  templateId: string | null | undefined,
  serviceName: string,
): JsonRecord | null {
  const content = isRecord(profileContent) ? profileContent : {}
  const candidates = [
    templateId ? content[templateId] : null,
    content.classic,
    content.classic2,
    content.classic3,
    content.classic4,
    content.classic5,
    content.classic6,
    content,
  ]

  const target = normalizeServiceName(serviceName)
  for (const candidate of candidates) {
    if (!isRecord(candidate) || !Array.isArray(candidate.services)) continue

    const match = candidate.services.find((svc) => {
      if (!isRecord(svc)) return false
      const name = readString(svc.name) ?? readString(svc.title)
      return name ? normalizeServiceName(name) === target : false
    })

    if (isRecord(match)) return match
  }

  return null
}

function normalizeServiceName(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase()
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
