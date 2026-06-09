'use client';
import { useState, useEffect } from 'react';
import { notificationsApi, type Notification } from '@/lib/notifications';
import { Search, Loader2 } from 'lucide-react';

const TARGET_LABEL: Record<string, string> = {
  ALL: 'Tất cả người dùng',
  INTERNAL: 'Sinh viên TLU',
  EXTERNAL: 'Độc giả ngoài trường',
  STAFF: 'Thủ thư / Kế toán',
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');

export default function NotificationListPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    notificationsApi.list().then(setItems).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((n) => n.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Danh sách Thông báo đã gửi</h1>

      <div className="bg-white rounded-xl border p-4 mb-6 flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text"  value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        <button className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-bold">Tra cứu</button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase border-b">
            <tr>
              <th className="px-6 py-3 font-bold text-left">Ngày gửi</th>
              <th className="px-6 py-3 font-bold text-left">Tiêu đề</th>
              <th className="px-6 py-3 font-bold text-left">Đối tượng</th>
              <th className="px-6 py-3 font-bold text-left">Người gửi</th>
              <th className="px-6 py-3 font-bold text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10"><Loader2 className="inline animate-spin" /></td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-500">Chưa có thông báo nào.</td></tr>
            ) : filtered.map((n) => (
              <tr key={n.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4 text-gray-600">{formatDate(n.createdAt)}</td>
                <td className="px-6 py-4 font-bold">{n.title}</td>
                <td className="px-6 py-4 text-gray-700">{TARGET_LABEL[n.targetType] || n.targetType}</td>
                <td className="px-6 py-4 text-gray-700">{n.senderName || 'Admin'}</td>
                <td className="px-6 py-4 text-right">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700">ĐÃ GỬI</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}