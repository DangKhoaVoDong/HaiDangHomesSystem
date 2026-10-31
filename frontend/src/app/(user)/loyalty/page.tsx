'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { useLanguageStore } from '@/stores/language';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1800&q=88';

const tiers = [
  { name: 'Regular', points: '0', discount: '0%', tone: 'bg-[#eee9e5] text-[#4d4039]' },
  { name: 'Silver', points: '100', discount: '5%', tone: 'bg-[#d8d9da] text-[#343638]' },
  { name: 'Gold', points: '500', discount: '10%', tone: 'bg-[#d6b66e] text-[#49330a]' },
  { name: 'Diamond', points: '1.000', discount: '15%', tone: 'bg-[#303b43] text-white' },
] as const;

const copy = {
  vi: {
    chapter: 'CHƯƠNG 03 — HỘI VIÊN', eyebrow: 'HAI ĐĂNG HOMES MEMBERS',
    title: 'Mỗi hành trình, thêm một đặc quyền.',
    subtitle: 'Chương trình dành cho những vị khách luôn chọn Hai Đăng Homes làm nơi dừng chân.',
    join: 'THAM GIA MIỄN PHÍ', explore: 'KHÁM PHÁ ĐIỂM LƯU TRÚ',
    overview: '— ĐẶC QUYỀN 001', overviewTitle: 'Ở nhiều hơn. Nhận lại nhiều hơn.',
    overviewText: 'Mỗi lần hoàn tất kỳ nghỉ, điểm thưởng của bạn được tích lũy để mở khóa hạng thành viên mới và mức ưu đãi tốt hơn cho những hành trình tiếp theo.',
    tier: 'Hạng hiện tại', points: 'Điểm tích lũy', signedOut: 'Đăng nhập để xem hạng và điểm của bạn.',
    signIn: 'ĐĂNG NHẬP TÀI KHOẢN', levelTitle: 'Hạng thành viên', required: 'Điểm yêu cầu', benefit: 'Ưu đãi theo hạng',
    howLabel: '— CÁCH HOẠT ĐỘNG 002', howTitle: 'Đơn giản trong từng bước.',
    steps: [
      ['01', 'Đăng ký tài khoản', 'Tạo tài khoản Hai Đăng Homes miễn phí để bắt đầu chương trình.'],
      ['02', 'Hoàn tất kỳ nghỉ', 'Mỗi 10.000 VND chi tiêu hợp lệ tương đương 1 điểm thành viên.'],
      ['03', 'Tự động nâng hạng', 'Khi đủ điểm, tài khoản được nâng hạng để nhận mức ưu đãi tương ứng.'],
    ],
    note: 'Điểm được ghi nhận sau khi đơn đặt phòng hoàn tất. Mức ưu đãi phụ thuộc vào hạng thành viên tại thời điểm đặt phòng và điều kiện áp dụng của từng nơi lưu trú.',
    closing: 'Hành trình tiếp theo đang chờ bạn.',
    closingText: 'Đăng nhập, đặt kỳ nghỉ và để mỗi trải nghiệm đưa bạn đến gần hơn với những đặc quyền mới.',
  },
  en: {
    chapter: 'CHAPTER 03 — MEMBERS', eyebrow: 'HAI DANG HOMES MEMBERS',
    title: 'Every journey, a new privilege.', subtitle: 'A program for guests who choose Hai Dang Homes as their place to return to.',
    join: 'JOIN FOR FREE', explore: 'EXPLORE OUR STAYS', overview: '— BENEFITS 001', overviewTitle: 'Stay more. Receive more.',
    overviewText: 'Every completed stay earns points toward a new membership tier and better benefits for your next journey.',
    tier: 'Current tier', points: 'Reward points', signedOut: 'Sign in to view your tier and points.', signIn: 'SIGN IN',
    levelTitle: 'Membership tier', required: 'Required points', benefit: 'Tier benefit', howLabel: '— HOW IT WORKS 002', howTitle: 'Simple at every step.',
    steps: [
      ['01', 'Create an account', 'Join Hai Dang Homes Members for free and begin your journey.'],
      ['02', 'Complete your stay', 'Every eligible 10,000 VND spent earns one membership point.'],
      ['03', 'Level up automatically', 'Reach the threshold and your account moves up to unlock its corresponding benefit.'],
    ],
    note: 'Points are credited after a booking is completed. Benefits depend on your tier at the time of booking and each property’s applicable conditions.',
    closing: 'Your next journey awaits.', closingText: 'Sign in, book your stay, and let every experience bring you closer to new privileges.',
  },
} as const;

