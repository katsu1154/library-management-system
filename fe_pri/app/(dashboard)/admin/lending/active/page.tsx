'use client';
import { useState, useEffect } from 'react';
import { borrowsApi, type BorrowTicket } from '@/lib/borrows';
import { Search, Loader2, BookCheck, Clock } from 'lucide-react';

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN') : '---';
const formatDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '---';

const ReservationCountdown = ({ deadline }: { deadline?: string | null }) => {
  if (!deadline) return <span className="text-gray-400 text-xs">---</span>;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return <span className="text-red-600 font-bold text-xs">⚠ Đã hết hạn!</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const urgent = diff < 3600000 * 6;
  return (
    <span className={`text-xs font-bold flex items-center gap-1 ${urgent ? 'text-red-600' : 'text-orange-500'}`}>
      <Clock size={11} /> Còn {h}g {m}p
    </span>
  );
};

const STATUS_COLORS: Record<string, string> = {
  PENDING_PICKUP: 'bg-yellow-50 text-yellow-700',
  BORROWED: 'bg-blue-50 text-blue-700',
  OVERDUE: 'bg-red-50 text-red-700',
};
const STATUS_LABELS: Record<string, string> = {
  PENDING_PICKUP: 'Đang giữ chỗ',
  BORROWED: 'Đang mượn',
  OVERDUE: 'Quá hạn',
};

export default function BorrowTrackPage() {
  const [tickets, setTickets] = useState<BorrowTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await borrowsApi.list();
      setTickets(all.filter((t) => ['PENDING_PICKUP', 'BORROWED'].includes(t.status)));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleConfirm = async (borrowCode: string, id: number) => {
    if (!confirm(`Xác nhận giao sách cho phiếu ${borrowCode}?`)) return;
    setConfirmingId(id);
    try {
      await borrowsApi.confirmBorrow(borrowCode);
      alert('Giao sách thành công! Bắt đầu tính ngày mượn.');
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Lỗi giao sách');
    } finally { setConfirmingId(null); }
  };

  const filtered = tickets.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.borrowCode.toLowerCase().includes(q) ||
      (t.user?.fullName ?? '').toLowerCase().includes(q) ||
      (t.user?.email ?? '').toLowerCase().includes(q) ||
      (t.bookCopy?.book?.title ?? '').toLowerCase().includes(q) ||
      (t.bookCopy?.copyCode ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-xl border shadow-sm flex flex-col min-h-[85vh]">
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold">Theo dõi Trạng thái (Sách đang mượn)</h1>
      </div>

      <div className="p-4 bg-gray-50/50 border-b flex gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none" />
        </div>
        <button onClick={fetchData} className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-medium">Làm mới</button>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-xs uppercase border-b">
              <th className="px-4 py-4 font-bold">Mã phiếu</th>
              <th className="px-4 py-4 font-bold">Độc giả</th>
              <th className="px-4 py-4 font-bold">Sách / Mã bản</th>
              <th className="px-4 py-4 font-bold">Ngày đặt</th>
              <th className="px-4 py-4 font-bold">Hạn lấy sách</th>
              <th className="px-4 py-4 font-bold">Ngày mượn</th>
              <th className="px-4 py-4 font-bold">Hạn trả</th>
              <th className="px-4 py-4 font-bold">Trạng thái</th>
              <th className="px-4 py-4 font-bold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {loading ? (
              <tr><td colSpan={9} className="text-center py-10 text-gray-500">
                <Loader2 className="inline animate-spin" size={20} /> Đang tải...
              </td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={9} className="text-center py-10 text-gray-500">
                Không có phiếu mượn đang xử lý.
              </td></tr>
            ) : filtered.map((t) => {
              const isOverdue = t.dueDate && new Date(t.dueDate) < new Date() && t.status === 'BORROWED';
              const displayStatus = isOverdue ? 'OVERDUE' : t.status;
              return (
                <tr key={t.id} className={`hover:bg-gray-50/50 ${t.status === 'PENDING_PICKUP' ? 'bg-yellow-50/30' : ''}`}>
                  <td className="px-4 py-4 text-gray-700 font-mono text-xs">
                    <div className="font-bold text-red-700">{t.borrowCode}</div>
                    <div className="text-gray-400">#{t.id}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-800">{t.user?.fullName ?? '---'}</div>
                    <div className="text-xs text-gray-400">{t.user?.email ?? '---'}</div>
                  </td>
                  <td className="px-4 py-4 text-gray-700 max-w-44">
                    <div className="truncate">{t.bookCopy?.book?.title ?? '---'}</div>
                    <div className="text-xs text-gray-400">{t.bookCopy?.copyCode ?? '---'}</div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-gray-700 text-xs">{formatDateTime(t.borrowDate)}</div>
                    {t.status === 'PENDING_PICKUP' && (
                      <ReservationCountdown deadline={t.pickupDeadline} />
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {t.status === 'PENDING_PICKUP' && t.pickupDeadline ? (
                      <span className="text-xs text-orange-600 font-bold">
                        {formatDateTime(t.pickupDeadline)}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">---</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-gray-600 text-xs">{formatDate(t.pickupDate)}</td>
                  <td className={`px-4 py-4 font-medium text-xs ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                    {formatDate(t.dueDate)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[displayStatus] || 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABELS[displayStatus] || displayStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {t.status === 'PENDING_PICKUP' ? (
                      <button onClick={() => handleConfirm(t.borrowCode, t.id)} disabled={confirmingId === t.id}
                        className="bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto">
                        {confirmingId === t.id ? <Loader2 size={12} className="animate-spin" /> : <BookCheck size={12} />}
                        Giao sách
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 border-t bg-gray-50/50 flex justify-between items-center text-sm text-gray-500">
        <span>{filtered.length} phiếu đang xử lý</span>
      </div>
    </div>
  );
}
