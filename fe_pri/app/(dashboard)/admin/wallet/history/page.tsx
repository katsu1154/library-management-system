'use client';
import { useState } from 'react';
import { adminWalletsApi, type WalletTransaction } from '@/lib/admin-wallets';
import { Search, Loader2 } from 'lucide-react';

const formatMoney = (n: number) => n.toLocaleString('vi-VN') + 'đ';
const formatDateTime = (iso: string) => new Date(iso).toLocaleString('vi-VN');
const formatTxId = (id: number) => `TXN-${String(id).padStart(4, '0')}`;
const PLUS_TYPES = ['DEPOSIT', 'REFUND'];

export default function WalletTransactionsPage() {
  const [loginName, setLoginName] = useState('');
  const [items, setItems] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!loginName.trim()) return setError('Nhập mã độc giả');
    setLoading(true);
    setError('');
    try {
      const all = await adminWalletsApi.getAll();
      const wallet = all.find((w) => w.loginName.toLowerCase() === loginName.trim().toLowerCase());
      if (!wallet) throw new Error('Không tìm thấy ví với mã này');
      setItems(await adminWalletsApi.getTransactions(wallet.walletId));
    } catch (e: any) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold">Lịch sử Biến động Ví</h1>
      <p className="text-sm text-gray-500 mb-6">Theo dõi các giao dịch nạp tiền, trừ tiền phạt, thanh toán phí mượn.</p>

      <div className="bg-white rounded-xl border p-4 mb-6 flex gap-3 items-center">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={loginName} onChange={(e) => setLoginName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm" />
        </div>
        <button onClick={handleSearch} className="bg-[#1e293b] text-white px-6 py-2.5 rounded-lg text-sm font-bold">Tra cứu</button>
      </div>

      {error && <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm mb-4">{error}</div>}

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-gray-500 uppercase border-b">
            <tr>
              <th className="px-6 py-3 font-bold text-left">Mã giao dịch</th>
              <th className="px-6 py-3 font-bold text-left">Thời gian</th>
              <th className="px-6 py-3 font-bold text-left">Nội dung</th>
              <th className="px-6 py-3 font-bold text-right">Biến động</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-10"><Loader2 className="inline animate-spin" /></td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-gray-500">Tra cứu mã độc giả ở trên để xem giao dịch.</td></tr>
            ) : items.map((t) => {
              const isPlus = PLUS_TYPES.includes(t.type);
              return (
                <tr key={t.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">{formatTxId(t.id)}</td>
                  <td className="px-6 py-4 text-gray-600">{formatDateTime(t.createdAt)}</td>
                  <td className="px-6 py-4 text-gray-700">{t.description}</td>
                  <td className={`px-6 py-4 text-right font-bold ${isPlus ? 'text-green-600' : 'text-red-600'}`}>{isPlus ? '+ ' : '- '}{formatMoney(t.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}