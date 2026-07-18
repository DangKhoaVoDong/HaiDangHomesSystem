'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, MapPin, DollarSign, ArrowUpDown, X } from 'lucide-react';

export interface PropertyFilterState {
  city: string | null;
  priceRange: [number, number] | null;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'newest';
}

interface PropertyFiltersProps {
  cities: string[];
  propertyList: any[];
  value: PropertyFilterState;
  onChange: (state: PropertyFilterState) => void;
}

const PRICE_PRESETS: Array<{ label: string; range: [number, number] }> = [
  { label: 'Tất cả mức giá', range: [0, 0] },
  { label: 'Dưới 1 triệu', range: [0, 1_000_000] },
  { label: '1 - 3 triệu', range: [1_000_000, 3_000_000] },
  { label: '3 - 5 triệu', range: [3_000_000, 5_000_000] },
  { label: 'Trên 5 triệu', range: [5_000_000, 0] },
];

const SORT_OPTIONS: Array<{ id: PropertyFilterState['sortBy']; label: string }> = [
  { id: 'popular', label: 'Phổ biến nhất' },
  { id: 'price-asc', label: 'Giá tăng dần' },
  { id: 'price-desc', label: 'Giá giảm dần' },
  { id: 'newest', label: 'Mới nhất' },
];

function formatVND(value: number): string {
  if (!value) return 'Không giới hạn';
  return value.toLocaleString('vi-VN') + ' đ';
}

export function PropertyFilters({ cities, propertyList, value, onChange }: PropertyFiltersProps) {
  const [openMenu, setOpenMenu] = useState<'city' | 'price' | 'sort' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Derive min/max prices from data to give user a sense of range
  const derivedPrices = propertyList
    .map((p) => Number(p.minPrice ?? 0))
    .filter((n) => Number.isFinite(n) && n > 0);
  const minDataPrice = derivedPrices.length ? Math.min(...derivedPrices) : 0;
  const maxDataPrice = derivedPrices.length ? Math.max(...derivedPrices) : 10_000_000;

  const [customMin, setCustomMin] = useState<string>(
    value.priceRange?.[0] ? String(value.priceRange[0]) : ''
  );
  const [customMax, setCustomMax] = useState<string>(
    value.priceRange?.[1] ? String(value.priceRange[1]) : ''
  );

  // Derive cities from data when available, fall back to preset
  const dataCities = Array.from(
    new Set(
      propertyList
        .map((p) => p.city)
        .filter((c): c is string => typeof c === 'string' && c.trim().length > 0)
    )
  ).sort();

  const cityOptions = ['Tất cả thành phố', ...(dataCities.length ? dataCities : cities)];

  const activeFilterCount =
    (value.city && value.city !== 'Tất cả thành phố' ? 1 : 0) +
    (value.priceRange && (value.priceRange[0] || value.priceRange[1]) ? 1 : 0) +
    (value.sortBy !== 'popular' ? 1 : 0);

  const applyPriceRange = (range: [number, number]) => {
    const isAllZero = range[0] === 0 && range[1] === 0;
    onChange({
      ...value,
      priceRange: isAllZero ? null : range,
    });
    setCustomMin(range[0] ? String(range[0]) : '');
    setCustomMax(range[1] ? String(range[1]) : '');
  };

  const applyCustomPrice = () => {
    const min = parseInt(customMin.replace(/\D/g, '')) || 0;
    const max = parseInt(customMax.replace(/\D/g, '')) || 0;
    if (min === 0 && max === 0) {
      onChange({ ...value, priceRange: null });
    } else if (max === 0) {
      applyPriceRange([min, maxDataPrice]);
    } else {
      applyPriceRange([min, max]);
    }
    setOpenMenu(null);
  };

  const resetAll = () => {
    setCustomMin('');
    setCustomMax('');
    onChange({ city: null, priceRange: null, sortBy: 'popular' });
  };

  const cityDisplay = !value.city || value.city === 'Tất cả thành phố' ? 'Chọn vị trí' : value.city;

  const priceDisplay = !value.priceRange
    ? 'Chọn giá'
    : value.priceRange[1] === 0
    ? `Từ ${formatVND(value.priceRange[0])}`
    : `${formatVND(value.priceRange[0])} - ${formatVND(value.priceRange[1])}`;

  const sortDisplay = SORT_OPTIONS.find((s) => s.id === value.sortBy)?.label ?? 'Phổ biến nhất';

  return (
    <div ref={containerRef} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {/* City filter */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'city' ? null : 'city')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
              value.city && value.city !== 'Tất cả thành phố'
                ? 'bg-[#D24A15] text-white border-[#D24A15]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{cityDisplay}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'city' ? 'rotate-180' : ''}`} />
          </button>
          {openMenu === 'city' && (
            <div className="absolute z-30 mt-2 w-64 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1">
              {cityOptions.map((city) => (
                <button
                  key={city}
                  onClick={() => {
                    const next = city === 'Tất cả thành phố' ? null : city;
                    onChange({ ...value, city: next });
                    setOpenMenu(null);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    (value.city ?? 'Tất cả thành phố') === city
                      ? 'bg-orange-50 text-[#D24A15] font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price filter */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'price' ? null : 'price')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-colors ${
              value.priceRange
                ? 'bg-[#D24A15] text-white border-[#D24A15]'
                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>{priceDisplay}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'price' ? 'rotate-180' : ''}`} />
          </button>
          {openMenu === 'price' && (
            <div className="absolute z-30 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-lg p-4">
              <div className="space-y-1 mb-3">
                {PRICE_PRESETS.map((preset) => {
                  const isActive =
                    JSON.stringify(preset.range) === JSON.stringify(value.priceRange ?? [0, 0]);
                  return (
                    <button
                      key={preset.label}
                      onClick={() => {
                        applyPriceRange(preset.range);
                        setOpenMenu(null);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-50 ${
                        isActive ? 'bg-orange-50 text-[#D24A15] font-medium' : 'text-gray-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">
                  Khoảng giá ({formatVND(minDataPrice)} - {formatVND(maxDataPrice)})
                </p>
                <div className="flex items-center gap-2">
                  <input
                    inputMode="numeric"
                    placeholder="Từ"
                    value={customMin}
                    onChange={(e) => setCustomMin(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D24A15]"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    inputMode="numeric"
                    placeholder="Đến"
                    value={customMax}
                    onChange={(e) => setCustomMax(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-[#D24A15]"
                  />
                </div>
                <button
                  onClick={applyCustomPrice}
                  className="mt-2 w-full bg-[#D24A15] hover:bg-[#b03d10] text-white text-sm font-medium rounded-md py-1.5"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setOpenMenu(openMenu === 'sort' ? null : 'sort')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border border-gray-200 bg-white text-gray-700 hover:border-gray-300"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>Sắp xếp: {sortDisplay}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${openMenu === 'sort' ? 'rotate-180' : ''}`} />
          </button>
          {openMenu === 'sort' && (
            <div className="absolute z-30 right-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg py-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    onChange({ ...value, sortBy: opt.id });
                    setOpenMenu(null);
                  }}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                    value.sortBy === opt.id
                      ? 'bg-orange-50 text-[#D24A15] font-medium'
                      : 'text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reset */}
        {activeFilterCount > 0 && (
          <button
            onClick={resetAll}
            className="ml-auto flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:text-[#D24A15]"
          >
            <X className="w-4 h-4" />
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
