import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'crypto';

/** Cryptographically random URL-safe token (used for email links). */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString('base64url');
}

/** One-way hash for storing tokens and backup codes at rest. */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

/** Derive an independent secret for a specific purpose from a base secret. */
export function deriveSecret(baseSecret: string, purpose: string): string {
  return createHmac('sha256', baseSecret).update(purpose).digest('hex');
}

export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

const CIPHER = 'aes-256-gcm';

function keyFrom(secret: string): Buffer {
  return createHash('sha256').update(secret).digest();
}

/** Authenticated symmetric encryption (AES-256-GCM) for secrets stored in the database. */
export function encrypt(plainText: string, secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(CIPHER, keyFrom(secret), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.');
}

export function decrypt(payload: string, secret: string): string {
  const [iv, tag, encrypted] = payload.split('.').map((part) => Buffer.from(part, 'base64url'));
  const decipher = createDecipheriv(CIPHER, keyFrom(secret), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
}
