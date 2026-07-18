'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Save,
  Award,
  RefreshCw,
} from 'lucide-react';
import { brandsApi, getApiData, getApiError } from '@/lib/api';

interface Brand {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

const emptyForm = {
  name: '',
  description: '',
  isActive: true,
};

export default function AdminBrandsPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const brandsQuery = useQuery({
    queryKey: ['admin-brands-include-inactive'],
    queryFn: async () => {
      const res = await brandsApi.getAll(true);
      return (getApiData(res) ?? []) as Brand[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => brandsApi.create({
      name: data.name,
      description: data.description || undefined,
    }),
    onSuccess: (res: any) => {
      if (res?.success === false) {
        toast.error(res?.message ?? 'Tạo thương hiệu thất bại');
        return;
      }
      toast.success('Đã tạo thương hiệu');
      queryClient.invalidateQueries({ queryKey: ['admin-brands-include-inactive'] });
      queryClient.invalidateQueries({ queryKey: ['brands-active'] });
      setShowForm(false);
      setForm({ ...emptyForm });
    },
    onError: (e: any) => toast.error(getApiError(e) ?? 'Lỗi mạng'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) =>
      brandsApi.update(id, {
        name: data.name,
        description: data.description || undefined,
        isActive: data.isActive,
      }),
    onSuccess: (res: any) => {
      if (res?.success === false) {
        toast.error(res?.message ?? 'Cập nhật thất bại');
        return;
      }
      toast.success('Đã cập nhật thương hiệu');
      queryClient.invalidateQueries({ queryKey: ['admin-brands-include-inactive'] });
      queryClient.invalidateQueries({ queryKey: ['brands-active'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(getApiError(e) ?? 'Lỗi mạng'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => brandsApi.remove(id),
    onSuccess: (res: any) => {
      if (res?.success === false) {
        toast.error(res?.message ?? 'Xoá thất bại');
        return;
      }
      toast.success('Đã xoá thương hiệu');
      queryClient.invalidateQueries({ queryKey: ['admin-brands-include-inactive'] });
      queryClient.invalidateQueries({ queryKey: ['brands-active'] });
    },
    onError: (e: any) => toast.error(getApiError(e) ?? 'Lỗi mạng'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (b: Brand) => {
    setEditing(b);
    setForm({
      name: b.name ?? '',
      description: b.description ?? '',
      isActive: b.isActive ?? true,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên thương hiệu');
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (b: Brand) => {
    if (!confirm(`Bạn chắc chắn muốn xoá thương hiệu "${b.name}"?`)) return;
    deleteMutation.mutate(b.id);
  };

  const items = brandsQuery.data ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Award className="w-6 h-6 text-[#D24A15]" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý thương hiệu</h1>
            <p className="text-sm text-gray-500">Thêm, sửa, xoá các thương hiệu của hệ thống</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => brandsQuery.refetch()}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
          <button
            onClick={openCreate}
            className="px-4 py-2 bg-[#D24A15] text-white rounded-lg text-sm font-medium hover:bg-[#b03d10] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm thương hiệu
          </button>
        </div>
      </div>

      {brandsQuery.isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang tải…
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Chưa có thương hiệu nào.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-900">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b) => (
                <tr key={b.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{b.name}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-md truncate">
                    {b.description || '—'}
                  </td>
                  <td className="px-4 py-3">
                    {b.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Hoạt động</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">Tắt</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(b)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Xoá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {editing ? 'Sửa thương hiệu' : 'Thêm thương hiệu'}
              </h2>
              <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên thương hiệu *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                  placeholder="Ví dụ: HAIDANG LUXURY"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tên sẽ được lưu trữ dạng IN HOA tự động.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                  placeholder="Mô tả thương hiệu"
                />
              </div>

              {editing && (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Đang hoạt động
                </label>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:bg-gray-50"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 bg-[#D24A15] text-white rounded-lg text-sm font-medium hover:bg-[#b03d10] flex items-center gap-2 disabled:opacity-60"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
