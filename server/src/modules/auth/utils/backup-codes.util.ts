import { randomInt } from 'crypto';
import { sha256 } from '../../../common/utils/crypto.util';

// Unambiguous characters (no 0/o, 1/l/i)
const ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

function randomGroup(length: number): string {
  let group = '';
  for (let i = 0; i < length; i++) {
    group += ALPHABET[randomInt(ALPHABET.length)];
  }
  return group;
}

/** Normalise user input so "ABCD EFGH", "abcd-efgh" and "abcdefgh" all match. */
export function normalizeBackupCode(code: string): string {
  return code.toLowerCase().replace(/[^a-z0-9]/g, '');
}

export function hashBackupCode(code: string): string {
  return sha256(normalizeBackupCode(code));
}

/** One-time recovery codes formatted "xxxx-xxxx"; only their hashes are stored. */
export function generateBackupCodes(count: number): { codes: string[]; hashes: string[] } {
  const codes = Array.from({ length: count }, () => `${randomGroup(4)}-${randomGroup(4)}`);
  return { codes, hashes: codes.map(hashBackupCode) };
}
