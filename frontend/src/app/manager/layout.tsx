import { RoleGuard } from '@/components/auth/RoleGuard';
import { ManagerMobileNav } from '@/components/manager/ManagerMobileNav';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={['Manager', 'Admin']}>
      <ManagerMobileNav />
      <div className="pt-16 lg:pt-0">{children}</div>
    </RoleGuard>
  );
}
