/**
 * lib/encryption.ts — AES-256-GCM encrypt/decrypt for Razorpay secret keys.
 *
 * SERVER ONLY — never import from client components.
 *
 * Env required:
 *   ENCRYPTION_KEY = 64-char hex string (32 bytes)
 *   Generate: openssl rand -hex 32
 *
 * Ciphertext format (base64url, colon-separated): iv:authTag:ciphertext
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY
  if (!hex || hex.length !== 64) {
    throw new Error(
      'ENCRYPTION_KEY env var must be a 64-char hex string. ' +
      'Generate one with: openssl rand -hex 32'
    )
  }
  return Buffer.from(hex, 'hex')
}

/** Encrypt plaintext → "iv:authTag:ciphertext" (base64url) */
export function encrypt(plaintext: string): string {
  const key       = getKey()
  const iv        = crypto.randomBytes(12)
  const cipher    = crypto.createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag   = cipher.getAuthTag()

  return [
    iv.toString('base64url'),
    authTag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join(':')
}

/** Decrypt ciphertext produced by encrypt(). Throws on tampered data. */
export function decrypt(ciphertext: string): string {
  const key   = getKey()
  const parts = ciphertext.split(':')
  if (parts.length !== 3) throw new Error('Invalid ciphertext format')

  const [ivB64, authTagB64, encB64] = parts
  const iv        = Buffer.from(ivB64,       'base64url')
  const authTag   = Buffer.from(authTagB64,  'base64url')
  const encrypted = Buffer.from(encB64,      'base64url')

  const decipher  = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
}
