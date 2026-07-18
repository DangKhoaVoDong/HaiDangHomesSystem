'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { roomsApi } from '@/lib/api';
import { useLanguageStore } from '@/stores/language';
import { BookingForm } from '@/components/BookingForm';
import { MapPin, Users, Bed, Bath, Maximize } from 'lucide-react';

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const roomId = params.id as string;
  const propertyId = searchParams.get('propertyId') || '';
  const { language } = useLanguageStore();

  const { data: room, isLoading } = useQuery({
    queryKey: ['room', roomId, language],
    queryFn: () => roomsApi.getById(roomId, { language }),
  });

  const roomData = room?.data?.data;

  const translations = {
    vi: {
      loading: 'Đang tải...',
      notFound: 'Không tìm thấy phòng',
    },
    en: {
      loading: 'Loading...',
      notFound: 'Room not found',
    },
  };

  const t = translations[language];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-96 rounded-lg mb-8"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500">{t.notFound}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Room Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 mb-6">
              <h1 className="text-3xl font-bold mb-4">{roomData.name}</h1>
              
              {/* Images */}
              <div className="grid grid-cols-4 gap-2 mb-6">
                {roomData.images?.slice(0, 4).map((img: any, index: number) => (
                  <div key={img.id} className={`${index === 0 ? 'col-span-2 row-span-2' : ''}`}>
                    <img
                      src={img.imageUrl}
                      alt={img.caption || `Room image ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ))}
              </div>

              {/* Room Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="h-5 w-5" />
                  <span>{roomData.maxOccupancy} guests</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Bed className="h-5 w-5" />
                  <span>{roomData.bedCount} beds</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Bath className="h-5 w-5" />
                  <span>{roomData.bathroomCount} baths</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Maximize className="h-5 w-5" />
                  <span>{roomData.sizeInSqm}m²</span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-600">{roomData.description || 'No description available.'}</p>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {roomData.amenities?.map((amenity: any) => (
                    <div key={amenity.id} className="flex items-center gap-2 text-gray-600">
                      <span>✓</span>
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <BookingForm
              roomId={roomId}
              roomName={roomData.name}
              propertyName={roomData.propertyName}
              pricePerNight={roomData.pricePerNight}
              maxOccupancy={roomData.maxOccupancy}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
