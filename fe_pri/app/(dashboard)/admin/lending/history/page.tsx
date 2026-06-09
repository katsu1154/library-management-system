'use client';
import { useState, useEffect } from 'react';
import { borrowsApi, type BorrowDetailResponse } from '@/lib/borrows';
import type { BorrowTicket } from '@/lib/types';
import { Search, Loader2, Eye, X, BookOpen, CheckCircle2, Clock } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  RETURNED: 'bg-green-50 text-green-700',
  CANCELED: 'bg-gray-100 text-gray-700',
};
const STATUS_LABELS: Record<string, string> = {
  RETURNED: 'Đã trả',
  CANCELED: 'Đã hủy',
};
const VIOLATION_LABELS: Record<string, string> = {
  LATE_RETURN: 'Trả trễ',
  LOST_BOOK: 'Mất sách',
  DAMAGED_BOOK: 'Hư hỏng sách',
  NOT_PICKED_UP: 'Không lấy sách',
};

const fmt = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN') : '---';
const fmtDT = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '---';
const fmtMoney = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Math.abs(n));
const cleanDesc = (s: string) => s.replace(/\s*\[BR-[A-Z0-9]+\]/g, '').trim();

export default function BorrowHistoryPage() {
  const [records, setRecords] = useState<BorrowTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<BorrowDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await borrowsApi.list();
        
        const historyRecords = all.filter((r) => ['RETURNED', 'CANCELED'].includes(r.status));
        
        historyRecords.sort((a, b) => {
          const dateA = a.borrowDate ? new Date(a.borrowDate).getTime() : 0;
          const dateB = b.borrowDate ? new Date(b.borrowDate).getTime() : 0;
          return dateB - dateA; 
        });

        setRecords(historyRecords);
        
      } catch (e: any) {
        setError(e?.message || 'Không thể kết nối đến máy chủ');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openDetail = async (ticketId: number) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const data = await borrowsApi.getDetail(ticketId);
      setDetail(data);
    } catch (e: any) {
      alert(e.message || 'Lỗi tải chi tiết');
    } finally {
      setDetailLoading(false);
    }
  };

  const q = search.toLowerCase();
  const filtered = records.filter(
    (r) =>
      (r.user?.fullName ?? '').toLowerCase().includes(q) ||
      (r.bookCopy?.book?.title ?? '').toLowerCase().includes(q) ||
      (r.bookCopy?.copyCode ?? '').toLowerCase().includes(q) ||
      (r.borrowCode ?? '').toLowerCase().includes(q),
  );

  return (
    <>
      <div className="bg-white rounded-xl border shadow-sm flex flex-col min-h-[85vh]">
        <div className="px-6 py-5 border-b">
          <h1 className="text-xl font-bold">Lịch sử mượn / trả</h1>
          <p className="text-sm text-gray-500 mt-1">Các phiếu đã hoàn tất hoặc bị hủy</p>
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
              <tr className="text-gray-500 text-xs uppercase border-b bg-gray-50/50">
                <th className="px-6 py-4 font-bold">Mã phiếu</th>
                <th className="px-6 py-4 font-bold">Độc giả</th>
                <th className="px-6 py-4 font-bold">Sách / Bản sao</th>
                <th className="px-6 py-4 font-bold">Ngày đặt</th>
                <th className="px-6 py-4 font-bold">Ngày trả</th>
                <th className="px-6 py-4 font-bold">Trạng thái</th>
                <th className="px-6 py-4 font-bold text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    <Loader2 className="inline animate-spin" size={20} /> Đang tải...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">Chưa có lịch sử.</td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 font-mono text-xs text-gray-700 whitespace-nowrap">
                      {r.borrowCode}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold">{r.user?.fullName ?? '---'}</div>
                      <div className="text-xs text-gray-500">{r.user?.email ?? ''}</div>
                    </td>
                    <td className="px-6 py-4 max-w-[220px]">
                      <div className="font-medium truncate">{r.bookCopy?.book?.title ?? '---'}</div>
                      <div className="text-xs text-gray-400">{r.bookCopy?.copyCode}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{fmt(r.borrowDate)}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{fmt(r.returnDate)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] ?? 'bg-gray-100'}`}>
                        {STATUS_LABELS[r.status] ?? r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openDetail(r.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-colors"
                      >
                        <Eye size={13} /> Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {(detailLoading || detail) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
              <div>
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <BookOpen size={18} className="text-red-600" /> Phiếu mượn sách
                </h2>
                {detail && (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-sm text-gray-500">{detail.ticket.borrowCode}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[detail.ticket.status] ?? 'bg-gray-100 text-gray-700'}`}>
                      {STATUS_LABELS[detail.ticket.status] ?? detail.ticket.status}
                    </span>
                  </div>
                )}
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500">
                <X size={18} />
              </button>
            </div>

            {detailLoading && (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-red-500" size={28} />
              </div>
            )}

            {detail && (
              <div className="overflow-y-auto flex-1 divide-y divide-gray-100">

                <div className="px-6 py-4 grid grid-cols-2 gap-x-6 gap-y-1">
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Sách</p>
                    <p className="font-bold text-gray-900 leading-snug">{detail.ticket.bookCopy?.book?.title ?? '---'}</p>
                    {detail.ticket.bookCopy?.book?.isbn && (
                      <p className="text-[11px] text-gray-400 mt-0.5">ISBN: {detail.ticket.bookCopy.book.isbn}</p>
                    )}
                    <p className="text-xs font-mono text-gray-600 mt-0.5">
                      Bản sao: <span className="font-semibold">{detail.ticket.bookCopy?.copyCode ?? '---'}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-1">Độc giả</p>
                    <p className="font-semibold text-gray-900">{detail.ticket.user?.fullName ?? '---'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{detail.ticket.user?.email ?? ''}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {detail.ticket.user?.roleName === 'ROLE_EXTERNAL_READER' ? 'Độc giả ngoài trường'
                        : detail.ticket.user?.roleName === 'ROLE_INTERNAL_READER' ? 'Sinh viên / Cán bộ'
                        : detail.ticket.user?.roleName ?? ''}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-3">Thời gian</p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <DRow label="Ngày giữ chỗ" value={fmtDT(detail.ticket.borrowDate)} />
                    <DRow label="Hạn lấy sách" value={fmtDT(detail.ticket.pickupDeadline)} dim />
                    <DRow label="Ngày lấy sách" value={fmtDT(detail.ticket.pickupDate)} />
                    <DRow label="Hạn trả sách" value={fmt(detail.ticket.dueDate)} dim />
                    <DRow label="Ngày trả thực tế" value={fmtDT(detail.ticket.returnDate)} />
                    {(detail.ticket.renewCount ?? 0) > 0 && (
                      <DRow label="Số lần gia hạn" value={`${detail.ticket.renewCount} lần`} />
                    )}
                  </div>
                </div>

                <div className="px-6 py-4">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-3">Tài chính</p>
                  {detail.transactions.length === 0 && detail.violations.every(v => v.status === 'PAID') ? (
                    <p className="text-xs text-gray-400 italic">Không có giao dịch liên quan.</p>
                  ) : (
                    <div className="space-y-2">
                      {detail.transactions.map((tx) => {
                        const isCredit = tx.type === 'REFUND' || tx.type === 'DEPOSIT';
                        return (
                          <div key={tx.id} className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm text-gray-700 leading-snug">{cleanDesc(tx.description)}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">{fmtDT(tx.createdAt)}</p>
                            </div>
                            <span className={`text-sm font-bold shrink-0 tabular-nums ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                              {isCredit ? '+' : '−'}{fmtMoney(tx.amount)}
                            </span>
                          </div>
                        );
                      })}
                      {detail.violations.filter(v => v.status === 'UNPAID').map((v) => (
                        <div key={`pending-${v.id}`} className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm text-orange-700 leading-snug">
                              Phí vi phạm: {VIOLATION_LABELS[v.violationType] ?? v.violationType}
                              <span className="ml-1.5 text-[10px] bg-orange-100 text-orange-600 rounded px-1 py-0.5 font-bold align-middle">Chưa thu</span>
                            </p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{fmtDT(v.createdAt)}</p>
                          </div>
                          <span className="text-sm font-bold shrink-0 tabular-nums text-orange-600">
                            −{fmtMoney(v.fineAmount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {detail.violations.length > 0 && (
                  <div className="px-6 py-4">
                    <p className="text-[10px] uppercase tracking-wide text-gray-400 mb-3">
                      Vi phạm ({detail.violations.length})
                    </p>
                    <div className="space-y-2">
                      {detail.violations.map((v) => (
                        <div key={v.id} className="bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="text-xs font-bold text-red-700">
                              {VIOLATION_LABELS[v.violationType] ?? v.violationType}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs font-bold text-red-700">{fmtMoney(v.fineAmount)}</span>
                              {v.status === 'PAID'
                                ? <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5"><CheckCircle2 size={10} /> Đã thu</span>
                                : <span className="text-[10px] text-orange-500 font-bold flex items-center gap-0.5"><Clock size={10} /> Chưa thu</span>
                              }
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">{cleanDesc(v.description)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}


function DRow({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div>
      <p className="text-[10px] text-gray-400">{label}</p>
      <p className={`text-sm ${dim ? 'text-gray-400' : 'text-gray-700'} font-medium`}>{value}</p>
    </div>
  );
}
