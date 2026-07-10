// Use native global Web Crypto API (supported natively in both Node 18+ and Next.js Edge)
const subtle = crypto.subtle;
const encoder = new TextEncoder();

/**
 * Derives a CryptoKey from the secret string for HMAC-SHA256 operations.
 */
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

interface SessionPayload {
  role: string;
  createdAt: number;
  [key: string]: any;
}

/**
 * Encrypts/signs a session payload into a cryptographically secure token.
 * Uses HMAC-SHA256 to guarantee authenticity and integrity.
 * 
 * @param payload - Object containing session state data.
 * @returns Promise<string> - Signed Base64url token string.
 */
export async function encryptSession(payload: SessionPayload): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not defined");
  }

  const key = await getCryptoKey(secret);
  const payloadString = JSON.stringify(payload);
  const data = encoder.encode(payloadString);
  const signature = await subtle.sign("HMAC", key, data);

  const payloadBase64 = Buffer.from(payloadString).toString("base64url");
  const signatureBase64 = Buffer.from(signature).toString("base64url");

  return `${payloadBase64}.${signatureBase64}`;
}

/**
 * Decrypts/verifies a session token.
 * 
 * @param token - Base64url signed token to verify.
 * @returns Promise<SessionPayload | null> - Decrypted payload if verification succeeds, otherwise null.
 */
export async function decryptSession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = process.env.SESSION_SECRET;
    if (!secret) {
      throw new Error("SESSION_SECRET environment variable is not defined");
    }

    const [payloadBase64, signatureBase64] = token.split(".");
    if (!payloadBase64 || !signatureBase64) {
      return null;
    }

    const payloadString = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const payload = JSON.parse(payloadString) as SessionPayload;

    const key = await getCryptoKey(secret);
    const signatureBuffer = Buffer.from(signatureBase64, "base64url");
    const data = encoder.encode(payloadString);

    const isValid = await subtle.verify("HMAC", key, signatureBuffer, data);
    return isValid ? payload : null;
  } catch (error) {
    return null;
  }
}

