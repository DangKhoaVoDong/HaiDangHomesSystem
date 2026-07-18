'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Calendar,
  Plus,
  HelpCircle,
  Bell,
  User,
  Bed,
  ChevronLeft,
  Save,
  Loader2,
  ImageIcon,
  X,
  Plus as PlusIcon,
  Users,
  Tag,
  Ruler,
  ArrowUpDown,
  Home,
  Building2,
} from 'lucide-react';
import { amenitiesApi, propertiesApi, roomsApi, getApiData, getApiError } from '@/lib/api';
import ImageUploadField from '@/components/ImageUploadField';

const navItems = [
  { icon: Building2, label: 'Quản lý căn nhà', active: false, href: '/manager/properties' },
  { icon: Bed, label: 'Quản lý phòng', active: false, href: '/manager' },
  { icon: Calendar, label: 'Lịch đặt phòng', active: false, href: '/manager/bookings' },
  { icon: Plus, label: 'Đăng tin mới', active: true, href: '/manager/rooms/new' },
];

interface FormState {
  name: string;
  description: string;
  propertyId: string;
  roomNumber: number;
  floor: number;
  pricePerNight: number;
  maxOccupancy: number;
  bedCount: number;
  bathroomCount: number;
  sizeInSqm: number;
  imageUrls: string[];
  amenityIds: string[];
}

const BED_TYPES = [
  '1 giường King',
  '2 giường đơn',
  '1 giường Queen',
  '1 King + 1 đơn',
  '1 Queen + 1 đơn',
  '3 giường đơn',
];

