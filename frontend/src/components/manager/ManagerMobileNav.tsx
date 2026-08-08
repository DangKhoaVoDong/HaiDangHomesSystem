'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, CalendarDays, LayoutDashboard, Plus } from 'lucide-react';
import { ManagerLogoutButton } from './ManagerLogoutButton';

const items = [
  { href: '/manager', label: 'Tổng quan', icon: LayoutDashboard, exact: true },
  { href: '/manager/properties', label: 'Cơ sở', icon: Building2 },
  { href: '/manager/bookings', label: 'Đặt phòng', icon: CalendarDays },
  { href: '/manager/rooms/new', label: 'Thêm phòng', icon: Plus },
];

export function ManagerMobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed inset-x-0 top-0 z-50 h-16 bg-white border-b border-gray-200 px-2 flex items-center justify-around">
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`min-w-0 flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium ${
              active ? 'text-[#D24A15]' : 'text-gray-500'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="truncate max-w-full">{item.label}</span>
          </Link>
        );
      })}
      <ManagerLogoutButton mobile />
    </nav>
  );
}
