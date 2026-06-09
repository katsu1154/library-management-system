'use client';
import { useState } from 'react';
import { adminWalletsApi } from '@/lib/admin-wallets';
import { Lock, Unlock, AlertTriangle, Loader2 } from 'lucide-react';

export default function LockWalletPage() {
  const [loginName, setLoginName] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAction = async (newStatus: 'LOCKED' | 'ACTIVE') => {
    setError('');
    if (!loginName.trim()) return setError('Nhập mã độc giả');
    if (newStatus === 'LOCKED' && !reason.trim()) return setError('Nhập lý do khóa');

    if (!confirm(`Xác nhận ${newStatus === 'LOCKED' ? 'KHÓA' : 'MỞ KHÓA'} ví của "${loginName}"?`)) return;

    setSubmitting(true);
    try {
      // Lookup wallet by loginName
      const all = await adminWalletsApi.getAll();
      const wallet = all.find((w) => w.loginName.toLowerCase() === loginName.trim().toLowerCase());
      if (!wallet) throw new Error('Không tìm thấy ví');

      await adminWalletsApi.toggleStatus(wallet.walletId, newStatus);
      alert(`Đã ${newStatus === 'LOCKED' ? 'khóa' : 'mở khóa'} ví ${loginName} thành công!`);
      setLoginName(''); setReason('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold">Khóa / Mở Ví Độc Giả</h1>
      <p className="text-sm text-gray-500 mb-6">Đóng băng tài khoản ví khi có vi phạm nghiêm trọng hoặc yêu cầu từ độc giả.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4 pb-3 border-b">Thao tác khóa ví</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Mã độc giả cần khóa</label>
              <input type="text" value={loginName} onChange={(e) => setLoginName(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Lý do khóa</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
            </div>
            {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>}
            <div className="flex gap-2">
              <button onClick={() => handleAction('LOCKED')} disabled={submitting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}Xác nhận Khóa Ví
              </button>
              <button onClick={() => handleAction('ACTIVE')} disabled={submitting}
                className="px-4 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-bold flex items-center gap-2">
                <Unlock size={16} />Mở
              </button>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <AlertTriangle size={26} className="text-red-600" />
          </div>
          <h3 className="font-bold text-red-700 mb-2">Lưu ý khi Khóa Ví</h3>
          <p className="text-sm text-gray-600">
            Việc khóa ví sẽ chặn toàn bộ các giao dịch mượn sách có phí hoặc trả nợ phạt của độc giả này trên hệ thống.
            Sinh viên sẽ nhận được thông báo yêu cầu liên hệ Admin để giải quyết.
          </p>
        </div>
      </div>
    </div>
  );
}