export default function NewRoomPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<FormState>({
    name: '',
    description: '',
    propertyId: '',
    roomNumber: 0,
    floor: 1,
    pricePerNight: 0,
    maxOccupancy: 2,
    bedCount: 1,
    bathroomCount: 1,
    sizeInSqm: 0,
    imageUrls: [],
    amenityIds: [],
  });

  const [bedType, setBedType] = useState<string>('1 giường King');
  const [viewType, setViewType] = useState<string>('City view');

  const propertiesQuery = useQuery({
    queryKey: ['my-properties'],
    queryFn: async () => {
      const res = await propertiesApi.getMyProperties();
      return getApiData(res) ?? [];
    },
  });

  const amenitiesQuery = useQuery({
    queryKey: ['amenities', 'vi'],
    queryFn: async () => {
      const res = await amenitiesApi.getAll('vi');
      return getApiData(res) ?? [];
    },
  });

  useEffect(() => {
    if (!form.propertyId && propertiesQuery.data && propertiesQuery.data.length > 0) {
      setForm((f) => ({ ...f, propertyId: propertiesQuery.data![0].id }));
    }
  }, [propertiesQuery.data, form.propertyId]);

  const existingRoomsQuery = useQuery({
    queryKey: ['property-rooms', form.propertyId],
    queryFn: async () => {
      if (!form.propertyId) return [];
      const res = await roomsApi.getByPropertyId(form.propertyId);
      return getApiData(res) ?? [];
    },
    enabled: !!form.propertyId,
  });

  const suggestedRoomNumber = useMemo(() => {
    const rooms = existingRoomsQuery.data ?? [];
    if (rooms.length === 0) return 1;
    const usedNumbers = new Set(rooms.map((r: any) => r.roomNumber));
    let n = 1;
    while (usedNumbers.has(n)) n += 1;
    return n;
  }, [existingRoomsQuery.data]);

  useEffect(() => {
    if (!form.propertyId) return;
    if (form.roomNumber === 0 || (existingRoomsQuery.data ?? []).some((r: any) => r.roomNumber === form.roomNumber)) {
      setForm((f) => ({ ...f, roomNumber: suggestedRoomNumber }));
    }
  }, [form.propertyId, suggestedRoomNumber, existingRoomsQuery.data, form.roomNumber]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const fullDescription = `${viewType}. ${form.description}`.trim();

      const res = await roomsApi.create({
        name: form.name.trim(),
        description: fullDescription || undefined,
        propertyId: form.propertyId,
        roomNumber: Number(form.roomNumber),
        floor: Number(form.floor),
        pricePerNight: Number(form.pricePerNight),
        maxOccupancy: Number(form.maxOccupancy),
        bedCount: Number(form.bedCount),
        bathroomCount: Number(form.bathroomCount),
        sizeInSqm: Number(form.sizeInSqm),
        imageUrls: form.imageUrls.length > 0 ? form.imageUrls : undefined,
        amenityIds: form.amenityIds.length > 0 ? form.amenityIds : undefined,
      });
      return res;
    },
    onSuccess: (res) => {
      const data = getApiData(res);
      if (data) {
        toast.success('Đăng tin phòng mới thành công!');
        queryClient.invalidateQueries({ queryKey: ['rooms-management'] });
        queryClient.invalidateQueries({ queryKey: ['property-rooms'] });
        router.push('/manager');
      } else {
        const errMsg = getApiError(res);
        toast.error(errMsg || 'Đăng tin phòng thất bại');
      }
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || 'Đăng tin phòng thất bại';
      toast.error(message);
    },
  });

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const toggleAmenity = (id: string) => {
    setForm((f) => ({
      ...f,
      amenityIds: f.amenityIds.includes(id)
        ? f.amenityIds.filter((x) => x !== id)
        : [...f.amenityIds, id],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên phòng');
      return;
    }
    if (!form.propertyId) {
      toast.error('Vui lòng chọn property');
      return;
    }
    if (form.roomNumber <= 0) {
      toast.error('Số phòng phải lớn hơn 0');
      return;
    }
    if (form.pricePerNight <= 0) {
      toast.error('Giá phòng phải lớn hơn 0');
      return;
    }
    if (form.sizeInSqm <= 0) {
      toast.error('Vui lòng nhập diện tích phòng');
      return;
    }
    if (form.bathroomCount <= 0) {
      toast.error('Vui lòng nhập số phòng tắm');
      return;
    }
    createMutation.mutate();
  };

  const formatVnd = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex">
      <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex-col z-50 hidden md:flex">
        <div className="px-6 py-8 border-b border-gray-200">
          <h1 className="font-serif text-2xl font-bold text-[#D24A15]">HaiDangHomes</h1>
          <p className="text-sm text-gray-500 mt-1">Luxury Manager</p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-orange-50 text-[#D24A15] font-bold border-r-4 border-[#D24A15]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-gray-200">
          <button className="w-full py-2 px-4 text-gray-600 hover:bg-gray-50 transition-colors duration-200 rounded-lg flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5" />
            <span className="text-sm">Support</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 px-6 md:px-12 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link
                href="/manager"
                className="text-gray-500 hover:text-[#D24A15] transition-colors flex items-center gap-2 shrink-0"
              >
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">Quay lại</span>
              </Link>
              <div className="min-w-0">
                <h2 className="font-serif text-xl md:text-2xl font-bold text-[#D24A15] truncate">
                  Đăng tin phòng mới
                </h2>
                <p className="text-xs text-gray-500 hidden md:block">
                  Tạo phòng mới với đầy đủ thông tin, hình ảnh và tiện nghi.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button className="text-gray-500 hover:text-[#D24A15] transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <button className="text-gray-500 hover:text-[#D24A15] transition-colors">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 md:p-12 max-w-6xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ==== SECTION 1: Room Identity ==== */}
            <SectionCard title="Thông tin cơ bản" icon={Home}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field
                  label="Property (Cơ sở lưu trú)"
                  required
                  hint="Phòng sẽ thuộc property này"
                >
                  <select
                    value={form.propertyId}
                    onChange={(e) => updateField('propertyId', e.target.value)}
                    className="form-input"
                    required
                    disabled={propertiesQuery.isLoading}
                  >
                    <option value="">
                      {propertiesQuery.isLoading ? 'Đang tải...' : '-- Chọn property --'}
                    </option>
                    {propertiesQuery.data?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {p.address}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Số phòng" required hint={`Gợi ý: ${suggestedRoomNumber}`}>
                  <input
                    type="number"
                    min={1}
                    value={form.roomNumber || ''}
                    onChange={(e) => updateField('roomNumber', Number(e.target.value))}
                    className="form-input"
                    required
                  />
                  {form.propertyId &&
                    (existingRoomsQuery.data ?? []).some((r: any) => r.roomNumber === form.roomNumber) && (
                      <p className="text-xs text-red-500 mt-1">
                        ⚠ Số phòng {form.roomNumber} đã được dùng trong property này.
                      </p>
                    )}
                </Field>

                <Field label="Tên phòng" required hint="VD: Deluxe Room - Ocean View">
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="Deluxe Room - Ocean View"
                    className="form-input"
                    required
                  />
                </Field>

                <Field label="Tầng" hint="Số tầng nơi đặt phòng">
                  <input
                    type="number"
                    min={1}
                    value={form.floor}
                    onChange={(e) => updateField('floor', Number(e.target.value))}
                    className="form-input"
                  />
                </Field>

                <Field label="Tiêu chí đánh giá" hint="Phòng mới sẽ tự động có tag 'New'">
                  <div className="flex items-center h-12 px-4 rounded-lg border border-gray-200 bg-gray-50">
                    <Tag className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                      New
                    </span>
                    <span className="ml-2 text-xs text-gray-500">(mặc định cho phòng mới)</span>
                  </div>
                </Field>

                <Field label="View (Hướng nhìn)" hint="Hiển thị trong mô tả phòng">
                  <select
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value)}
                    className="form-input"
                  >
                    <option>City view</option>
                    <option>Ocean view</option>
                    <option>Sea view</option>
                    <option>Garden view</option>
                    <option>Pool view</option>
                    <option>Mountain view</option>
                    <option>River view</option>
                    <option>No view</option>
                  </select>
                </Field>
              </div>
            </SectionCard>

            {/* ==== SECTION 2: Room Capacity & Size ==== */}
            <SectionCard title="Sức chứa & Kích thước" icon={Users}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CounterField
                  label="Khách tối đa"
                  value={form.maxOccupancy}
                  min={1}
                  max={20}
                  onChange={(v) => updateField('maxOccupancy', v)}
                  required
                />
                <CounterField
                  label="Số giường"
                  value={form.bedCount}
                  min={1}
                  max={10}
                  onChange={(v) => updateField('bedCount', v)}
                  required
                />
                <CounterField
                  label="Phòng tắm"
                  value={form.bathroomCount}
                  min={1}
                  max={10}
                  onChange={(v) => updateField('bathroomCount', v)}
                  required
                />
                <Field label="Diện tích (m²)" required>
                  <input
                    type="number"
                    min={1}
                    value={form.sizeInSqm || ''}
                    onChange={(e) => updateField('sizeInSqm', Number(e.target.value))}
                    placeholder="32"
                    className="form-input"
                    required
                  />
                </Field>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Loại giường" hint="Cấu hình giường trong phòng">
                  <select
                    value={bedType}
                    onChange={(e) => setBedType(e.target.value)}
                    className="form-input"
                  >
                    {BED_TYPES.map((bt) => (
                      <option key={bt}>{bt}</option>
                    ))}
                  </select>
                </Field>

                <Field label="Cấu hình giường (tự động)" hint="Tổng hợp từ số giường + loại">
                  <input
                    type="text"
                    readOnly
                    value={`${form.bedCount} ${form.bedCount > 1 ? 'giường' : 'giường'}: ${bedType}`}
                    className="form-input bg-gray-50 cursor-not-allowed"
                  />
                </Field>
              </div>
            </SectionCard>

            {/* ==== SECTION 3: Description ==== */}
            <SectionCard title="Mô tả chi tiết" icon={ArrowUpDown}>
              <Field label="Mô tả" hint="Mô tả chi tiết các tiện nghi, điểm nhấn của phòng">
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Phòng rộng rãi với nội thất gỗ cao cấp, ban công riêng, ánh sáng tự nhiên..."
                  rows={5}
                  className="form-input resize-none"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {form.description.length} ký tự
                </p>
              </Field>
            </SectionCard>

            {/* ==== SECTION 4: Pricing ==== */}
            <SectionCard title="Giá phòng" icon={Tag}>
              <Field label="Giá mỗi đêm (VND)" required>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={form.pricePerNight || ''}
                    onChange={(e) => updateField('pricePerNight', Number(e.target.value))}
                    placeholder="1500000"
                    className="form-input pr-16"
                    required
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                    VND
                  </span>
                </div>
                {form.pricePerNight > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    ≈ {formatVnd(form.pricePerNight)} VND/đêm ·{' '}
                    {formatVnd(Math.round(form.pricePerNight * 1.1))} VND bao gồm thuế & phí
                  </p>
                )}
              </Field>
            </SectionCard>

            {/* ==== SECTION 5: Images ==== */}
            <SectionCard title="Hình ảnh phòng" icon={ImageIcon}>
              <ImageUploadField
                multiple
                value={form.imageUrls}
                onChange={(urls) => updateField('imageUrls', urls)}
                hint="Ảnh đầu tiên là ảnh chính. JPG, PNG, WEBP, GIF; tối đa 10MB mỗi ảnh."
              />
            </SectionCard>

            {/* ==== SECTION 6: Amenities ==== */}
            <SectionCard title="Tiện nghi phòng" icon={Ruler}>
              {amenitiesQuery.isLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tải danh sách tiện nghi...
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {(amenitiesQuery.data ?? []).map((amenity: any) => {
                    const selected = form.amenityIds.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3 ${
                          selected
                            ? 'border-[#D24A15] bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 ${
                            selected ? 'bg-[#D24A15] border-[#D24A15]' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {selected && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm ${selected ? 'text-[#D24A15] font-medium' : 'text-gray-700'}`}>
                          {amenity.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-3 text-xs text-gray-500">
                Đã chọn: {form.amenityIds.length} tiện nghi
              </div>
            </SectionCard>

            {/* ==== Summary + Submit ==== */}
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/40 border border-orange-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-serif text-lg font-semibold text-gray-900">Tóm tắt phòng</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <SummaryItem label="Phòng" value={form.name || '—'} />
                <SummaryItem label="Số phòng / Tầng" value={`${form.roomNumber} / ${form.floor}`} />
                <SummaryItem
                  label="Giá"
                  value={form.pricePerNight > 0 ? `${formatVnd(form.pricePerNight)}đ/đêm` : '—'}
                />
                <SummaryItem
                  label="Diện tích"
                  value={form.sizeInSqm > 0 ? `${form.sizeInSqm} m²` : '—'}
                />
                <SummaryItem
                  label="Khách / Giường"
                  value={`${form.maxOccupancy} / ${form.bedCount}`}
                />
                <SummaryItem label="Phòng tắm" value={`${form.bathroomCount}`} />
                <SummaryItem label="Loại giường" value={bedType} />
                <SummaryItem label="Hình ảnh" value={`${form.imageUrls.length} ảnh`} />
                <SummaryItem label="Tiện nghi" value={`${form.amenityIds.length} mục`} />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-[#D24A15] hover:bg-[#b03d10] disabled:opacity-60 text-white py-3 px-6 rounded-xl flex items-center gap-2 transition-colors font-medium"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {createMutation.isPending ? 'Đang đăng...' : 'Đăng tin phòng'}
              </button>
              <Link
                href="/manager"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl flex items-center gap-2 transition-colors font-medium"
              >
                Hủy
              </Link>
            </div>
          </form>
        </main>
      </div>

      <style jsx>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          background: white;
          font-size: 0.95rem;
        }
        .form-input:focus {
          border-color: #D24A15;
          box-shadow: 0 0 0 3px rgba(210, 74, 21, 0.1);
        }
        .form-input:disabled {
          background: #f9fafb;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm">
      <h3 className="font-serif text-lg md:text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
        <Icon className="w-5 h-5 text-[#D24A15]" />
        {title}
      </h3>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function CounterField({
  label,
  value,
  min,
  max,
  onChange,
  required,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden h-12">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="px-3 h-full hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 text-lg"
        >
          −
        </button>
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!isNaN(n) && n >= min && n <= max) onChange(n);
          }}
          className="flex-1 text-center border-0 outline-none bg-transparent text-sm font-medium h-full"
          required={required}
        />
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="px-3 h-full hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 text-lg"
        >
          +
        </button>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
      <div className="font-medium text-gray-900 mt-0.5 truncate" title={value}>
        {value}
      </div>
    </div>
  );
}
