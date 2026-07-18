'use client';

import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import Link from 'next/link';
import { Calendar, MapPin, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export default function MyBookingsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingsApi.getMyBookings(),
    enabled: isAuthenticated,
  });

  const translations = {
    vi: {
      title: 'Đơn đặt của tôi',
      noBookings: 'Bạn chưa có đơn đặt phòng nào.',
      bookingCode: 'Mã đặt phòng',
      checkIn: 'Nhận phòng',
      checkOut: 'Trả phòng',
      total: 'Tổng cộng',
      status: {
        Pending: 'Chờ thanh toán',
        Confirmed: 'Đã xác nhận',
        CheckedIn: 'Đã nhận phòng',
        Completed: 'Hoàn thành',
        Cancelled: 'Đã hủy',
        Refunded: 'Đã hoàn tiền',
      },
      loginRequired: 'Vui lòng đăng nhập để xem đơn đặt phòng.',
      viewDetails: 'Xem chi tiết',
      bookNow: 'Đặt phòng ngay',
    },
    en: {
      title: 'My Bookings',
      noBookings: 'You have no bookings yet.',
      bookingCode: 'Booking Code',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      total: 'Total',
      status: {
        Pending: 'Pending Payment',
        Confirmed: 'Confirmed',
        CheckedIn: 'Checked In',
        Completed: 'Completed',
        Cancelled: 'Cancelled',
        Refunded: 'Refunded',
      },
      loginRequired: 'Please login to view your bookings.',
      viewDetails: 'View Details',
      bookNow: 'Book Now',
    },
  };

  const t = translations[language];
  const dateLocale = language === 'vi' ? vi : enUS;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 mb-4">{t.loginRequired}</p>
          <Link href="/login" className="text-blue-600 hover:underline">
            {language === 'vi' ? 'Đăng nhập' : 'Login'}
          </Link>
        </div>
      </div>
    );
  }

  const bookingList = bookings?.data?.data || [];

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">{t.title}</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg p-6">
                <div className="bg-gray-200 h-24 rounded"></div>
              </div>
            ))}
          </div>
        ) : bookingList.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 mb-4">{t.noBookings}</p>
            <Link href="/properties" className="text-blue-600 hover:underline">
              {t.bookNow}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookingList.map((booking: any) => (
              <div key={booking.id} className="bg-white rounded-lg p-6 shadow hover:shadow-lg transition">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-2xl font-bold text-blue-600">{booking.bookingCode}</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                        booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'Cancelled' || booking.status === 'Refunded' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.status[booking.status as keyof typeof t.status] || booking.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{booking.roomName}</p>
                      <p className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {booking.propertyName}
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(booking.checkInDate), 'dd/MM/yyyy', { locale: dateLocale })} - 
                        {format(new Date(booking.checkOutDate), 'dd/MM/yyyy', { locale: dateLocale })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{t.total}</p>
                      <p className="text-xl font-bold text-blue-600">
                        {booking.finalPrice.toLocaleString()} VND
                      </p>
                    </div>
                    <Link
                      href={`/booking/${booking.bookingCode}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      {t.viewDetails}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
