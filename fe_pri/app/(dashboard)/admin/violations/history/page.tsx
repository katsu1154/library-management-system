'use client';
import { useState, useEffect } from 'react';
import { violationsApi, type Violation } from '@/lib/violations';
import { Search, Loader2, CheckCircle2 } from 'lucide-react';

const formatViolationId = (id: number) => `VP-${String(id).padStart(4, '0')}`;
const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN') : '---';

const VIOLATION_LABELS: Record<string, string> = {
  LATE_RETURN:  'Trả trễ hạn',
  LOST_BOOK:    'Mất sách',
  DAMAGED_BOOK: 'Hỏng sách',
  NOT_PICKED_UP:'Không lấy sách',
};

export default function HistoryViolationsPage() {
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await violationsApi.allViolations();
      
      const paidViolations = all.filter((v) => v.status === 'PAID');
      
      paidViolations.sort((a, b) => {
        const dateA = a.paidAt ? new Date(a.paidAt).getTime() : 0;
        const dateB = b.paidAt ? new Date(b.paidAt).getTime() : 0;
        
        return dateB - dateA; 
      });

      setViolations(paidViolations);
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

  return (
    <div className="bg-white rounded-xl border shadow-sm flex flex-col min-h-[85vh]">
      <div className="px-6 py-5 border-b flex items-center gap-2">
        <CheckCircle2 size={20} className="text-green-500" />
        <h1 className="text-xl font-bold">Lịch sử Vi phạm (Đã xử lý)</h1>
      </div>

      <div className="p-4 bg-gray-50/50 border-b">
        <div className="relative">
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
              <th className="px-6 py-4 font-bold">Ngày xử lý</th>
              <th className="px-6 py-4 font-bold">Độc giả</th>
              <th className="px-6 py-4 font-bold">Loại vi phạm</th>
              <th className="px-6 py-4 font-bold">Ghi chú</th>
              <th className="px-6 py-4 font-bold text-right">Đã nộp phạt</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {loading ? (
              <tr key="loading">
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  <Loader2 className="inline animate-spin" size={20} /> Đang tải...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr key="empty">
                <td colSpan={6} className="text-center py-10 text-gray-500">
                  Chưa có lịch sử vi phạm đã xử lý.
                </td>
              </tr>
            ) : (
              filtered.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-700">{formatViolationId(v.id)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDate(v.paidAt)}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{v.user?.fullName ?? '---'}</div>
                    <div className="text-xs text-gray-500">{v.user?.email ?? ''}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {VIOLATION_LABELS[v.violationType] ?? v.violationType}
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">
                    {v.description ?? '---'}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-600">
                    {formatMoney(v.fineAmount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t bg-gray-50/50 text-sm text-gray-500">
        {filtered.length} vi phạm đã xử lý
      </div>
    </div>
  );
}
