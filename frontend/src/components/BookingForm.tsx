'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { bookingsApi, getApiData, getApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { differenceInDays } from 'date-fns';

interface BookingFormProps {
  roomId: string;
  roomName: string;
  propertyName: string;
  pricePerNight: number;
  maxOccupancy: number;
}

export function BookingForm({ roomId, roomName, propertyName, pricePerNight, maxOccupancy }: BookingFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();
  
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = parseInt(searchParams.get('guests') || '1');

  const nights = differenceInDays(new Date(checkOut), new Date(checkIn)) || 1;
  const totalPrice = pricePerNight * nights;

  const [formData, setFormData] = useState({
    guestFullName: '',
    guestEmail: '',
    guestPhone: '',
    guestIdCardNumber: '',
    specialRequests: '',
  });

  const translations = {
    vi: {
      title: 'Đặt phòng',
      guestInfo: 'Thông tin khách',
      fullName: 'Họ và tên',
      email: 'Email',
      phone: 'Số điện ththoại',
      idCard: 'CMND/CCCD',
      specialRequests: 'Yêu cầu đặc biệt',
      totalPrice: 'Tổng cộng',
      nights: 'đêm',
      bookNow: 'Đặt ngay',
      pleaseLogin: 'Vui lòng đăng nhập để đặt phòng',
      bookingSuccess: 'Đặt phòng thành công! Đang chuyển đến thanh toán...',
      bookingError: 'Đặt phòng thất bại',
    },
    en: {
      title: 'Book Room',
      guestInfo: 'Guest Information',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      idCard: 'ID Card',
      specialRequests: 'Special Requests',
      totalPrice: 'Total',
      nights: 'nights',
      bookNow: 'Book Now',
      pleaseLogin: 'Please login to book',
      bookingSuccess: 'Booking successful! Redirecting to payment...',
      bookingError: 'Booking failed',
    },
  };

  const t = translations[language];

  const bookingMutation = useMutation({
    mutationFn: (data: any) => bookingsApi.create(data),
    onSuccess: (response) => {
      const bookingData = getApiData(response);
      if (bookingData) {
        toast.success(t.bookingSuccess);
        // Navigate to payment page with booking code
        router.push(`/booking/${bookingData.bookingCode}/payment`);
      } else {
        toast.error(getApiError(response) || t.bookingError);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t.bookingError);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required guest info
    if (!formData.guestFullName || !formData.guestEmail || !formData.guestPhone) {
      toast.error(language === 'vi' ? 'Vui lòng điền đầy đủ thông tin' : 'Please fill in all required fields');
      return;
    }

    bookingMutation.mutate({
      roomId,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      numberOfGuests: guests,
      specialRequests: formData.specialRequests,
      guestFullName: formData.guestFullName,
      guestEmail: formData.guestEmail,
      guestPhone: formData.guestPhone,
      guestIdCardNumber: formData.guestIdCardNumber,
    });
  };

  return (
    <div className="bg-white border rounded-lg p-6 sticky top-24">
      <h3 className="text-xl font-bold mb-4">{t.title}</h3>
      
      <div className="mb-4 text-sm text-gray-600">
        <p>{roomName}</p>
        <p>{propertyName}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t.fullName}</label>
          <input
            type="text"
            value={formData.guestFullName}
            onChange={(e) => setFormData({ ...formData, guestFullName: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t.email}</label>
          <input
            type="email"
            value={formData.guestEmail}
            onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t.phone}</label>
          <input
            type="tel"
            value={formData.guestPhone}
            onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t.idCard}</label>
          <input
            type="text"
            value={formData.guestIdCardNumber}
            onChange={(e) => setFormData({ ...formData, guestIdCardNumber: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t.specialRequests}</label>
          <textarea
            value={formData.specialRequests}
            onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between mb-2">
            <span>{pricePerNight.toLocaleString()} VND x {nights} {t.nights}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>{t.totalPrice}</span>
            <span className="text-blue-600">{totalPrice.toLocaleString()} VND</span>
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={bookingMutation.isPending}>
          {bookingMutation.isPending ? '...' : t.bookNow}
        </Button>
      </form>
    </div>
  );
}
