import { PrimaryNavigationSection } from '@/components/PrimaryNavigationSection';
import { SiteFooterSection } from '@/components/SiteFooterSection';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PrimaryNavigationSection />
      <main className="min-h-screen bg-[#fcf9f8]">{children}</main>
      <SiteFooterSection />
    </>
  );
}