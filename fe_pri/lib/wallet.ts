import { tokenStore } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${tokenStore.get()}`,
});

export const walletApi = {
  getMyWallet: async () => {
    const res = await fetch(`${API_URL}/api/wallets/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể lấy thông tin ví');
    return res.json();
  },

  getMyTransactions: async () => {
    const res = await fetch(`${API_URL}/api/wallets/me/transactions`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Không thể lấy lịch sử giao dịch');
    return res.json();
  },

  createVNPayPayment: async (amount: number): Promise<{ paymentUrl: string }> => {
    const res = await fetch(`${API_URL}/api/vnpay/create-payment?amount=${amount}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Không thể tạo thanh toán VNPay');
    }
    return res.json();
  },

  withdraw: async (amount: number, description: string) => {
    const res = await fetch(`${API_URL}/api/wallets/me/withdraw`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount, description }),
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || 'Lỗi yêu cầu rút tiền');
    }
    return res.json();
  },
};
