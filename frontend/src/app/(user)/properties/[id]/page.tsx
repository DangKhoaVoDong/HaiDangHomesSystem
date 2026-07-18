'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { propertiesApi, roomsApi, getApiData } from '@/lib/api';
import { useLanguageStore } from '@/stores/language';
import { BookingForm } from '@/components/BookingForm';
import {
  MapPin,
  Star,
  Wifi,
  Car,
  Coffee,
  Tv,
  Wind,
  Users,
  Bed,
  Bath,
  Maximize,
  Calendar,
  Check,
  ArrowRight,
  ChevronDown,
  Phone,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const defaultAmenityIcons = [Wifi, Coffee, Wind, Bath, Tv, Car, Users, Check];

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params.id as string;
  const { language } = useLanguageStore();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', propertyId, language],
    queryFn: () => propertiesApi.getById(propertyId, { language }),
  });

  const { data: rooms } = useQuery({
    queryKey: ['rooms', propertyId, language],
    queryFn: () => roomsApi.getByPropertyId(propertyId, { language }),
  });

  const propertyData = getApiData(property) as any;
  const roomList: any[] = getApiData(rooms) || [];

  const amenityList: { name: string; id?: string }[] = (propertyData?.amenities ?? []).map(
    (a: any) => ({ name: a.name, id: a.id })
  );
  while (amenityList.length > 0 && amenityList.length < 4) {
    amenityList.push({ name: 'Dọn phòng hàng ngày' });
  }

  const categoryName: string = (propertyData?.categoryName ?? '').toString();
  const isApartment = /c[aă]n\s*h[oộ]|apartment/i.test(categoryName);
  const allowRoomSelection = !isApartment;

  const allImages: string[] = [];
  if (propertyData?.thumbnailUrl) allImages.push(propertyData.thumbnailUrl);
  if (Array.isArray(propertyData?.images)) {
    propertyData.images.forEach((img: any) => {
      if (img?.imageUrl && !allImages.includes(img.imageUrl)) allImages.push(img.imageUrl);
    });
  }
  if (allImages.length === 0) {
    allImages.push('https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80');
  }

  const roomListSafe: any[] = useMemo(
    () => (roomList.length > 0 ? roomList : (propertyData?.rooms ?? [])),
    [roomList, propertyData]
  );
  const defaultRoom = roomListSafe[0];
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    defaultRoom?.id ?? null
  );
  useEffect(() => {
    if (!selectedRoomId && defaultRoom?.id) {
      setSelectedRoomId(defaultRoom.id);
    }
  }, [defaultRoom, selectedRoomId]);

  const selectedRoom: any = useMemo(
    () => roomListSafe.find((r: any) => r.id === selectedRoomId) ?? defaultRoom,
    [roomListSafe, selectedRoomId, defaultRoom]
  );

  const headerGallery: string[] = useMemo(() => {
    if (selectedRoom && Array.isArray(selectedRoom.images) && selectedRoom.images.length > 0) {
      const urls = selectedRoom.images
        .map((img: any) => img?.imageUrl)
        .filter((u: any): u is string => typeof u === 'string' && u.length > 0);
      if (urls.length > 0) {
        return [selectedRoom.primaryImageUrl, ...urls].filter(
          (u, i, arr) => typeof u === 'string' && u.length > 0 && arr.indexOf(u) === i
        );
      }
    }
    return allImages;
  }, [selectedRoom, allImages]);
  const [mainImage, ...restImages] = headerGallery;

  const topRef = useRef<HTMLDivElement>(null);
  const scrollToGallery = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const activeRoom = selectedRoom;
  const minPrice = activeRoom?.pricePerNight ?? propertyData?.rooms?.[0]?.pricePerNight ?? null;
  const maxOccupancy = activeRoom?.maxOccupancy ?? propertyData?.totalRooms ?? 2;
  const sizeInSqm = activeRoom?.sizeInSqm ?? null;
  const beds = activeRoom?.bedCount ?? null;
  const bathrooms = activeRoom?.bathroomCount ?? null;
  const roomName = activeRoom?.name ?? propertyData?.name ?? '';

  const translations = {
    vi: {
      description: 'Mô tả',
      amenities: 'Tiện ích',
      rooms: 'Các loại phòng',
      selectRoom: 'Chọn phòng',
      viewAll: 'Xem tất cả',
      guests: 'Khách',
      beds: 'Giường',
      baths: 'Phòng tắm',
      size: 'Diện tích',
      perNight: '/đêm',
      reviews: 'Đánh giá',
      aboutProperty: 'Về cơ sở lưu trú',
      location: 'Vị trí',
      highlights: 'Điểm nhấn',
      policies: 'Chính sách',
      bookNow: 'Đặt ngay',
    },
    en: {
      description: 'Description',
      amenities: 'Amenities',
      rooms: 'Room Types',
      selectRoom: 'Select Room',
      viewAll: 'View all',
      guests: 'Guests',
      beds: 'Beds',
      baths: 'Baths',
      size: 'Size',
      perNight: '/night',
      reviews: 'Reviews',
      aboutProperty: 'About Property',
      location: 'Location',
      highlights: 'Highlights',
      policies: 'Policies',
      bookNow: 'Book Now',
    },
  };

  const t = translations[language];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fcf9f8]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-lg mb-8" />
            <div className="bg-gray-200 h-8 w-1/2 rounded mb-4" />
            <div className="bg-gray-200 h-4 w-1/4 rounded mb-8" />
          </div>
        </div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="min-h-screen bg-[#fcf9f8] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Không tìm thấy cơ sở lưu trú.</p>
          <Link href="/properties" className="text-[#D24A15] hover:underline mt-2 inline-block">
            ← Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f8]" ref={topRef}>
      <main className="max-w-7xl mx-auto px-4 md:px-16 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8 uppercase tracking-wider">
          <Link href="/properties" className="flex items-center gap-1 hover:text-[#D24A15] transition-colors">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Quay Lại
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-900 font-semibold truncate">{propertyData.name}</span>
        </div>

        {/* Header Info */}
        <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">
              {(propertyData.city || '').toString().toUpperCase()} · {propertyData.name}
              {isApartment && (
                <span className="ml-2 inline-block px-2 py-0.5 bg-[#f6f3f2] text-[#D24A15] text-[10px] font-bold rounded">
                  CĂN HỘ
                </span>
              )}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-gray-900 mb-4">
              {allowRoomSelection ? (roomName || propertyData.name) : propertyData.name}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl line-clamp-3">
              {propertyData.description || 'Cơ sở lưu trú cao cấp từ Haidang Homes.'}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 mb-1">
              <Star className="w-4 h-4 fill-[#D24A15] text-[#D24A15]" />
              <span className="font-bold text-gray-900">9.4</span>
              <span className="text-gray-500 text-sm">/ 10 · {t.reviews}</span>
            </div>
            <div className="flex items-center justify-end gap-1 text-gray-500 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{propertyData.address}</span>
            </div>
          </div>
        </div>

        {/* Image Gallery (Asymmetric) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12 h-auto md:h-[600px]">
          <div className="md:col-span-8 relative h-[400px] md:h-full rounded-xl overflow-hidden group bg-gray-100">
            <img
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              src={mainImage}
              alt={propertyData.name}
            />
            <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-gray-700">
              1 / {allImages.length}
            </div>
          </div>

          <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-6 h-[400px] md:h-full">
            {restImages.slice(0, 4).map((img, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden relative bg-gray-100">
                <img className="w-full h-full object-cover" src={img} alt={`View ${idx + 2}`} />
              </div>
            ))}
            {restImages.length === 0 && (
              <div className="rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 text-sm col-span-2 md:col-span-1">
                Chưa có thêm hình ảnh
              </div>
            )}
          </div>
        </div>

        {/* Quick Specs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-gray-200 mb-12">
          <div className="flex items-start gap-3">
            <Maximize className="w-5 h-5 text-[#D24A15] mt-1" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t.size}</p>
              <p className="font-semibold text-gray-900">{sizeInSqm ? `${sizeInSqm} m²` : '—'}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Bed className="w-5 h-5 text-[#D24A15] mt-1" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t.beds}</p>
              <p className="font-semibold text-gray-900">{beds ?? '—'} giường</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-[#D24A15] mt-1" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t.guests}</p>
              <p className="font-semibold text-gray-900">{maxOccupancy} người</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Bath className="w-5 h-5 text-[#D24A15] mt-1" />
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t.baths}</p>
              <p className="font-semibold text-gray-900">{bathrooms ?? '—'} phòng tắm</p>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Details */}
          <div className="lg:col-span-8 space-y-12">
            {/* Intro Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-4 h-[1px] bg-gray-300" />
                <h2 className="text-xs uppercase tracking-widest text-gray-500">Giới Thiệu</h2>
              </div>
              <h3 className="font-serif text-2xl text-[#D24A15] mb-6">
                {propertyData.description?.split('.')[0] || 'Không gian lưu trú cao cấp'}
              </h3>
              <div className="space-y-4 text-gray-600">
                {propertyData.description ? (
                  propertyData.description
                    .split('.')
                    .filter((s: string) => s.trim().length > 0)
                    .map((para: string, idx: number) => (
                      <p key={idx}>{para.trim()}.</p>
                    ))
                ) : (
                  <p>
                    Cơ sở lưu trú này thuộc hệ thống Haidang Homes với đầy đủ tiện nghi hiện đại,
                    phục vụ 24/7 và không gian sang trọng.
                  </p>
                )}
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Highlights Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-4 h-[1px] bg-gray-300" />
                <h2 className="text-xs uppercase tracking-widest text-gray-500">Điểm Nhấn</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  `${propertyData.totalRooms ?? 0} phòng tiện nghi hiện đại`,
                  `${propertyData.categoryName ?? 'Phòng cao cấp'}`,
                  propertyData.city ? `Vị trí trung tâm ${propertyData.city}` : 'Vị trí thuận tiện',
                  'Phục vụ 24/7 & dọn phòng hàng ngày',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="text-[#D24A15] mt-1">●</span>
                    <span className="text-gray-900">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Amenities Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-4 h-[1px] bg-gray-300" />
                <h2 className="text-xs uppercase tracking-widest text-gray-500">Tiện Nghi Của Cơ Sở</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(amenityList.length > 0
                  ? amenityList
                  : defaultAmenityIcons.map((Ico, idx) => ({ name: ['Wi-Fi', 'Cà phê', 'Điều hòa', 'Bồn tắm'][idx] }))
                )
                  .slice(0, 8)
                  .map((amenity, index) => {
                    const Icon = defaultAmenityIcons[index % defaultAmenityIcons.length];
                    return (
                      <div
                        key={`${amenity.name}-${index}`}
                        className="bg-[#f6f3f2] p-4 rounded-xl flex flex-col items-start gap-3"
                      >
                        <Icon className="w-5 h-5 text-[#D24A15]" />
                        <span className="text-sm font-semibold text-gray-900">{amenity.name}</span>
                      </div>
                    );
                  })}
              </div>
            </section>

            <hr className="border-gray-200" />

            {/* Policies Section */}
            <section>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-4 h-[1px] bg-gray-300" />
                <h2 className="text-xs uppercase tracking-widest text-gray-500">Chính Sách</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="border-l-2 border-[#D24A15] pl-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nhận Phòng</p>
                  <p className="font-semibold text-gray-900">Từ 14:00</p>
                </div>
                <div className="border-l-2 border-[#D24A15] pl-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trả Phòng</p>
                  <p className="font-semibold text-gray-900">Trước 12:00</p>
                </div>
                <div className="border-l-2 border-[#D24A15] pl-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Hủy Miễn Phí</p>
                  <p className="font-semibold text-gray-900">Trước 48 giờ</p>
                </div>
                <div className="border-l-2 border-[#D24A15] pl-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Trẻ Em</p>
                  <p className="font-semibold text-gray-900">Miễn phí dưới 6 tuổi</p>
                </div>
              </div>
            </section>

            {/* Room Types Section — hidden for Apartments */}
            {allowRoomSelection && (
            <section className="bg-white rounded-2xl p-6">
              <h2 className="font-serif text-2xl text-gray-900 mb-6">Các Loại Phòng</h2>
              <div className="space-y-4">
                {roomListSafe.length > 0 ? (
                  roomListSafe.map((room: any) => {
                    const isSelected = room.id === selectedRoomId;
                    return (
                    <div
                      key={room.id}
                      className={`border rounded-xl p-4 flex gap-4 transition-all ${
                        isSelected
                          ? 'border-[#D24A15] ring-2 ring-[#D24A15]/20'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-48 h-32 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {room.primaryImageUrl ? (
                          <img
                            src={room.primaryImageUrl}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#f6f3f2]">
                            <Bed className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 mb-2">{room.name}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {room.maxOccupancy} {t.guests}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />
                            {room.bedCount} {t.beds}
                          </span>
                          <span className="flex items-center gap-1">
                            <Bath className="w-4 h-4" />
                            {room.bathroomCount} {t.baths}
                          </span>
                          <span className="flex items-center gap-1">
                            <Maximize className="w-4 h-4" />
                            {room.sizeInSqm}m²
                          </span>
                        </div>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <span className="text-xl font-bold text-[#D24A15]">
                              {room.pricePerNight?.toLocaleString()} VND
                            </span>
                            <span className="text-gray-500 text-sm"> {t.perNight}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRoomId(room.id);
                              scrollToGallery();
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                              isSelected
                                ? 'bg-white border border-[#D24A15] text-[#D24A15]'
                                : 'bg-[#D24A15] text-white hover:bg-[#b03d10]'
                            }`}
                          >
                            {isSelected ? '✓ Đã chọn' : t.selectRoom}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                  })
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Loader2 className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <p>Đang tải danh sách phòng...</p>
                  </div>
                )}
              </div>
            </section>
            )}
          </div>

          {/* Right Column: Sticky Booking Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
                <div className="mb-6 border-b border-gray-200 pb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="font-serif text-2xl text-[#D24A15] font-bold">
                      {minPrice != null
                        ? `${Number(minPrice).toLocaleString('vi-VN')}`
                        : 'Liên hệ'}
                    </span>
                    {minPrice != null && (
                      <span className="text-sm text-gray-500">VND / {t.perNight}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Giá thấp nhất - đã bao gồm thuế & phí
                  </p>
                  {propertyData.isFeatured && (
                    <div className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      ĐANG ĐƯỢC YÊU THÍCH
                    </div>
                  )}
                </div>

                {activeRoom?.id ? (
                  <BookingForm
                    roomId={activeRoom.id}
                    roomName={roomName || propertyData.name}
                    propertyName={propertyData.name}
                    pricePerNight={minPrice ?? 0}
                    maxOccupancy={maxOccupancy}
                  />
                ) : (
                  <div className="bg-[#f6f3f2] rounded-xl p-5 text-center">
                    <Phone className="w-6 h-6 mx-auto text-[#D24A15] mb-2" />
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {isApartment ? 'Đặt căn hộ trực tiếp' : 'Vui lòng liên hệ để đặt phòng'}
                    </p>
                    <p className="text-xs text-gray-600 mb-3">
                      Cho thuê nguyên căn — liên hệ hotline để được báo giá & sắp xếp.
                    </p>
                    <a
                      href="tel:19001234"
                      className="inline-block w-full bg-[#D24A15] text-white py-2 rounded-full font-medium text-sm hover:bg-[#b03d10] transition-colors"
                    >
                      Gọi 1900 1234
                    </a>
                  </div>
                )}

                <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-1 mt-4">
                  <Check className="w-4 h-4 text-[#D24A15]" />
                  Hủy miễn phí trước 48 giờ
                </div>
              </div>

              <div className="bg-[#f6f3f2] rounded-xl p-4 flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-900">Ưu Đãi Hội Viên</h4>
                <p className="text-sm text-gray-600">
                  Đăng ký miễn phí để giảm thêm 10% và nhận trả phòng muộn đến 16:00.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
