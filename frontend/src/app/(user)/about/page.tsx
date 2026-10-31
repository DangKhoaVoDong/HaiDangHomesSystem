'use client';

import Link from 'next/link';
import { ArrowRight, Building2, HeartHandshake, MapPin, Sparkles } from 'lucide-react';
import { BrandLogo } from '@/components/BrandLogo';
import { useLanguageStore } from '@/stores/language';

const content = {
  vi: {
    eyebrow: 'CÂU CHUYỆN HẢI ĐĂNG HOMES',
    title: 'Một nơi ở đẹp, một hành trình đáng nhớ.',
    intro:
      'Hai Đăng Homes mang đến những không gian lưu trú ấm áp, chỉn chu và đậm dấu ấn địa phương — để mỗi chuyến đi đều nhẹ nhàng như trở về nhà.',
    discover: 'Khám phá chỗ ở',
    storyEyebrow: 'VỀ CHÚNG TÔI',
    storyTitle: 'Được tạo nên từ tình yêu dành cho những chuyến đi.',
    storyOne:
      'Chúng tôi tin rằng nơi lưu trú không chỉ là một căn phòng. Đó là nơi bạn bắt đầu buổi sáng, trở về sau một ngày khám phá và lưu giữ những khoảnh khắc riêng của mình.',
    storyTwo:
      'Vì thế, từng không gian tại Hai Đăng Homes được lựa chọn cẩn thận, chăm chút trong từng chi tiết và vận hành bằng sự hiếu khách chân thành.',
    stats: [
      ['Không gian', 'được tuyển chọn kỹ lưỡng'],
      ['24/7', 'đồng hành cùng khách hàng'],
      ['Tận tâm', 'trong từng trải nghiệm'],
    ],
    valueEyebrow: 'ĐIỀU CHÚNG TÔI TRÂN TRỌNG',
    valueTitle: 'Sự thoải mái bắt đầu từ những điều giản dị.',
    values: [
      ['Không gian có bản sắc', 'Mỗi nơi ở đều có câu chuyện riêng, hài hòa giữa tiện nghi hiện đại và nét đẹp địa phương.'],
      ['Chăm sóc bằng sự chân thành', 'Chúng tôi lắng nghe và hỗ trợ nhanh chóng để bạn luôn an tâm trong suốt kỳ nghỉ.'],
      ['Trải nghiệm chỉn chu', 'Từ lúc tìm phòng đến khi trả phòng, mọi bước đều được thiết kế rõ ràng và thuận tiện.'],
    ],
    promise: 'LỜI HỨA CỦA CHÚNG TÔI',
    promiseTitle: 'Để bạn có thể ở trọn từng khoảnh khắc.',
    promiseText:
      'Dù là một chuyến nghỉ ngắn ngày, kỳ công tác hay hành trình cùng gia đình, Hai Đăng Homes luôn mong bạn tìm thấy một không gian vừa vặn với mình.',
    cta: 'Tìm nơi ở phù hợp',
  },
  en: {
    eyebrow: 'THE HAI DANG HOMES STORY',
    title: 'A beautiful stay, a journey to remember.',
    intro:
      'Hai Dang Homes offers warm, thoughtful spaces with a local soul — making every journey feel a little more like coming home.',
    discover: 'Explore our stays',
    storyEyebrow: 'ABOUT US',
    storyTitle: 'Born from a love for meaningful journeys.',
    storyOne:
      'We believe a stay is more than a room. It is where mornings begin, where you return after a day of discovery, and where personal moments become memories.',
    storyTwo:
      'That is why every Hai Dang Homes space is carefully selected, thoughtfully detailed, and run with genuine hospitality.',
    stats: [
      ['Spaces', 'thoughtfully selected'],
      ['24/7', 'guest support'],
      ['Heartfelt', 'in every experience'],
    ],
    valueEyebrow: 'WHAT MATTERS TO US',
    valueTitle: 'Comfort begins with the simple things.',
    values: [
      ['Spaces with character', 'Every stay has its own story, balancing modern comfort with a distinct local spirit.'],
      ['Genuine hospitality', 'We listen and respond quickly so you can feel at ease throughout your stay.'],
      ['Thoughtful experiences', 'From search to checkout, every step is designed to be clear and effortless.'],
    ],
    promise: 'OUR PROMISE',
    promiseTitle: 'So you can be present for every moment.',
    promiseText:
      'Whether it is a weekend escape, a business trip, or time away with family, we hope you find a space that feels just right.',
    cta: 'Find your perfect stay',
  },
} as const;

const valueIcons = [Building2, HeartHandshake, Sparkles];

