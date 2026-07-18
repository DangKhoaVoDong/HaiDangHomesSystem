'use client';

import { useQuery } from '@tanstack/react-query';
import { propertiesApi, categoriesApi, getApiData } from '@/lib/api';
import { useLanguageStore } from '@/stores/language';
import { PropertyList, Category } from '@/types';
import Link from 'next/link';
import { MapPin, Star } from 'lucide-react';

export function FeaturedProperties() {
  const { language } = useLanguageStore();

  const { data: propertiesResponse, isLoading } = useQuery({
    queryKey: ['featured-properties', language],
    queryFn: () => propertiesApi.getFeatured({ count: 6, language }),
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories', language],
    queryFn: () => categoriesApi.getAll(language),
  });

  const translations = {
    vi: {
      featuredProperties: 'Cơ sở nổi bật',
      viewAll: 'Xem tất cả',
      categories: 'Danh mục',
      viewProperty: 'Xem chi tiết',
      from: 'Từ',
      perNight: '/đêm',
    },
    en: {
      featuredProperties: 'Featured Properties',
      viewAll: 'View all',
      categories: 'Categories',
      viewProperty: 'View details',
      from: 'From',
      perNight: '/night',
    },
  };

  const t = translations[language];

  if (isLoading) {
    return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
          <div className="bg-gray-200 h-4 w-3/4 rounded mb-2"></div>
          <div className="bg-gray-200 h-4 w-1/2 rounded"></div>
        </div>
      ))}
    </div>;
  }

  // Backend returns array directly in data.data for getFeatured
  const propertyList: PropertyList[] = getApiData(propertiesResponse) || [];
  // Backend returns array directly in data.data for getAll categories
  const categoryList: Category[] = getApiData(categoriesResponse) || [];

  return (
    <section className="py-12">
      {/* Categories */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">{t.categories}</h2>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {categoryList.map((category) => (
            <Link
              key={category.id}
              href={`/properties?category=${category.id}`}
              className="flex-shrink-0 px-6 py-3 bg-white border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
            >
              <span className="font-medium">{category.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Properties */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t.featuredProperties}</h2>
        <Link href="/properties" className="text-blue-600 hover:underline">
          {t.viewAll}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {propertyList.map((property) => (
          <Link
            key={property.id}
            href={`/properties/${property.id}`}
            className="group bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-all"
          >
            <div className="relative h-48 bg-gray-200">
              {property.thumbnailUrl ? (
                <img
                  src={property.thumbnailUrl}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <span className="text-blue-600 font-medium">No Image</span>
                </div>
              )}
              {property.isFeatured && (
                <div className="absolute top-2 left-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                  {language === 'vi' ? 'Nổi bật' : 'Featured'}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                <MapPin className="h-4 w-4" />
                <span className="truncate">{property.address}</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600">
                {property.name}
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-blue-600">
                    {property.minPrice?.toLocaleString()} VND
                  </span>
                  <span className="text-gray-500 text-sm"> {t.perNight}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm">4.8</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
