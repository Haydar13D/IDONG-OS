import crypto from "crypto";

/**
 * Verifies if the provided passcode matches the stored system password.
 * 
 * @param password - The plaintext password/passcode entered by the user.
 * @returns boolean - True if the password matches, false otherwise.
 * 
 * > Assumption: The APP_PASSWORD environment variable holds the SHA-256 hex hash
 * > of the user's secret passcode.
 */
export function verifyPassword(password: string): boolean {
  const storedPasswordHash = process.env.APP_PASSWORD;
  if (!storedPasswordHash) {
    console.error("APP_PASSWORD environment variable is not defined");
    return false;
  }

  // Hash the incoming passcode with SHA-256
  const inputHash = crypto.createHash("sha256").update(password).digest("hex");

  // timingSafeEqual requires buffers of identical length.
  // We hash both hashes again to guarantee constant-length comparison buffers.
  const bufferA = crypto.createHash("sha256").update(inputHash).digest();
  const bufferB = crypto.createHash("sha256").update(storedPasswordHash).digest();

  return crypto.timingSafeEqual(bufferA, bufferB);
}
