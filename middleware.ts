import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth-edge";
import { verifyUserTokenEdge, USER_COOKIE_NAME } from "@/lib/user-auth-edge";

const ADMIN_COOKIE_NAME = "admin_token";

// ─── Route config (extend here to add/modify protection) ─────────────────────

/** Routes requiring user auth (any role). Add path prefixes to protect. */
const protectedRoutes = ["/join", "/payment", "/jobs", "/matrimony", "/marriage"];

/** Routes requiring user auth (any logged-in user, member or non-member). */
const portalRoutes = ["/events", "/members"];

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
// Keep in sync with protectedRoutes and portalRoutes above
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
    "/marriage",
    "/marriage/:path*",
    "/events",
    "/events/:path*",
    "/members",
    "/members/:path*",
    "/admin",
    "/admin/:path*",
  ],
};

/**
 * Standard Next.js Middleware.
 * Renamed from proxy.ts (was previously inactive) to middleware.ts.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let response: NextResponse;

  // ─── Phase 1: Authentication Gate ───────────────────────────────────────────

  // Admin routes: admin auth
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login" || pathname === "/admin/login/") {
      response = NextResponse.next();
    } else {
      const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      const payload = token ? await verifyTokenEdge(token) : null;
      if (!payload) {
        const loginUrl = req.nextUrl.clone();
        loginUrl.pathname = "/admin/login";
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      response = NextResponse.next();
    }
  }
  // Protected routes: user auth required
  else if (isRouteMatch(pathname, protectedRoutes) || isRouteMatch(pathname, portalRoutes)) {
    const redirect = await requireUserAuth(req, pathname);
    if (redirect) return redirect;
    response = NextResponse.next();
  }
  else {
    response = NextResponse.next();
  }

  // ─── Phase 2: Security Headers ──────────────────────────────────────────────
  
  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https://res.cloudinary.com;
    font-src 'self' https://fonts.gstatic.com;
    frame-src 'self' https://api.razorpay.com https://checkout.razorpay.com;
    connect-src 'self' https://lumberjack.razorpay.com;
  `.replace(/\s+/g, " ").trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");

  return response;
}
