'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { readerBorrowsApi, borrowsApi, type BorrowTicket } from '@/lib/borrows';
import { BookOpen, Clock, CheckCircle2, RefreshCw, Loader2, Info, AlertCircle, XCircle } from 'lucide-react';

const formatDate = (iso?: string | null) => iso ? new Date(iso).toLocaleDateString('vi-VN') : '---';
const formatDateTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '---';

const CountdownPickup = ({ deadline }: { deadline?: string | null }) => {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return <span className="text-red-600 font-bold text-xs">⚠ Đã hết hạn đặt sách!</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const urgent = diff < 3600000 * 6;
  return <span className={`text-xs font-bold ${urgent ? 'text-red-600' : 'text-orange-500'}`}>⏰ Còn {h}g {m}p để đến lấy sách</span>;
};

export default function MyBorrowsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<BorrowTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [renewingId, setRenewingId] = useState<number | null>(null);
  const [renewModal, setRenewModal] = useState<{ ticketId: number; bookTitle: string; days: number } | null>(null);
  const [cancelModal, setCancelModal] = useState<{ ticket: BorrowTicket } | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  const isExternal = user?.roleName === 'ROLE_EXTERNAL_READER';

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await readerBorrowsApi.myBorrows();
      setTickets(data);
    } catch (e: any) {
      setError(e.message || 'Lỗi tải danh sách');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const active = tickets.filter((r) => ['PENDING_PICKUP', 'BORROWED'].includes(r.status));
  const history = tickets.filter((r) => ['RETURNED', 'CANCELED'].includes(r.status));

  const handleRenew = (ticketId: number, bookTitle: string) => {
    setRenewModal({ ticketId, bookTitle, days: 7 });
  };

  const handleRenewConfirm = async () => {
    if (!renewModal) return;
    const { ticketId, days } = renewModal;
    setRenewModal(null);
    setRenewingId(ticketId);
    try {
      await borrowsApi.renew(ticketId, days);
      alert(`Gia hạn thành công ${days} ngày!`);
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Lỗi gia hạn');
    } finally {
      setRenewingId(null);
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelModal) return;
    setCancelLoading(true);
    try {
      await borrowsApi.cancel(cancelModal.ticket.id);
      setCancelModal(null);
      fetchData();
    } catch (e: any) {
      alert(e.message || 'Lỗi huỷ đặt chỗ');
    } finally {
      setCancelLoading(false);
    }
  };

  const getActiveStatus = (t: BorrowTicket) => {
    if (t.status === 'PENDING_PICKUP') return { label: 'Đang giữ chỗ', color: 'bg-yellow-50 text-yellow-700' };
    if (t.dueDate && new Date(t.dueDate) < new Date()) return { label: 'Quá hạn', color: 'bg-red-50 text-red-700' };
    return { label: 'Trong hạn', color: 'bg-green-50 text-green-700' };
  };

  const getHistoryStatus = (t: BorrowTicket) => {
    if (t.status === 'CANCELED') return { label: 'Đã hủy', color: 'bg-gray-100 text-gray-700' };
    return { label: 'Đã trả', color: 'bg-green-50 text-green-700' };
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <BookOpen className="text-red-600" /> Quản lý mượn trả
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex gap-2 mb-6">
          <AlertCircle size={18} />{error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={32} /></div>
      ) : (
        <>
          <section className="bg-white rounded-xl shadow-sm border mb-6">
            <div className="px-6 py-4 border-b flex items-center gap-2">
              <Clock size={18} className="text-blue-500" />
              <h2 className="font-bold text-gray-800">Sách đang mượn / giữ chỗ</h2>
              <span className="ml-auto text-sm text-gray-500">{active.length} phiếu</span>
            </div>

            {active.length === 0 ? (
              <div className="p-10 text-center text-gray-500 text-sm">Bạn chưa mượn cuốn sách nào.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase border-b">
                    <tr>
                      <th className="px-6 py-3 font-bold">Mã phiếu</th>
                      <th className="px-6 py-3 font-bold">Tên sách</th>
                      <th className="px-6 py-3 font-bold">Ngày đặt</th>
                      <th className="px-6 py-3 font-bold">Hạn lấy / Ngày mượn</th>
                      <th className="px-6 py-3 font-bold">Hạn trả</th>
                      <th className="px-6 py-3 font-bold">Trạng thái</th>
                      <th className="px-6 py-3 font-bold text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {active.map((t) => {
                      const st = getActiveStatus(t);
                      const canRenew = t.status === 'BORROWED' && t.dueDate && new Date(t.dueDate) >= new Date() && t.renewCount < 2;
                      return (
                        <tr key={t.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 text-gray-700 font-mono text-xs">
                            <div className="font-bold">{t.borrowCode}</div>
                          </td>
                          <td className="px-6 py-4 font-bold max-w-52 truncate">
                            {t.bookCopy?.book?.title ?? '---'}
                            <div className="text-xs text-gray-400 font-normal">{t.bookCopy?.copyCode}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                            <div>{formatDateTime(t.borrowDate)}</div>
                            {t.status === 'PENDING_PICKUP' && <CountdownPickup deadline={t.pickupDeadline} />}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {t.status === 'PENDING_PICKUP'
                              ? <span className="text-orange-600 font-bold text-xs">{formatDateTime(t.pickupDeadline)}</span>
                              : formatDate(t.pickupDate)
                            }
                          </td>
                          <td className="px-6 py-4 font-medium">{formatDate(t.dueDate)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {canRenew ? (
                              <button
                                onClick={() => handleRenew(t.id, t.bookCopy?.book?.title ?? '---')}
                                disabled={renewingId === t.id}
                                className="text-blue-600 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto disabled:opacity-50"
                              >
                                {renewingId === t.id ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                                Gia hạn
                              </button>
                            ) : t.status === 'PENDING_PICKUP' ? (
                              <button
                                onClick={() => setCancelModal({ ticket: t })}
                                className="text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto"
                              >
                                <XCircle size={12} /> Huỷ đặt chỗ
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
                <div className={`px-6 py-3 border-t text-xs flex items-center gap-2 ${
                  !isExternal ? 'bg-green-50/30 text-green-700' : 'bg-blue-50/30 text-gray-600'
                }`}>
                  {!isExternal ? (
                    <><CheckCircle2 size={14} className="text-green-500" />Sinh viên trong trường được gia hạn miễn phí. Tối đa 2 lần, 3–7 ngày mỗi lần.</>
                  ) : (
                    <><Info size={14} className="text-blue-500" />Tối đa gia hạn 2 lần (3–7 ngày/lần, 3%/ngày). Phí tự động trừ vào Ví.</>
                  )}
                </div>
              </div>
            )}
          </section>

          <section className="bg-white rounded-xl shadow-sm border">
            <div className="px-6 py-4 border-b flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green-500" />
              <h2 className="font-bold text-gray-800">Lịch sử mượn trả đã hoàn thành</h2>
              <span className="ml-auto text-sm text-gray-500">{history.length} phiếu</span>
            </div>

            {history.length === 0 ? (
              <div className="p-10 text-center text-gray-500 text-sm">Chưa có lịch sử.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase border-b">
                    <tr>
                      <th className="px-6 py-3 font-bold">Mã phiếu</th>
                      <th className="px-6 py-3 font-bold">Tên sách</th>
                      <th className="px-6 py-3 font-bold">Ngày mượn</th>
                      <th className="px-6 py-3 font-bold">Ngày trả</th>
                      <th className="px-6 py-3 font-bold">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {history.map((t) => {
                      const st = getHistoryStatus(t);
                      return (
                        <tr key={t.id} className="hover:bg-gray-50/50">
                          <td className="px-6 py-4 text-gray-700 font-mono text-xs">{t.borrowCode}</td>
                          <td className="px-6 py-4 font-bold max-w-52 truncate">{t.bookCopy?.book?.title ?? '---'}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(t.pickupDate ?? t.borrowDate)}</td>
                          <td className="px-6 py-4 text-gray-600">{formatDate(t.returnDate)}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>{st.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
      {cancelModal && (() => {
        const t = cancelModal.ticket;
        const bookPrice = t.bookCopy?.book?.price ?? 0;
        const penalty = bookPrice * 0.1;
        const deposit = t.depositAmount ?? 0;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <XCircle size={20} className="text-red-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-base">Xác nhận huỷ đặt chỗ</h3>
                  <p className="text-xs text-gray-500 truncate max-w-52">{t.bookCopy?.book?.title}</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-900 space-y-1.5 mb-5">
                <p className="font-bold">Lưu ý về chi phí huỷ:</p>
                <p>• Phạt huỷ đặt chỗ: <span className="font-bold text-red-600">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(penalty)}
                </span> (10% giá sách)</p>
                {isExternal && deposit > 0 && (
                  <p>• Tiền cọc hoàn lại: <span className="font-bold text-green-700">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(deposit)}
                  </span></p>
                )}
                {isExternal
                  ? <p className="text-xs text-gray-600 pt-1">Tiền cọc được hoàn đầy đủ vào ví. Phí phạt được trừ riêng vào ví.</p>
                  : <p className="text-xs text-gray-600 pt-1">Phí phạt sẽ được trừ tự động vào ví của bạn.</p>
                }
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setCancelModal(null)}
                  disabled={cancelLoading}
                  className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleCancelConfirm}
                  disabled={cancelLoading}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-bold hover:bg-red-700 flex items-center gap-1.5 disabled:opacity-50"
                >
                  {cancelLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  {cancelLoading ? 'Đang xử lý...' : 'Xác nhận huỷ'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {renewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-gray-800 text-lg mb-1">Gia hạn mượn sách</h3>
            <p className="text-sm text-gray-500 mb-5 truncate">{renewModal.bookTitle}</p>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số ngày gia hạn: <span className="text-blue-600 font-bold">{renewModal.days} ngày</span>
            </label>
            <input
              type="range"
              min={3}
              max={7}
              step={1}
              value={renewModal.days}
              onChange={(e) => setRenewModal({ ...renewModal, days: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1 mb-5">
              <span>3 ngày</span><span>5 ngày</span><span>7 ngày</span>
            </div>

            {isExternal && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2 mb-5">
                Phí gia hạn sẽ được trừ tự động vào Ví của bạn.
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setRenewModal(null)}
                className="px-4 py-2 rounded-lg border text-sm text-gray-600 hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleRenewConfirm}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 flex items-center gap-1.5"
              >
                <RefreshCw size={14} /> Xác nhận gia hạn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}