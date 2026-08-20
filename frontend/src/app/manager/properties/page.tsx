'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Calendar,
  Plus,
  HelpCircle,
  Search,
  Bell,
  User,
  Bed,
  Edit,
  Trash2,
  ChevronLeft,
  Loader2,
  Save,
  X,
  Building2,
  Star,
  MapPin,
  Power,
  ImageIcon,
} from 'lucide-react';
import { propertiesApi, categoriesApi, brandsApi, getApiData, getApiError, isApiSuccess, BRANDS } from '@/lib/api';
import ImageUploadField from '@/components/ImageUploadField';
import { useAuthStore } from '@/stores/auth';
import { ManagerLogoutButton } from '@/components/manager/ManagerLogoutButton';

const LocationPickerMap = dynamic(() => import('@/components/maps/LocationPickerMap'), {
  ssr: false,
  loading: () => <div className="h-72 w-full animate-pulse rounded-xl bg-gray-100" />,
});

const navItems = [
  { icon: Building2, label: 'Quản lý căn nhà', active: true, href: '/manager/properties' },
  { icon: Bed, label: 'Quản lý phòng', active: false, href: '/manager' },
  { icon: Calendar, label: 'Lịch đặt phòng', active: false, href: '/manager/bookings' },
  { icon: Plus, label: 'Đăng tin mới', active: false, href: '/manager/rooms/new' },
];

interface PropertyForm {
  id?: string;
  name: string;
  description: string;
  categoryId: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  latitude: string;
  longitude: string;
  thumbnailUrl: string;
  imageUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  brandName: string;
}

const emptyForm: PropertyForm = {
  name: '',
  description: '',
  categoryId: '',
  address: '',
  city: '',
  district: '',
  ward: '',
  latitude: '',
  longitude: '',
  thumbnailUrl: '',
  imageUrls: [],
  isActive: true,
  isFeatured: false,
  brandName: '',
};

