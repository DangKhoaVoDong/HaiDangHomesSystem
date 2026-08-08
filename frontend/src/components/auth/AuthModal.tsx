'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LockKeyhole, Mail, Phone, User, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi, getApiData, getApiError, isApiSuccess } from '@/lib/api';
import { getRoleLandingPath } from '@/lib/auth-shared';
import { useAuthStore } from '@/stores/auth';

type Mode = 'login' | 'register';

export function AuthModal({ initialMode, onClose }: { initialMode: Mode; onClose: () => void }) {
  const router = useRouter();
  const { setTokens, setUser } = useAuthStore();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const completeAuth = (authData: any) => {
    setTokens(authData.accessToken, authData.refreshToken);
    setUser(authData.user);
    onClose();
    router.push(getRoleLandingPath(authData.user?.role));
    router.refresh();
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      toast.error('Vui lòng nhập email và mật khẩu');
      return;
    }
    if (mode === 'register') {
      if (!fullName.trim() || !phoneNumber.trim()) {
        toast.error('Vui lòng nhập họ tên và số điện thoại');
        return;
      }
      if (password.length < 8) {
        toast.error('Mật khẩu phải có ít nhất 8 ký tự');
        return;
      }
      if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
        toast.error('Mật khẩu cần có chữ hoa, chữ thường và chữ số');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Mật khẩu xác nhận không khớp');
        return;
      }
    }

    setLoading(true);
    try {
      const response = mode === 'login'
        ? await authApi.login({ email: email.trim(), password })
        : await authApi.register({
            email: email.trim(),
            fullName: fullName.trim(),
            phoneNumber: phoneNumber.trim(),
            password,
          });
      if (!isApiSuccess(response)) throw new Error(getApiError(response));
      const data = getApiData(response);
      if (!data) throw new Error('Không nhận được thông tin đăng nhập');
      completeAuth(data);
      toast.success(mode === 'login' ? 'Đăng nhập thành công' : 'Đăng ký thành công');
    } catch (error: unknown) {
      const message = error instanceof Error && !('response' in error)
        ? error.message
        : getApiError(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const unavailable = (provider: string) =>
    toast.error(`${provider} chưa được cấu hình trên hệ thống`);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 backdrop-blur-[2px]"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className="relative w-full max-w-[470px] max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[28px] bg-white px-6 py-7 shadow-2xl sm:px-8 sm:py-8">
        <button type="button" onClick={onClose} aria-label="Đóng" className="absolute right-5 top-5 rounded-full p-2 text-gray-500 hover:bg-gray-100">
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#D24A15]/30 bg-orange-50">
            <span className="font-serif text-2xl font-bold text-[#D24A15]">HH</span>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#D24A15]">HaiDang Homes</p>
          <h2 className="mt-3 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
            {mode === 'login' ? 'Chào mừng bạn trở lại' : 'Trở thành thành viên của chúng tôi'}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {mode === 'login' ? 'Đăng nhập để quản lý và theo dõi kỳ nghỉ của bạn.' : 'Mở khóa trải nghiệm đặt phòng thuận tiện và nhiều quyền lợi.'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <AuthField icon={Mail} label="Địa chỉ email" type="email" value={email} onChange={setEmail} placeholder="abc@email.com" required />
          {mode === 'register' && (
            <>
              <AuthField icon={User} label="Họ và tên" value={fullName} onChange={setFullName} placeholder="Nhập họ và tên" required />
              <AuthField icon={Phone} label="Số điện thoại" type="tel" value={phoneNumber} onChange={setPhoneNumber} placeholder="090 000 0000" required />
            </>
          )}
          <AuthField icon={LockKeyhole} label="Mật khẩu" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />
          {mode === 'register' && (
            <AuthField icon={LockKeyhole} label="Xác nhận mật khẩu" type="password" value={confirmPassword} onChange={setConfirmPassword} placeholder="••••••••" required />
          )}

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-full bg-[#D24A15] px-5 py-3.5 font-semibold text-white transition-colors hover:bg-[#b03d10] disabled:opacity-60">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'login' ? 'Đăng nhập' : 'Tham gia ngay'}
          </button>
        </form>

        <p className="my-4 text-center text-sm text-gray-500">
          {mode === 'login' ? 'Bạn chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="font-semibold text-[#D24A15] hover:underline">
            {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
          </button>
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-400"><span className="h-px flex-1 bg-gray-200" /><span>HOẶC</span><span className="h-px flex-1 bg-gray-200" /></div>
        <button type="button" onClick={() => unavailable('Đăng nhập Google')} className="mt-4 flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span className="text-lg font-bold text-blue-600">G</span> Google
        </button>
        <button type="button" onClick={() => unavailable('Đăng nhập bằng số điện thoại')} className="mt-3 flex w-full items-center justify-center gap-3 rounded-full border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Phone className="h-4 w-4" /> Đăng nhập bằng số điện thoại
        </button>

        <p className="mt-6 text-center text-xs leading-5 text-gray-500">
          Bằng cách tiếp tục, bạn đồng ý với <span className="text-[#D24A15]">Điều khoản sử dụng</span> và <span className="text-[#D24A15]">Chính sách bảo mật</span> của HaiDang Homes.
        </p>
      </section>
    </div>
  );
}

function AuthField({ icon: Icon, label, value, onChange, type = 'text', placeholder, required }: {
  icon: typeof Mail; label: string; value: string; onChange: (value: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-gray-700">
      <span>{label}{required && <span className="text-[#D24A15]"> *</span>}</span>
      <span className="relative mt-1.5 block">
        <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 outline-none transition focus:border-[#D24A15] focus:ring-2 focus:ring-[#D24A15]/10" />
      </span>
    </label>
  );
}
