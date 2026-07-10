import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "./lib/session";

const COOKIE_NAME = "idong_os_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname.startsWith("/dashboard") || pathname.startsWith("/settings");

  if (isProtectedPath) {
    const sessionToken = request.cookies.get(COOKIE_NAME)?.value;

    if (!sessionToken || !(await decryptSession(sessionToken))) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
  ],
};
