'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesApi, getApiData, BRANDS, BrandName } from '@/lib/api';
import { useLanguageStore } from '@/stores/language';
import Link from 'next/link';

type PropertyCard = {
  id: string;
  name: string;
  brandName?: string | null;
  city?: string | null;
  categoryName?: string;
  thumbnailUrl?: string | null;
  isFeatured: boolean;
  minPrice?: number | null;
};

function formatVnd(amount?: number | null): string {
  if (!amount || amount <= 0) return 'Liên hệ';
  return `${amount.toLocaleString('vi-VN')}₫ / đêm`;
}

const APARTMENT_REGEX = /c[aă]n\s*h[oộ]|apartment/i;

function isApartment(categoryName?: string): boolean {
  if (!categoryName) return false;
  return APARTMENT_REGEX.test(categoryName);
}

export function FeaturedOnHomeSection() {
  const { language } = useLanguageStore();
  const [selectedBrand, setSelectedBrand] = useState<'all' | BrandName>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['home-featured', language],
    queryFn: async () => {
      const res = await propertiesApi.getAll({ pageSize: 100, language });
      return getApiData(res);
    },
  });

  const featured: PropertyCard[] = useMemo(() => {
    const list: PropertyCard[] = ((data?.items as PropertyCard[]) ?? []).filter(
      (p) => p?.isFeatured && p?.brandName,
    );
    return list;
  }, [data]);

  const brandOptions = useMemo<string[]>(() => {
    const set = new Set<string>();
    for (const p of featured) if (p.brandName) set.add(p.brandName);
    // Đảm bảo luôn show 2 brand đã định nghĩa ngay cả khi DB chưa có data
    for (const b of BRANDS) set.add(b);
    return Array.from(set);
  }, [featured]);

  const cityOptions = useMemo<string[]>(() => {
    const set = new Set<string>();
    for (const p of featured) if (p.city) set.add(p.city);
    return Array.from(set).sort();
  }, [featured]);

  const visible = useMemo(() => {
    return featured.filter((p) => {
      const brandOk =
        selectedBrand === 'all' || p.brandName === selectedBrand;
      const cityOk = selectedCity === 'all' || p.city === selectedCity;
      return brandOk && cityOk;
    });
  }, [featured, selectedBrand, selectedCity]);

  // UX: nếu chọn brand nhưng city filter rỗng -> fallback city = all
  const effectiveCity = useMemo(() => {
    if (selectedCity !== 'all' && visible.length === 0) return 'all';
    return selectedCity;
  }, [selectedCity, visible.length]);

  const finalList = useMemo(() => {
    if (effectiveCity !== selectedCity) {
      return featured.filter((p) => {
        const brandOk =
          selectedBrand === 'all' || p.brandName === selectedBrand;
        return brandOk;
      });
    }
    return visible;
  }, [featured, selectedBrand, selectedCity, effectiveCity, visible]);

  if (isLoading) {
    return (
      <section className="w-full bg-white px-6 md:px-16 py-16">
        <div className="max-w-screen-xl mx-auto text-center text-gray-500">
          Đang tải điểm lưu trú...
        </div>
      </section>
    );
  }

  if (featured.length === 0) {
    return (
      <section className="w-full bg-white px-6 md:px-16 py-20">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="text-xs tracking-[3px] text-[#D24A15] mb-3">
            — ĐIỂM ĐẾN 002
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-gray-900 mb-4">
            Những điểm lưu trú chọn lọc khắp{' '}
            <span className="text-[#D24A15]">Việt Nam.</span>
          </h2>
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            Manager hãy gắn thẻ &quot;Nổi bật&quot; cho căn nhà để hiển thị tại
            đây.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-white px-6 md:px-16 py-20">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid md:grid-cols-12 gap-6 mb-10">
          <div className="md:col-span-8">
            <p className="text-xs tracking-[3px] text-[#D24A15] mb-3">
              — ĐIỂM ĐẾN 002
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
              Những điểm lưu trú chọn lọc khắp{' '}
              <span className="text-[#D24A15]">Việt Nam.</span>
            </h2>
          </div>
          <div className="md:col-span-4 self-end">
            <p className="text-sm text-gray-600 leading-relaxed">
              Từ những ngôi nhà phố di sản trong khu phố cổ Hà Nội đến những
              khu nghỉ dưỡng giữa rừng thông Đà Lạt — mỗi điểm đến đều được
              tuyển chọn kỹ lưỡng và đặc biệt riêng.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* BRAND SIDEBAR */}
          <aside className="md:col-span-3 space-y-6">
            <div>
              <p className="text-[11px] font-semibold tracking-[1.1px] text-gray-700 mb-4">
                THƯƠNG HIỆU
              </p>
              <div className="border-t border-[#e2bfb54c]">
                <button
                  type="button"
                  onClick={() => setSelectedBrand('all')}
                  className={`w-full flex items-center justify-between px-0 py-4 border-b border-[#e2bfb54c] text-left ${
                    selectedBrand === 'all'
                      ? 'text-[#1c1b1b] font-semibold'
                      : 'text-gray-700 font-normal'
                  }`}
                >
                  <span className="text-xs">Tất Cả Thương Hiệu</span>
                  <span
                    className={`w-1 h-1 rounded-full ${
                      selectedBrand === 'all' ? 'bg-[#D24A15]' : 'bg-transparent'
                    }`}
                  />
                </button>
                {brandOptions.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBrand(b as BrandName)}
                    className={`w-full flex flex-col items-start pt-5 pb-4 border-b border-[#e2bfb54c] text-left ${
                      selectedBrand === b
                        ? 'text-[#1c1b1b] font-semibold'
                        : 'text-gray-700 font-normal'
                    }`}
                  >
                    <span className="text-xs tracking-wide">{b}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#f0edec] rounded-xl p-5">
              <p className="text-[11px] font-semibold tracking-[1.1px] text-[#D24A15] mb-2">
                ƯU ĐÃI HỘI VIÊN
              </p>
              <p className="text-xs text-gray-700 leading-relaxed mb-3">
                Hội viên thân thiết được giảm đến 20% mức giá linh hoạt tốt
                nhất, kèm trà phòng muộn miễn phí.
              </p>
              <button
                type="button"
                className="text-[11px] font-semibold tracking-[1.1px] text-[#1c1b1b]"
              >
                ĐĂNG KÝ MIỄN PHÍ →
              </button>
            </div>
          </aside>

          {/* CITY TABS + RESULTS */}
          <div className="md:col-span-9 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSelectedCity('all')}
                className={`px-5 py-2 rounded-full text-[11px] font-semibold tracking-[1.1px] transition-colors ${
                  selectedCity === 'all'
                    ? 'bg-[#1c1b1b] text-white'
                    : 'border border-[#e2bfb5] text-gray-700'
                }`}
              >
                TẤT CẢ THÀNH PHỐ
              </button>
              {cityOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedCity(c)}
                  className={`px-5 py-2 rounded-full text-[11px] font-semibold tracking-[1.1px] transition-colors ${
                    selectedCity === c
                      ? 'bg-[#1c1b1b] text-white'
                      : 'border border-[#e2bfb5] text-gray-700'
                  }`}
                >
                  {c.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between border-b border-[#e2bfb54c] pb-4">
              <p className="text-[10px] tracking-[1px] text-gray-600">
                {finalList.length} ĐIỂM LƯU TRÚ · SẮP XẾP THEO NỔI BẬT
              </p>
            </div>

            {finalList.length === 0 ? (
              <div className="py-16 text-center bg-[#fcf9f8] rounded-2xl">
                <p className="text-gray-500 text-sm">
                  Không có điểm lưu trú nào khớp với bộ lọc hiện tại.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {finalList.map((p) => (
                  <article
                    key={p.id}
                    className="group flex flex-col"
                  >
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-gray-100">
                      {p.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          alt={p.name}
                          src={p.thumbnailUrl}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                          No image
                        </div>
                      )}

                      {/* Brand chip góc trái dưới */}
                      {p.brandName && (
                        <div className="absolute left-4 bottom-4 bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2 shadow">
                          <span className="w-1.5 h-1.5 bg-[#D24A15] rounded-full" />
                          <span className="text-[9px] font-semibold tracking-[0.9px] text-[#1c1b1b]">
                            {p.brandName}
                          </span>
                        </div>
                      )}

                      {/* Apartment badge góc phải trên */}
                      {isApartment(p.categoryName) && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-blue-600 text-white text-[10px] font-semibold tracking-wider px-2 py-1 rounded-md">
                            CĂN HỘ
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-serif text-lg text-[#1c1b1b] leading-snug line-clamp-2">
                          {p.name}
                        </h3>
                        <Link
                          href={`/properties/${p.id}`}
                          className="shrink-0 inline-flex items-center text-[10px] font-semibold tracking-[1px] text-[#D24A15] hover:underline"
                        >
                          ĐẶT NGAY →
                        </Link>
                      </div>
                      <p className="text-[11px] text-gray-700 tracking-wide">
                        {formatVnd(p.minPrice)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeaturedOnHomeSection;