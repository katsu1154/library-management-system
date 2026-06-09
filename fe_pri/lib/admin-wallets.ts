import { api, tokenStore } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export type WalletAdminView = {
  walletId: number;
  accountId: number;
  loginName: string;
  fullName: string;
  balance: number;
  status: string;
};

export type WalletTransaction = {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
};

export const adminWalletsApi = {
  getAll: () => api<WalletAdminView[]>('/api/admin/wallets', { method: 'GET' }),

  getTransactions: (walletId: number) =>
    api<WalletTransaction[]>(`/api/admin/wallets/${walletId}/transactions`, { method: 'GET' }),

  toggleStatus: async (walletId: number, status: 'ACTIVE' | 'LOCKED') => {
    const res = await fetch(`${API_URL}/api/admin/wallets/${walletId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi cập nhật');
    return res.json();
  },
};