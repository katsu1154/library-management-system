'use client';
import { useState, useEffect } from 'react';
import { violationsApi, type Violation } from '@/lib/violations';
import { Search, Bell, Trash2, Loader2 } from 'lucide-react';

const formatViolationId = (id: number) => `VP-${String(id).padStart(4, '0')}`;
const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN') : '---';

export default function PendingViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await violationsApi.allViolations();
      setViolations(all.filter((v) => v.status === 'UNPAID'));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const q = search.toLowerCase();
  const filtered = violations.filter((v) =>
    !q
    || formatViolationId(v.id).toLowerCase().includes(q)
    || (v.user?.fullName ?? '').toLowerCase().includes(q)
    || (v.user?.email ?? '').toLowerCase().includes(q)
    || v.violationType.toLowerCase().includes(q)
  );

  const handleRemind = (v: Violation) => {
    alert(`Đã gửi nhắc nhở đến ${v.user?.fullName} về vi phạm ${formatViolationId(v.id)}.`);
  };

  const handleDelete = (v: Violation) => {
    if (!confirm(`Hủy bỏ vi phạm ${formatViolationId(v.id)} của ${v.user?.fullName}?`)) return;
    alert('Tính năng hủy vi phạm đang phát triển.');
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm flex flex-col min-h-[85vh]">
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold">Danh sách Vi phạm (Ví không đủ — Chưa xử lý)</h1>
      </div>

      <div className="p-4 bg-gray-50/50 border-b flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
          />
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b">
              <th className="px-6 py-4 font-bold">Mã VP</th>
              <th className="px-6 py-4 font-bold">Độc giả</th>
              <th className="px-6 py-4 font-bold">Loại vi phạm</th>
              <th className="px-6 py-4 font-bold">Ghi chú</th>
              <th className="px-6 py-4 font-bold">Ngày tạo</th>
              <th className="px-6 py-4 font-bold">Tiền phạt</th>
              <th className="px-6 py-4 font-bold text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {loading ? (
              <tr key="loading">
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  <Loader2 className="inline animate-spin" size={20} /> Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr key="empty">
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  Không có vi phạm chưa xử lý. 🎉
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-700">{formatViolationId(v.id)}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{v.user?.fullName ?? '---'}</div>
                    <div className="text-xs text-gray-500">{v.user?.email ?? ''}</div>
                  </td>
                  <td className="px-6 py-4 text-red-600 font-medium">{v.violationType}</td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                    {v.description ?? '---'}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{formatDate(v.createdAt)}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{formatMoney(v.fineAmount)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button
                        onClick={() => handleRemind(v)}
                        className="text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                        title="Gửi nhắc nhở"
                      >
                        <Bell size={12} />Nhắc nhở
                      </button>
                      <button
                        onClick={() => handleDelete(v)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                        title="Hủy vi phạm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t bg-gray-50/50 text-sm text-gray-500">
        {filtered.length} vi phạm chưa xử lý
      </div>
    </div>
  );
}
