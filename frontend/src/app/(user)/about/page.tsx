'use client';

import Link from 'next/link';
import { useLanguageStore } from '@/stores/language';

const HERO_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuARo4dBDtEAJh96XoFAq6slD6k8s2TklD2BxesXmyk6JjKKzCM8jij-7LzIM1BwGT0-2YCm7rwiz0qr6klLTUIix02lzyWoyUBkY48PO3_-6kbRCY_sYABsa_Zg2HcUOccIxmMzXx7j2RLj2ZwXkKJToBeYM-HHZb_lzN98Rq2KL1mvTF_NtyiRAedZGqGH5Cfc0HBHnw6B1OiVYbXLoOIEEorEV-Va02jFdtZrIYx42FgXLtGLUc1kbQ';
const STORY_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=85';
const DETAIL_IMAGE = 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=85';

const content = {
  vi: {
    chapter: 'CHƯƠNG 02 — CÂU CHUYỆN', eyebrow: 'VỀ HẢI ĐĂNG HOMES', heroTitle: 'Không gian để trở về.',
    heroMeta: 'SỐNG CHẬM · CẢM NHẬN SÂU · LƯU GIỮ LÂU', storyLabel: '— CÂU CHUYỆN 001',
    storyTitle: 'Mỗi nơi ở là một phần của hành trình.',
    storyOne: 'Hai Đăng Homes bắt đầu từ một niềm tin giản dị: nơi lưu trú không chỉ là căn phòng để nghỉ, mà còn là nơi mỗi chuyến đi thực sự bắt đầu.',
    storyTwo: 'Chúng tôi tìm kiếm những không gian có bản sắc, chăm chút từng chi tiết và kết nối bạn với nhịp sống riêng của mỗi điểm đến. Từ lúc tìm phòng đến khi rời đi, mọi trải nghiệm đều được giữ rõ ràng, gần gũi và vừa đủ.',
    imageCaption: 'NHỮNG KHÔNG GIAN ĐƯỢC TUYỂN CHỌN BỞI HẢI ĐĂNG HOMES', statOne: 'Không gian được tuyển chọn',
    statTwo: 'Đồng hành cùng khách hàng', statThree: 'Tận tâm trong từng trải nghiệm', valuesLabel: '— GIÁ TRỊ 002',
    valuesTitle: 'Những điều chúng tôi luôn gìn giữ.',
    values: [
      ['01', 'Bản sắc', 'Mỗi không gian mang một câu chuyện riêng, hài hòa giữa tiện nghi hiện đại và tinh thần địa phương.'],
      ['02', 'Chân thành', 'Sự hiếu khách bắt đầu từ việc lắng nghe, thấu hiểu và hỗ trợ đúng lúc.'],
      ['03', 'Chỉn chu', 'Những chi tiết nhỏ được chăm chút để hành trình của bạn luôn nhẹ nhàng và trọn vẹn.'],
    ],
    promiseLabel: 'LỜI HỨA CỦA CHÚNG TÔI', promiseTitle: 'Ở trọn từng khoảnh khắc.',
    promiseText: 'Dù là một kỳ nghỉ ngắn ngày, chuyến công tác hay hành trình bên gia đình, chúng tôi mong bạn luôn tìm thấy một nơi vừa vặn để dừng chân.',
    cta: 'KHÁM PHÁ ĐIỂM LƯU TRÚ',
  },
  en: {
    chapter: 'CHAPTER 02 — OUR STORY', eyebrow: 'ABOUT HAI DANG HOMES', heroTitle: 'A place to return to.',
    heroMeta: 'LIVE SLOWLY · FEEL DEEPLY · REMEMBER LONGER', storyLabel: '— OUR STORY 001', storyTitle: 'Every stay is part of the journey.',
    storyOne: 'Hai Dang Homes began with a simple belief: a stay is more than a room to rest in. It is where every journey truly begins.',
    storyTwo: 'We seek spaces with character, care for every detail, and connect you with the distinct rhythm of each destination. From search to departure, every experience is kept clear, warm, and effortless.',
    imageCaption: 'THOUGHTFULLY SELECTED SPACES BY HAI DANG HOMES', statOne: 'Thoughtfully selected spaces',
    statTwo: 'Guest support whenever needed', statThree: 'Care in every experience', valuesLabel: '— OUR VALUES 002',
    valuesTitle: 'The things we choose to preserve.',
    values: [
      ['01', 'Character', 'Every space carries its own story, blending modern comfort with a distinctive local spirit.'],
      ['02', 'Sincerity', 'True hospitality begins with listening, understanding, and being there at the right time.'],
      ['03', 'Thoughtfulness', 'Small details are carefully considered so your journey feels effortless and complete.'],
    ],
    promiseLabel: 'OUR PROMISE', promiseTitle: 'Be present for every moment.',
    promiseText: 'Whether it is a short escape, a business trip, or time away with family, we hope you always find a place that feels just right.',
    cta: 'EXPLORE OUR STAYS',
  },
} as const;

