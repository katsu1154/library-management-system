'use client';
import { Search } from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';

export default function Topbar() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10 shadow-sm shrink-0">
      <div className="font-semibold text-gray-800">Trang quản trị Hệ thống quản lý Thư viện</div>
      <div className="flex items-center gap-6">
        <NotificationBell />
      </div>
    </header>
  );
}