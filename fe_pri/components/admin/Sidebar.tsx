'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  User, Key, LogOut, ChevronUp,
  Home, LayoutDashboard, Users, BookOpen, ArrowLeftRight,
  AlertTriangle, Package, CreditCard, Wallet, MessageCircle,
  MessageSquare, ChevronDown, ChevronRight, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

type MenuItem = {
  title: string;
  icon: any;
  href?: string;
  roles?: string[]; 
  children?: Omit<MenuItem, 'icon'>[]; 
};

const MENU_ITEMS: MenuItem[] = [
  {
    title: 'Về Trang chủ', icon: Home, href: '/',
    roles: ['ROLE_ADMIN', 'ROLE_LIBRARIAN', 'ROLE_ACCOUNTANT', 'ROLE_WAREHOUSE_MANAGER']
  },
  {
    title: 'Tổng quan (Dashboard)', icon: LayoutDashboard, href: '/admin',
    roles: ['ROLE_ADMIN', 'ROLE_LIBRARIAN', 'ROLE_ACCOUNTANT', 'ROLE_WAREHOUSE_MANAGER']
  },
  {
    title: 'Quản lý Người dùng', icon: Users, href: '/admin/users',
    roles: ['ROLE_ADMIN']
  },
  {
    title: 'Quản lý Biên mục', icon: BookOpen,
    roles: ['ROLE_ADMIN', 'ROLE_LIBRARIAN'],
    children: [
      { title: 'Quản lý Đầu sách', href: '/admin/catalog/books' },
      { title: 'Quản lý Bản sao', href: '/admin/catalog/copies' },
      { title: 'Danh mục Thể loại', href: '/admin/catalog/categories' },
      { title: 'Tác giả & Nhà xuất bản', href: '/admin/catalog/authors' },
      { title: 'Quản lý Kệ sách', href: '/admin/catalog/shelves' },
    ]
  },
  {
    title: 'Quản lý Mượn / Trả', icon: ArrowLeftRight,
    roles: ['ROLE_ADMIN', 'ROLE_LIBRARIAN'],
    children: [
      { title: 'Tiếp nhận sách trả', href: '/admin/lending/receive' },
      { title: 'Theo dõi trạng thái', href: '/admin/lending/active' },
      { title: 'Xem lịch sử', href: '/admin/lending/history' },
    ]
  },
  {
    title: 'Quản lý Vi phạm', icon: AlertTriangle,
    roles: ['ROLE_ADMIN', 'ROLE_LIBRARIAN'],
    children: [
      { title: 'Danh sách vi phạm', href: '/admin/violations/pending' },
      { title: 'Lịch sử vi phạm', href: '/admin/violations/history' }
    ]
  },
  {
    title: 'Quản lý Kho sách', icon: Package,
    roles: ['ROLE_ADMIN', 'ROLE_WAREHOUSE_MANAGER'],
    children: [
      { title: 'Nhập sách vào kho', href: '/admin/inventory/import' },
      // { title: 'Xuất sách khỏi kho', href: '/admin/inventory/export' },
      { title: 'Danh sách tồn kho', href: '/admin/inventory/stock' },
      { title: 'Báo cáo tồn kho', href: '/admin/inventory/reports' }
    ]
  },
  {
    title: 'Quản lý Tài chính', icon: CreditCard,
    roles: ['ROLE_ADMIN', 'ROLE_ACCOUNTANT'],
    children: [
      { title: 'Lịch sử thu phạt', href: '/admin/finance/fines' },
      { title: 'Quản lý chi phí mua sách', href: '/admin/finance/purchases' },
      { title: 'Báo cáo thu chi', href: '/admin/finance/reports' }
    ]
  },
  {
    title: 'Quản lý Ví Độc giả', icon: Wallet,
    roles: ['ROLE_ADMIN'],
    children: [
      { title: 'Số dư ví', href: '/admin/wallet/balance' },
      { title: 'Lịch sử giao dịch', href: '/admin/wallet/history' },
      { title: 'Khoá ví', href: '/admin/wallet/lock' },
    ]
  },
  {
    title: 'Thông báo & Hỗ trợ', icon: MessageSquare,
    roles: ['ROLE_ADMIN', 'ROLE_LIBRARIAN'],
    children: [
      { title: 'Gửi thông báo', href: '/admin/support/send' },
      { title: 'Danh sách thông báo', href: '/admin/support/list' },
      { title: 'Xử lý phản ánh', href: '/admin/support/feedback' }
    ]
  },
  {
    title: 'Hộp thoại', icon: MessageCircle,
    href: '/admin/chat',
    roles: ['ROLE_ADMIN', 'ROLE_LIBRARIAN'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, setUser } = useAuth();

  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // 3. ĐÃ XÓA 2 STATE DƯ THỪA: showUpdateModal và showPasswordModal

  const currentRole = user?.roleName || 'guest';

  const filteredMenu = MENU_ITEMS.map((item) => {
    if (item.children) {
      const filteredChildren = item.children.filter((child) => {
        return child.roles
          ? child.roles.some(r => r.toUpperCase() === currentRole.toUpperCase())
          : true;
      });
      return { ...item, children: filteredChildren };
    }
    return item;
  }).filter((item) => {
    const hasAccess = item.roles
      ? item.roles.some(r => r.toUpperCase() === currentRole.toUpperCase())
      : false;

    const hasVisibleChildren = item.children ? item.children.length > 0 : true;
    return hasAccess && hasVisibleChildren;
  });

  const handleLogout = () => {
    setUser(null);
    router.push('/login');
  };

  const getAvatarLetters = (name: string) => {
    if (!name) return 'U';
    const words = name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <aside className="w-65 bg-[#1a233a] text-gray-300 flex flex-col h-screen shrink-0 border-r border-gray-800">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 bg-[#161d31]">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="bg-red-600 p-1.5 rounded-lg"><Shield size={20} className="text-white" /></div>
            <span className="text-xl font-bold text-white tracking-tight">TLU<span className="text-red-500">Admin</span></span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
          <ul className="space-y-1">
            {filteredMenu.map((item, index) => {
              const Icon = item.icon;
              const hasChildren = !!item.children;
              const isActive = pathname === item.href;
              const isOpen = openGroup === item.title;

              return (
                <li key={index} className="px-3">
                  {hasChildren ? (
                    <div>
                      <button
                        onClick={() => setOpenGroup(isOpen ? null : item.title)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isOpen ? 'text-white' : 'hover:bg-white/5 hover:text-white'}`}
                      >
                        <div className="flex items-center gap-3"><Icon size={18} /> {item.title}</div>
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      {isOpen && (
                        <ul className="mt-1 mb-2 space-y-1 border-l border-gray-700 ml-5 pl-2">
                          {item.children?.map((child, cIndex) => (
                            <li key={cIndex}>
                              <Link
                                href={child.href!} // Dấu chấm than báo với TS rằng href luôn tồn tại ở đây
                                className={`block px-3 py-2 text-sm rounded-md transition-colors ${pathname === child.href ? 'text-white bg-white/10 font-bold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                              >
                                {child.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href!}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-white/10 text-white border-l-4 border-red-500 font-bold' : 'font-medium hover:bg-white/5 hover:text-white'}`}
                    >
                      <Icon size={18} /> {item.title}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative mt-auto bg-[#0f172a]">
          {showProfileMenu && (
            <div className="absolute bottom-full left-2 right-2 mb-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2">
              <Link
                href="/profile" 
                onClick={() => setShowProfileMenu(false)} 
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                <User size={16} className="text-gray-500" /> Cập nhật tài khoản
              </Link>

              <Link
                href="/profile"
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                <Key size={16} className="text-gray-500" /> Đổi mật khẩu
              </Link>
              <div className="border-t border-gray-100"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-sm font-bold text-[#da251d] transition-colors"
              >
                <LogOut size={16} /> Đăng xuất
              </button>
            </div>
          )}

          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-full flex items-center justify-between p-4 hover:bg-[#1e293b] transition-colors border-t border-gray-800/50"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-red-600 flex items-center justify-center text-white font-bold shadow-md">
                {getAvatarLetters(user?.fullName || 'User')}
              </div>
              <div className="text-left truncate">
                <p className="text-sm font-bold text-white truncate">{user?.fullName || 'Chưa đăng nhập'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || 'N/A'}</p>
              </div>
            </div>
            <ChevronUp size={16} className={`shrink-0 text-gray-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </aside>
    </>
  );
}