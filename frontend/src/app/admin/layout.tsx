import { RoleGuard } from '@/components/auth/RoleGuard';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allowed={['Admin']}>
      <div className="min-h-screen bg-[#fcf9f8]">
        <AdminSidebar />
        <main className="pt-16 lg:pt-0 lg:ml-64 min-h-screen">{children}</main>
      </div>
    </RoleGuard>
  );
}
