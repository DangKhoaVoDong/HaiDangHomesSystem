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
  Menu,
  Building2,
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
  { icon: Building2, label: 'Quản lý căn nhà', href: '/admin/properties' },
  { icon: Bed,      label: 'Quản lý phòng', href: '/admin/rooms' },
  { icon: Calendar, label: 'Lịch đặt phòng', href: '/admin/bookings' },
  { icon: Plus,     label: 'Đăng tin mới', href: '/admin/rooms/new' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <div className="lg:hidden fixed inset-x-0 top-0 z-50 h-16 bg-white border-b border-gray-200 flex items-center gap-3 px-4">
        <Menu className="h-5 w-5 text-[#D24A15]" />
        <Link href="/admin" className="font-serif text-lg font-bold text-[#D24A15]">
          HaiDang Home
        </Link>
        <nav className="ml-auto flex items-center gap-1 overflow-x-auto">
          {PRIMARY_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={`shrink-0 rounded-lg p-2 ${
                isActive(item.href) ? 'bg-orange-50 text-[#D24A15]' : 'text-gray-500'
              }`}
            >
              <item.icon className="h-5 w-5" />
            </Link>
          ))}
          <button onClick={() => logout()} aria-label="Đăng xuất" className="shrink-0 rounded-lg p-2 text-gray-500">
            <LogOut className="h-5 w-5" />
          </button>
        </nav>
      </div>
      <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 border-r border-gray-200 bg-white flex-col z-50">
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
    </>
  );
}
