'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertiesApi, categoriesApi, roomsApi, amenitiesApi, getApiData } from '@/lib/api';
import { useLanguageStore } from '@/stores/language';
import { SearchBox } from '@/components/SearchBox';
import { PropertyFilters, PropertyFilterState } from '@/components/PropertyFilters';
import { MapPin, Star, Wifi, Coffee, Car, Check, Phone, ChevronDown, Building2, Home } from 'lucide-react';
import Link from 'next/link';
import { PropertyList } from '@/types';

// ─── Date helper: format yyyy-MM-dd → Vietnamese short date ─────────────
function formatViDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const months = ['Th01', 'Th02', 'Th03', 'Th04', 'Th05', 'Th06', 'Th07', 'Th08', 'Th09', 'Th10', 'Th11', 'Th12'];
  return `${weekdays[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<PropertiesLoading />}>
      <PropertiesContent />
    </Suspense>
  );
}

function PropertiesLoading() {
  return (
    <div className="min-h-screen bg-[#f6f3f2]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-2xl mb-6" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl h-64" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PropertiesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguageStore();
  const [openSearchPanel, setOpenSearchPanel] = useState<'city' | 'checkIn' | 'checkOut' | 'guests' | null>(null);

  const categoryId = searchParams.get('category');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', categoryId, language],
    queryFn: () => propertiesApi.getAll({ language }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', language],
    queryFn: () => categoriesApi.getAll(language),
  });

  // Backend returns SearchResult with items for getAll, array for getAll categories
  const propertiesData = getApiData(properties) as { items: any[]; totalCount: number; page: number; pageSize: number; totalPages: number } | null;
  const propertyList: any[] = propertiesData?.items || [];
  const categoryList: any[] = getApiData(categories) || [];

  const cities = useMemo(() => {
    const fromData = Array.from(
      new Set(
        propertyList
          .map((p: any) => p.city)
          .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
      )
    ).sort();
    return fromData.length
      ? fromData
      : ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hội An', 'Đà Lạt'];
  }, [propertyList]);

  // Property type tabs (Tất cả / Khách sạn / Villa)
  const tabs = [
    { id: 'all', label: 'Tất cả', icon: Building2, match: () => true },
    { id: 'hotel', label: 'Khách sạn', icon: Building2, match: (cat: string = '') => /kh[aá]ch s[aạ]n|hotel/i.test(cat) },
    { id: 'villa', label: 'Villa', icon: Home, match: (cat: string = '') => /villa/i.test(cat) },
  ];
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const amenitiesQuery = useQuery({
    queryKey: ['amenities'],
    queryFn: async () => {
      const res = await amenitiesApi.getAll();
      return getApiData(res) || [];
    },
  });
  const amenitiesList: any[] = amenitiesQuery.data || [];

  const amenitiesOnProperties = useMemo(() => {
    const ids = new Set<string>();
    for (const p of propertyList) {
      const list: any[] = p.amenities || p.amenityIds || [];
      for (const a of list) {
        if (a?.id) ids.add(String(a.id));
        else if (typeof a === 'string') ids.add(a);
      }
    }
    return amenitiesList.filter((a) => ids.has(String(a.id)));
  }, [propertyList, amenitiesList]);

  const tabCounts = useMemo(() => {
    const counts: Record<string, number> = { all: propertyList.length };
    for (const tab of tabs) {
      if (tab.id === 'all') continue;
      counts[tab.id] = propertyList.filter((p: any) =>
        tab.match(p.categoryName || p.category?.name || '')
      ).length;
    }
    return counts;
  }, [propertyList, categories, language]);

  const activeMatch = tabs.find((t) => t.id === activeTab)?.match ?? (() => true);
  const filteredProperties = useMemo(
    () => propertyList.filter((p: any) => activeMatch(p.categoryName || p.category?.name || '')),
    [propertyList, activeTab, language]
  );

  // ─── Advanced filters (City, Price, Sort) ─────────────────────────────
  const [filterState, setFilterState] = useState<PropertyFilterState>({
    city: null,
    priceRange: null,
    sortBy: 'popular',
  });

  // ─── Apply filter from URL params (from Home SearchBox) ──────────────
  // Only set the city filter if it actually exists in the loaded data,
  // otherwise the page would appear empty (DB rows currently have empty city).
  const [filterInitialized, setFilterInitialized] = useState(false);
  useEffect(() => {
    if (filterInitialized) return;
    const cityParam = searchParams.get('city') || searchParams.get('location') || '';
    if (cityParam && propertyList.some((p: any) => (p.city ?? '').toLowerCase().includes(cityParam.toLowerCase()))) {
      setFilterState({ city: cityParam, priceRange: null, sortBy: 'popular' });
    }
    setFilterInitialized(true);
  }, [searchParams, propertyList, filterInitialized]);

  // ─── Derived display values for top bar ──────────────────────────────
  const cityParamRaw = searchParams.get('city') || searchParams.get('location') || '';
  const guestsParam = parseInt(searchParams.get('guests') || '0', 10);
  const checkInParam = searchParams.get('checkIn');
  const checkOutParam = searchParams.get('checkOut');

  const displayCity = cityParamRaw || 'Toàn Quốc';
  const displayGuests = Number.isFinite(guestsParam) && guestsParam > 0 ? `${guestsParam} Khách` : '2 Khách';
  const displayCheckIn = checkInParam ? formatViDate(checkInParam) : 'T7 4 Th07 2026';
  const displayCheckOut = checkOutParam ? formatViDate(checkOutParam) : 'CN 5 Th07 2026';

  // City options for the search-bar city popover (derive from data + fallback list)
  const searchCityOptions = useMemo(() => {
    const fromData = Array.from(
      new Set(
        propertyList
          .map((p: any) => p.city)
          .filter((c: any): c is string => typeof c === 'string' && c.trim().length > 0)
      )
    ).sort();
    return ['Toàn Quốc', ...(fromData.length ? fromData : cities)];
  }, [propertyList, cities]);

  const finalProperties = useMemo(() => {
    let list = filteredProperties;
    const { city, priceRange, sortBy } = filterState;

    if (city && city !== 'Tất cả thành phố') {
      list = list.filter((p: any) =>
        (p.city ?? '').toLowerCase().includes(city.toLowerCase())
      );
    }
    if (priceRange && (priceRange[0] || priceRange[1])) {
      list = list.filter((p: any) => {
        const price = Number(p.minPrice ?? 0);
        if (!price) return true;
        const lo = priceRange[0] || 0;
        const hi = priceRange[1] || Number.MAX_SAFE_INTEGER;
        return price >= lo && price <= hi;
      });
    }

    let sorted = [...list];
    if (selectedAmenities.length > 0) {
      sorted = sorted.filter((p: any) => {
        const list: any[] = p.amenities || p.amenityIds || [];
        const ids = list.map((a: any) => String(a?.id ?? a));
        return selectedAmenities.every((id) => ids.includes(id));
      });
    }
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => Number(a.minPrice ?? 0) - Number(b.minPrice ?? 0));
        break;
      case 'price-desc':
        sorted.sort((a, b) => Number(b.minPrice ?? 0) - Number(a.minPrice ?? 0));
        break;
      case 'newest':
        sorted.sort((a, b) => String(b.id).localeCompare(String(a.id)));
        break;
      default:
        sorted.sort((a, b) => Number(b.isFeatured ?? 0) - Number(a.isFeatured ?? 0));
    }
    return sorted;
  }, [filteredProperties, filterState, selectedAmenities]);

  return (
    <div className="min-h-screen bg-[#f6f3f2]">

      {/* Search Section */}
      <div className="bg-white border-b border-gray-200 py-4 hidden md:block">
        <div className="max-w-[96rem] mx-auto px-6">
          <div className="flex items-stretch bg-white border border-gray-200 rounded-full py-2 px-4 shadow-sm gap-1 relative">
            {/* Vị trí */}
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setOpenSearchPanel(openSearchPanel === 'city' ? null : 'city')}
                className="w-full flex flex-col items-start px-4 hover:bg-gray-50 rounded-l-full transition-colors text-left"
              >
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Chọn vị trí</span>
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap truncate w-full">
                  {displayCity}
                </span>
              </button>
              {openSearchPanel === 'city' && (
                <div className="absolute top-full left-0 mt-2 z-30 bg-white border border-gray-200 rounded-2xl shadow-xl w-72 max-h-80 overflow-y-auto py-2">
                  {searchCityOptions.map((c) => {
                    const valueKey = c === 'Toàn Quốc' ? null : c;
                    const isActive = (filterState.city ?? null) === valueKey;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => {
                          setFilterState((prev) => ({ ...prev, city: valueKey }));
                          setOpenSearchPanel(null);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                          isActive ? 'bg-orange-50 text-[#D24A15] font-medium' : 'text-gray-700'
                        }`}
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="w-px self-stretch bg-gray-200 my-1" />
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setOpenSearchPanel(openSearchPanel === 'checkIn' ? null : 'checkIn')}
                className="w-full flex flex-col items-start px-4 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Nhận phòng</span>
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{displayCheckIn}</span>
              </button>
              {openSearchPanel === 'checkIn' && (
                <input
                  type="date"
                  autoFocus
                  defaultValue={checkInParam || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    const params = new URLSearchParams(Array.from(searchParams.entries()));
                    if (v) params.set('checkIn', v);
                    else params.delete('checkIn');
                    router.replace(`/properties?${params.toString()}`);
                    setOpenSearchPanel(null);
                  }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-2"
                />
              )}
            </div>
            <div className="w-px self-stretch bg-gray-200 my-1" />
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setOpenSearchPanel(openSearchPanel === 'checkOut' ? null : 'checkOut')}
                className="w-full flex flex-col items-start px-4 hover:bg-gray-50 transition-colors text-left"
              >
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Trả phòng</span>
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{displayCheckOut}</span>
              </button>
              {openSearchPanel === 'checkOut' && (
                <input
                  type="date"
                  autoFocus
                  defaultValue={checkOutParam || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    const params = new URLSearchParams(Array.from(searchParams.entries()));
                    if (v) params.set('checkOut', v);
                    else params.delete('checkOut');
                    router.replace(`/properties?${params.toString()}`);
                    setOpenSearchPanel(null);
                  }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30 bg-white border border-gray-200 rounded-xl shadow-xl p-2"
                />
              )}
            </div>
            <div className="w-px self-stretch bg-gray-200 my-1" />
            <div className="relative flex-1 min-w-0">
              <button
                type="button"
                onClick={() => setOpenSearchPanel(openSearchPanel === 'guests' ? null : 'guests')}
                className="w-full flex flex-col items-start px-4 hover:bg-gray-50 rounded-r-full transition-colors text-left"
              >
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Khách</span>
                <span className="text-sm font-medium text-gray-900 whitespace-nowrap">{displayGuests}</span>
              </button>
              {openSearchPanel === 'guests' && (
                <div className="absolute top-full right-0 mt-2 z-30 bg-white border border-gray-200 rounded-2xl shadow-xl w-72 p-4 space-y-1">
                  {[1, 2, 3, 4, 5, 6].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => {
                        const params = new URLSearchParams(Array.from(searchParams.entries()));
                        params.set('guests', String(n));
                        router.replace(`/properties?${params.toString()}`);
                        setOpenSearchPanel(null);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 ${
                        guestsParam === n
                          ? 'bg-orange-50 text-[#D24A15] font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {n} Khách
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/properties"
              className="self-center bg-white border border-[#D24A15] text-[#D24A15] hover:bg-orange-50 font-medium rounded-full px-6 py-2.5 transition-colors ml-2 shrink-0 whitespace-nowrap"
            >
              Tìm phòng
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Left Column (Results) */}
        <div className="flex-1 max-w-[850px]">
          {/* Property Type Tabs (Tất cả / Khách sạn / Villa) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const count = tabCounts[tab.id] ?? 0;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Banner */}
          <div className="relative h-64 rounded-2xl overflow-hidden mb-6">
            <img
              alt="City view"
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1200&h=400&fit=crop"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center p-8">
              <h1 className="text-3xl md:text-4xl text-white font-serif leading-tight">
                Đa phong cách.
                <br />
                Đa trải nghiệm.
                <br />
                <span className="font-serif">Cho hành trình trọn hạnh phúc.</span>
              </h1>
            </div>
          </div>

          {/* Sorting */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <span className="font-medium text-gray-900">
              {finalProperties.length > 0 ? finalProperties.length : propertyList.length || 12} lựa chọn
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sắp xếp</span>
              <div className="relative cursor-pointer flex items-center gap-1">
                <span className="text-sm font-medium text-[#D24A15]">Phổ biến nhất</span>
                <ChevronDown className="w-4 h-4 text-[#D24A15]" />
              </div>
            </div>
          </div>

          {/* Contact Banner */}
          <div className="bg-orange-50 rounded-xl p-4 mb-6 flex items-center gap-2 text-sm text-gray-900">
            <Phone className="w-4 h-4 text-[#D24A15]" />
            <span className="font-medium">Đặt nhiều phòng?</span>
            Chỉ cần gọi <a className="text-[#D24A15] font-medium underline" href="#">1900 3311</a> hoặc{' '}
            <a className="text-[#D24A15] font-medium underline" href="#">email</a>! Đã có Haidang Home lo.
          </div>

          {/* Property Filters (City, Price, Sort) */}
          <PropertyFilters
            cities={cities}
            propertyList={propertyList}
            value={filterState}
            onChange={setFilterState}
          />

          {/* Empty state when nothing matches */}
          {finalProperties.length === 0 && !isLoading && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center mb-6">
              <div className="flex justify-center mb-4">
                <div className="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-[#D24A15]" />
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Không tìm thấy kết quả phù hợp
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Thử điều chỉnh bộ lọc hoặc xoá bộ lọc để thấy nhiều hơn.
              </p>
              <button
                onClick={() =>
                  setFilterState({ city: null, priceRange: null, sortBy: 'popular' })
                }
                className="text-sm font-medium text-[#D24A15] hover:underline"
              >
                Xoá bộ lọc
              </button>
            </div>
          )}

          {/* Dynamic property cards from API */}
          <div className="flex flex-col gap-6 mb-6">
            {finalProperties.length > 0 ? (
              finalProperties.map((property: any) => (
                <article
                  key={property.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row"
                >
                  <div className="relative w-full md:w-1/3 h-56 md:h-64">
                    {property.thumbnailUrl ? (
                      <img
                        alt={property.name}
                        className="w-full h-full object-cover"
                        src={property.thumbnailUrl}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                        No image
                      </div>
                    )}
                    {property.isFeatured && (
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-red-600 text-white text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                          Nổi bật
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4">
                      <span className="text-white font-serif text-xl font-bold tracking-wide drop-shadow-md bg-black/30 px-2 py-1 rounded">
                        {property.name?.split(' ')[0]?.toUpperCase() || 'STAY'}
                      </span>
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {property.categoryName && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {property.categoryName}
                          </span>
                        )}
                        {property.city && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                            {property.city}
                          </span>
                        )}
                      </div>
                      <h2 className="text-xl font-serif font-medium text-gray-900 mb-1">
                        {property.name}
                      </h2>
                      <p className="text-sm text-gray-500 mb-3 flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        {property.address}
                      </p>
                      {property.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                          {property.description}
                        </p>
                      )}
                      {property.totalRooms > 0 && (
                        <p className="text-xs text-gray-500">
                          {property.totalRooms} phòng
                        </p>
                      )}
                    </div>
                    <div className="flex items-end justify-end mt-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          Chỉ từ
                        </div>
                        <div className="text-xl font-bold text-[#D24A15] mb-1">
                          {property.minPrice
                            ? property.minPrice.toLocaleString('vi-VN')
                            : 'Liên hệ'}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">
                          {property.minPrice ? 'Đồng / Đêm • Đã gồm thuế' : ''}
                        </div>
                        <Link
                          href={`/properties/${property.id}`}
                          className="bg-[#D24A15] hover:bg-[#b03d10] text-white font-medium rounded-full px-6 py-2.5 transition-colors text-sm w-full block text-center"
                        >
                          Chọn phòng
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center">
                    <MapPin className="w-7 h-7 text-[#D24A15]" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Không có kết quả phù hợp
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Thử điều chỉnh bộ lọc hoặc xoá bộ lọc để thấy nhiều hơn.
                </p>
                <button
                  onClick={() => {
                    setFilterState({ city: null, priceRange: null, sortBy: 'popular' });
                    setSelectedAmenities([]);
                  }}
                  className="text-sm font-medium text-[#D24A15] hover:underline"
                >
                  Xoá bộ lọc
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar (Filters) */}
        <aside className="w-80 hidden lg:block flex-shrink-0">
          {/* Map Widget */}
          <div className="relative h-32 rounded-xl overflow-hidden mb-6 group cursor-pointer">
            <img
              alt="Map Thumbnail"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop"
            />
            <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-white text-gray-900 font-medium px-4 py-2 rounded-full shadow-sm text-sm">
                Xem bản đồ
              </span>
            </div>
          </div>

          {/* Filters Wrapper */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-6">
            {/* Price Filter */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h3 className="font-medium text-gray-900">Phạm vi giá</h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              <p className="text-xs text-gray-500 mb-4">1 phòng, 1 đêm</p>
              <div className="relative w-full h-1.5 bg-gray-200 rounded-full mb-6">
                <div className="absolute h-full bg-[#D24A15] rounded-full" style={{ left: '0%', right: '20%' }} />
                <div className="absolute w-4 h-4 bg-[#D24A15] rounded-full border-2 border-white shadow -top-1.5 -ml-2" style={{ left: '0%' }} />
                <div className="absolute w-4 h-4 bg-[#D24A15] rounded-full border-2 border-white shadow -top-1.5 -ml-2" style={{ left: '80%' }} />
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                  <input
                    className="w-full text-sm border border-gray-200 rounded-lg pr-6 py-2 focus:ring-[#D24A15] focus:border-[#D24A15]"
                    type="text"
                    defaultValue="750.000"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400">₫</span>
                </div>
                <span className="text-gray-400">-</span>
                <div className="flex-1 relative">
                  <input
                    className="w-full text-sm border border-gray-200 rounded-lg pr-6 py-2 focus:ring-[#D24A15] focus:border-[#D24A15]"
                    type="text"
                    defaultValue="3.700.000"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-400">₫</span>
                </div>
              </div>
              <div className="text-right">
                <button className="text-sm font-medium text-gray-900 hover:text-[#D24A15] inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Xóa bộ lọc
                </button>
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between mb-4 cursor-pointer">
                <h3 className="font-medium text-gray-900">Tiện nghi</h3>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </div>
              {amenitiesOnProperties.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                  {amenitiesOnProperties.map((amenity: any) => {
                    const id = String(amenity.id);
                    const checked = selectedAmenities.includes(id);
                    return (
                      <label
                        key={id}
                        className="flex items-center gap-2 cursor-pointer text-sm text-gray-700 hover:text-gray-900"
                      >
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#D24A15] rounded border-gray-300"
                          checked={checked}
                          onChange={() => {
                            setSelectedAmenities((prev) =>
                              prev.includes(id)
                                ? prev.filter((x) => x !== id)
                                : [...prev, id]
                            );
                          }}
                        />
                        <span className="flex-1 truncate">{amenity.name || amenity.code}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Chưa có tiện nghi nào.</p>
              )}
              {selectedAmenities.length > 0 && (
                <button
                  onClick={() => setSelectedAmenities([])}
                  className="mt-3 text-xs text-[#D24A15] hover:underline font-medium"
                >
                  Xóa bộ lọc tiện nghi
                </button>
              )}
            </div>
          </div>
        </aside>  
      </main>

      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-[#D24A15] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#b03d10] transition-colors z-50">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>
    </div>
  );
}
