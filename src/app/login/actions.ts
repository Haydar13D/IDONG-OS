"use server";

import { redirect } from "next/navigation";
import { verifyPassword } from "../../lib/auth";
import { encryptSession } from "../../lib/session";
import { setSessionCookie } from "../../lib/cookies";

/**
 * Server Action to process login passcode verification.
 * 
 * @param passcode - The passcode entered by the user.
 * @returns object - Error details if authentication fails.
 */
export async function handleLogin(passcode: string) {
  let success = false;

  try {
    const isValid = verifyPassword(passcode);
    if (!isValid) {
      return { error: "Invalid passcode. Access Denied." };
    }

    const payload = {
      role: "admin",
      createdAt: Date.now(),
    };

    // Encrypt token and set secure cookie
    const token = await encryptSession(payload);
    setSessionCookie(token);
    success = true;
  } catch (error) {
    console.error("Login action failure:", error);
    return { error: "Authentication system error." };
  }

  // Next.js redirect must be called outside the try-catch block
  // because it throws a specific redirection error.
  if (success) {
    redirect("/dashboard");
  }
}
