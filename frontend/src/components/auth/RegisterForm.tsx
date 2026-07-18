'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi, getApiData, isApiSuccess, getApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import Link from 'next/link';

const registerSchema = z.object({
  email: z.string().email('Invalid email'),
  phoneNumber: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const { language } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const translations = {
    vi: {
      title: 'Đăng ký',
      email: 'Email',
      phoneNumber: 'Số điện thoại',
      password: 'Mật khẩu',
      confirmPassword: 'Xác nhận mật khẩu',
      fullName: 'Họ và tên',
      submit: 'Đăng ký',
      hasAccount: 'Đã có tài khoản?',
      login: 'Đăng nhập',
      success: 'Đăng ký thành công! Vui lòng xác minh email.',
    },
    en: {
      title: 'Register',
      email: 'Email',
      phoneNumber: 'Phone number',
      password: 'Password',
      confirmPassword: 'Confirm password',
      fullName: 'Full name',
      submit: 'Register',
      hasAccount: 'Already have an account?',
      login: 'Login',
      success: 'Registration successful! Please verify your email.',
    },
  };

  const t = translations[language];

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        fullName: data.fullName,
      });
      
      if (isApiSuccess(response)) {
        const authData = getApiData(response);
        if (authData) {
          setTokens(authData.accessToken, authData.refreshToken);
          setUser(authData.user);
          toast.success(t.success);
          // Newly registered users are always Customer — go home.
          router.push('/');
        }
      } else {
        toast.error(getApiError(response) || 'Registration failed');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">{t.title}</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">{t.fullName}</label>
            <input
              {...register('fullName')}
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nguyen Van A"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.email}</label>
            <input
              {...register('email')}
              type="email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.phoneNumber} (Optional)</label>
            <input
              {...register('phoneNumber')}
              type="tel"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0901234567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.password}</label>
            <input
              {...register('password')}
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t.confirmPassword}</label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '...' : t.submit}
          </Button>

          <p className="text-center text-sm">
            {t.hasAccount}{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              {t.login}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
