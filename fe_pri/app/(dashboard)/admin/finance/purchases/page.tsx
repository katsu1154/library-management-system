'use client';
import { useState, useEffect } from 'react';
import { inventoryApi } from '@/lib/inventory';
import { CheckCircle2, X, Loader2, Inbox, FileCheck } from 'lucide-react';

const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');

export default function PurchaseCostPage() {
  const [pending, setPending] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejecting, setRejecting] = useState<any | null>(null);
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const all = await inventoryApi.listPurchaseRequests();
      
      setPending(all.filter((x: any) => x.status === 'PENDING'));
      
      const hist = all.filter((x: any) => x.status === 'APPROVED' || x.status === 'REJECTED');
      
      hist.sort((a: any, b: any) => {
        const dateA = a.importDate ? new Date(a.importDate).getTime() : 0;
        const dateB = b.importDate ? new Date(b.importDate).getTime() : 0;
        
        if (dateB === dateA) {
          return (b.id || 0) - (a.id || 0);
        }
        
        return dateB - dateA;
      });

      setHistory(hist);
      
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (ticket: any) => {
    setApprovingId(ticket.id);
    try {
      await inventoryApi.approvePurchaseRequest(ticket.id, { actualCost: ticket.totalCost });
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Lỗi khi duyệt');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold">Quản lý Chi phí mua sách</h1>
      <p className="text-sm text-gray-500 mb-6">Duyệt đơn đề nghị mua sách từ kho, ghi nhận chi phí thực tế và hạch toán.</p>

      {/* Pending */}
      <div className="bg-white rounded-xl border-2 border-red-100 mb-6 overflow-hidden">
        <div className="px-6 py-4 border-b bg-red-50/30 flex items-center gap-2">
          <Inbox size={18} className="text-red-500" />
          <h2 className="font-bold">Đơn đề nghị chờ duyệt (Từ Phòng Kho)</h2>
        </div>
        {loading ? (
          <div className="text-center py-10"><Loader2 className="inline animate-spin" size={20} /></div>
        ) : pending.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">Không có đơn chờ duyệt.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b">
              <tr>
                <th className="px-6 py-3 font-bold text-left">Tên sách</th>
                <th className="px-6 py-3 font-bold text-center">SL yêu cầu</th>
                <th className="px-6 py-3 font-bold text-right">Đơn giá</th>
                <th className="px-6 py-3 font-bold text-right">Tổng chi phí</th>
                <th className="px-6 py-3 font-bold text-left">Ghi chú từ kho</th>
                <th className="px-6 py-3 font-bold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {pending.map((p) => (
                <tr key={p.id} className="hover:bg-red-50/20">
                  <td className="px-6 py-4 font-bold">{p.details?.[0]?.book?.title || '---'}</td>
                  <td className="px-6 py-4 text-center font-bold">{p.details?.reduce((s: number, d: any) => s + d.quantity, 0)}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{formatMoney(p.details?.[0]?.unitPrice ?? 0)}</td>
                  <td className="px-6 py-4 text-right font-bold text-red-600">- {formatMoney(p.totalCost ?? 0)}</td>
                  <td className="px-6 py-4 text-gray-600 italic">{p.note || '---'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex gap-2">
                      <button onClick={() => setRejecting(p)}
                        className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs hover:bg-red-50">
                        Từ chối
                      </button>
                      <button onClick={() => handleApprove(p)} disabled={approvingId === p.id}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1">
                        {approvingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                        Duyệt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center gap-2">
          <FileCheck size={18} className="text-green-500" />
          <h2 className="font-bold">Lịch sử xử lý đơn nhập kho</h2>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-sm">Chưa có lịch sử.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-gray-500 uppercase border-b">
              <tr>
                <th className="px-6 py-3 font-bold text-left">Ngày</th>
                <th className="px-6 py-3 font-bold text-left">Tên sách</th>
                <th className="px-6 py-3 font-bold text-center">SL</th>
                <th className="px-6 py-3 font-bold text-right">Chi phí</th>
                <th className="px-6 py-3 font-bold text-left">Kết quả / Lý do từ chối</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {history.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-gray-600">{formatDate(p.importDate)}</td>
                  <td className="px-6 py-4 font-bold">{p.details?.[0]?.book?.title || '---'}</td>
                  <td className="px-6 py-4 text-center">{p.details?.reduce((s: number, d: any) => s + d.quantity, 0)}</td>
                  <td className="px-6 py-4 text-right text-red-600 font-bold">
                    {p.status === 'APPROVED' ? `- ${formatMoney(p.totalCost || 0)}` : '---'}
                  </td>
                  <td className="px-6 py-4">
                    {p.status === 'APPROVED' ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">Đã duyệt</span>
                    ) : (
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700">Đã từ chối</span>
                        {p.rejectReason && <span className="ml-2 text-xs text-gray-500 italic">"{p.rejectReason}"</span>}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {rejecting && (
        <RejectModal request={rejecting} onClose={() => setRejecting(null)} onSuccess={() => { setRejecting(null); fetchData(); }} />
      )}
    </div>
  );
}

function RejectModal({ request, onClose, onSuccess }: { request: any; onClose: () => void; onSuccess: () => void }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!reason.trim()) return setError('Vui lòng nhập lý do từ chối');
    setSubmitting(true);
    try {
      await inventoryApi.rejectPurchaseRequest(request.id, reason.trim());
      onSuccess();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg text-red-600">Từ chối đơn nhập kho</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 border rounded-lg p-3 text-sm">
            <p className="text-gray-500">Sách:</p>
            <p className="font-bold">{request.details?.[0]?.book?.title}</p>
            <p className="text-gray-500 mt-1">Số lượng: <span className="font-bold">{request.details?.reduce((s: number, d: any) => s + d.quantity, 0)} cuốn</span></p>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Lý do từ chối *</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-red-400 focus:ring-1 focus:ring-red-200 outline-none resize-none" />
          </div>
          {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-100">Hủy</button>
            <button type="submit" disabled={submitting}
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-2">
              {submitting && <Loader2 size={14} className="animate-spin" />}Xác nhận từ chối
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
