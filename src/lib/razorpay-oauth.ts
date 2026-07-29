import 'server-only'

/**
 * lib/razorpay-oauth.ts -- "Connect with Razorpay" OAuth flow.
 *
 * Distinct from lib/razorpay.ts (platform-level keys) and the manual
 * per-therapist key entry in save-credentials/route.ts. This handles the
 * OAuth alternative: a therapist clicks "Connect with Razorpay", authorizes
 * on Razorpay's consent screen, and we get back an access/refresh token
 * pair tied to their merchant account -- no keys ever pass through our UI.
 *
 * Env required (client gets these from the Razorpay Partner Dashboard,
 * under "Register Your OAuth Application"):
 *   RAZORPAY_OAUTH_CLIENT_ID
 *   RAZORPAY_OAUTH_CLIENT_SECRET
 *   RAZORPAY_OAUTH_REDIRECT_URI      (defaults to the production callback URL below)
 *   RAZORPAY_OAUTH_WEBHOOK_SECRET    (separate secret configured for the OAuth app's webhook)
 */

import { createServiceSupabaseClient } from '@/lib/supabase-server'
import { encrypt, decrypt } from '@/lib/encryption'

const AUTHORIZE_URL = 'https://auth.razorpay.com/authorize'
const TOKEN_URL = 'https://auth.razorpay.com/token'

// Must exactly match a redirect URI registered on the Razorpay OAuth app.
// Overridable via env for local/staging testing against a separately
// registered redirect URI -- do NOT reuse NEXT_PUBLIC_APP_URL (see the note
// in .env.local for why that var is intentionally unset).
const DEFAULT_REDIRECT_URI = 'https://www.counsellorsofindia.com/api/razorpay/oauth/callback'

function getClientId(): string {
  const id = process.env.RAZORPAY_OAUTH_CLIENT_ID
  if (!id) throw new Error('RAZORPAY_OAUTH_CLIENT_ID is not configured.')
  return id
}

function getClientSecret(): string {
  const secret = process.env.RAZORPAY_OAUTH_CLIENT_SECRET
  if (!secret) throw new Error('RAZORPAY_OAUTH_CLIENT_SECRET is not configured.')
  return secret
}

export function getRedirectUri(): string {
  return process.env.RAZORPAY_OAUTH_REDIRECT_URI ?? DEFAULT_REDIRECT_URI
}

/** Builds the URL to send the therapist to for Razorpay's consent screen. */
export function buildAuthorizationUrl(state: string, scope = 'read_write'): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: getClientId(),
    redirect_uri: getRedirectUri(),
    scope,
    state,
  })
  return `${AUTHORIZE_URL}?${params.toString()}`
}

interface RazorpayTokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number            // seconds until access_token expires
  refresh_token_expires_in?: number // seconds until refresh_token expires (if present)
  razorpay_account_id: string    // the connected merchant's account id
  public_token?: string
  scope?: string
}

async function postToTokenEndpoint(body: Record<string, string>): Promise<RazorpayTokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.error_description ?? data?.error ?? 'Razorpay OAuth token request failed.')
  }

  return data as RazorpayTokenResponse
}

/** Exchanges an authorization `code` (from the callback query string) for tokens. */
export async function exchangeCodeForTokens(code: string): Promise<RazorpayTokenResponse> {
  return postToTokenEndpoint({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    client_id: getClientId(),
    client_secret: getClientSecret(),
  })
}

/** Exchanges a refresh token for a new access/refresh token pair. */
export async function refreshTokens(refreshToken: string): Promise<RazorpayTokenResponse> {
  return postToTokenEndpoint({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: getClientId(),
    client_secret: getClientSecret(),
  })
}

