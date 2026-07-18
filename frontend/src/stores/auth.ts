import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { User } from '@/types';
import { normalizeRole } from '@/lib/auth-shared';
import { setAuthCookie, clearAuthCookie } from '@/lib/auth-cookies.client';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// Mirror auth state into a non-httpOnly cookie so Next.js middleware (Edge runtime,
// which can't read localStorage) can check role-based access on protected routes.
function syncCookie(user: User | null): void {
  if (user && user.id) {
    setAuthCookie({ role: normalizeRole(user.role), userId: user.id });
  } else {
    clearAuthCookie();
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setUser: (user) => {
        syncCookie(user);
        set({
          user,
          isAuthenticated: true,
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
        // Note: cookie is written by setUser() once we have the user object;
        // for backward compat, if tokens arrive without user we still mark
        // isAuthenticated but won't have role until setUser is called.
      },

      logout: () => {
        syncCookie(null);
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      // sessionStorage: session clears when the tab/browser is closed, so a freshly
      // opened browser will not auto-resume the previous account.
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.sessionStorage : (undefined as unknown as Storage)
      ),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // On hydrate from sessionStorage, make sure the cookie is also set
      // (e.g., user refreshed the page after a previous login).
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          syncCookie(state.user);
        }
      },
    }
  )
);