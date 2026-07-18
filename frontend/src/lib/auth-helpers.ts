// Cookie helpers — must be importable from BOTH client components AND middleware (Edge runtime).
// Edge runtime can't read localStorage, so we mirror auth state into cookies.
// These are non-httpOnly cookies (so middleware can read them). They mirror localStorage.

export const AUTH_COOKIE_NAME = 'auth_session';

export type AuthRole = 'Customer' | 'Manager' | 'Admin';

export interface AuthCookieData {
  role: AuthRole | string;
  userId: string;
  // We don't put the JWT in cookies — middleware only needs to know
  // "is this user allowed on this route?" so role is sufficient.
  // Tokens stay in localStorage for the actual API calls.
}

// Backwards-compatible re-export — kept so older imports still resolve.
// All implementations now live in auth-shared.ts / auth-cookies.client.ts.
export { normalizeRole, isAdmin, isManagerOrAdmin, getRoleLandingPath } from './auth-shared';