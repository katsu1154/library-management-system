'use client';
import { useState, useEffect } from 'react';
import { adminWalletsApi, type WalletAdminView } from '@/lib/admin-wallets';
import { Search, Loader2 } from 'lucide-react';

const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export default function WalletBalancesPage() {
  const [wallets, setWallets] = useState<WalletAdminView[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    adminWalletsApi.getAll().then(setWallets).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = wallets.filter((w) => {
    const q = search.toLowerCase();
    return !q || w.loginName.toLowerCase().includes(q) || w.fullName.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-xl border shadow-sm flex flex-col min-h-[85vh]">
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold">Xem số dư ví</h1>
      </div>
      <div className="p-4 bg-gray-50/50 border-b flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
        </div>
        <button className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium">Tìm kiếm</button>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b">
              <th className="px-6 py-4 font-bold">Mã độc giả</th>
              <th className="px-6 py-4 font-bold">Tên độc giả</th>
              <th className="px-6 py-4 font-bold">Trạng thái</th>
              <th className="px-6 py-4 font-bold text-right">Số dư (VNĐ)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10"><Loader2 className="inline animate-spin" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-500">Không có ví.</td></tr>
            ) : filtered.map((w) => (
              <tr key={w.walletId} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">{w.loginName}</td>
                <td className="px-6 py-4 font-bold">{w.fullName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${w.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {w.status === 'ACTIVE' ? 'Hoạt động' : 'Khóa'}
                  </span>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${w.balance > 0 ? 'text-green-600' : 'text-gray-700'}`}>{formatMoney(w.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}