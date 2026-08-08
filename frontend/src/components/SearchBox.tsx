'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useLanguageStore } from '@/stores/language';
import { MapPin, Plus, Minus, ChevronLeft, ChevronRight, Compass } from 'lucide-react';
import {
  addMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface GuestConfig {
  adults: number;
  children: number;
  infants: number;
}

const DEFAULT_LOCATIONS = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Hội An',
  'Đà Lạt',
  'Nha Trang',
  'Phú Quốc',
  'Sapa',
  'Huế',
  'Quy Nhơn',
  'Vũng Tàu',
  'Cần Thơ',
];

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguageStore();

  const [openPanel, setOpenPanel] = useState<'location' | 'dates' | 'guests' | null>(null);
  const containerRef = useRef<HTMLFormElement>(null);

  // ─── Hydrate from URL ────────────────────────────────────────────────
  const initialCity = searchParams.get('city') || searchParams.get('location') || '';
  const initialGuests = parseInt(searchParams.get('guests') || '2');
  const initialStart = searchParams.get('checkIn');
  const initialEnd = searchParams.get('checkOut');

  const [location, setLocation] = useState<string>(initialCity);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: initialStart ? new Date(initialStart) : null,
    end: initialEnd ? new Date(initialEnd) : null,
  });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState<GuestConfig>({
    adults: Math.max(1, initialGuests),
    children: 0,
    infants: 0,
  });
  const [viewMonth, setViewMonth] = useState<Date>(
    dateRange.start ? startOfMonth(dateRange.start) : startOfMonth(new Date())
  );

  // ─── Translations ────────────────────────────────────────────────────
  const t = {
    vi: {
      where: 'Địa điểm',
      whereHint: 'Tìm kiếm điểm đến',
      when: 'Kế hoạch chuyến đi',
      checkIn: 'Nhận phòng',
      checkOut: 'Trả phòng',
      datePlaceholder: 'dd/mm/yyyy',
      datesHint: 'Thêm ngày',
      who: 'Số khách',
      search: 'Tìm kiếm',
      months: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
      weekdays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
      pickStart: 'Chọn ngày bắt đầu',
      pickEnd: 'Chọn ngày kết thúc',
      nightsLabel: (n: number) => `${n} đêm`,
      adults: 'Người lớn',
      children: 'Trẻ em',
      infants: 'Em bé',
      age13: 'Từ 13 tuổi trở lên',
      age2to12: 'Từ 2 – 12 tuổi',
      under2: 'Dưới 2 tuổi',
      clear: 'Xóa',
      flexible: 'Linh hoạt',
    },
    en: {
      where: 'Where',
      whereHint: 'Search destinations',
      when: 'When',
      checkIn: 'Check-in',
      checkOut: 'Check-out',
      datePlaceholder: 'mm/dd/yyyy',
      datesHint: 'Add dates',
      who: 'Who',
      search: 'Search',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      pickStart: 'Pick start date',
      pickEnd: 'Pick end date',
      nightsLabel: (n: number) => `${n} ${n === 1 ? 'night' : 'nights'}`,
      adults: 'Adults',
      children: 'Children',
      infants: 'Infants',
      age13: 'Age 13+',
      age2to12: 'Ages 2–12',
      under2: 'Under 2',
      clear: 'Clear',
      flexible: 'Flexible',
    },
  }[language];

  const dateLocale = language === 'vi' ? vi : enUS;

  // ─── Click outside to close ──────────────────────────────────────────
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPanel(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // ─── Date helpers ────────────────────────────────────────────────────
  const isInRange = (day: Date) => {
    if (!dateRange.start) return false;
    if (!dateRange.end && hoverDate && isAfter(hoverDate, dateRange.start)) {
      return isWithinInterval(day, { start: dateRange.start, end: hoverDate });
    }
    if (dateRange.end) {
      return isWithinInterval(day, { start: dateRange.start, end: dateRange.end });
    }
    return false;
  };

  const handleDayClick = (day: Date) => {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: day, end: null });
    } else if (isBefore(day, dateRange.start)) {
      setDateRange({ start: day, end: dateRange.start });
    } else {
      setDateRange({ start: dateRange.start, end: day });
    }
  };

  const nightCount = useMemo(() => {
    if (!dateRange.start || !dateRange.end) return 0;
    return Math.max(0, differenceInDays(dateRange.end, dateRange.start));
  }, [dateRange]);

  // ─── Date input parsers (accepts dd/MM/yyyy or yyyy-MM-dd) ───────────
  const parseDateInput = (raw: string): Date | null => {
    const v = raw.trim();
    if (!v) return null;
    // dd/MM/yyyy (Vietnamese format)
    const dmy = v.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (dmy) {
      const d = parseInt(dmy[1], 10);
      const m = parseInt(dmy[2], 10) - 1;
      const y = parseInt(dmy[3], 10);
      const date = new Date(y, m, d);
      return isNaN(date.getTime()) ? null : date;
    }
    // yyyy-MM-dd (HTML date input)
    const ymd = v.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
    if (ymd) {
      const y = parseInt(ymd[1], 10);
      const m = parseInt(ymd[2], 10) - 1;
      const d = parseInt(ymd[3], 10);
      const date = new Date(y, m, d);
      return isNaN(date.getTime()) ? null : date;
    }
    // Fallback to native Date parsing
    const fallback = new Date(v);
    return isNaN(fallback.getTime()) ? null : fallback;
  };

  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    if (language === 'vi') return format(date, 'dd/MM/yyyy');
    return format(date, 'MM/dd/yyyy');
  };

  const handleDateInputChange = (
    raw: string,
    which: 'start' | 'end'
  ) => {
    const parsed = parseDateInput(raw);
    if (!parsed) {
      // Allow user to keep typing; only sync when fully valid
      if (which === 'start') setDateRange((r) => ({ ...r, start: null }));
      else setDateRange((r) => ({ ...r, end: null }));
      return;
    }
    if (which === 'start') {
      setDateRange({
        start: parsed,
        end: dateRange.end && isBefore(dateRange.end, parsed) ? null : dateRange.end,
      });
      setViewMonth(startOfMonth(parsed));
    } else {
      setDateRange((r) => ({
        start: r.start,
        end: isBefore(parsed, r.start ?? new Date(0)) ? r.start : parsed,
      }));
    }
  };

  const totalGuests = guests.adults + guests.children;
  const dateLabel = useMemo(() => {
    if (!dateRange.start) return t.datesHint;
    if (!dateRange.end) return format(dateRange.start, 'd MMM', { locale: dateLocale });
    return `${format(dateRange.start, 'd MMM', { locale: dateLocale })} – ${format(dateRange.end, 'd MMM', { locale: dateLocale })}`;
  }, [dateRange, t, dateLocale]);

  const guestLabel = useMemo(() => {
    const parts: string[] = [];
    if (guests.adults > 0) parts.push(`${guests.adults} ${language === 'vi' ? 'người lớn' : 'adults'}`);
    if (guests.children > 0) parts.push(`${guests.children} ${language === 'vi' ? 'trẻ em' : 'children'}`);
    if (guests.infants > 0) parts.push(`${guests.infants} ${language === 'vi' ? 'em bé' : 'infants'}`);
    return parts.length ? parts.join(', ') : t.who;
  }, [guests, language, t]);

  // ─── Submit ──────────────────────────────────────────────────────────
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set('city', location);
    if (dateRange.start) params.set('checkIn', format(dateRange.start, 'yyyy-MM-dd'));
    if (dateRange.end) params.set('checkOut', format(dateRange.end, 'yyyy-MM-dd'));
    params.set('guests', String(Math.max(1, totalGuests)));
    setOpenPanel(null);
    router.push(`/properties?${params.toString()}`);
  };

  const updateGuests = (key: keyof GuestConfig, delta: number) => {
    setGuests((prev) => {
      const next = Math.max(0, prev[key] + delta);
      if (key === 'adults' && next < 1) return prev; // at least 1 adult
      return { ...prev, [key]: next };
    });
  };

  // ─── Render month grid ───────────────────────────────────────────────
  const renderMonth = (monthDate: Date) => {
    const start = startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 });
    const days: Date[] = [];
    let d = start;
    while (d <= end) {
      days.push(d);
      d = addDays(d, 1);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (
      <div className="flex-1 min-w-[280px]">
        <div className="text-center font-medium mb-3">
          {format(monthDate, 'MMMM yyyy', { locale: dateLocale })}
        </div>
        <div className="grid grid-cols-7 mb-2">
          {t.weekdays.map((w) => (
            <div key={w} className="text-center text-xs text-gray-500 py-1">{w}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-1">
          {days.map((day) => {
            const inMonth = isSameMonth(day, monthDate);
            const isPast = isBefore(day, today);
            const isStart = dateRange.start && isSameDay(day, dateRange.start);
            const isEnd = dateRange.end && isSameDay(day, dateRange.end);
            const inRange = isInRange(day);
            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isPast || !inMonth}
                onClick={() => handleDayClick(day)}
                onMouseEnter={() => setHoverDate(day)}
                className={[
                  'h-10 w-10 mx-auto rounded-full text-sm transition-colors flex items-center justify-center',
                  !inMonth && 'text-transparent cursor-default',
                  inMonth && isPast && 'text-gray-300 cursor-not-allowed',
                  inMonth && !isPast && !isStart && !isEnd && 'hover:bg-gray-100',
                  (isStart || isEnd) && 'bg-[#D24A15] text-white hover:bg-[#D24A15]',
                  inRange && !isStart && !isEnd && 'bg-orange-100',
                  inMonth && !isPast && !(isStart || isEnd) && !inRange && 'text-gray-900',
                ].filter(Boolean).join(' ')}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <form
      ref={containerRef}
      onSubmit={handleSearch}
      className="relative mx-auto w-full max-w-[1000px] rounded-2xl border border-white/70 bg-white shadow-[0_8px_28px_rgba(0,0,0,.14)] md:rounded-full"
    >
      <div className="grid grid-cols-1 items-stretch divide-y divide-gray-200 md:grid-cols-[1.45fr_1.65fr_1fr_auto] md:divide-x md:divide-y-0">
        {/* Where */}
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === 'location' ? null : 'location')}
          className={`flex min-w-0 items-center text-left px-5 py-3.5 transition-colors md:rounded-l-full md:px-7 ${
            openPanel === 'location' ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-[#e64812]">
              {t.where}
            </span>
            <span className={`mt-1 block truncate text-sm font-medium ${location ? 'text-gray-900' : 'text-gray-400'}`}>
              {location || t.whereHint}
            </span>
          </span>
        </button>

        {/* When - 2 inline date inputs */}
        <div
          className={`grid min-w-0 grid-cols-2 transition-colors ${
            openPanel === 'dates' ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
        >
          {/* Check-in sub-cell */}
          <button type="button" className="flex min-w-0 cursor-pointer items-center border-r border-gray-200/70 px-5 py-3.5 text-left"
            onClick={() => setOpenPanel('dates')}
          >
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-[#e64812]">
                {t.checkIn}
              </span>
              <span className={`mt-1 block truncate text-sm font-medium ${
                  dateRange.start ? 'text-gray-900' : 'text-gray-500'
                }`}
              >{formatDateForInput(dateRange.start) || t.datePlaceholder}</span>
            </div>
          </button>

          {/* Check-out sub-cell */}
          <button type="button" className="flex min-w-0 cursor-pointer items-center px-5 py-3.5 text-left"
            onClick={() => setOpenPanel('dates')}
          >
            <div className="min-w-0 flex-1">
              <span className="block text-xs font-medium text-[#e64812]">
                {t.checkOut}
              </span>
              <span className={`mt-1 block truncate text-sm font-medium ${
                  dateRange.end ? 'text-gray-900' : 'text-gray-500'
                }`}
              >{formatDateForInput(dateRange.end) || t.datePlaceholder}</span>
            </div>
          </button>
        </div>

        {/* Who */}
        <button
          type="button"
          onClick={() => setOpenPanel(openPanel === 'guests' ? null : 'guests')}
          className={`flex min-w-0 items-center px-5 py-3.5 text-left transition-colors ${
            openPanel === 'guests' ? 'bg-gray-100' : 'hover:bg-gray-50'
          }`}
        >
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-medium text-[#e64812]">
              {t.who}
            </span>
            <span className={`mt-1 block truncate text-sm font-medium ${totalGuests > 0 ? 'text-gray-900' : 'text-gray-500'}`}>
              {guestLabel}
            </span>
          </span>
        </button>

        {/* Search button */}
        <div className="flex items-center px-4 py-3 md:px-5 md:py-2">
          <button
            type="submit"
            className="flex w-full min-w-[140px] items-center justify-center rounded-full bg-[#e64812] px-7 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#c93c0d] md:w-auto"
          >
            <span>{language === 'vi' ? 'Tìm phòng' : t.search}</span>
          </button>
        </div>
      </div>

      {/* ─── Location popover ─── */}
      {openPanel === 'location' && (
        <div className="absolute top-full left-0 right-0 md:left-0 md:right-auto md:w-[460px] mt-3 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-40">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {language === 'vi' ? 'Điểm đến phổ biến' : 'Popular destinations'}
            </p>
            <button
              type="button"
              onClick={() => { setLocation(''); }}
              className="text-xs underline text-gray-500 hover:text-gray-900"
            >
              {t.clear}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
            {DEFAULT_LOCATIONS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => { setLocation(c); setOpenPanel('dates'); }}
                className={`flex items-center gap-2 text-left px-3 py-2 rounded-xl text-sm border transition-colors ${
                  location === c
                    ? 'border-[#D24A15] bg-orange-50 text-[#D24A15]'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <MapPin className="w-4 h-4 shrink-0 text-gray-400" />
                {c}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              {language === 'vi' ? 'Hoặc nhập địa điểm' : 'Or enter location'}
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t.whereHint}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D24A15]"
            />
          </div>
        </div>
      )}

      {/* ─── Dates popover (dual-month) ─── */}
      {openPanel === 'dates' && (
        <>
        <button type="button" aria-label="Close calendar" onClick={() => setOpenPanel(null)} className="fixed inset-0 z-30 cursor-default bg-black/30 backdrop-blur-[1px]" />
        <div className="absolute left-1/2 top-[calc(100%+18px)] z-40 w-[min(740px,calc(100vw-28px))] -translate-x-1/2 rounded-[18px] border border-gray-100 bg-white p-5 shadow-[0_20px_70px_rgba(0,0,0,.22)] sm:p-6">
          {/* Top bar: legend + night count */}
          <div className="hidden">
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              {dateRange.start && dateRange.end
                ? `${t.nightsLabel(nightCount)} • ${format(dateRange.start, 'd MMM', { locale: dateLocale })} – ${format(dateRange.end, 'd MMM', { locale: dateLocale })}`
                : !dateRange.start
                ? t.pickStart
                : t.pickEnd}
            </p>
            {(dateRange.start || dateRange.end) && (
              <button
                type="button"
                onClick={() => setDateRange({ start: null, end: null })}
                className="text-xs underline text-gray-500 hover:text-gray-900"
              >
                {t.clear}
              </button>
            )}
          </div>

          {/* Month navigation */}
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, -1))}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="sr-only">
              {format(viewMonth, 'yyyy', { locale: dateLocale })}
            </div>
            <button
              type="button"
              onClick={() => setViewMonth(addMonths(viewMonth, 1))}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dual month grids */}
          <div className="flex flex-col gap-8 md:flex-row">
            {renderMonth(viewMonth)}
            {renderMonth(addMonths(viewMonth, 1))}
          </div>

          {/* Quick flexible presets */}
          <div className="hidden">
            <span className="text-xs text-gray-500 mr-1 flex items-center gap-1">
              <Compass className="w-3 h-3" />
              {t.flexible}:
            </span>
            {[
              { label: language === 'vi' ? '±1 ngày' : '±1 day', days: 1 },
              { label: language === 'vi' ? '±2 ngày' : '±2 days', days: 2 },
              { label: language === 'vi' ? '±3 ngày' : '±3 days', days: 3 },
              { label: language === 'vi' ? '±7 ngày' : '±7 days', days: 7 },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  const start = dateRange.start ?? new Date();
                  setDateRange({
                    start,
                    end: addDays(start, p.days),
                  });
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-900"
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setDateRange({ start: null, end: null }); setOpenPanel(null); }}
              className="ml-auto text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5"
            >
              {t.clear}
            </button>
          </div>
          <div className="mt-5 flex flex-col gap-1 border-t pt-4 text-right">
            <strong className="text-sm text-gray-800">
              {dateRange.start && dateRange.end
                ? `${format(dateRange.start, 'EEE, dd/MM', { locale: dateLocale })} – ${format(dateRange.end, 'EEE, dd/MM', { locale: dateLocale })} (${t.nightsLabel(nightCount)})`
                : !dateRange.start ? t.pickStart : t.pickEnd}
            </strong>
            <span className="text-xs text-gray-400">
              {language === 'vi' ? 'Tất cả ngày giờ theo giờ địa phương' : 'All dates use local time'}
            </span>
          </div>
        </div>
        </>
      )}

      {/* ─── Guests popover ─── */}
      {openPanel === 'guests' && (
        <div className="absolute top-full left-0 right-0 md:left-auto md:right-0 md:w-[360px] mt-3 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 z-40">
          {[
            { key: 'adults' as const, label: t.adults, sub: t.age13, min: 1 },
            { key: 'children' as const, label: t.children, sub: t.age2to12, min: 0 },
            { key: 'infants' as const, label: t.infants, sub: t.under2, min: 0 },
          ].map((row) => (
            <div key={row.key} className="flex items-center justify-between py-3 border-b last:border-b-0">
              <div>
                <div className="font-medium text-gray-900">{row.label}</div>
                <div className="text-xs text-gray-500">{row.sub}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateGuests(row.key, -1)}
                  disabled={guests[row.key] <= row.min}
                  className={`h-8 w-8 rounded-full border flex items-center justify-center transition-colors ${
                    guests[row.key] <= row.min
                      ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:border-gray-900'
                  }`}
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-5 text-center font-medium">{guests[row.key]}</span>
                <button
                  type="button"
                  onClick={() => updateGuests(row.key, +1)}
                  className="h-8 w-8 rounded-full border border-gray-300 text-gray-700 hover:border-gray-900 flex items-center justify-center"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-3">
            {language === 'vi'
              ? `${totalGuests} khách, ${guests.infants} em bé`
              : `${totalGuests} guests, ${guests.infants} infants`}
          </p>
        </div>
      )}
    </form>
  );
}
