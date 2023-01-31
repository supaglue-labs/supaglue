import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const saltLength = 16;
const ivLength = 16;

const secret = process.env.SUPAGLUE_API_ENCRYPTION_SECRET;

function getKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, 32, 'sha512');
}

export function encrypt(text: string): Buffer {
  const salt = crypto.randomBytes(saltLength);
  if (!secret) {
    throw new Error('Cannot encrypt without a secret');
  }
  const key = getKey(secret, salt);
  const iv = crypto.randomBytes(ivLength);

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  const encryptedData = Buffer.concat([cipher.update(text), cipher.final()]);

  return Buffer.concat([salt, iv, encryptedData]);
}

export function decrypt(buffer: Buffer): string {
  const salt = buffer.subarray(0, saltLength);
  const iv = buffer.subarray(saltLength, saltLength + ivLength);
  const encryptedData = buffer.subarray(saltLength + ivLength);
  if (!secret) {
    throw new Error('Cannot decrypt without a secret');
  }
  const key = getKey(secret, salt);

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]).toString();
}
