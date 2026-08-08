'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { bookingsApi, getApiData, getApiError } from '@/lib/api';
import { useLanguageStore } from '@/stores/language';
import type { Booking } from '@/types';
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
  const searchParams = useSearchParams();
  const { language } = useLanguageStore();
  const [submittedBooking, setSubmittedBooking] = useState<Booking | null>(null);
  
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
      bookingSuccess: 'Yêu cầu đã được gửi. Chúng tôi đang kiểm tra phòng và sẽ phản hồi sớm nhất qua email hoặc số điện thoại của bạn.',
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
      bookingSuccess: 'Your request was received. We are checking the room and will contact you by email or phone as soon as possible.',
      bookingError: 'Booking failed',
    },
  };

  const t = translations[language];

  const bookingMutation = useMutation({
    mutationFn: bookingsApi.create,
    onSuccess: (response) => {
      const bookingData = getApiData(response);
      if (bookingData) {
        setSubmittedBooking(bookingData);
        toast.success(t.bookingSuccess);
      } else {
        toast.error(getApiError(response) || t.bookingError);
      }
    },
    onError: (error: unknown) => {
      toast.error(getApiError(error) || t.bookingError);
    },
  });

  if (submittedBooking) {
    return (
      <div className="bg-white border rounded-lg p-6 sticky top-24" role="status">
        <h3 className="text-xl font-bold text-green-700 mb-3">
          {language === 'vi' ? 'Đã tiếp nhận yêu cầu' : 'Request received'}
        </h3>
        <p className="text-gray-700 mb-4">{t.bookingSuccess}</p>
        <div className="rounded-md bg-gray-50 p-4 text-sm">
          <span className="text-gray-500">
            {language === 'vi' ? 'Mã yêu cầu' : 'Request code'}
          </span>
          <p className="font-bold text-lg">{submittedBooking.bookingCode}</p>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)) {
      toast.error(language === 'vi' ? 'Vui lòng chọn ngày nhận và trả phòng hợp lệ' : 'Please select valid check-in and check-out dates');
      return;
    }
    if (guests < 1 || guests > maxOccupancy) {
      toast.error(language === 'vi' ? `Phòng này nhận tối đa ${maxOccupancy} khách` : `This room allows up to ${maxOccupancy} guests`);
      return;
    }

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
    <div className="bg-white border rounded-lg p-4 sm:p-6 lg:sticky lg:top-24">
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
