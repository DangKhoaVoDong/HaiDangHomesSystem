'use client';

import { Suspense } from 'react';
import { HeroBannerSection } from '@/components/HeroBannerSection';
import { FeaturedOnHomeSection } from '@/components/FeaturedOnHomeSection';

export default function HomePage() {
  return (
    <>
      <Suspense fallback={<div className="min-h-[600px]" />}>
        <HeroBannerSection />
      </Suspense>
      <Suspense fallback={<div className="min-h-[400px]" />}>
        <FeaturedOnHomeSection />
      </Suspense>
    </>
  );
}
