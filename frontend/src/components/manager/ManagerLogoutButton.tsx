'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

export function ManagerLogoutButton({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace('/login');
    router.refresh();
  };

  if (mobile) {
    return (
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Đăng xuất"
        className="min-w-0 flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium text-gray-500 hover:text-[#D24A15]"
      >
        <LogOut className="h-5 w-5" />
        <span>Đăng xuất</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="mt-2 w-full rounded-lg bg-[#D24A15] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#b03d10] flex items-center justify-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>Đăng xuất</span>
    </button>
  );
}
