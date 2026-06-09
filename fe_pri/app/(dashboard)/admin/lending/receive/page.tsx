'use client';
import { useState } from 'react';
import { borrowsApi, type BorrowTicket } from '@/lib/borrows';
import { Info, AlertOctagon, CheckCircle2, Loader2, FileText } from 'lucide-react';

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('vi-VN') : '---';

export default function BorrowReturnPage() {
  const [input, setInput] = useState('');
  const [searching, setSearching] = useState(false);
  const [ticket, setTicket] = useState<BorrowTicket | null>(null);
  const [error, setError] = useState('');
  const [damagePercent, setDamagePercent] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  const handleSearch = async () => {
    const code = input.trim().toUpperCase();
    if (!code) return;
    setSearching(true);
    setTicket(null);
    setError('');
    setSuccess('');
    setDamagePercent(0);
    try {
      const found = await borrowsApi.findActiveByBorrowCode(code);
      if (!found) setError(`Không tìm thấy phiếu mượn đang MƯỢN với mã "${code}"`);
      else setTicket(found);
    } catch (e: any) {
      setError(e.message || 'Lỗi tra cứu');
    } finally {
      setSearching(false);
    }
  };

  const handleReturn = async () => {
    if (!ticket) return;
    setSubmitting(true);
    setError('');
    try {
      await borrowsApi.returnBook(ticket.borrowCode, damagePercent);
      const dmgMsg = damagePercent > 0 ? ` — ghi phạt hỏng ${damagePercent}%` : '';
      setSuccess(
        `Đã nhận lại sách "${ticket.bookCopy?.book?.title}" của ${ticket.user?.fullName}${dmgMsg}`
      );
      setTicket(null);
      setInput('');
      setDamagePercent(0);
    } catch (e: any) {
      setError(e.message || 'Lỗi xử lý trả sách');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = ticket?.dueDate && new Date(ticket.dueDate) < new Date();
  const isExternal = ticket?.user?.roleName === 'ROLE_EXTERNAL_READER';

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-800">Tiếp nhận Trả sách</h1>

      <div className="bg-white rounded-xl border shadow-sm p-6">
        <label className="block text-sm font-bold text-gray-800 mb-2">Nhập Mã phiếu mượn</label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none bg-blue-50/30"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="bg-[#1e293b] hover:bg-slate-800 text-white px-8 py-3 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {searching && <Loader2 size={16} className="animate-spin" />}Tra cứu
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
           Mã phiếu định dạng BR-XXXXXXXX, được tạo khi độc giả đặt sách thành công
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle2 size={20} />{success}
        </div>
      )}

      {ticket && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Info size={18} className="text-blue-500" />Thông tin phiếu mượn
            </h3>
            <div className="space-y-3 text-sm">
              {([
                ['Mã phiếu', <span className="font-bold font-mono">{ticket.borrowCode}</span>],
                ['Độc giả', `${ticket.user?.fullName} (${ticket.user?.email})`],
                ['Sách', `${ticket.bookCopy?.book?.title} — ${ticket.bookCopy?.copyCode}`],
                ['Ngày lấy', formatDate(ticket.pickupDate)],
                [
                  'Hạn trả',
                  <span className={`font-bold ${isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                    {formatDate(ticket.dueDate)}{isOverdue ? ' ⚠ Quá hạn' : ''}
                  </span>,
                ],
                ...(ticket.depositAmount > 0
                  ? [['Tiền cọc (sẽ hoàn)', `${ticket.depositAmount.toLocaleString('vi-VN')}đ`]]
                  : []),
              ] as [string, React.ReactNode][]).map(([label, val], i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-500">{label}:</span>
                  <span className="text-gray-800 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertOctagon size={18} className="text-red-500" />Kiểm tra tình trạng sách
            </h3>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                % hư hỏng so với lúc cho mượn (0 = không hỏng)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={damagePercent}
                onChange={(e) => setDamagePercent(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none"
              />
              {damagePercent > 0 && (
                <p className="text-xs text-red-500">
                  {damagePercent >= 50
                    ? '⚠ Hỏng ≥ 50% → Tính như MẤT sách (100% giá trị).'
                    : ` Hỏng ${damagePercent}% → Phạt ${damagePercent}% giá trị sách.`}
                  {isExternal
                    ? ' Tiền phạt trừ trực tiếp từ ví độc giả.'
                    : ' Vi phạm ghi vào hồ sơ, độc giả thanh toán sau.'}
                </p>
              )}
            </div>

            <button
              onClick={handleReturn}
              disabled={submitting}
              className="mt-5 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {damagePercent > 0 ? 'Ghi phạt & Xác nhận nhận sách' : 'Xác nhận nhận sách'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
