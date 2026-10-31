import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
export const token = () => randomBytes(32).toString('base64url');
export const hash = (s: string) => createHash('sha256').update(s).digest('hex');
export class Vault {
  private key: Buffer;
  constructor(key: string) {
    this.key = Buffer.from(key, 'base64');
    if (this.key.length !== 32) throw new Error('AUTH_ENCRYPTION_KEY must be 32 random bytes in base64');
  }
  seal(value: unknown): string {
    const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', this.key, iv);
    const data = Buffer.concat([cipher.update(JSON.stringify(value)), cipher.final()]);
    return Buffer.concat([iv, cipher.getAuthTag(), data]).toString('base64');
  }
  open<T>(value: string): T {
    const b = Buffer.from(value, 'base64'), cipher = createDecipheriv('aes-256-gcm', this.key, b.subarray(0, 12));
    cipher.setAuthTag(b.subarray(12, 28));
    return JSON.parse(Buffer.concat([cipher.update(b.subarray(28)), cipher.final()]).toString());
  }
}
