'use client';
import { useState, useEffect } from 'react';
import { inventoryApi, type ImportTicket } from '@/lib/inventory';
import { booksApi } from '@/lib/books';
import type { BookTitle } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const SOURCES = ['Nhập mua mới', 'Tài trợ', 'Trao đổi', 'Khác'];
const formatDate = (iso?: string | null) => iso ? new Date(iso).toLocaleDateString('vi-VN') : '---';
const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'APPROVED') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Đã duyệt</span>;
  if (status === 'REJECTED') return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">Từ chối</span>;
  return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700">Chờ duyệt</span>;
};

export default function ImportStockPage() {
  const [books, setBooks] = useState<BookTitle[]>([]);
  const [history, setHistory] = useState<ImportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  const [bookTitleId, setBookTitleId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [source, setSource] = useState(SOURCES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bs, hist] = await Promise.all([booksApi.list(), inventoryApi.listImportTickets()]);
      
      const sortedHistory = [...hist].sort((a, b) => {
        const dateA = a.importDate ? new Date(a.importDate).getTime() : 0;
        const dateB = b.importDate ? new Date(b.importDate).getTime() : 0;
        return dateB - dateA;
      });

      setBooks(bs);
      setHistory(sortedHistory); 
      
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await inventoryApi.createImportTicket(
        [{ bookId: Number(bookTitleId), quantity: Number(quantity), unitPrice: Number(unitPrice) }],
        `Nguồn: ${source}`
      );
      alert('Đã gửi yêu cầu nhập sách sang cho Kế toán phê duyệt!');
      setBookTitleId('');
      setQuantity('');
      setUnitPrice('');
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi gửi yêu cầu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold mb-6">Nhập sách vào kho</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold text-gray-800 mb-4 pb-3 border-b">Phiếu đề nghị nhập kho</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-bold mb-1">Đầu sách *</label>
              <select value={bookTitleId}
                onChange={(e) => setBookTitleId(e.target.value === '' ? '' : Number(e.target.value))}
                required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                <option value="">-- Chọn sách --</option>
                {books.map((b) => <option key={b.id} value={b.id}>{`S-${String(b.id).padStart(3, '0')} - ${b.title}`}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Nguồn nhập</label>
              <select value={source} onChange={(e) => setSource(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold mb-1">Số lượng *</label>
                <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Đơn giá (VNĐ) *</label>
                <input type="number" min="0" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            </div>
            {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
            <button type="submit" disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
              {submitting && <Loader2 size={16} className="animate-spin" />}Gửi yêu cầu cho Kế toán
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold text-gray-800 mb-4 pb-3 border-b">Lịch sử đề nghị nhập kho</h2>
          {loading ? <Loader2 className="animate-spin text-blue-500 mx-auto" size={24} /> : (
            <div className="overflow-y-auto max-h-125">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-gray-500 border-b">
                  <tr>
                    <th className="py-2 font-bold text-left">Sách / Ngày</th>
                    <th className="py-2 font-bold text-center">SL</th>
                    <th className="py-2 font-bold text-right">Đơn giá</th>
                    <th className="py-2 font-bold text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {history.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-6 text-gray-500">Chưa có yêu cầu nào.</td></tr>
                  ) : history.map((t) => (
                    <tr key={t.id}>
                      <td className="py-3">
                        <div className="font-bold">{t.details?.[0]?.book?.title || '---'}</div>
                        <div className="text-xs text-gray-500">{formatDate(t.importDate)}</div>
                        {t.status === 'REJECTED' && t.rejectReason && (
                          <div className="text-xs text-red-500 mt-0.5 italic">Lý do: {t.rejectReason}</div>
                        )}
                      </td>
                      <td className="py-3 text-center font-bold text-blue-600">
                        {t.details?.reduce((s, d) => s + d.quantity, 0)}
                      </td>
                      <td className="py-3 text-right text-gray-600 text-xs">
                        {formatMoney(t.details?.[0]?.unitPrice ?? 0)}
                      </td>
                      <td className="py-3 text-right">
                        <StatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
