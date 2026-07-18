'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { authApi, getApiData, isApiSuccess, getApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import { Button } from '@/components/ui/button';
import { getRoleLandingPath } from '@/lib/auth-shared';
import toast from 'react-hot-toast';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { setUser, setTokens } = useAuthStore();
  const { language } = useLanguageStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const translations = {
    vi: {
      title: 'Đăng nhập',
      email: 'Email',
      password: 'Mật khẩu',
      submit: 'Đăng nhập',
      noAccount: 'Chưa có tài khoản?',
      register: 'Đăng ký ngay',
      forgotPassword: 'Quên mật khẩu?',
      invalidCredentials: 'Email hoặc mật khẩu không đúng',
    },
    en: {
      title: 'Login',
      email: 'Email',
      password: 'Password',
      submit: 'Login',
      noAccount: "Don't have an account?",
      register: 'Register now',
      forgotPassword: 'Forgot password?',
      invalidCredentials: 'Invalid email or password',
    },
  };

  const t = translations[language];

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      if (isApiSuccess(response)) {
        const authData = getApiData(response);
        if (authData) {
          setTokens(authData.accessToken, authData.refreshToken);
          setUser(authData.user);
          toast.success(language === 'vi' ? 'Đăng nhập thành công!' : 'Login successful!');
          // Redirect by role: Admin → /admin, Manager → /manager, others → /
          // Honor ?redirect=… if present (set by middleware when a protected route kicked them to login).
          const params = new URLSearchParams(window.location.search);
          const requestedRedirect = params.get('redirect');
          const fallback = getRoleLandingPath(authData.user?.role);
          const target = requestedRedirect && requestedRedirect.startsWith('/')
            ? requestedRedirect
            : fallback;
          router.push(target);
        }
      } else {
        toast.error(getApiError(response) || t.invalidCredentials);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t.invalidCredentials);
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

          <div className="flex items-center justify-between">
            <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              {t.forgotPassword}
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '...' : t.submit}
          </Button>

          <p className="text-center text-sm">
            {t.noAccount}{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              {t.register}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
