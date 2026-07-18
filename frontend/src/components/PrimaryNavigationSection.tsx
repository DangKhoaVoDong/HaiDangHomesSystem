'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLanguageStore } from '@/stores/language';
import { useAuthStore } from '@/stores/auth';
import { normalizeRole } from '@/lib/auth-shared';
import { Menu, X, User, LogOut, Settings, Calendar, Globe } from 'lucide-react';

const navigationItems = [
  { label: 'Đặt Phòng', href: '/properties' },
  { label: 'Về Chúng Tôi', href: '/about' },
  { label: 'Khách Hàng Thân Thiết', href: '#' },
  { label: 'Dịch Vụ Doanh Nghiệp', href: '#' },
];

export const PrimaryNavigationSection = () => {
  const { language, setLanguage } = useLanguageStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userRole = user ? normalizeRole(user.role as unknown as string | number) : 'Customer';
  const canAccessDashboard = userRole === 'Manager' || userRole === 'Admin';

  const t = {
    vi: {
      login: 'ĐĂNG NHẬP',
      register: 'ĐĂNG KÝ',
      myBookings: 'Đơn đặt của tôi',
      dashboard: 'Quản lý',
      logout: 'Đăng xuất',
      welcome: 'Chào',
      language: 'VIE',
      openMenu: 'Mở menu',
      closeMenu: 'Đóng menu',
    },
    en: {
      login: 'LOGIN',
      register: 'REGISTER',
      myBookings: 'My Bookings',
      dashboard: 'Dashboard',
      logout: 'Logout',
      welcome: 'Hello',
      language: 'ENG',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
    },
  }[language];

  return (
    <header className="sticky top-0 z-50 w-full bg-surface border-b border-outline-variant/30">
      <div className="flex justify-between items-center px-margin-desktop py-stack-sm w-full max-w-container-max mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 rounded-full border border-primary flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary"></div>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md tracking-[0.2em] text-on-background uppercase">
              HAIDANG HOME
            </span>
            <span className="text-[10px] tracking-[0.3em] text-on-surface-variant uppercase">
              LIFESTYLE
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navigationItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-on-surface-variant font-label-md hover:text-primary transition-colors duration-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
            className="flex items-center gap-2 border border-outline-variant rounded-full px-4 py-2 hover:bg-surface-container transition-colors"
            aria-label="Switch language"
          >
            <Globe className="h-4 w-4 text-on-surface-variant" />
            <span className="font-label-sm text-on-surface-variant font-semibold">
              {t.language}
            </span>
          </button>

          {/* User menu OR Login/Register */}
          {isAuthenticated && user ? (
            <div className="relative group">
              <button
                type="button"
                className="flex items-center gap-2 border border-outline-variant rounded-full px-4 py-2 hover:bg-surface-container transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white">
                  <User className="h-4 w-4" />
                </span>
                <span className="font-label-sm text-on-surface-variant font-semibold truncate max-w-[140px]">
                  {user.fullName}
                </span>
              </button>
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-outline-variant/30 bg-white shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <p className="text-sm font-medium text-gray-900">
                    {t.welcome}, {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{userRole}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/bookings"
                    className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    {t.myBookings}
                  </Link>
                  {canAccessDashboard && (
                    <Link
                      href="/manager"
                      className="flex items-center px-4 py-2 text-sm hover:bg-gray-50 text-gray-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      {t.dashboard}
                    </Link>
                  )}
                </div>
                <div className="border-t border-outline-variant/20 py-1">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-50 text-left text-gray-700"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.logout}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="font-label-sm border border-outline-variant px-4 py-2 rounded-full text-on-surface font-semibold hover:bg-surface-container transition-colors duration-300 whitespace-nowrap shrink-0"
              >
                {t.login}
              </Link>
              <Link
                href="/register"
                className="font-label-sm border border-primary bg-primary px-4 py-2 rounded-full text-white font-semibold hover:bg-[#b03d10] hover:border-[#b03d10] transition-colors duration-300 whitespace-nowrap shrink-0"
              >
                {t.register}
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-on-surface-variant p-2"
          aria-label={mobileMenuOpen ? t.closeMenu : t.openMenu}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-surface shadow-xl border-t border-outline-variant/30">
          <div className="px-margin-mobile py-stack-lg space-y-stack-sm">
            {navigationItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-on-surface-variant font-label-md hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <div className="border-t border-outline-variant/30 pt-stack-sm flex flex-col gap-stack-sm">
              <button
                onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                className="flex items-center gap-2 font-label-sm text-on-surface-variant"
              >
                <Globe className="h-4 w-4" />
                {t.language}
              </button>
              {isAuthenticated && user ? (
                <>
                  <p className="text-sm text-gray-700">
                    {t.welcome}, {user.fullName}
                  </p>
                  <Link
                    href="/bookings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-gray-700"
                  >
                    {t.myBookings}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block text-sm text-left text-gray-700"
                  >
                    {t.logout}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block font-label-md font-semibold text-on-surface"
                  >
                    {t.login}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block font-label-md font-semibold text-primary"
                  >
                    {t.register}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};