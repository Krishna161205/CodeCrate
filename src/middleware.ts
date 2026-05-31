import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "codecrate-temporary-nextauth-secret-for-mvp-dev-purposes-12345" 
  });
  const { pathname } = req.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/auth", req.url));
    }
    
    if (token.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect seller routes
  if (pathname.startsWith("/seller") || pathname.startsWith("/api/seller/analytics")) {
    if (!token) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/auth", req.url));
    }

    if (token.role !== "SELLER" && token.role !== "ADMIN") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Forbidden. Seller access required." }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/settings", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/seller/:path*",
    "/api/admin/:path*",
    "/api/seller/analytics/:path*",
  ],
};
