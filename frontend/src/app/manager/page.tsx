'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Key,
  Wrench,
  Luggage,
  Edit,
  EyeOff,
  Eye,
  Trash2,
  ChevronLeft,
  Loader2,
  Save,
  X,
  Building2,
} from 'lucide-react';
import { roomsApi, getApiData, getApiError, isApiSuccess } from '@/lib/api';

const navItems = [
  { icon: Building2, label: 'Quản lý căn nhà', active: false, href: '/manager/properties' },
  { icon: Bed, label: 'Quản lý phòng', active: true, href: '/manager' },
  { icon: Calendar, label: 'Lịch đặt phòng', active: false, href: '/manager/bookings' },
  { icon: Plus, label: 'Đăng tin mới', active: false, href: '/manager/rooms/new' },
];

const recentActivities = [
  {
    color: 'bg-[#D24A15]',
    text: 'Phòng Deluxe - Savvy Hai Bà Trưng vừa được đặt cho ngày 15/10 - 18/10.',
    time: '10 phút trước',
  },
  {
    color: 'bg-rose-600',
    text: 'Cập nhật trạng thái Signature Valley Suite thành Đang sửa chữa.',
    time: '2 giờ trước',
  },
  {
    color: 'bg-[#D24A15]',
    text: 'Tin đăng mới Penthouse Ocean View đã được duyệt.',
    time: 'Hôm qua',
  },
];

// RoomOperationalStatus enum (backend): Available=1, Occupied=2, Maintenance=3, CheckOutSoon=4, Blocked=5
const STATUS_LABELS: Record<number, string> = {
  1: 'Đang trống',
  2: 'Đã đặt',
  3: 'Đang sửa chữa',
  4: 'Sắp check-out',
  5: 'Bị khóa',
};

const STATUS_CLASSES: Record<number, string> = {
  1: 'bg-gray-100 text-gray-700',
  2: 'bg-orange-100 text-[#D24A15] border border-orange-200',
  3: 'bg-red-100 text-red-600 border border-red-200',
  4: 'bg-rose-100 text-rose-600 border border-rose-200',
  5: 'bg-gray-100 text-gray-500',
};

function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN').format(price);
}

