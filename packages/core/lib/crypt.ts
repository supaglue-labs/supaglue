import crypto from 'crypto';

const algorithm = 'aes-256-cbc';
const saltLength = 16;
const ivLength = 16;

const secret = process.env.SUPAGLUE_API_ENCRYPTION_SECRET;

async function getKey(secret: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(secret, salt, 100000, 32, 'sha512', (err, key) => {
      if (err) {
        return reject(err);
      }

      resolve(key);
    });
  });
}

export function generateApiKey(): string {
  return crypto.randomBytes(64).toString('base64');
}

export async function cryptoHash(text: string): Promise<{ original: string; hashed: string }> {
  const hashedText = await new Promise<string>((resolve, reject) => {
    // TODO: remove bang by getting NodeJs ProcessEnv global interface working
    crypto.scrypt(text, secret!, 64, (err, derivedKey) => {
      if (err) {
        return reject(err);
      }

      resolve(derivedKey.toString('hex'));
    });
  });

  return {
    original: text,
    hashed: hashedText,
  };
}

export async function encrypt(text: string): Promise<Buffer> {
  const salt = crypto.randomBytes(saltLength);
  if (!secret) {
    throw new Error('Cannot encrypt without a secret');
  }
  const key = await getKey(secret, salt);
  const iv = crypto.randomBytes(ivLength);

  const cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
  const encryptedData = Buffer.concat([cipher.update(text), cipher.final()]);

  return Buffer.concat([salt, iv, encryptedData]);
}

export async function encryptAsString(text: string): Promise<string> {
  return (await encrypt(text)).toString('base64');
}

export async function decrypt(buffer: Buffer): Promise<string> {
  const salt = buffer.subarray(0, saltLength);
  const iv = buffer.subarray(saltLength, saltLength + ivLength);
  const encryptedData = buffer.subarray(saltLength + ivLength);
  if (!secret) {
    throw new Error('Cannot decrypt without a secret');
  }
  const key = await getKey(secret, salt);

  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
  return Buffer.concat([decipher.update(encryptedData), decipher.final()]).toString();
}

export async function decryptFromString(encodedString: string): Promise<string> {
  return decrypt(Buffer.from(encodedString, 'base64'));
}