export default function AboutPage() {
  const { language } = useLanguageStore();
  const t = content[language];

  return (
    <div className="bg-white text-[#1c1b1b]">
      <section className="relative flex min-h-[680px] items-end overflow-hidden sm:min-h-[760px] lg:min-h-[840px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/30" />
        <div className="absolute left-0 right-0 top-6 z-10 mx-auto flex w-full max-w-container-max justify-between gap-4 px-5 sm:top-10 sm:px-8 lg:px-16">
          <span className="text-[10px] tracking-[0.3em] text-white/80">N 11°56&apos; — E 108°26&apos;</span>
          <span className="text-right text-[10px] tracking-[0.3em] text-white/80">{t.chapter}</span>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-container-max px-5 pb-16 text-center sm:px-8 sm:pb-20 lg:px-16 lg:pb-24">
          <span className="mb-6 block text-[10px] tracking-[0.3em] text-white/90 sm:text-xs">— {t.eyebrow} —</span>
          <h1 className="font-display-lg text-5xl italic leading-[1.05] text-white drop-shadow-lg sm:text-7xl lg:text-[104px]">{t.heroTitle}</h1>
          <p className="mt-8 text-[10px] tracking-[0.28em] text-white/85 sm:text-xs">{t.heroMeta}</p>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto w-full max-w-screen-xl">
          <div className="grid gap-8 md:grid-cols-12 md:gap-6">
            <div className="md:col-span-7">
              <p className="mb-4 text-xs tracking-[3px] text-[#D24A15]">{t.storyLabel}</p>
              <h2 className="max-w-3xl font-serif text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl lg:text-6xl">{t.storyTitle}</h2>
            </div>
            <div className="space-y-5 self-end text-sm leading-7 text-gray-600 md:col-span-5 lg:text-base lg:leading-8">
              <p>{t.storyOne}</p><p>{t.storyTwo}</p>
            </div>
          </div>
          <figure className="mt-14">
            <div className="aspect-[16/8] min-h-[360px] overflow-hidden rounded-xl bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={STORY_IMAGE} alt="Hai Dang Homes" className="h-full w-full object-cover" />
            </div>
            <figcaption className="mt-4 flex items-center justify-between gap-4 border-b border-[#e2bfb54c] pb-4 text-[9px] tracking-[1.8px] text-gray-500 sm:text-[10px]">
              <span>{t.imageCaption}</span><span>EST. 2024</span>
            </figcaption>
          </figure>
          <div className="mt-12 grid border-y border-[#e2bfb54c] sm:grid-cols-3">
            {[["01", t.statOne], ["24/7", t.statTwo], ["100%", t.statThree]].map(([value, label], index) => (
              <div key={label} className={`py-8 text-center sm:px-5 ${index > 0 ? 'border-t border-[#e2bfb54c] sm:border-l sm:border-t-0' : ''}`}>
                <p className="font-serif text-4xl text-[#D24A15]">{value}</p><p className="mt-2 text-xs text-gray-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fcf9f8] px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto grid w-full max-w-screen-xl gap-12 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <p className="mb-4 text-xs tracking-[3px] text-[#D24A15]">{t.valuesLabel}</p>
            <h2 className="font-serif text-4xl font-semibold leading-tight text-gray-900 sm:text-5xl">{t.valuesTitle}</h2>
            <div className="mt-10 hidden aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={DETAIL_IMAGE} alt="Không gian Hai Dang Homes" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="border-t border-[#e2bfb54c] lg:col-span-6 lg:col-start-7 lg:self-center">
            {t.values.map(([number, title, description]) => (
              <article key={number} className="grid gap-4 border-b border-[#e2bfb54c] py-8 sm:grid-cols-[64px_1fr] sm:py-10">
                <span className="text-xs tracking-[2px] text-[#D24A15]">{number}</span>
                <div><h3 className="font-serif text-2xl text-gray-900 sm:text-3xl">{title}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-gray-600">{description}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1c1b1b] px-5 py-20 text-white sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto grid w-full max-w-screen-xl items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-8">
            <p className="mb-5 text-xs tracking-[3px] text-[#ffb59d]">— {t.promiseLabel}</p>
            <h2 className="font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">{t.promiseTitle}</h2>
            <p className="mt-6 max-w-2xl text-sm leading-7 text-white/65 sm:text-base">{t.promiseText}</p>
          </div>
          <div className="md:col-span-4 md:text-right">
            <Link href="/properties" className="inline-block rounded-full bg-[#D24A15] px-7 py-3.5 text-[11px] font-semibold tracking-[1.2px] text-white transition-colors hover:bg-[#b03d10]">{t.cta} →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
