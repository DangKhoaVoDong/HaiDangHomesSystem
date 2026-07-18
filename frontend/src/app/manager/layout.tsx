import { RoleGuard } from '@/components/auth/RoleGuard';

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={['Manager', 'Admin']}>{children}</RoleGuard>
  );
}