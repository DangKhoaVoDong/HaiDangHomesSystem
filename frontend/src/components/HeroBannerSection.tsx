'use client';

import Link from 'next/link';
import { useState } from 'react';
import { SearchBox } from '@/components/SearchBox';

const categories = ['KHÁCH SẠN & VILLA', 'LƯU TRÚ DÀI HẠN', 'TRẢI NGHIỆM'];

export const HeroBannerSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('KHÁCH SẠN & VILLA');

  return (
    <section className="relative w-full min-h-[900px] flex flex-col justify-end items-center pb-16">
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
      <div className="absolute top-12 left-0 right-0 z-10 px-margin-desktop flex justify-between items-center w-full max-w-container-max mx-auto">
        <span className="text-white/80 font-label-sm tracking-[0.3em] text-[10px]">
          N 11°56&apos; — E 108°26&apos;
        </span>
        <span className="text-white/80 font-label-sm tracking-[0.3em] text-[10px]">
          CHAPTER 01 — THE VALLEY
        </span>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 w-full max-w-container-max mx-auto px-margin-desktop text-center mb-12 mt-32">
        <span className="text-white/90 font-label-sm tracking-[0.3em] text-xs uppercase mb-6 block">
          — BỘ SƯU TẬP SIGNATURE —
        </span>
        <h1 className="font-display-lg text-[80px] md:text-[110px] italic text-white drop-shadow-lg mb-6 leading-[1.1]">
          The Valley<br />Retreat
        </h1>
        <p className="text-white/90 font-label-sm tracking-[0.3em] text-xs uppercase mt-8">
          BỞI HAIDANG HOME · ĐÀ LẠT, VIỆT NAM
        </p>
      </div>

      {/* Quick-Search Widget */}
      <div className="relative z-20 w-full max-w-[1100px] mx-auto px-4 md:px-6 flex flex-col items-center">
        {/* Tabs */}
        <div className="flex bg-white/20 backdrop-blur-md rounded-full p-1 mb-6 border border-white/30">
          {categories.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-label-sm tracking-[0.1em] text-[11px] font-bold transition-colors ${
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
