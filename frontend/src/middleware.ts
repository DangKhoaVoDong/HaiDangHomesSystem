import { NextRequest, NextResponse } from 'next/server';

// Middleware runs on the Edge runtime — no Node APIs, no localStorage, no `document`.
// We read the role from the `auth_session` cookie (written by stores/auth.ts on the client).
//
// IMPORTANT: Only import from `auth-shared` here. Never import `auth-cookies.client`
// or anything that touches `document` — Turbopack will reject it.

import { AUTH_COOKIE_NAME, isAdmin, isManagerOrAdmin, normalizeRole } from '@/lib/auth-shared';

interface AuthCookieData {
  role: string;
  userId: string;
}

function readAuthCookie(req: NextRequest): AuthCookieData | null {
  const raw = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as AuthCookieData;
    return {
      role: normalizeRole(parsed.role),
      userId: String(parsed.userId ?? ''),
    };
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const auth = readAuthCookie(req);

  // /admin — Admin only
  if (pathname.startsWith('/admin')) {
    if (!auth) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (!isAdmin(auth.role)) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('forbidden', 'admin');
      return NextResponse.redirect(url);
    }
  }

  // /manager — Manager OR Admin
  if (pathname.startsWith('/manager')) {
    if (!auth) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }
    if (!isManagerOrAdmin(auth.role)) {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('forbidden', 'manager');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Match /admin/* and /manager/* but skip Next.js internals & static assets.
  matcher: ['/admin/:path*', '/manager/:path*'],
};