'use client';

import { useRef, useState } from 'react';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadApi, getApiData, getApiError } from '@/lib/api';

interface ImageUploadFieldProps {
  /** Single image mode (default). When `multiple` is false, only one URL is kept. */
  multiple?: boolean;
  /** Controlled list of URLs (already uploaded). */
  value: string[];
  /** Called whenever the URL list changes. */
  onChange: (urls: string[]) => void;
  /** Optional label shown above the control. */
  label?: string;
  /** Optional helper text. */
  hint?: string;
  /** Optional max file size in MB. Defaults to 10. */
  maxSizeMB?: number;
  /** Allowed MIME types. Defaults to common image formats. */
  accept?: string;
}

/**
 * Upload ảnh lên S3 thông qua BE /api/upload/image.
 * - Có thể upload nhiều file cùng lúc (multiple).
 * - Khi upload xong, URL public được append vào `value` qua onChange.
 * - Người dùng có thể xoá từng URL hoặc dán URL trực tiếp (giữ flow cũ).
 */
export default function ImageUploadField({
  multiple = false,
  value,
  onChange,
  label,
  hint,
  maxSizeMB = 10,
  accept = 'image/jpeg,image/jpg,image/png,image/webp,image/gif',
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [draftUrl, setDraftUrl] = useState('');

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        if (file.size > maxSizeMB * 1024 * 1024) {
          toast.error(`"${file.name}" vượt quá ${maxSizeMB}MB`);
          continue;
        }
        const res = await uploadApi.uploadImage(file);
        const data = getApiData(res);
        if (data?.imageUrl) {
          uploaded.push(data.imageUrl);
        } else {
          toast.error(getApiError(res) ?? `Upload "${file.name}" thất bại`);
        }
      }
      if (uploaded.length > 0) {
        if (multiple) {
          onChange([...value, ...uploaded]);
        } else {
          onChange([uploaded[0]]);
        }
        toast.success(`Đã upload ${uploaded.length} ảnh`);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const addDraftUrl = () => {
    const url = draftUrl.trim();
    if (!url) return;
    if (value.includes(url)) {
      toast.error('URL ảnh này đã được thêm');
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error('URL không hợp lệ. Vui lòng nhập URL đầy đủ (http:// hoặc https://)');
      return;
    }
    onChange(multiple ? [...value, url] : [url]);
    setDraftUrl('');
  };

  const removeAt = (idx: number) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  const moveAt = (idx: number, direction: -1 | 1) => {
    const next = [...value];
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= next.length) return;
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    onChange(next);
  };

  return (
    <div>
      {label && (
        <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wider">
          {label}
        </label>
      )}

      <div className="flex flex-col sm:flex-row gap-2 mb-3">
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="bg-[#D24A15] hover:bg-[#B23E10] disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shrink-0"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? 'Đang tải lên...' : multiple ? 'Tải ảnh lên' : 'Tải ảnh lên'}
        </button>

        <div className="flex-1 flex gap-2">
          <input
            type="url"
            value={draftUrl}
            onChange={(e) => setDraftUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addDraftUrl();
              }
            }}
            placeholder="Hoặc dán URL ảnh..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-[#D24A15]"
          />
          <button
            type="button"
            onClick={addDraftUrl}
            className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Thêm URL
          </button>
        </div>
      </div>

      {hint && <p className="text-xs text-gray-500 mb-3">{hint}</p>}

      {value.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
          <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Chưa có ảnh nào.</p>
          <p className="text-xs text-gray-400 mt-1">
            Bấm "Tải ảnh lên" hoặc dán URL ảnh vào ô phía trên.
          </p>
        </div>
      ) : (
        <div
          className={
            multiple
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'
              : 'grid grid-cols-1 gap-3'
          }
        >
          {value.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-100"
            >
              <img
                src={url}
                alt={`uploaded-${idx + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {multiple && idx === 0 && (
                <div className="absolute top-2 left-2 bg-[#D24A15] text-white text-xs font-semibold px-2 py-1 rounded">
                  Chính
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-1">
                  {multiple && (
                    <>
                      <button
                        type="button"
                        onClick={() => moveAt(idx, -1)}
                        disabled={idx === 0}
                        className="bg-white/90 hover:bg-white text-gray-700 w-8 h-8 rounded-full text-xs disabled:opacity-30"
                        title="Chuyển lên"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveAt(idx, 1)}
                        disabled={idx === value.length - 1}
                        className="bg-white/90 hover:bg-white text-gray-700 w-8 h-8 rounded-full text-xs disabled:opacity-30"
                        title="Chuyển xuống"
                      >
                        ↓
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAt(idx)}
                    className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full text-xs flex items-center justify-center"
                    title="Xóa"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
