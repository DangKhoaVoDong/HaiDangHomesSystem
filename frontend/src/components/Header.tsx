'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';
import { User, Globe, LogOut, Settings, Calendar, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const translations = {
    vi: {
      search: 'Tìm kiếm',
      login: 'Đăng nhập',
      register: 'Đăng ký',
      myBookings: 'Đơn đặt của tôi',
      dashboard: 'Quản lý',
      logout: 'Đăng xuất',
      welcome: 'Chào mừng',
    },
    en: {
      search: 'Search',
      login: 'Login',
      register: 'Register',
      myBookings: 'My Bookings',
      dashboard: 'Dashboard',
      logout: 'Logout',
      welcome: 'Welcome',
    },
  };

  const t = translations[language];

  return (
    <header className="absolute top-0 left-0 right-0 z-50 w-full">
      <div className="max-w-[1400px] mx-auto px-6 md:px-16 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-serif text-2xl text-white tracking-wider">
            Haidang Home
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-10">
          <Link href="/properties" className="text-xs text-white/90 hover:text-white uppercase tracking-widest font-medium transition-colors">
            Properties
          </Link>
          <Link href="/about" className="text-xs text-white/90 hover:text-white uppercase tracking-widest font-medium transition-colors">
            About
          </Link>
          <Link href="/contact" className="text-xs text-white/90 hover:text-white uppercase tracking-widest font-medium transition-colors">
            Contact
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="flex items-center space-x-1 text-xs text-white/90 hover:text-white uppercase tracking-widest transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>{language.toUpperCase()}</span>
          </button>

          {isAuthenticated && user ? (
            <div className="relative group">
              <button className="flex items-center space-x-2 text-xs text-white/90 hover:text-white uppercase tracking-widest transition-colors">
                <User className="h-4 w-4" />
                <span>{user.fullName}</span>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 mt-4 w-56 rounded-md border bg-white shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-medium text-gray-900">{t.welcome}, {user.fullName}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/bookings"
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t.myBookings}
                  </Link>
                  {(user.role === 'Manager' || user.role === 'Admin') && (
                    <Link
                      href="/manager"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t.dashboard}
                    </Link>
                  )}
                </div>
                <div className="border-t py-1">
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 text-left"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.logout}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-xs text-white/90 hover:text-white uppercase tracking-widest font-medium transition-colors"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 text-xs font-bold text-gray-900 bg-white rounded-full hover:bg-gray-100 transition-colors uppercase tracking-widest"
              >
                {t.register}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-white"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-white shadow-xl">
          <div className="px-6 py-6 space-y-4">
            <Link href="/properties" className="block text-sm font-medium text-gray-900 uppercase tracking-wider">
              Properties
            </Link>
            <Link href="/about" className="block text-sm font-medium text-gray-900 uppercase tracking-wider">
              About
            </Link>
            <Link href="/contact" className="block text-sm font-medium text-gray-900 uppercase tracking-wider">
              Contact
            </Link>
            <div className="border-t pt-4">
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="flex items-center space-x-2 text-sm font-medium text-gray-900 uppercase tracking-wider mb-4"
              >
                <Globe className="h-4 w-4" />
                <span>{language.toUpperCase()}</span>
              </button>
              {isAuthenticated && user ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-900">{t.welcome}, {user.fullName}</p>
                  <Link href="/bookings" className="block text-sm text-gray-600">My Bookings</Link>
                  <button onClick={logout} className="block text-sm text-gray-600">Logout</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link href="/login" className="block text-sm font-medium text-gray-900 uppercase tracking-wider">
                    {t.login}
                  </Link>
                  <Link href="/register" className="block text-sm font-bold text-gray-900 uppercase tracking-wider">
                    {t.register}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
