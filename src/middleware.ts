import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /admin/* (but not /admin/login itself)
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // Firebase Auth uses client-side session — we can't verify server-side without
    // additional cookie setup. For MVP, protection is handled client-side in the
    // dashboard via onAuthStateChanged redirect. This middleware adds a basic
    // cache-control header to admin pages.
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