export function PropertyManagementView({ adminMode = false }: { adminMode?: boolean }) {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.user?.id);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<PropertyForm | null>(null);
  const [deleting, setDeleting] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const myPropertiesQuery = useQuery({
    queryKey: ['my-properties', userId],
    queryFn: async () => {
      const res = await propertiesApi.getMyProperties('vi');
      return getApiData(res) ?? [];
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories-vi'],
    queryFn: async () => {
      const res = await categoriesApi.getAll('vi');
      return getApiData(res) ?? [];
    },
  });

  const brandsQuery = useQuery({
    queryKey: ['brands-active'],
    queryFn: async () => {
      const res = await brandsApi.getAll(false);
      return (getApiData(res) ?? []) as { id: string; name: string }[];
    },
  });

  const properties = myPropertiesQuery.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter(
      (p: any) =>
        (p.name ?? '').toLowerCase().includes(q) ||
        (p.city ?? '').toLowerCase().includes(q) ||
        (p.address ?? '').toLowerCase().includes(q)
    );
  }, [properties, search]);

  const createMutation = useMutation({
    mutationFn: async (data: PropertyForm) => {
      const payload = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        categoryId: data.categoryId,
        address: data.address.trim(),
        city: data.city.trim() || undefined,
        district: data.district.trim() || undefined,
        ward: data.ward.trim() || undefined,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        thumbnailUrl: data.imageUrls[0] || undefined,
        imageUrls: data.imageUrls,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        brandName: data.brandName.trim() || undefined,
      };
      const response = await propertiesApi.create(payload as any);
      const created = getApiData(response);
      if (!created?.id) throw new Error(getApiError(response));
      const persisted = await propertiesApi.getById(created.id);
      if (!getApiData(persisted)) throw new Error('Căn nhà chưa được lưu ổn định trong database');
      return response;
    },
    onSuccess: (res) => {
      if (getApiData(res)) {
        toast.success('Tạo căn nhà thành công');
        queryClient.invalidateQueries({ queryKey: ['my-properties'] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        setShowCreate(false);
        setEditing(null);
      } else {
        toast.error(getApiError(res) ?? 'Tạo thất bại');
      }
    },
    onError: (e: unknown) => toast.error(getApiError(e)),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: PropertyForm) => {
      if (!data.id) throw new Error('Missing id');
      const payload = {
        name: data.name.trim(),
        description: data.description.trim() || undefined,
        categoryId: data.categoryId,
        address: data.address.trim(),
        city: data.city.trim() || undefined,
        district: data.district.trim() || undefined,
        ward: data.ward.trim() || undefined,
        latitude: data.latitude ? parseFloat(data.latitude) : undefined,
        longitude: data.longitude ? parseFloat(data.longitude) : undefined,
        thumbnailUrl: data.imageUrls[0] || undefined,
        imageUrls: data.imageUrls,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        brandName: data.brandName.trim() || undefined,
      };
      const response = await propertiesApi.update(data.id, payload as any);
      const updated = getApiData(response);
      if (!updated?.id) throw new Error(getApiError(response));
      const persisted = await propertiesApi.getById(updated.id);
      if (!getApiData(persisted)) throw new Error('Không đọc lại được căn nhà sau khi cập nhật');
      return response;
    },
    onSuccess: (res) => {
      if (getApiData(res)) {
        toast.success('Cập nhật thành công');
        queryClient.invalidateQueries({ queryKey: ['my-properties'] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        setEditing(null);
      } else {
        toast.error(getApiError(res) ?? 'Cập nhật thất bại');
      }
    },
    onError: (e: unknown) => toast.error(getApiError(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => propertiesApi.delete(id),
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        toast.success('Đã xoá căn nhà');
        queryClient.invalidateQueries({ queryKey: ['my-properties'] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        setDeleting(null);
      } else {
        toast.error(getApiError(res) ?? 'Xoá thất bại');
      }
    },
    onError: (e: unknown) => toast.error(getApiError(e)),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (p: any) =>
      propertiesApi.update(p.id, {
        name: p.name,
        description: p.description,
        categoryId: p.categoryId,
        address: p.address,
        city: p.city,
        district: p.district,
        ward: p.ward,
        latitude: p.latitude,
        longitude: p.longitude,
        thumbnailUrl: p.thumbnailUrl,
        isActive: !p.isActive,
        isFeatured: p.isFeatured,
        brandName: p.brandName ?? '',
      } as any),
    onSuccess: (res) => {
      if (getApiData(res)) {
        toast.success('Đã đổi trạng thái');
        queryClient.invalidateQueries({ queryKey: ['my-properties'] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
      } else {
        toast.error(getApiError(res) ?? 'Lỗi');
      }
    },
  });

  const openEdit = async (p: any) => {
    let detail = p;
    try {
      const response = await propertiesApi.getById(p.id);
      detail = getApiData(response) ?? p;
    } catch {
      // Keep the list data available even if refreshing details temporarily fails.
    }
    const imageUrls = Array.isArray(detail.images) && detail.images.length > 0
      ? [...detail.images]
          .sort((a: any, b: any) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((image: any) => image.imageUrl)
          .filter(Boolean)
      : detail.thumbnailUrl
        ? [detail.thumbnailUrl]
        : [];
    setEditing({
      id: detail.id,
      name: detail.name ?? '',
      description: detail.description ?? '',
      categoryId: detail.categoryId ?? '',
      address: detail.address ?? '',
      city: detail.city ?? '',
      district: detail.district ?? '',
      ward: detail.ward ?? '',
      latitude: detail.latitude != null ? String(detail.latitude) : '',
      longitude: detail.longitude != null ? String(detail.longitude) : '',
      thumbnailUrl: imageUrls[0] ?? '',
      imageUrls,
      isActive: !!detail.isActive,
      isFeatured: !!detail.isFeatured,
      brandName: detail.brandName ?? '',
    });
  };

  const submit = (data: PropertyForm) => {
    if (!data.name.trim() || !data.address.trim() || !data.categoryId) {
      toast.error('Vui lòng nhập Tên, Địa chỉ và Loại hình');
      return;
    }

    const latitude = data.latitude ? Number(data.latitude) : null;
    const longitude = data.longitude ? Number(data.longitude) : null;
    if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
      toast.error('Vĩ độ phải nằm trong khoảng -90 đến 90');
      return;
    }
    if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
      toast.error('Kinh độ phải nằm trong khoảng -180 đến 180');
      return;
    }

    if (data.id) updateMutation.mutate(data);
    else createMutation.mutate(data);
  };

  const renderSidebar = () => (
    <aside className="hidden lg:flex w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex-col z-50">
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
        <ManagerLogoutButton />
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex">
      {!adminMode && renderSidebar()}

      <div className={`flex-1 flex flex-col min-h-screen ${adminMode ? '' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-10 xl:px-16 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={adminMode ? '/admin' : '/manager'} className="text-gray-500 hover:text-[#D24A15]">
                <ChevronLeft className="w-6 h-6" />
              </Link>
              <h2 className="font-serif text-2xl font-bold text-[#D24A15] hidden md:block">
                Quản lý căn nhà
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tìm căn nhà..."
                  className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm w-64 focus:outline-none focus:border-[#D24A15]"
                />
              </div>
              <button className="text-gray-500 hover:text-[#D24A15] relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#D24A15] rounded-full" />
              </button>
              <button className="text-gray-500 hover:text-[#D24A15]">
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-10 xl:px-16 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {adminMode ? 'Danh sách căn nhà' : 'Căn nhà của bạn'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Tổng cộng {properties.length} căn nhà · {properties.filter((p: any) => p.isActive).length} đang hoạt động
              </p>
            </div>
            <button
              onClick={() => {
                setEditing({ ...emptyForm, categoryId: categoriesQuery.data?.[0]?.id ?? '' });
                setShowCreate(true);
              }}
              className="w-full sm:w-auto justify-center bg-[#D24A15] hover:bg-[#B23E10] text-white font-medium px-6 py-2.5 rounded-full flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm căn nhà</span>
            </button>
          </div>

          {myPropertiesQuery.isLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#D24A15]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 text-center">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {properties.length === 0
                  ? 'Bạn chưa có căn nhà nào'
                  : 'Không tìm thấy kết quả phù hợp'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {properties.length === 0
                  ? 'Bắt đầu bằng việc tạo căn nhà đầu tiên của bạn.'
                  : 'Thử đổi từ khoá tìm kiếm khác.'}
              </p>
              {properties.length === 0 && (
                <button
                  onClick={() => {
                    setEditing({ ...emptyForm, categoryId: categoriesQuery.data?.[0]?.id ?? '' });
                    setShowCreate(true);
                  }}
                  className="text-sm font-medium text-[#D24A15] hover:underline"
                >
                  + Tạo căn nhà đầu tiên
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((p: any) => (
                <article
                  key={p.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col"
                >
                  <div className="relative h-44 bg-gray-100">
                    {p.thumbnailUrl ? (
                      <img
                        alt={p.name}
                        src={p.thumbnailUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ImageIcon className="w-10 h-10" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 flex gap-2">
                      {p.isFeatured && (
                        <span className="bg-yellow-400 text-yellow-900 text-xs font-medium px-2 py-1 rounded-md flex items-center gap-1">
                          <Star className="w-3 h-3" /> Nổi bật
                        </span>
                      )}
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-md ${
                          p.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {p.isActive ? 'Hoạt động' : 'Tạm ẩn'}
                      </span>
                      {p.brandName && (
                        <span className="bg-orange-100 text-[#D24A15] text-xs font-semibold px-2 py-1 rounded-md tracking-wide">
                          {p.brandName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-serif text-lg font-bold text-gray-900 line-clamp-1">
                      {p.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">
                        {[p.address, p.city].filter(Boolean).join(', ') || '—'}
                      </span>
                    </p>
                    {p.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{p.description}</p>
                    )}
                    <div className="mt-auto pt-4 flex items-center gap-2">
                      <button
                        onClick={() => void openEdit(p)}
                        className="flex-1 px-3 py-2 text-sm font-medium text-[#D24A15] bg-orange-50 hover:bg-orange-100 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Edit className="w-4 h-4" /> Sửa
                      </button>
                      <button
                        onClick={() => toggleActiveMutation.mutate(p)}
                        disabled={toggleActiveMutation.isPending}
                        title={p.isActive ? 'Tạm ẩn' : 'Kích hoạt'}
                        className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(p)}
                        className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Create/Edit Modal */}
      {(editing || showCreate) && (
        <PropertyFormModal
          initial={editing ?? { ...emptyForm, categoryId: categoriesQuery.data?.[0]?.id ?? '' }}
          categories={categoriesQuery.data ?? []}
          brands={brandsQuery.data ?? []}
          isEditing={!!editing?.id}
          submitting={createMutation.isPending || updateMutation.isPending}
          onClose={() => {
            setEditing(null);
            setShowCreate(false);
          }}
          onSubmit={submit}
        />
      )}

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Xoá căn nhà này?</h3>
            <p className="text-sm text-gray-600 mb-1">
              Bạn sắp xoá <strong>{deleting.name}</strong>. Hành động này không thể hoàn tác.
            </p>
            <p className="text-sm text-red-600 mb-5">
              ⚠ Tất cả phòng thuộc căn nhà này cũng sẽ bị ảnh hưởng.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Huỷ
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleting.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Xoá
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PropertyFormModal({
  initial,
  categories,
  brands,
  isEditing,
  submitting,
  onClose,
  onSubmit,
}: {
  initial: PropertyForm;
  categories: any[];
  brands: { id: string; name: string }[];
  isEditing: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (data: PropertyForm) => void;
}) {
  const [form, setForm] = useState<PropertyForm>(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const update = (patch: Partial<PropertyForm>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="font-serif text-xl font-bold text-gray-900">
            {isEditing ? 'Chỉnh sửa căn nhà' : 'Thêm căn nhà mới'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Tên căn nhà *">
            <input
              type="text"
              value={form.name}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="VD: Hai Dang Hoi An"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
            />
          </Field>

          <Field label="Mô tả">
            <textarea
              value={form.description}
              onChange={(e) => update({ description: e.target.value })}
              rows={3}
              placeholder="Mô tả ngắn về căn nhà..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
            />
          </Field>

          <Field label="Loại hình *">
            <select
              value={form.categoryId}
              onChange={(e) => update({ categoryId: e.target.value })}
              disabled={categories.length === 0}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15] disabled:bg-gray-50 disabled:text-gray-400"
            >
              <option value="">
                {categories.length === 0 ? 'Đang tải...' : '-- Chọn loại hình --'}
              </option>
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Thương hiệu">
            <select
              value={form.brandName}
              onChange={(e) => update({ brandName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
            >
              <option value="">-- Không --</option>
              {brands.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
              {/* Fallback: hiển thị const khi API rỗng (admin chưa tạo brand nào) */}
              {brands.length === 0 &&
                BRANDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
            </select>
            {brands.length === 0 && !BRANDS.length && (
              <p className="text-xs text-amber-600 mt-1">
                Admin chưa tạo thương hiệu nào. Vào Admin → Thương hiệu để thêm.
              </p>
            )}
          </Field>

          <Field label="Địa chỉ *">
            <input
              type="text"
              value={form.address}
              onChange={(e) => update({ address: e.target.value })}
              placeholder="Số nhà, đường..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Thành phố">
              <input
                type="text"
                value={form.city}
                onChange={(e) => update({ city: e.target.value })}
                placeholder="Hội An"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
              />
            </Field>
            <Field label="Quận/Huyện">
              <input
                type="text"
                value={form.district}
                onChange={(e) => update({ district: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
              />
            </Field>
            <Field label="Phường/Xã">
              <input
                type="text"
                value={form.ward}
                onChange={(e) => update({ ward: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Vĩ độ">
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => update({ latitude: e.target.value })}
                placeholder="15.8801"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
              />
            </Field>
            <Field label="Kinh độ">
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => update({ longitude: e.target.value })}
                placeholder="108.3380"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
              />
            </Field>
          </div>

          <Field label="Chọn vị trí trên bản đồ">
            <LocationPickerMap
              latitude={form.latitude && Number.isFinite(Number(form.latitude)) ? Number(form.latitude) : undefined}
              longitude={form.longitude && Number.isFinite(Number(form.longitude)) ? Number(form.longitude) : undefined}
              onChange={(latitude, longitude) =>
                update({ latitude: latitude.toFixed(6), longitude: longitude.toFixed(6) })
              }
            />
          </Field>

          <Field label="Hình ảnh căn nhà">
            <ImageUploadField
              multiple
              value={form.imageUrls}
              onChange={(urls) => update({ imageUrls: urls, thumbnailUrl: urls[0] ?? '' })}
              hint="Có thể thêm nhiều ảnh. Ảnh đầu tiên được dùng làm ảnh đại diện; dùng nút mũi tên để đổi thứ tự."
            />
          </Field>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => update({ isActive: e.target.checked })}
                className="w-4 h-4 accent-[#D24A15]"
              />
              <span className="text-sm text-gray-700">Đang hoạt động</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => update({ isFeatured: e.target.checked })}
                className="w-4 h-4 accent-[#D24A15]"
              />
              <span className="text-sm text-gray-700">Nổi bật</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Huỷ
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={submitting}
            className="px-5 py-2 text-sm font-medium text-white bg-[#D24A15] hover:bg-[#B23E10] rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <Save className="w-4 h-4" />
            {isEditing ? 'Lưu thay đổi' : 'Tạo căn nhà'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

export default function ManagerPropertiesPage() {
  return <PropertyManagementView />;
}
