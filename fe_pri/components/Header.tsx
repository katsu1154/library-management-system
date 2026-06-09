'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import {
  Library, ChevronDown, User, LogOut, ShieldCheck,
  BookCheck, AlertTriangle, MessageSquare, Wallet, Lock, Bell, CreditCard, Shield
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const ROLES = {
  ADMIN: 'ROLE_ADMIN',
  LIBRARIAN: 'ROLE_LIBRARIAN',
  ACCOUNTANT: 'ROLE_ACCOUNTANT',
  HR: 'ROLE_HR',
  WAREHOUSE_MANAGER: 'ROLE_WAREHOUSE_MANAGER',
  INTERNAL_READER: 'ROLE_INTERNAL_READER',
  EXTERNAL_READER: 'ROLE_EXTERNAL_READER'
};

const ROLE_CONFIG = {
  [ROLES.ADMIN]: { label: 'Admin Hệ thống', isStaff: true },
  [ROLES.HR]: { label: 'Phòng Nhân sự', isStaff: true },
  [ROLES.ACCOUNTANT]: { label: 'Phòng Kế toán', isStaff: true },
  [ROLES.WAREHOUSE_MANAGER]: { label: 'Nhân viên kho', isStaff: true },
  [ROLES.LIBRARIAN]: { label: 'Thủ thư', isStaff: true },
  [ROLES.INTERNAL_READER]: { label: 'Độc giả (Nội bộ)', isStaff: false },
  [ROLES.EXTERNAL_READER]: { label: 'Độc giả (Ngoài trường)', isStaff: false },
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [pwdModal, setPwdModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Logic đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    router.push('/login');
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const currentRoleConfig = user ? ROLE_CONFIG[user.roleName] : null;
  const isStaff = currentRoleConfig?.isStaff || false;

  return (
    <>
      <header className="bg-[#1e293b] text-white sticky top-0 z-50 border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-red-600 p-1.5 rounded-lg group-hover:bg-red-500 transition-colors">
              {isStaff ? <Shield size={20} strokeWidth={2.5} /> : <Library size={20} strokeWidth={2.5} />}
            </div>
            <span className="text-xl font-bold tracking-tight">
              TLU<span className="font-medium text-red-500">Library</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center h-full">
            <Link href="/" className={`flex items-center h-full px-4 text-sm font-medium border-b-2 transition-colors ${pathname === '/' ? 'border-red-500 text-white' : 'border-transparent text-gray-300 hover:text-white'
              }`}>
              Trang chủ
            </Link>

            <Link href="/categories" className={`flex items-center h-full px-4 text-sm font-medium border-b-2 transition-colors ${pathname === '/categories' ? 'border-red-500 text-white' : 'border-transparent text-gray-300 hover:text-white'
              }`}>
              Danh mục
            </Link>

            <div className="relative group h-full flex items-center">
              <button className={`flex items-center h-full px-4 text-sm font-medium border-b-2 transition-colors ${pathname.startsWith('/services') ? 'border-red-500 text-white' : 'border-transparent text-gray-300 group-hover:text-white'
                }`}>
                Dịch vụ
                <ChevronDown size={14} className="ml-1 opacity-70 group-hover:rotate-180 transition-transform duration-200" />
              </button>
              <div className="absolute top-full left-0 w-56 bg-white rounded-lg shadow-xl py-2 text-gray-800 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <Link href="/services/borrows" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm font-medium">
                  <BookCheck size={16} className="text-gray-500" /> Quản lý mượn trả
                </Link>
                <Link href="/services/violations" className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm font-medium">
                  <AlertTriangle size={16} className="text-gray-500" /> Vi phạm & Phạt
                </Link>
                {(user?.roleName === ROLES.INTERNAL_READER || user?.roleName === ROLES.EXTERNAL_READER) &&  (
                  <Link href="/services/wallet" className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-sm font-medium text-blue-600">
                    <Wallet size={16} className="text-blue-500" /> Quản lý ví
                  </Link>
                )}
                {(user?.roleName === ROLES.INTERNAL_READER || user?.roleName === ROLES.EXTERNAL_READER) &&  (
                  <Link href="/services/support" className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 text-sm font-medium text-blue-600">
                    <MessageSquare size={16} className="text-blue-500" /> Hỗ trợ/ Phản ánh
                  </Link>
                )}
              </div>
            </div>



            <Link href="/about" className={`flex items-center h-full px-4 text-sm font-medium border-b-2 transition-colors ${pathname === '/about' ? 'border-red-500 text-white' : 'border-transparent text-gray-300 hover:text-white'
              }`}>
              Giới thiệu
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {isStaff && (
              <Link href="/admin" className="hidden sm:flex items-center gap-2 bg-linear-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all border border-red-500">
                <ShieldCheck size={18} /> Quản trị
              </Link>
            )}

            {!user ? (
              <div className="flex items-center gap-4">
                <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">Đăng nhập</Link>
                <Link href="/signup" className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-full text-sm font-bold transition-all shadow-lg text-white">Đăng ký</Link>
              </div>
            ) : (
              <div className="flex items-center gap-5">

                <NotificationBell />

                <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setMenuOpen(!menuOpen)} className="flex items-center gap-3 hover:bg-white/5 p-1 pr-3 rounded-xl transition-all">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center font-bold text-sm border border-red-500 shadow-inner">
                      {getInitials(user.fullName || user.loginName)}
                    </div>
                    <div className="hidden sm:flex flex-col items-start">
                      <span className="text-sm font-bold leading-tight">{user.fullName || user.loginName}</span>
                      <span className="text-xs text-gray-400 font-medium">{currentRoleConfig?.label}</span>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl py-2 text-gray-800 border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-3 border-b border-gray-50 mb-1 flex flex-col">
                        <span className="font-bold text-sm truncate">{user.fullName}</span>
                        <span className="text-[11px] text-gray-500 uppercase tracking-wider">{currentRoleConfig?.label}</span>
                      </div>

                      

                      <Link href="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm font-medium">
                        <User size={16} className="text-gray-400" /> Hồ sơ cá nhân
                      </Link>

                      <button
                        onClick={() => { setPwdModal(true); setMenuOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm font-medium text-left"
                      >
                        <Lock size={16} className="text-gray-400" /> Đổi mật khẩu
                      </button>

                      <div className="h-px bg-gray-100 my-1 mx-2" />

                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm font-bold text-red-600 transition-colors">
                        <LogOut size={16} /> Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {pwdModal && <ChangePasswordModal onClose={() => setPwdModal(false)} />}
    </>
  );
}