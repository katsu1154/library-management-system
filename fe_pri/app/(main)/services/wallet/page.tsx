'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { walletApi } from '@/lib/wallet';
import {
  Wallet, ArrowUpRight, ArrowDownLeft, CheckCircle2, XCircle,
  PlusCircle, MinusCircle, RefreshCw, Building2, Loader2, AlertCircle,
} from 'lucide-react';

type WalletData = { walletId: number; balance: number; status: string; };
type Transaction = {
  id: number; amount: number; type: string;
  description: string; createdAt: string;
};

const POPULAR_BANKS = ['Vietcombank', 'BIDV', 'VietinBank', 'Agribank', 'Techcombank', 'MB Bank', 'VPBank', 'TPBank', 'ACB', 'Sacombank', 'SHB', 'HDBank', 'OCB', 'MSB'];

function WalletPageInner() {
  const searchParams = useSearchParams();
  const paymentStatus = searchParams.get('payment');
  const paymentAmount = searchParams.get('amount');

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [dAmount, setDAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState('');

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [wAmount, setWAmount] = useState('');
  const [wBankName, setWBankName] = useState('');
  const [wAccountNumber, setWAccountNumber] = useState('');
  const [wAccountHolder, setWAccountHolder] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [walletRes, txRes] = await Promise.all([
        walletApi.getMyWallet(),
        walletApi.getMyTransactions(),
      ]);
      setWallet(walletRes);
      setTransactions(txRes);
    } catch (error: any) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadWalletData(); }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

  // ============ VNPay Deposit ============
  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError('');
    const amt = Number(dAmount);
    if (amt < 10000) {
      setDepositError('Số tiền tối thiểu là 10.000đ');
      return;
    }
    setDepositLoading(true);
    try {
      const { paymentUrl } = await walletApi.createVNPayPayment(amt);
      window.location.href = paymentUrl;
    } catch (error: any) {
      setDepositError(error.message || 'Không thể tạo thanh toán');
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError('');
    setWithdrawLoading(true);
    try {
      const description = `${wBankName.trim()} - STK: ${wAccountNumber.trim()} - ${wAccountHolder.trim().toUpperCase()}`;
      await walletApi.withdraw(Number(wAmount), description);
      alert('Rút tiền thành công! Tiền đã được trừ khỏi ví.');
      setIsWithdrawOpen(false);
      setWAmount(''); setWBankName(''); setWAccountNumber(''); setWAccountHolder('');
      loadWalletData();
    } catch (error: any) {
      setWithdrawError(error.message || 'Lỗi rút tiền');
    } finally {
      setWithdrawLoading(false);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'DEPOSIT': case 'REFUND':
        return { color: 'text-green-600', bg: 'bg-green-100', icon: <ArrowDownLeft size={16} />, sign: '+' };
      case 'WITHDRAWAL': case 'HOLD': case 'FINE': case 'PENALTY':
        return { color: 'text-red-600', bg: 'bg-red-100', icon: <ArrowUpRight size={16} />, sign: '-' };
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', icon: <Wallet size={16} />, sign: '' };
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin text-red-500" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Wallet className="text-red-600" /> Quản lý ví điện tử
      </h1>

      {paymentStatus === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <CheckCircle2 className="text-green-600 shrink-0" size={22} />
          <div>
            <p className="font-bold text-green-800">Nạp tiền thành công!</p>
            {paymentAmount && (
              <p className="text-sm text-green-700">Đã cộng <strong>{formatCurrency(Number(paymentAmount))}</strong> vào ví của bạn.</p>
            )}
          </div>
        </div>
      )}
      {(paymentStatus === 'failed' || paymentStatus === 'error') && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center gap-3">
          <XCircle className="text-red-600 shrink-0" size={22} />
          <div>
            <p className="font-bold text-red-800">Thanh toán không thành công.</p>
            <p className="text-sm text-red-700">Vui lòng thử lại hoặc liên hệ thư viện nếu tiền đã bị trừ.</p>
          </div>
        </div>
      )}

      <div className="bg-linear-to-r from-red-600 to-red-800 rounded-2xl shadow-xl p-6 text-white mb-8">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-red-100 font-medium mb-1">Số dư khả dụng</p>
            <h2 className="text-4xl font-bold tracking-tight">
              {wallet ? formatCurrency(wallet.balance) : '0 ₫'}
            </h2>
            <p className="mt-2 text-sm text-red-200">
              Trạng thái: <span className="font-semibold">Hoạt động</span>
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="bg-white text-red-600 hover:bg-red-50 px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
              <PlusCircle size={18} /> Nạp tiền
            </button>
            <button
              onClick={() => setIsWithdrawOpen(true)}
              className="bg-red-700 text-white border border-red-500 hover:bg-red-600 px-5 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
              <MinusCircle size={18} /> Rút tiền
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Lịch sử biến động</h3>
        </div>
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có giao dịch nào.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => {
              const style = getTypeStyle(tx.type);
              const absAmount = Math.abs(tx.amount);
              return (
                <div key={tx.id} className="p-4 sm:px-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${style.bg} ${style.color}`}>{style.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-800">{tx.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${style.color}`}>
                      {style.sign}{formatCurrency(absAmount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isDepositOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-[#005baa] p-4 text-white flex items-center gap-3">
              <img src="https://sandbox.vnpayment.vn/paymentv2/images/vnpay_v2.svg" alt="VNPay" className="h-7 bg-white rounded px-1" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <h3 className="font-bold text-lg">Nạp tiền qua VNPay</h3>
            </div>
            <form onSubmit={handleDeposit} className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-900">
                Bạn sẽ được chuyển đến cổng thanh toán VNPay (môi trường sandbox). Sau khi thanh toán thành công, số dư ví sẽ được cộng ngay lập tức.
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Số tiền nạp (VNĐ) *</label>
                <input
                  type="number"
                  min="10000"
                  step="1000"
                  required
                  value={dAmount}
                  onChange={(e) => setDAmount(e.target.value)}
                  placeholder="Tối thiểu 10.000đ"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {[50000, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDAmount(String(amt))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${dAmount === String(amt) ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:border-blue-400'}`}
                  >
                    {(amt / 1000).toFixed(0)}K
                  </button>
                ))}
              </div>
              {depositError && (
                <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm flex items-center gap-2">
                  <AlertCircle size={14} /> {depositError}
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setIsDepositOpen(false); setDepositError(''); setDAmount(''); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm">Hủy</button>
                <button type="submit" disabled={depositLoading}
                  className="px-4 py-2 bg-[#005baa] hover:bg-[#004a8f] text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-2 text-sm">
                  {depositLoading ? <Loader2 size={14} className="animate-spin" /> : null}
                  {depositLoading ? 'Đang chuyển hướng...' : 'Thanh toán qua VNPay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isWithdrawOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gray-800 p-4 text-white flex items-center gap-2">
              <Building2 size={20} />
              <h3 className="font-bold text-lg">Rút tiền về ngân hàng</h3>
            </div>
            <form onSubmit={handleWithdraw} className="p-6 space-y-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-xs text-green-900">
                Tiền sẽ được trừ khỏi ví ngay lập tức. Vui lòng đảm bảo thông tin tài khoản chính xác.
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Số tiền rút (Số dư: <span className="text-red-600">{wallet ? formatCurrency(wallet.balance) : '0₫'}</span>) *
                </label>
                <input type="number" min="50000" max={wallet?.balance || 0} required
                  value={wAmount} onChange={(e) => setWAmount(e.target.value)}
                  placeholder="Tối thiểu 50.000đ"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-800 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên ngân hàng *</label>
                <input list="bank-list" required value={wBankName} onChange={(e) => setWBankName(e.target.value)}
                  placeholder="Chọn hoặc nhập ngân hàng..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-800 outline-none text-sm" />
                <datalist id="bank-list">
                  {POPULAR_BANKS.map((b) => <option key={b} value={b} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Số tài khoản *</label>
                <input type="text" required value={wAccountNumber} onChange={(e) => setWAccountNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-800 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tên chủ tài khoản (KHÔNG DẤU) *</label>
                <input type="text" required value={wAccountHolder}
                  onChange={(e) => setWAccountHolder(e.target.value.toUpperCase())}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-800 outline-none text-sm" />
              </div>
              {withdrawError && (
                <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm flex items-center gap-2">
                  <AlertCircle size={14} /> {withdrawError}
                </div>
              )}
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setIsWithdrawOpen(false); setWithdrawError(''); }}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm">Hủy</button>
                <button type="submit" disabled={withdrawLoading}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-bold disabled:opacity-50 flex items-center gap-2 text-sm">
                  {withdrawLoading && <Loader2 size={14} className="animate-spin" />}
                  {withdrawLoading ? 'Đang xử lý...' : 'Xác nhận rút tiền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WalletPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><RefreshCw className="animate-spin text-red-500" size={32} /></div>}>
      <WalletPageInner />
    </Suspense>
  );
}
