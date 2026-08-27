import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "stokvela_session";
const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith("/api/");
  if (isPublic) return NextResponse.next();

  const hasSession = req.cookies.has(SESSION_COOKIE);
  if (!hasSession) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