/** Persists a fresh token pair for a therapist (used after connect + after refresh). */
export async function storeTokensForTherapist(therapistId: string, tokens: RazorpayTokenResponse): Promise<void> {
  const now = Date.now()
  const db = createServiceSupabaseClient()

  const { error } = await db
    .from('therapists')
    .update({
      razorpay_oauth_merchant_id: tokens.razorpay_account_id,
      razorpay_oauth_access_token_enc: encrypt(tokens.access_token),
      razorpay_oauth_refresh_token_enc: encrypt(tokens.refresh_token),
      razorpay_oauth_access_expires_at: new Date(now + tokens.expires_in * 1000).toISOString(),
      razorpay_oauth_refresh_expires_at: tokens.refresh_token_expires_in
        ? new Date(now + tokens.refresh_token_expires_in * 1000).toISOString()
        : null,
      razorpay_oauth_scope: tokens.scope ?? null,
      razorpay_oauth_connected_at: new Date(now).toISOString(),
      razorpay_oauth_public_token: tokens.public_token ?? null,
    })
    .eq('id', therapistId)

  if (error) throw error
}

interface TherapistOAuthRow {
  razorpay_oauth_merchant_id: string | null
  razorpay_oauth_access_token_enc: string | null
  razorpay_oauth_refresh_token_enc: string | null
  razorpay_oauth_access_expires_at: string | null
}

const REFRESH_SKEW_MS = 5 * 60 * 1000 // refresh if expiring within 5 minutes

/**
 * Returns a valid (decrypted) access token for the given therapist,
 * transparently refreshing it first if it's expired or expiring soon.
 * Throws if the therapist hasn't connected via OAuth at all.
 */
export async function getValidAccessToken(therapistId: string): Promise<string> {
  const db = createServiceSupabaseClient()

  const { data, error } = await db
    .from('therapists')
    .select(
      'razorpay_oauth_merchant_id, razorpay_oauth_access_token_enc, razorpay_oauth_refresh_token_enc, razorpay_oauth_access_expires_at'
    )
    .eq('id', therapistId)
    .single<TherapistOAuthRow>()

  if (error || !data) throw new Error('Therapist not found.')
  if (!data.razorpay_oauth_access_token_enc || !data.razorpay_oauth_refresh_token_enc) {
    throw new Error('Therapist has not connected Razorpay via OAuth.')
  }

  const expiresAt = data.razorpay_oauth_access_expires_at
    ? new Date(data.razorpay_oauth_access_expires_at).getTime()
    : 0
  const isExpiringSoon = Date.now() > expiresAt - REFRESH_SKEW_MS

  if (!isExpiringSoon) {
    return decrypt(data.razorpay_oauth_access_token_enc)
  }

  // Expired or expiring soon -- refresh, store, and return the new token.
  const currentRefreshToken = decrypt(data.razorpay_oauth_refresh_token_enc)
  const tokens = await refreshTokens(currentRefreshToken)
  await storeTokensForTherapist(therapistId, tokens)
  return tokens.access_token
}

/**
 * Clears OAuth connection state for a therapist by their Razorpay merchant
 * id -- used when the webhook reports the therapist revoked access. Manual
 * key credentials (if separately configured) are left untouched.
 */
export async function disconnectOAuthByMerchantId(merchantId: string): Promise<void> {
  const db = createServiceSupabaseClient()

  const { error } = await db
    .from('therapists')
    .update({
      razorpay_oauth_merchant_id: null,
      razorpay_oauth_access_token_enc: null,
      razorpay_oauth_refresh_token_enc: null,
      razorpay_oauth_access_expires_at: null,
      razorpay_oauth_refresh_expires_at: null,
      razorpay_oauth_scope: null,
      razorpay_oauth_connected_at: null,
    })
    .eq('razorpay_oauth_merchant_id', merchantId)

  if (error) throw error
}

export function getOAuthWebhookSecret(): string {
  const secret = process.env.RAZORPAY_OAUTH_WEBHOOK_SECRET
  if (!secret) throw new Error('RAZORPAY_OAUTH_WEBHOOK_SECRET is not configured.')
  return secret
}
