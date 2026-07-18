// Edge-safe shared auth helpers — can be imported from BOTH client components AND middleware.
// MUST NOT touch `document`, `window`, or any browser-only API.

export const AUTH_COOKIE_NAME = 'auth_session';

export type AuthRole = 'Customer' | 'Manager' | 'Admin';

export interface AuthCookieData {
  role: AuthRole;
  userId: string;
}

// Normalize role strings from any source (backend enum, JSON casing, numeric enum, etc.)
// into one of the three canonical AuthRole values.
//
// Handles all of: "Admin"/"admin"/"ADMIN", numeric enum (3 → Admin, 2 → Manager, 1 → Customer).
export function normalizeRole(role: string | number | undefined | null): AuthRole {
  if (role === undefined || role === null) return 'Customer';
  // Numeric enum from backend before JsonStringEnumConverter is wired up.
  if (typeof role === 'number') {
    if (role === 3) return 'Admin';
    if (role === 2) return 'Manager';
    return 'Customer';
  }
  const r = String(role).trim().toLowerCase();
  if (r === 'admin' || r === '3') return 'Admin';
  if (r === 'manager' || r === '2') return 'Manager';
  if (r === 'customer' || r === '1') return 'Customer';
  return 'Customer';
}

// -------- Role landing pages --------
// Admin lands on /admin, Manager on /manager, everyone else on /
// Called by login form right after successful authentication.
export function getRoleLandingPath(role: string | number | undefined | null): string {
  switch (normalizeRole(role)) {
    case 'Admin':
      return '/admin';
    case 'Manager':
      return '/manager';
    default:
      return '/';
  }
}

// -------- Role gates used by middleware + client guards --------
// /admin  → Admin only
// /manager → Manager OR Admin
export function isAdmin(role: string | number | undefined | null): boolean {
  return normalizeRole(role) === 'Admin';
}

export function isManagerOrAdmin(role: string | number | undefined | null): boolean {
  const r = normalizeRole(role);
  return r === 'Manager' || r === 'Admin';
}