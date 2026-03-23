import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";
import { verifyUserTokenEdge, USER_COOKIE_NAME } from "@/lib/user-auth-edge";

const ADMIN_COOKIE_NAME = "admin_token";

// ─── Route config (extend here to add/modify protection) ─────────────────────

/** Routes requiring user auth (any role). Add path prefixes to protect. */
const protectedRoutes = ["/join", "/payment", "/jobs", "/matrimony"];

/** Routes requiring user auth + member role. */
const memberOnlyRoutes = ["/events", "/members"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

async function requireUserAuth(req: NextRequest, pathname: string): Promise<NextResponse | null> {
  const token = req.cookies.get(USER_COOKIE_NAME)?.value;
  const payload = token ? await verifyUserTokenEdge(token) : null;
  if (!payload) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
  return null; // allow
}

// ─── Matcher (must be static for Next.js build) ───────────────────────────────
// Keep in sync with protectedRoutes and memberOnlyRoutes above
export const config = {
  matcher: [
    "/join",
    "/join/:path*",
    "/payment",
    "/payment/:path*",
    "/jobs",
    "/jobs/:path*",
    "/matrimony",
    "/matrimony/:path*",
    "/events",
    "/events/:path*",
    "/members",
    "/members/:path*",
    "/admin",
    "/admin/:path*",
  ],
};

// ─── Middleware ──────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protected routes: user auth required
  if (isRouteMatch(pathname, protectedRoutes)) {
    const redirect = await requireUserAuth(req, pathname);
    if (redirect) return redirect;
    return NextResponse.next();
  }

  // Member-only routes: user auth + member role
  if (isRouteMatch(pathname, memberOnlyRoutes)) {
    const token = req.cookies.get(USER_COOKIE_NAME)?.value;
    const payload = token ? await verifyUserTokenEdge(token) : null;
    if (!payload) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (payload.role !== "member") {
      const joinUrl = req.nextUrl.clone();
      joinUrl.pathname = "/join";
      joinUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(joinUrl);
    }
    return NextResponse.next();
  }

  // Admin routes: admin auth
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
      return NextResponse.next();
    }
    const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const payload = token ? await verifyTokenEdge(token) : null;
    if (!payload) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}
