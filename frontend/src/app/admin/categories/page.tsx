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
  Tag,
  RefreshCw,
} from 'lucide-react';
import { categoriesAdminApi, getApiData, getApiError } from '@/lib/api';

interface CategoryAdmin {
  id: string;
  nameVi: string;
  nameEn: string;
  descriptionVi?: string | null;
  descriptionEn?: string | null;
  iconUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string | null;
}

const emptyForm = {
  nameVi: '',
  nameEn: '',
  descriptionVi: '',
  descriptionEn: '',
  iconUrl: '',
  displayOrder: 0,
  isActive: true,
};

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<CategoryAdmin | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const categoriesQuery = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await categoriesAdminApi.list();
      return (getApiData(res) ?? []) as CategoryAdmin[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof form) => categoriesAdminApi.create({
      nameVi: data.nameVi,
      nameEn: data.nameEn,
      descriptionVi: data.descriptionVi || undefined,
      descriptionEn: data.descriptionEn || undefined,
      iconUrl: data.iconUrl || undefined,
      displayOrder: data.displayOrder,
    }),
    onSuccess: (res: any) => {
      if (res?.success === false) {
        toast.error(res?.message ?? 'Tạo loại hình thất bại');
        return;
      }
      toast.success('Đã tạo loại hình');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-vi'] });
      setShowForm(false);
      setForm({ ...emptyForm });
    },
    onError: (e: any) => toast.error(getApiError(e) ?? 'Lỗi mạng'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: typeof form }) =>
      categoriesAdminApi.update(id, {
        nameVi: data.nameVi,
        nameEn: data.nameEn,
        descriptionVi: data.descriptionVi || undefined,
        descriptionEn: data.descriptionEn || undefined,
        iconUrl: data.iconUrl || undefined,
        displayOrder: data.displayOrder,
        isActive: data.isActive,
      }),
    onSuccess: (res: any) => {
      if (res?.success === false) {
        toast.error(res?.message ?? 'Cập nhật thất bại');
        return;
      }
      toast.success('Đã cập nhật loại hình');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-vi'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e: any) => toast.error(getApiError(e) ?? 'Lỗi mạng'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesAdminApi.remove(id),
    onSuccess: (res: any) => {
      if (res?.success === false) {
        toast.error(res?.message ?? 'Xoá thất bại');
        return;
      }
      toast.success('Đã xoá loại hình');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-vi'] });
    },
    onError: (e: any) => toast.error(getApiError(e) ?? 'Lỗi mạng'),
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (c: CategoryAdmin) => {
    setEditing(c);
    setForm({
      nameVi: c.nameVi ?? '',
      nameEn: c.nameEn ?? '',
      descriptionVi: c.descriptionVi ?? '',
      descriptionEn: c.descriptionEn ?? '',
      iconUrl: c.iconUrl ?? '',
      displayOrder: c.displayOrder ?? 0,
      isActive: c.isActive ?? true,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameVi.trim() || !form.nameEn.trim()) {
      toast.error('Vui lòng nhập tên tiếng Việt và tiếng Anh');
      return;
    }
    if (editing) {
      updateMutation.mutate({ id: editing.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleDelete = (c: CategoryAdmin) => {
    if (!confirm(`Bạn chắc chắn muốn xoá loại hình "${c.nameVi}"?`)) return;
    deleteMutation.mutate(c.id);
  };

  const items = categoriesQuery.data ?? [];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Tag className="w-6 h-6 text-[#D24A15]" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Quản lý loại hình</h1>
            <p className="text-sm text-gray-500">Thêm, sửa, xoá các loại hình cho căn nhà</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => categoriesQuery.refetch()}
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
            Thêm loại hình
          </button>
        </div>
      </div>

      {categoriesQuery.isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang tải…
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Chưa có loại hình nào.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-sm text-gray-900">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Tên (Vi)</th>
                <th className="px-4 py-3">Tên (En)</th>
                <th className="px-4 py-3">Thứ tự</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr key={c.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{c.nameVi || '—'}</td>
                  <td className="px-4 py-3 text-gray-600">{c.nameEn || '—'}</td>
                  <td className="px-4 py-3">{c.displayOrder ?? 0}</td>
                  <td className="px-4 py-3">
                    {c.isActive ? (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-700">Hoạt động</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600">Tắt</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
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
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {editing ? 'Sửa loại hình' : 'Thêm loại hình'}
              </h2>
              <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên (Vi) *
                  </label>
                  <input
                    type="text"
                    value={form.nameVi}
                    onChange={(e) => setForm({ ...form, nameVi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                    placeholder="Ví dụ: Khách sạn"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên (En) *
                  </label>
                  <input
                    type="text"
                    value={form.nameEn}
                    onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                    placeholder="Ví dụ: Hotel"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả (Vi)
                  </label>
                  <textarea
                    rows={2}
                    value={form.descriptionVi}
                    onChange={(e) => setForm({ ...form, descriptionVi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                    placeholder="Mô tả tiếng Việt"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả (En)
                  </label>
                  <textarea
                    rows={2}
                    value={form.descriptionEn}
                    onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                    placeholder="English description"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon URL
                  </label>
                  <input
                    type="text"
                    value={form.iconUrl}
                    onChange={(e) => setForm({ ...form, iconUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
                    placeholder="https://…"
                  />
                </div>
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
