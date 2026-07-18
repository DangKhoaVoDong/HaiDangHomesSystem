'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { normalizeRole } from '@/lib/auth-shared';

type AllowedRole = 'Admin' | 'Manager' | 'Customer';

interface RoleGuardProps {
  allowed: AllowedRole[];
  children: React.ReactNode;
}

// Client-side belt-and-suspenders guard for protected pages.
// Middleware already blocks unauthorized users at the network layer,
// but this prevents a brief flash of protected UI if middleware
// is bypassed (e.g. user manually editing localStorage without cookie).
export function RoleGuard({ allowed, children }: RoleGuardProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [ready, setReady] = useState(false);

  const userRole = user ? normalizeRole(user.role as unknown as string | number) : null;
  const hasAccess = userRole !== null && allowed.includes(userRole);

  // Wait one tick for zustand persist to rehydrate from localStorage
  // on initial page load.
  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated || !user) {
      router.replace('/login');
      return;
    }
    if (!hasAccess) {
      // Send unauthorized role to home.
      router.replace('/');
    }
  }, [ready, isAuthenticated, user, hasAccess, router]);

  if (!ready || !isAuthenticated || !user || !hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf9f8]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#D24A15] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Đang kiểm tra quyền truy cập…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}