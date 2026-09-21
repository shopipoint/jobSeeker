import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME } from "./lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthed = Boolean(request.cookies.get(COOKIE_NAME)?.value);

  const protectedPaths = [
    "/dashboard",
    "/jobs",
    "/resume",
    "/applications",
    "/copilot",
    "/profile",
    "/team",
  ];
  const isProtected = protectedPaths.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if ((pathname === "/login" || pathname === "/register") && isAuthed) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/jobs/:path*",
    "/resume/:path*",
    "/applications/:path*",
    "/copilot/:path*",
    "/profile/:path*",
    "/team/:path*",
    "/login",
    "/register",
  ],
};
