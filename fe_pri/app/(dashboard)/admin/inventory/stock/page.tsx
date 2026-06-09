'use client';
import { useState, useEffect } from 'react';
import { inventoryApi, type StockItem } from '@/lib/inventory';
import { Search, Loader2 } from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  SAFE: { label: 'An toàn', color: 'bg-green-50 text-green-700' },
  WARNING: { label: 'Cảnh báo', color: 'bg-yellow-50 text-yellow-700' },
  OUT: { label: 'Hết hàng', color: 'bg-red-50 text-red-700' },
};

export default function StockListPage() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    inventoryApi.stock().then(setItems).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((i) => i.bookTitleName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="bg-white rounded-xl border shadow-sm flex flex-col min-h-[85vh]">
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold">Danh sách Tồn Kho</h1>
      </div>

      <div className="p-4 bg-gray-50/50 border-b flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text"  value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
        </div>
        <button className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium">Tìm kiếm</button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b">
              <th className="px-6 py-4 font-bold">Tên sách</th>
              <th className="px-6 py-4 font-bold">Tồn kho</th>
              <th className="px-6 py-4 font-bold">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {loading ? (
              <tr><td colSpan={3} className="text-center py-10 text-gray-500"><Loader2 className="inline animate-spin" size={20} /> Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={3} className="text-center py-10 text-gray-500">Không có dữ liệu.</td></tr>
            ) : filtered.map((i) => {
              const st = STATUS_LABELS[i.status] || { label: i.status, color: 'bg-gray-100' };
              return (
                <tr key={i.bookTitleId} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 font-bold">{i.bookTitleName}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{i.availableCopies}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}