// Client-only cookie helpers.
// This file uses `document` — it MUST NOT be imported from middleware or any
// Edge runtime code. The `.client.ts` suffix signals to Next.js / Turbopack
// that this module is browser-only and should never be bundled into the
// Edge runtime (where `document` does not exist).
//
// To prevent accidental misuse, the implementation is wrapped in a runtime
// guard that throws a clear error if it ever runs outside a browser.

import { AUTH_COOKIE_NAME, AuthCookieData, normalizeRole } from './auth-shared';

function assertBrowser(): void {
  if (typeof document === 'undefined') {
    throw new Error(
      '[auth-cookies.client] document is not available. This module is client-only.'
    );
  }
}

export function setAuthCookie(data: AuthCookieData): void {
  assertBrowser();
  const payload: AuthCookieData = {
    role: normalizeRole(data.role),
    userId: String(data.userId),
  };
  const value = encodeURIComponent(JSON.stringify(payload));
  const maxAge = 60 * 60 * 24 * 7;
  document.cookie = `${AUTH_COOKIE_NAME}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function clearAuthCookie(): void {
  assertBrowser();
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAuthCookie(): AuthCookieData | null {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split('; ');
  for (const c of cookies) {
    const [name, ...rest] = c.split('=');
    if (name === AUTH_COOKIE_NAME) {
      try {
        const parsed = JSON.parse(decodeURIComponent(rest.join('='))) as AuthCookieData;
        return {
          role: normalizeRole(parsed.role),
          userId: String(parsed.userId ?? ''),
        };
      } catch {
        return null;
      }
    }
  }
  return null;
}