'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { propertiesApi, getApiData } from '@/lib/api';
import { Loader2, MapPin, ArrowUpRight } from 'lucide-react';

const brands: { id: string; label: string }[] = [
  { id: 'all', label: 'Tất Cả Thương Hiệu' },
  { id: 'haidang-homestays', label: 'HAIDANG HOMESTAYS' },
];

const cities: { id: string; label: string }[] = [
  { id: 'all', label: 'TẤT CẢ THÀNH PHỐ' },
  { id: 'ho-chi-minh', label: 'HỒ CHÍ MINH' },
  { id: 'ha-noi', label: 'HÀ NỘI' },
  { id: 'da-nang', label: 'ĐÀ NẴNG' },
  { id: 'hoi-an', label: 'HỘI AN' },
  { id: 'da-lat', label: 'ĐÀ LẠT' },
  { id: 'nha-trang', label: 'NHA TRANG' },
  { id: 'phu-quoc', label: 'PHÚ QUỐC' },
];

export const DestinationHighlightsSection = () => {
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const { data: propertiesResponse, isLoading } = useQuery({
    queryKey: ['properties-featured', 20],
    queryFn: () => propertiesApi.getAll({ pageSize: 20, language: 'vi' }),
  });

  const propertiesData = getApiData(propertiesResponse) as
    | { items: any[]; totalCount: number }
    | null;
  const allProperties: any[] = propertiesData?.items ?? [];

  const visibleProperties = useMemo(() => {
    if (selectedCity === 'all') return allProperties;
    const selectedLabel = cities.find((c) => c.id === selectedCity)?.label ?? '';
    return allProperties.filter(
      (p: any) => (p.city ?? '').toLowerCase() === selectedLabel.toLowerCase()
    );
  }, [allProperties, selectedCity]);

  return (
    <section className="w-full bg-surface-container-lowest py-[100px]">
      <div className="max-w-container-max mx-auto px-margin-desktop">
        {/* Section Header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-16 items-end">
          <div className="md:col-span-7">
            <span className="text-primary font-label-sm tracking-[0.3em] text-[10px] uppercase mb-4 block">
              — ĐIỂM ĐẾN 002
            </span>
            <h2 className="font-display-lg text-headline-lg md:text-[64px] text-on-surface leading-tight">
              Khám phá không gian phù hợp với phong cách của{' '}
              <span className="text-primary">bạn.</span>
            </h2>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Left Sidebar Filters */}
          <aside className="md:col-span-3">
            <div className="mb-8">
              <h3 className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-widest font-bold mb-6">
                THƯƠNG HIỆU
              </h3>
              <ul className="space-y-0 border-t border-outline-variant/30">
                {brands.map((brand, index) => (
                  <li
                    key={brand.id}
                    className={`py-4 border-b border-outline-variant/30 flex items-center justify-between ${
                      index === 0 ? '' : ''
                    }`}
                  >
                    <span
                      className={`font-label-md text-xs ${
                        index === 0
                          ? 'text-on-surface font-bold'
                          : 'text-on-surface-variant uppercase tracking-wider'
                      }`}
                    >
                      {brand.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main Area */}
          <div className="md:col-span-9">
            <div className="mb-8">
              {/* City Tabs */}
              <div className="flex flex-wrap gap-3 mb-8">
                {cities.map((city) => {
                  const isSelected = selectedCity === city.id;
                  return (
                    <button
                      key={city.id}
                      onClick={() => setSelectedCity(city.id)}
                      className={`px-6 py-2 rounded-full font-label-sm text-[11px] font-bold uppercase tracking-widest transition-colors ${
                        isSelected
                          ? 'bg-on-surface text-white'
                          : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {city.label}
                    </button>
                  );
                })}
              </div>

              {/* Count Header */}
              <div className="flex items-start justify-between border-b border-outline-variant/30 pb-4 gap-4">
                <span className="text-[10px] text-on-surface-variant uppercase tracking-widest whitespace-nowrap ml-4 pt-4">
                  {isLoading
                    ? 'Đang tải...'
                    : `${visibleProperties.length} điểm lưu trú · sắp xếp theo Nổi Bật`}
                </span>
              </div>
            </div>

            {/* Property Grid */}
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-gray-500">Đang tải...</span>
              </div>
            ) : visibleProperties.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p>Chưa có cơ sở lưu trú nào ở khu vực này.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                {visibleProperties.map((property: any) => {
                  const fallbackImage =
                    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
                  const image = property.thumbnailUrl || fallbackImage;
                  const district = property.district || property.city || '';
                  const price =
                    property.minPrice != null
                      ? `từ ${Number(property.minPrice).toLocaleString('vi-VN')}đ · mỗi đêm`
                      : 'Liên hệ';
                  return (
                    <article key={property.id} className="flex flex-col group">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-4 bg-gray-100">
                        <img
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          src={image}
                          alt={property.name}
                          loading="lazy"
                        />
                        {property.isFeatured && (
                          <div className="absolute top-4 left-4 flex gap-2">
                            <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                              Nổi bật
                            </span>
                          </div>
                        )}
                        {district && (
                          <div className="absolute top-4 right-4 text-white text-[10px] font-bold uppercase tracking-widest bg-black/40 px-2 py-1 rounded">
                            {String(district).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h4 className="font-headline-md text-[18px] text-on-surface leading-tight">
                            {property.name}
                          </h4>
                          <Link
                            href={`/properties/${property.id}`}
                            className="text-primary text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 hover:underline flex-shrink-0"
                          >
                            ĐẶT NGAY
                            <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                          </Link>
                        </div>
                        <p className="text-[11px] text-on-surface-variant">{price}</p>
                        {property.categoryName && (
                          <p className="text-[11px] text-on-surface-variant mt-1">
                            {property.categoryName}
                          </p>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
