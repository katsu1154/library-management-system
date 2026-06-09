'use client';
import { useState, useEffect } from 'react';
import { financeApi, type FineHistoryItem } from '@/lib/finance';
import { Search, Loader2 } from 'lucide-react';

const formatId = (id: number) => `VP-${String(id).padStart(4, '0')}`;
const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleString('vi-VN') : '-';
const cleanDesc = (s: string) => s?.replace(/\s*\[BR-[A-Z0-9]+\]/g, '').trim() ?? '';

export default function FineHistoryPage() {
  const [all, setAll] = useState<FineHistoryItem[]>([]);
  const [filtered, setFiltered] = useState<FineHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loginName, setLoginName] = useState('');

  useEffect(() => {
    financeApi.fineHistory()
      .then(data => {
        const paid = data.filter(v => v.status === 'PAID');
        
        paid.sort((a, b) => {
          const dateA = a.paidAt || a.createdAt ? new Date(a.paidAt ?? a.createdAt).getTime() : 0;
          const dateB = b.paidAt || b.createdAt ? new Date(b.paidAt ?? b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setAll(paid);
        setFiltered(paid);
      })
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    let result = all;
    if (loginName.trim()) {
      const q = loginName.trim().toLowerCase();
      result = result.filter(v =>
        v.user.identityNumber?.toLowerCase().includes(q) ||
        v.user.fullName?.toLowerCase().includes(q)
      );
    }
    if (from) result = result.filter(v => new Date(v.paidAt ?? v.createdAt) >= new Date(from));
    if (to) result = result.filter(v => new Date(v.paidAt ?? v.createdAt) <= new Date(to + 'T23:59:59'));
    setFiltered(result);
  };

  return (
    <div>
      <h1 className="text-xl font-bold">Xem lịch sử Thu phạt</h1>
      <p className="text-sm text-gray-500 mb-6">Danh sách các khoản phí phạt đã thu được.</p>

      <div className="bg-white rounded-xl border p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Từ ngày</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <span className="pb-2">-</span>
        <div>
          <label className="block text-xs font-bold text-gray-600 mb-1">Đến ngày</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="flex-1 min-w-50">
          <label className="block text-xs font-bold text-gray-600 mb-1">Mã / Tên độc giả</label>
          <input type="text"  value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <button onClick={handleSearch}
          className="bg-[#1e293b] text-white px-6 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <Search size={14} />Truy vấn
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b bg-gray-50">
              <th className="px-6 py-3 font-bold">Mã phiếu / Ngày thu</th>
              <th className="px-6 py-3 font-bold">Độc giả</th>
              <th className="px-6 py-3 font-bold">Lý do phạt</th>
              <th className="px-6 py-3 font-bold text-right">Số tiền thu</th>
              <th className="px-6 py-3 font-bold text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr key="loading">
                <td colSpan={5} className="text-center py-10 text-gray-500">
                  <Loader2 className="inline animate-spin" size={20} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr key="empty">
                <td colSpan={5} className="text-center py-10 text-gray-500">Không có dữ liệu.</td>
              </tr>
            ) : filtered.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <div className="font-medium">{formatId(item.id)}</div>
                  <div className="text-xs text-gray-500">{formatDate(item.paidAt ?? item.createdAt)}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold">{item.user.fullName}</div>
                  <div className="text-xs text-gray-500">{item.user.identityNumber ?? item.user.email}</div>
                </td>
                <td className="px-6 py-4 text-gray-700">{cleanDesc(item.description)}</td>
                <td className="px-6 py-4 text-right font-bold text-red-600">{formatMoney(item.fineAmount)}</td>
                <td className="px-6 py-4 text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    Đã thu (Trừ Ví)
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
