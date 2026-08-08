'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SearchBox } from '@/components/SearchBox';

const categories = ['KHÁCH SẠN & VILLA', 'LƯU TRÚ DÀI HẠN', 'TRẢI NGHIỆM'];

export const HeroBannerSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('KHÁCH SẠN & VILLA');

  return (
    <section className="relative w-full min-h-[760px] sm:min-h-[820px] lg:min-h-[900px] flex flex-col justify-end items-center pb-8 sm:pb-12 lg:pb-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <div
          className="bg-cover bg-center w-full h-full"
          style={{
            backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuARo4dBDtEAJh96XoFAq6slD6k8s2TklD2BxesXmyk6JjKKzCM8jij-7LzIM1BwGT0-2YCm7rwiz0qr6klLTUIix02lzyWoyUBkY48PO3_-6kbRCY_sYABsa_Zg2HcUOccIxmMzXx7j2RLj2ZwXkKJToBeYM-HHZb_lzN98Rq2KL1mvTF_NtyiRAedZGqGH5Cfc0HBHnw6B1OiVYbXLoOIEEorEV-Va02jFdtZrIYx42FgXLtGLUc1kbQ')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/30"></div>
      </div>

      {/* Top Metadata */}
      <div className="absolute top-6 sm:top-10 left-0 right-0 z-10 px-5 sm:px-8 lg:px-16 flex justify-between items-center gap-4 w-full max-w-container-max mx-auto">
        <span className="text-white/80 font-label-sm tracking-[0.3em] text-[10px]">
          N 11°56&apos; — E 108°26&apos;
        </span>
        <span className="text-white/80 font-label-sm tracking-[0.3em] text-[10px]">
          CHAPTER 01 — THE VALLEY
        </span>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-container-max mx-auto px-5 sm:px-8 lg:px-16 text-center mb-8 sm:mb-12 mt-28">
        <span className="text-white/90 font-label-sm tracking-[0.3em] text-xs uppercase mb-6 block">
          — BỘ SƯU TẬP SIGNATURE —
        </span>
        <h1 className="font-display-lg text-5xl sm:text-7xl lg:text-[110px] italic text-white drop-shadow-lg mb-5 leading-[1.05]">
          The Valley<br />Retreat
        </h1>
        <p className="text-white/90 font-label-sm tracking-[0.3em] text-xs uppercase mt-8">
          BỞI HAIDANG HOME · ĐÀ LẠT, VIỆT NAM
        </p>
      </div>

      {/* Quick-Search Widget */}
      <div className="absolute left-0 right-0 top-[42%] z-20 mx-auto flex w-full max-w-[1440px] -translate-y-full flex-col items-center px-4 sm:px-8 lg:px-12 xl:px-16">
        {/* Tabs */}
        <div className="hidden">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`shrink-0 px-4 sm:px-6 py-2 rounded-full font-label-sm tracking-[0.08em] text-[10px] sm:text-[11px] font-bold transition-colors ${
                  isSelected
                    ? 'bg-white text-on-surface'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Search Form (replaced with SearchBox component) */}
        <div className="w-full">
          <SearchBox />
        </div>
      </div>
    </section>
  );
};