export default function LoyaltyPage() {
  const { user, isAuthenticated } = useAuthStore();
  const { language } = useLanguageStore();
  const t = copy[language];

  return (
    <div className="bg-white text-[#1c1b1b]">
      <section className="relative flex min-h-[650px] items-end overflow-hidden sm:min-h-[720px] lg:min-h-[790px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/35" />
        <div className="absolute left-0 right-0 top-6 z-10 mx-auto flex w-full max-w-container-max justify-between px-5 text-[10px] tracking-[.3em] text-white/80 sm:top-10 sm:px-8 lg:px-16">
          <span>EST. 2024</span><span>{t.chapter}</span>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-container-max px-5 pb-16 text-center text-white sm:px-8 sm:pb-20 lg:px-16 lg:pb-24">
          <p className="mb-6 text-[10px] tracking-[.3em] sm:text-xs">— {t.eyebrow} —</p>
          <h1 className="mx-auto max-w-5xl font-serif text-5xl italic leading-[1.05] drop-shadow-lg sm:text-7xl lg:text-[96px]">{t.title}</h1>
          <p className="mx-auto mt-7 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">{t.subtitle}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href={isAuthenticated ? '/properties' : '/login'} className="rounded-full bg-[#D24A15] px-7 py-3.5 text-[11px] font-semibold tracking-[1.2px]">{isAuthenticated ? t.explore : t.join}</Link>
          </div>
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-16 lg:py-28">
        <div className="mx-auto w-full max-w-screen-xl">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7"><p className="mb-4 text-xs tracking-[3px] text-[#D24A15]">{t.overview}</p><h2 className="font-serif text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">{t.overviewTitle}</h2></div>
            <p className="self-end text-sm leading-7 text-gray-600 md:col-span-5 lg:text-base lg:leading-8">{t.overviewText}</p>
          </div>

          <div className="mt-14 grid overflow-hidden rounded-2xl bg-[#211d1b] text-white lg:grid-cols-[1.2fr_.8fr]">
            <div className="p-7 sm:p-10 lg:p-14">
              <p className="text-[10px] tracking-[2.5px] text-white/55">HAI ĐĂNG HOMES MEMBERS</p>
              {isAuthenticated && user ? <><p className="mt-14 font-serif text-4xl">{user.fullName}</p><div className="mt-10 grid grid-cols-2 border-t border-white/15 pt-7"><div><p className="text-xs text-white/50">{t.tier}</p><p className="mt-2 text-xl">{user.membershipTier}</p></div><div><p className="text-xs text-white/50">{t.points}</p><p className="mt-2 text-xl">{user.loyaltyPoints.toLocaleString('vi-VN')}</p></div></div></> : <><p className="mt-14 max-w-lg font-serif text-3xl leading-snug">{t.signedOut}</p><Link href="/login" className="mt-10 inline-block border-b border-white pb-1 text-[11px] font-semibold tracking-[1.2px]">{t.signIn} →</Link></>}
            </div>
            <div className="flex min-h-72 items-end bg-[linear-gradient(145deg,#763017,#d24a15_55%,#f0a07f)] p-8 sm:p-10">
              <div><p className="font-serif text-5xl italic">Members</p><p className="mt-3 text-xs tracking-[2px] text-white/75">STAY · EARN · DISCOVER</p></div>
            </div>
          </div>

          <div className="mt-20"><p className="mb-7 text-xs font-semibold tracking-[2px] text-gray-700">{t.levelTitle.toUpperCase()}</p><div className="grid border-y border-[#e2bfb54c] sm:grid-cols-2 lg:grid-cols-4">{tiers.map((tier, index) => <article key={tier.name} className={`p-6 sm:p-8 ${index > 0 ? 'border-t border-[#e2bfb54c] sm:border-l sm:border-t-0' : ''}`}><span className={`inline-block rounded-full px-3 py-1 text-[10px] font-semibold tracking-[1px] ${tier.tone}`}>{tier.name.toUpperCase()}</span><p className="mt-9 text-xs text-gray-500">{t.required}</p><p className="mt-1 font-serif text-3xl">{tier.points}</p><p className="mt-7 text-xs text-gray-500">{t.benefit}</p><p className="mt-1 text-lg font-semibold text-[#D24A15]">{tier.discount}</p></article>)}</div></div>
        </div>
      </section>

      <section className="bg-[#fcf9f8] px-5 py-20 sm:px-8 lg:px-16 lg:py-28"><div className="mx-auto w-full max-w-screen-xl"><p className="mb-4 text-xs tracking-[3px] text-[#D24A15]">{t.howLabel}</p><h2 className="font-serif text-4xl font-semibold sm:text-5xl">{t.howTitle}</h2><div className="mt-12 grid border-t border-[#e2bfb54c] md:grid-cols-3">{t.steps.map(([number, title, description], index) => <article key={number} className={`py-8 md:p-8 ${index > 0 ? 'border-t border-[#e2bfb54c] md:border-l md:border-t-0' : ''}`}><span className="text-xs tracking-[2px] text-[#D24A15]">{number}</span><h3 className="mt-8 font-serif text-2xl">{title}</h3><p className="mt-3 text-sm leading-7 text-gray-600">{description}</p></article>)}</div><p className="mt-8 border-l-2 border-[#D24A15] pl-5 text-xs leading-6 text-gray-500">{t.note}</p></div></section>

      <section className="bg-[#1c1b1b] px-5 py-20 text-white sm:px-8 lg:px-16 lg:py-24"><div className="mx-auto flex w-full max-w-screen-xl flex-col justify-between gap-8 md:flex-row md:items-end"><div><h2 className="font-serif text-4xl sm:text-5xl">{t.closing}</h2><p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">{t.closingText}</p></div><Link href="/properties" className="shrink-0 rounded-full bg-[#D24A15] px-7 py-3.5 text-[11px] font-semibold tracking-[1.2px]">{t.explore} →</Link></div></section>
    </div>
  );
}
