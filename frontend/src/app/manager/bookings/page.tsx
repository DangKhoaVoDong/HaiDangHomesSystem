'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Calendar,
  Plus,
  HelpCircle,
  Bell,
  User,
  Bed,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
} from 'lucide-react';
import { bookingsApi, getApiData } from '@/lib/api';

const navItems = [
  { icon: Building2, label: 'Quản lý căn nhà', active: false, href: '/manager/properties' },
  { icon: Bed, label: 'Quản lý phòng', active: false, href: '/manager' },
  { icon: Calendar, label: 'Lịch đặt phòng', active: true, href: '/manager/bookings' },
  { icon: Plus, label: 'Đăng tin mới', active: false, href: '/manager/rooms/new' },
];

const STATUS_LABELS: Record<number, { label: string; color: string }> = {
  0: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  1: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  2: { label: 'Đã check-in', color: 'bg-green-100 text-green-700 border-green-200' },
  3: { label: 'Hoàn thành', color: 'bg-gray-100 text-gray-700 border-gray-200' },
  4: { label: 'Đã hủy', color: 'bg-red-100 text-red-700 border-red-200' },
  5: { label: 'Hoàn tiền', color: 'bg-purple-100 text-purple-700 border-purple-200' },
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

function eachDay(start: Date, end: Date) {
  const days: Date[] = [];
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  while (cur <= end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export default function ManagerBookingsPage() {
  const [monthCursor, setMonthCursor] = useState(new Date());

  const monthStart = useMemo(() => startOfMonth(monthCursor), [monthCursor]);
  const monthEnd = useMemo(() => endOfMonth(monthCursor), [monthCursor]);

  // Pad to whole weeks (Mon-Sun)
  const gridStart = useMemo(() => {
    const d = new Date(monthStart);
    const dow = (d.getDay() + 6) % 7; // Monday=0
    d.setDate(d.getDate() - dow);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [monthStart]);
  const gridEnd = useMemo(() => {
    const d = new Date(monthEnd);
    const dow = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() + (6 - dow));
    d.setHours(23, 59, 59, 999);
    return d;
  }, [monthEnd]);

  const calendarQuery = useQuery({
    queryKey: ['bookings-calendar', monthStart.toISOString(), gridEnd.toISOString()],
    queryFn: async () => {
      const res = await bookingsApi.getCalendar({
        startDate: gridStart.toISOString(),
        endDate: gridEnd.toISOString(),
      });
      return getApiData(res) ?? [];
    },
  });

  const days = useMemo(() => eachDay(gridStart, gridEnd), [gridStart, gridEnd]);

  // Index bookings by day for fast lookup
  const bookingsByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    const data = calendarQuery.data ?? [];
    for (const b of data) {
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      const cur = new Date(checkIn);
      cur.setHours(0, 0, 0, 0);
      while (cur < checkOut) {
        const key = cur.toISOString().slice(0, 10);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(b);
        cur.setDate(cur.getDate() + 1);
      }
    }
    return map;
  }, [calendarQuery.data]);

  const allBookingsQuery = useQuery({
    queryKey: ['bookings-all', monthStart.toISOString()],
    queryFn: async () => {
      const res = await bookingsApi.getAll({ page: 1, pageSize: 50 });
      return getApiData(res);
    },
  });

  const monthLabel = monthCursor.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-50">
        <div className="px-6 py-8 border-b border-gray-200">
          <h1 className="font-serif text-2xl font-bold text-[#D24A15]">HaiDangHomes</h1>
          <p className="text-sm text-gray-500 mt-1">Luxury Manager</p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-orange-50 text-[#D24A15] font-bold border-r-4 border-[#D24A15]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <button className="w-full py-2 px-4 text-gray-600 hover:bg-gray-50 transition-colors duration-200 rounded-lg flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm">Support</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 px-16 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/manager"
                className="text-gray-500 hover:text-[#D24A15] transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Quay lại</span>
              </Link>
              <h2 className="font-serif text-2xl font-bold text-[#D24A15] hidden md:block">
                Lịch đặt phòng
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-gray-500 hover:text-[#D24A15] transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-[#D24A15] transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Calendar Content */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                Lịch đặt phòng
              </h1>
              <p className="text-gray-600">Xem và theo dõi các booking theo ngày.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))
                }
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 font-medium text-gray-900 min-w-[180px] text-center capitalize">
                {monthLabel}
              </span>
              <button
                onClick={() =>
                  setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))
                }
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setMonthCursor(new Date())}
                className="ml-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hôm nay
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm mb-6">
            <div className="grid grid-cols-7 mb-3">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                <div key={d} className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                  {d}
                </div>
              ))}
            </div>

            {calendarQuery.isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-[#D24A15]" />
                <span className="ml-2 text-gray-500">Đang tải lịch...</span>
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                {days.map((day) => {
                  const key = day.toISOString().slice(0, 10);
                  const dayBookings = bookingsByDay.get(key) ?? [];
                  const isCurrentMonth = day.getMonth() === monthCursor.getMonth();
                  const isToday = key === new Date().toISOString().slice(0, 10);
                  return (
                    <div
                      key={key}
                      className={`min-h-[110px] bg-white p-2 ${
                        isCurrentMonth ? '' : 'opacity-40'
                      }`}
                    >
                      <div className={`text-xs font-medium mb-1 ${isToday ? 'text-[#D24A15] font-bold' : 'text-gray-700'}`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayBookings.slice(0, 3).map((b: any) => {
                          const statusInfo = STATUS_LABELS[b.status] ?? {
                            label: `Trạng thái ${b.status}`,
                            color: 'bg-gray-100 text-gray-600 border-gray-200',
                          };
                          return (
                            <div
                              key={b.bookingId}
                              title={`${b.roomName} - ${b.guestName} (${statusInfo.label})`}
                              className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${statusInfo.color}`}
                            >
                              {b.roomName}
                            </div>
                          );
                        })}
                        {dayBookings.length > 3 && (
                          <div className="text-[10px] text-gray-500 px-1">
                            +{dayBookings.length - 3} khác
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Bookings List */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Booking gần đây</h3>
            {allBookingsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-[#D24A15]" />
              </div>
            ) : (allBookingsQuery.data?.items ?? []).length === 0 ? (
              <div className="text-center py-8 text-gray-500">Chưa có booking nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 text-sm font-medium text-gray-500">Mã booking</th>
                      <th className="py-3 text-sm font-medium text-gray-500">Phòng</th>
                      <th className="py-3 text-sm font-medium text-gray-500">Check-in</th>
                      <th className="py-3 text-sm font-medium text-gray-500">Check-out</th>
                      <th className="py-3 text-sm font-medium text-gray-500">Giá</th>
                      <th className="py-3 text-sm font-medium text-gray-500">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(allBookingsQuery.data?.items ?? []).map((b: any) => {
                      const statusInfo = STATUS_LABELS[b.status] ?? {
                        label: `Trạng thái ${b.status}`,
                        color: 'bg-gray-100 text-gray-700 border-gray-200',
                      };
                      return (
                        <tr key={b.id} className="hover:bg-gray-50">
                          <td className="py-3 font-mono text-xs text-gray-900">{b.bookingCode}</td>
                          <td className="py-3 text-sm text-gray-900">{b.roomName}</td>
                          <td className="py-3 text-sm text-gray-600">
                            {new Date(b.checkInDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-3 text-sm text-gray-600">
                            {new Date(b.checkOutDate).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-3 text-sm font-medium text-gray-900">
                            {b.finalPrice?.toLocaleString('vi-VN')} ₫
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}