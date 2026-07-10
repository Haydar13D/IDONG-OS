import { cookies } from "next/headers";

const COOKIE_NAME = "idong_os_session";

/**
 * Sets the session token in an HTTP-only, secure cookie.
 * 
 * > Note: Must be called inside Next.js Server Actions or Route Handlers (API Routes).
 * > It cannot be called directly inside a Server Component page render.
 * 
 * @param token - The cryptographically secure session string.
 */
export function setSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    path: "/",
  });
}

/**
 * Retrieves the session token from cookies if it exists.
 * 
 * @returns string | undefined - The session token value if present.
 */
export function getSessionCookie(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Deletes the session cookie to log the user out.
 * 
 * > Note: Must be called inside Next.js Server Actions or Route Handlers (API Routes).
 */
export function deleteSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}
