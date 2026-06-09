'use client';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Topbar from '@/components/admin/Topbar';
import { useRoleGuard } from '@/lib/useRoleGuard'; // Hook của bạn
import Sidebar from '@/components/admin/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  const staffRoles = ['ROLE_ADMIN', 'ROLE_LIBRARIAN', 'ROLE_ACCOUNTANT', 'ROLE_HR', 'ROLE_WAREHOUSE_MANAGER'];

  const isChecking = useRoleGuard(pathname.startsWith('/admin') ? staffRoles : ['ROLE_INTERNAL_READER', 'ROLE_EXTERNAL_READER', ...staffRoles]);

  if (loading || isChecking) {
    return <div className="h-screen flex items-center justify-center">Đang tải...</div>;
  }

  if ((user?.roleName === 'ROLE_INTERNAL_READER' || user?.roleName === 'ROLE_EXTERNAL_READER') && pathname.startsWith('/admin')) {
    return null; 
  }

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}