export default function AboutPage() {
  const { language } = useLanguageStore();
  const t = content[language];

  return (
    <div className="overflow-hidden bg-[#fcf9f8] text-on-surface">
      <section className="relative min-h-[650px] border-b border-outline-variant/30 px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="absolute -right-40 -top-48 h-[620px] w-[620px] rounded-full bg-primary-fixed/70 blur-3xl" />
        <div className="absolute -bottom-48 -left-52 h-[520px] w-[520px] rounded-full border-[90px] border-[#f0dfd8]/70" />

        <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-16 lg:grid-cols-[1.1fr_.9fr]">
          <div className="max-w-3xl">
            <p className="mb-6 text-xs font-semibold tracking-[0.25em] text-primary sm:text-sm">{t.eyebrow}</p>
            <h1 className="max-w-4xl text-5xl leading-[1.08] text-on-surface sm:text-6xl lg:text-7xl xl:text-[84px]">
              {t.title}
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-8 text-on-surface-variant sm:text-lg">{t.intro}</p>
            <Link
              href="/properties"
              className="mt-10 inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#b83d0e] hover:shadow-lg"
            >
              {t.discover} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative mx-auto hidden h-[430px] w-full max-w-[520px] lg:block" aria-hidden="true">
            <div className="absolute inset-x-12 top-2 h-[360px] rounded-[180px_180px_32px_32px] bg-[#d6b7a6] shadow-[0_30px_80px_rgba(86,55,43,.16)]" />
            <div className="absolute inset-x-[72px] top-[22px] h-[320px] overflow-hidden rounded-[160px_160px_22px_22px] bg-[#6f6559]">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#c8ddd9] to-[#efe2d3]" />
              <div className="absolute bottom-0 h-48 w-full bg-[#b47958] [clip-path:polygon(0_50%,25%_25%,43%_48%,68%_8%,100%_48%,100%_100%,0_100%)]" />
              <div className="absolute bottom-0 left-1/2 h-36 w-48 -translate-x-1/2 rounded-t-[90px] bg-[#f4eee8] shadow-2xl" />
              <div className="absolute bottom-0 left-1/2 h-24 w-24 -translate-x-1/2 rounded-t-[48px] bg-[#4d3429]" />
            </div>
            <div className="absolute bottom-0 left-0 rounded-2xl bg-white p-5 shadow-xl">
              <BrandLogo className="h-10 w-auto" />
              <div className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant">
                <MapPin className="h-4 w-4 text-primary" /> Không gian để trở về
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto grid w-full max-w-[1440px] gap-12 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="text-xs font-semibold tracking-[0.24em] text-primary">{t.storyEyebrow}</p>
            <h2 className="mt-5 max-w-xl text-4xl leading-tight sm:text-5xl">{t.storyTitle}</h2>
          </div>
          <div className="space-y-5 text-base leading-8 text-on-surface-variant sm:text-lg">
            <p>{t.storyOne}</p>
            <p>{t.storyTwo}</p>
          </div>
        </div>

        <div className="mx-auto mt-20 grid w-full max-w-[1440px] border-y border-outline-variant/40 sm:grid-cols-3">
          {t.stats.map(([value, label], index) => (
            <div key={value} className={`px-5 py-9 text-center ${index > 0 ? 'border-t border-outline-variant/40 sm:border-l sm:border-t-0' : ''}`}>
              <p className="font-headline-md text-3xl text-primary sm:text-4xl">{value}</p>
              <p className="mt-2 text-sm text-on-surface-variant">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#f3ece8] px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto w-full max-w-[1440px]">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-primary">{t.valueEyebrow}</p>
            <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">{t.valueTitle}</h2>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {t.values.map(([title, description], index) => {
              const Icon = valueIcons[index];
              return (
                <article key={title} className="rounded-3xl border border-white/70 bg-white/75 p-7 shadow-[0_16px_50px_rgba(70,43,31,.06)] backdrop-blur sm:p-9">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-8 text-2xl">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-on-surface-variant">{description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="relative mx-auto w-full max-w-[1440px] overflow-hidden rounded-[32px] bg-[#28211e] px-6 py-16 text-center text-white sm:px-12 lg:py-24">
          <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full border-[70px] border-white/5" />
          <div className="absolute -bottom-40 -left-20 h-80 w-80 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.24em] text-[#ffb59d]">{t.promise}</p>
            <h2 className="mt-5 text-4xl leading-tight sm:text-5xl">{t.promiseTitle}</h2>
            <p className="mx-auto mt-6 max-w-2xl leading-8 text-white/70">{t.promiseText}</p>
            <Link href="/properties" className="mt-9 inline-flex items-center gap-3 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#e65a22]">
              {t.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
