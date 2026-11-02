import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

// Local rehearsal format only: bounded fixture archives, never a streaming production backup.
const magic = Buffer.from('IT2B1');
export function seal(plain: Buffer, key: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(magic);
  const bytes = Buffer.concat([cipher.update(plain), cipher.final()]);
  return Buffer.concat([magic, iv, cipher.getAuthTag(), bytes]);
}
export function open(encrypted: Buffer, key: Buffer) {
  if (encrypted.length < 33 || !encrypted.subarray(0, 5).equals(magic)) throw Error('INVALID_BACKUP');
  const cipher = createDecipheriv('aes-256-gcm', key, encrypted.subarray(5, 17));
  cipher.setAAD(magic);
  cipher.setAuthTag(encrypted.subarray(17, 33));
  return Buffer.concat([cipher.update(encrypted.subarray(33)), cipher.final()]);
}

// lastGood advances only after verified external upload. Failure never resets its age.
export function backupStatus(lastGood: string | null, now: Date, failed = false) {
  const ageHours = lastGood === null ? Infinity : (now.getTime() - Date.parse(lastGood)) / 3_600_000;
  if (!Number.isFinite(ageHours) || ageHours < 0) return 'BLOCKED';
  if (ageHours >= 168) return 'BREACH';
  if (failed) return 'FAIL';
  if (ageHours >= 160) return 'CRITICAL';
  if (ageHours >= 144) return 'WARNING';
  return 'OK';
}