export default function ManagerPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  const [deletingRoom, setDeletingRoom] = useState<any | null>(null);

  const { data: roomsResponse, isLoading } = useQuery({
    queryKey: ['rooms-management'],
    queryFn: async () => {
      const res = await roomsApi.getForManagement({ pageSize: 100 });
      return getApiData(res);
    },
  });

  const rooms = roomsResponse?.items ?? [];

  const updateMutation = useMutation({
    mutationFn: async (payload: { id: string; data: any }) =>
      roomsApi.update(payload.id, payload.data),
    onSuccess: (res) => {
      if (getApiData(res)) {
        toast.success('Cập nhật phòng thành công');
        queryClient.invalidateQueries({ queryKey: ['rooms-management'] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        setEditingRoom(null);
      } else {
        toast.error(getApiError(res) || 'Cập nhật thất bại');
      }
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || err?.message || 'Cập nhật thất bại'),
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async (room: any) =>
      roomsApi.update(room.id, {
        name: room.name,
        description: room.description,
        roomNumber: room.roomNumber,
        floor: room.floor,
        pricePerNight: room.pricePerNight,
        maxOccupancy: room.maxOccupancy,
        bedCount: room.bedCount,
        bathroomCount: room.bathroomCount,
        sizeInSqm: room.sizeInSqm,
        isActive: true,
        isAvailable: !room.isAvailable,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms-management'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => roomsApi.delete(id),
    onSuccess: (res) => {
      if (isApiSuccess(res)) {
        toast.success('Đã xóa phòng');
        queryClient.invalidateQueries({ queryKey: ['rooms-management'] });
        queryClient.invalidateQueries({ queryKey: ['properties'] });
        setDeletingRoom(null);
      } else {
        toast.error(getApiError(res) || 'Xóa thất bại');
      }
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message || err?.message || 'Xóa thất bại'),
  });

  const stats = {
    total: rooms.length,
    available: rooms.filter((r: any) => r.operationalStatus === 1).length,
    maintenance: rooms.filter((r: any) => r.operationalStatus === 3).length,
    booked: rooms.filter((r: any) => r.operationalStatus === 2).length,
  };

  const filteredRooms = searchQuery
    ? rooms.filter((r: any) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.propertyName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : rooms;

  return (
    <div className="min-h-screen bg-[#fcf9f8] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col z-50">
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

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 px-16 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="md:hidden text-gray-500">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="font-serif text-2xl font-bold text-[#D24A15] hidden md:block">
                Quản lý phòng & Đăng tin
              </h2>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm phòng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-[#D24A15] transition-colors w-64 placeholder:text-gray-400"
                />
              </div>
              <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-[#D24A15] transition-colors">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="text-gray-500 hover:text-[#D24A15] transition-colors">
                  <User className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 md:p-16 max-w-7xl mx-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
                Tổng quan & Quản lý
              </h1>
              <p className="text-gray-600">Quản lý danh sách phòng và theo dõi tình trạng hiện tại.</p>
            </div>
            <Link
              href="/manager/rooms/new"
              className="bg-[#D24A15] hover:bg-[#b03d10] text-white py-3 px-6 rounded-xl flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Đăng tin phòng mới
            </Link>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12">
            {/* Stats Cards */}
            <div className="lg:col-span-4 grid grid-cols-2 gap-4">
              {/* Total Rooms */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-4 text-[#D24A15]">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Tổng số phòng</p>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  )}
                </div>
              </div>

              {/* Available */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-4 text-gray-600">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Đang trống</p>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stats.available}</p>
                  )}
                </div>
              </div>

              {/* Maintenance */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Đang sửa chữa</p>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stats.maintenance}</p>
                  )}
                </div>
              </div>

              {/* Booked */}
              <div className="bg-white rounded-2xl p-6 border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-all">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center mb-4 text-rose-600">
                  <Luggage className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Đã đặt</p>
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">{stats.booked}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-8 bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-all">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Hoạt động gần đây</h3>
              <div className="space-y-6">
                {recentActivities.map((activity, index) => (
                  <div key={index} className={`flex gap-4 items-start pb-6 ${index < 2 ? 'border-b border-gray-200' : ''}`}>
                    <div className={`w-2 h-2 rounded-full ${activity.color} mt-2 flex-shrink-0`} />
                    <div className="flex-1">
                      <p className="text-gray-900">{activity.text}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Room Management Table */}
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Danh sách phòng</h3>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:shadow-lg transition-all">
              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#D24A15]" />
                    <span className="ml-3 text-gray-500">Đang tải dữ liệu...</span>
                  </div>
                ) : filteredRooms.length === 0 ? (
                  <div className="py-20 text-center">
                    <Bed className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-700 mb-1">Chưa có phòng nào</h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Hãy tạo property trước, sau đó thêm phòng mới.
                    </p>
                    <Link
                      href="/manager/rooms/new"
                      className="inline-flex items-center gap-2 bg-[#D24A15] hover:bg-[#b03d10] text-white py-2 px-4 rounded-lg text-sm transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Đăng tin phòng mới
                    </Link>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">Tên phòng</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">Trạng thái</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500">Giá / Đêm</th>
                        <th className="py-4 px-6 text-sm font-medium text-gray-500 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredRooms.map((room: any) => {
                        const primaryImage = room.images?.[0]?.imageUrl ?? null;
                        const statusClass = STATUS_CLASSES[room.operationalStatus] ?? STATUS_CLASSES[1];
                        const statusLabel = STATUS_LABELS[room.operationalStatus] ?? 'Không xác định';

                        return (
                          <tr key={room.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                  {primaryImage ? (
                                    <img
                                      src={primaryImage}
                                      alt={room.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Bed className="w-5 h-5" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{room.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">Mã: RM-{room.roomNumber}</p>
                                  {room.propertyName && (
                                    <p className="text-xs text-gray-400 mt-0.5">{room.propertyName}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium uppercase tracking-wide ${statusClass}`}>
                                {statusLabel}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-gray-900">{formatPrice(room.pricePerNight)} ₫</td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingRoom(room)}
                                  className="p-2 text-gray-500 hover:text-[#D24A15] transition-colors"
                                  title="Sửa"
                                >
                                  <Edit className="w-5 h-5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => toggleAvailabilityMutation.mutate(room)}
                                  disabled={toggleAvailabilityMutation.isPending}
                                  className="p-2 text-gray-500 hover:text-[#D24A15] transition-colors disabled:opacity-50"
                                  title={room.isAvailable ? 'Ẩn phòng' : 'Hiện phòng'}
                                >
                                  {room.isAvailable ? (
                                    <Eye className="w-5 h-5" />
                                  ) : (
                                    <EyeOff className="w-5 h-5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeletingRoom(room)}
                                  className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
              {filteredRooms.length > 0 && roomsResponse && roomsResponse.totalCount > filteredRooms.length && (
                <div className="p-4 border-t border-gray-200 flex justify-center">
                  <button className="text-[#D24A15] hover:underline text-sm font-medium">
                    Xem toàn bộ danh sách ({roomsResponse.totalCount} phòng)
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          onClose={() => setEditingRoom(null)}
          onSubmit={(data) =>
            updateMutation.mutate({
              id: editingRoom.id,
              data,
            })
          }
          isPending={updateMutation.isPending}
        />
      )}

      {deletingRoom && (
        <ConfirmDeleteDialog
          roomName={deletingRoom.name}
          onClose={() => setDeletingRoom(null)}
          onConfirm={() => deleteMutation.mutate(deletingRoom.id)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}

function EditRoomModal({
  room,
  onClose,
  onSubmit,
  isPending,
}: {
  room: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState({
    name: room.name ?? '',
    description: room.description ?? '',
    roomNumber: room.roomNumber ?? 1,
    floor: room.floor ?? 1,
    pricePerNight: room.pricePerNight ?? 0,
    maxOccupancy: room.maxOccupancy ?? 2,
    bedCount: room.bedCount ?? 1,
    bathroomCount: room.bathroomCount ?? 1,
    sizeInSqm: room.sizeInSqm ?? 0,
    isActive: room.isActive ?? true,
    isAvailable: room.isAvailable ?? true,
  });

  const updateField = (field: string, value: any) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên phòng');
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
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-serif text-xl font-bold text-gray-900">Chỉnh sửa phòng</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số phòng <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                value={form.roomNumber || ''}
                onChange={(e) => updateField('roomNumber', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tầng</label>
              <input
                type="number"
                min={1}
                value={form.floor}
                onChange={(e) => updateField('floor', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá/đêm (VND) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                step={10000}
                value={form.pricePerNight || ''}
                onChange={(e) => updateField('pricePerNight', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khách tối đa</label>
              <input
                type="number"
                min={1}
                value={form.maxOccupancy}
                onChange={(e) => updateField('maxOccupancy', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số giường</label>
              <input
                type="number"
                min={1}
                value={form.bedCount}
                onChange={(e) => updateField('bedCount', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phòng tắm</label>
              <input
                type="number"
                min={1}
                value={form.bathroomCount}
                onChange={(e) => updateField('bathroomCount', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diện tích (m²)</label>
              <input
                type="number"
                min={1}
                value={form.sizeInSqm || ''}
                onChange={(e) => updateField('sizeInSqm', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15] resize-none"
            />
          </div>

          <div className="flex gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => updateField('isActive', e.target.checked)}
                className="w-4 h-4 accent-[#D24A15]"
              />
              <span className="text-sm text-gray-700">Đang hoạt động</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) => updateField('isAvailable', e.target.checked)}
                className="w-4 h-4 accent-[#D24A15]"
              />
              <span className="text-sm text-gray-700">Còn phòng</span>
            </label>
          </div>
        </form>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            disabled={isPending}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={() => onSubmit(form)}
            disabled={isPending}
            className="px-5 py-2 bg-[#D24A15] hover:bg-[#b03d10] text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isPending ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteDialog({
  roomName,
  onClose,
  onConfirm,
  isPending,
}: {
  roomName: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-lg font-bold text-gray-900">Xóa phòng?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Bạn có chắc muốn xóa <span className="font-medium">{roomName}</span>? Hành động này
                không thể hoàn tác.
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            disabled={isPending}
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? 'Đang xóa...' : 'Xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}
