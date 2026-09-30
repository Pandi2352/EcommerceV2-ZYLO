import { createHmac, randomBytes } from 'crypto';
import { safeEqual } from '../../../common/utils/crypto.util';

/**
 * Time-based one-time passwords (RFC 6238, HMAC-SHA1, 6 digits, 30s step),
 * compatible with Google Authenticator, Microsoft Authenticator, 1Password, etc.
 */

const STEP_SECONDS = 30;
const DIGITS = 6;
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of clean) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) throw new Error('Invalid base32 character in TOTP secret');
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function hotp(secret: Buffer, counter: number): string {
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', secret).update(counterBuffer).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary = (hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;
  return binary.toString().padStart(DIGITS, '0');
}

export function currentTotpStep(now = Date.now()): number {
  return Math.floor(now / 1000 / STEP_SECONDS);
}

/** New random base32 secret (160 bits, as recommended by RFC 4226). */
export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function generateTotp(secretBase32: string, step = currentTotpStep()): string {
  return hotp(base32Decode(secretBase32), step);
}

/**
 * Verify a code, allowing ±`window` steps of clock drift.
 * Returns the matched time step (for replay protection) or null.
 */
export function verifyTotp(secretBase32: string, code: string, window = 1): number | null {
  if (!new RegExp(`^\\d{${DIGITS}}$`).test(code)) return null;
  const secret = base32Decode(secretBase32);
  const step = currentTotpStep();
  for (let offset = -window; offset <= window; offset++) {
    if (safeEqual(hotp(secret, step + offset), code)) {
      return step + offset;
    }
  }
  return null;
}

/** otpauth:// URI encoded into the QR code that authenticator apps scan. */
export function buildOtpauthUrl(issuer: string, accountName: string, secretBase32: string): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret: secretBase32,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(STEP_SECONDS),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}
