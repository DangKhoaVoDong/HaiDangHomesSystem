'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Bell,
  User,
  TrendingUp,
  ChevronDown,
  BarChart3,
  PlusCircle,
  Hotel,
  DollarSign,
  BookOpen,
  Calendar,
} from 'lucide-react';

const kpis = [
  {
    label: 'Doanh thu tổng',
    value: '1.280.000.000 đ',
    change: '+12%',
    changeLabel: 'so với tháng trước',
    positive: true,
    icon: DollarSign,
    color: 'text-[#D24A15]',
    bgColor: 'bg-orange-100',
  },
  {
    label: 'Công suất phòng',
    value: '85%',
    change: '+5%',
    changeLabel: 'so với tháng trước',
    positive: true,
    icon: Hotel,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
  },
  {
    label: 'Giá trung bình (ADR)',
    value: '2.100.000 đ',
    change: '0%',
    changeLabel: 'Không đổi',
    positive: null,
    icon: BarChart3,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
  {
    label: 'Tổng lượt đặt',
    value: '420',
    change: '+8%',
    changeLabel: 'so với tháng trước',
    positive: true,
    icon: BookOpen,
    color: 'text-[#D24A15]',
    bgColor: 'bg-orange-100',
  },
];

const brandRevenue = [
  { name: 'Signature', percentage: 45, color: 'bg-[#D24A15]' },
  { name: 'Savvy', percentage: 35, color: 'bg-rose-600' },
  { name: 'M Hotel', percentage: 20, color: 'bg-gray-500' },
];

const roomReports = [
  {
    name: 'Ocean View Villa A1',
    brand: 'Signature',
    nights: 28,
    revenue: '98.000.000',
    performance: 93,
    performanceType: 'good',
  },
  {
    name: 'Garden Suite B2',
    brand: 'Savvy',
    nights: 25,
    revenue: '62.500.000',
    performance: 83,
    performanceType: 'good',
  },
  {
    name: 'City Loft C5',
    brand: 'M Hotel',
    nights: 22,
    revenue: '44.000.000',
    performance: 73,
    performanceType: 'medium',
  },
  {
    name: 'Poolside Villa D1',
    brand: 'Signature',
    nights: 30,
    revenue: '120.000.000',
    performance: 100,
    performanceType: 'excellent',
  },
];

export default function AdminPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('Tháng này');

  const getPerformanceColor = (type: string) => {
    switch (type) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-green-600';
      case 'medium':
        return 'text-orange-500';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 right-0 w-[calc(100%-16rem)] h-16 border-b border-gray-200 bg-white flex justify-between items-center px-16 z-40">
        <div className="flex items-center gap-8">
          <h2 className="font-serif text-2xl font-semibold text-[#D24A15] hidden lg:block">
            Luxury Hotel Admin
          </h2>
          <nav className="hidden md:flex gap-6">
            <Link href="/manager" className="text-sm text-gray-500 hover:text-[#D24A15] transition-all">
              Dashboard
            </Link>
            <Link href="/admin" className="text-sm text-[#D24A15] font-medium border-b-2 border-[#D24A15] pb-1">
              Analytics
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:text-[#D24A15] transition-all">
              Staff
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-50 border border-gray-200 rounded-lg text-sm pl-4 pr-10 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-[#D24A15] focus:border-transparent"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <button className="text-gray-500 hover:text-[#D24A15] transition-all">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-gray-500 hover:text-[#D24A15] transition-all">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-64 pt-24 px-16 pb-12 min-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <h1 className="font-serif text-4xl text-gray-900 mb-2">Báo cáo & Phân tích</h1>
            <p className="text-lg text-gray-500">Theo dõi hiệu suất kinh doanh và doanh thu của hệ thống.</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-gray-200">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer text-gray-700"
            >
              <option>Tháng này (Tháng 7, 2026)</option>
              <option>Tháng trước</option>
              <option>Quý 2, 2026</option>
              <option>Năm nay</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-sm text-gray-500">{kpi.label}</span>
                <span className={`${kpi.bgColor} p-2 rounded-lg`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{kpi.value}</div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  {kpi.positive === true && (
                    <>
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">{kpi.change}</span>
                    </>
                  )}
                  {kpi.positive === false && (
                    <>
                      <TrendingUp className="w-4 h-4 text-red-500" />
                      <span className="text-red-500">{kpi.change}</span>
                    </>
                  )}
                  {kpi.positive === null && (
                    <>
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-400">{kpi.change}</span>
                    </>
                  )}
                  <span className="text-gray-500 ml-1">{kpi.changeLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-medium text-gray-900">Xu hướng doanh thu (6 tháng)</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            {/* Chart Placeholder */}
            <div className="w-full h-72 bg-gray-50 rounded-lg border border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 39px, #ccc 39px, #ccc 40px)',
                  backgroundSize: '100% 40px',
                }}
              />
              <div className="relative flex flex-col items-center gap-4">
                {/* Simple Chart Visualization */}
                <div className="flex items-end gap-3 h-32">
                  {[60, 75, 55, 80, 70, 90].map((height, i) => (
                    <div
                      key={i}
                      className="w-10 bg-[#D24A15]/20 rounded-t-md relative"
                      style={{ height: `${height}%` }}
                    >
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-[#D24A15] rounded-t-md"
                        style={{ height: `${height * 0.7}%` }}
                      />
                    </div>
                  ))}
                </div>
                <span className="text-gray-400 text-sm">[ Revenue Trend Chart ]</span>
              </div>
            </div>
          </div>

          {/* Donut Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-medium text-gray-900">Doanh thu theo thương hiệu</h3>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
            {/* Donut Placeholder */}
            <div className="w-48 h-48 mx-auto relative">
              <div className="w-full h-full rounded-full border-8 border-gray-100 flex items-center justify-center">
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(#D24A15 0% 45%, #be123c 45% 80%, #6b7280 80% 100%)`,
                  }}
                />
                <div className="w-28 h-28 bg-white rounded-full z-10 flex items-center justify-center">
                  <span className="text-gray-400 text-xs text-center px-2">[ Donut ]</span>
                </div>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {brandRevenue.map((brand) => (
                <div key={brand.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${brand.color}`} />
                    <span className="text-gray-700">{brand.name}</span>
                  </div>
                  <span className="font-medium text-gray-900">{brand.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-900">Báo cáo chi tiết theo phòng</h3>
            <button className="text-[#D24A15] text-sm font-medium hover:underline">
              Xuất dữ liệu (CSV)
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-900">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Tên phòng</th>
                  <th className="px-6 py-4 font-medium">Thương hiệu</th>
                  <th className="px-6 py-4 font-medium text-right">Số đêm đã đặt</th>
                  <th className="px-6 py-4 font-medium text-right">Doanh thu</th>
                  <th className="px-6 py-4 font-medium text-right">Hiệu suất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {roomReports.map((room, index) => (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium">{room.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">{room.brand}</span>
                    </td>
                    <td className="px-6 py-4 text-right">{room.nights}</td>
                    <td className="px-6 py-4 text-right font-medium">{room.revenue} đ</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`font-medium ${getPerformanceColor(room.performanceType)}`}>
                        {room.performance}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}

function MoreHorizontal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
}
