import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Derives a cryptographically strong key from the secret string using PBKDF2.
 */
function getKey(secret: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(secret, salt, 100000, 32, "sha256");
}

interface SessionPayload {
  role: string;
  createdAt: number;
  [key: string]: any;
}

/**
 * Encrypts a session payload into a cryptographically secure token string.
 * Uses AES-256-GCM to guarantee confidentiality and integrity (AEAD).
 * 
 * @param payload - Object containing session state data.
 * @returns string - Base64url encoded token.
 */
export function encryptSession(payload: SessionPayload): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not defined");
  }

  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = getKey(secret, salt);
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();

  // Combine salt, iv, tag, and encrypted data into a single buffer
  const sessionBuffer = Buffer.concat([salt, iv, tag, encrypted]);
  return sessionBuffer.toString("base64url");
}

/**
 * Decrypts and verifies a session token.
 * 
 * @param token - Base64url encoded token to decrypt.
 * @returns SessionPayload | null - The decrypted payload if successful, otherwise null.
 */
export function decryptSession(token: string): SessionPayload | null {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      throw new Error("SESSION_SECRET environment variable is not defined");
    }

    const buffer = Buffer.from(token, "base64url");

    // Extract components from structural buffer
    const salt = buffer.subarray(0, SALT_LENGTH);
    const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = getKey(secret, salt);
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final()
    ]);

    return JSON.parse(decrypted.toString("utf8"));
  } catch (error) {
    // Return null if signature verification or decryption fails
    return null;
  }
}
