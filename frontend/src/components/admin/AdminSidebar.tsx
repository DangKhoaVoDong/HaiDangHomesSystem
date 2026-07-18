'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bed,
  Calendar,
  Plus,
  FileText,
  Settings,
  HelpCircle,
  Tag,
  Award,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth';

interface NavItem {
  icon: typeof Bed;
  label: string;
  href: string;
}

// Primary navigation shared between /admin pages.
const PRIMARY_NAV: NavItem[] = [
  { icon: FileText, label: 'Báo cáo', href: '/admin' },
  { icon: Tag,      label: 'Loại hình', href: '/admin/categories' },
  { icon: Award,    label: 'Thương hiệu', href: '/admin/brands' },
  { icon: Bed,      label: 'Quản lý phòng', href: '/manager' },
  { icon: Calendar, label: 'Lịch đặt phòng', href: '/manager' },
  { icon: Plus,     label: 'Đăng tin mới', href: '/manager' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href);

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 border-r border-gray-200 bg-white flex flex-col z-50">
      <div className="px-6 py-8 border-b border-gray-200">
        <h1 className="font-serif text-2xl font-bold text-[#D24A15]">HaiDang Home</h1>
        <p className="text-sm text-gray-500 mt-1">Luxury Management</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1">
        {PRIMARY_NAV.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                active
                  ? 'bg-orange-50 text-[#D24A15] font-bold border-r-4 border-[#D24A15]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-200 space-y-1">
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Cài đặt</span>
        </Link>
        <Link
          href="#"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm">Hỗ trợ</span>
        </Link>
        <button
          onClick={() => logout()}
          className="w-full mt-4 bg-[#D24A15] text-white py-3 rounded-xl text-sm font-medium hover:bg-[#b03d10] transition-colors flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Đăng xuất
          {user ? ` (${user.fullName ?? user.email})` : ''}
        </button>
      </div>
    </aside>
  );
}
