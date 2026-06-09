import { api, tokenStore } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export type Violation = {
  id: number;
  user: {
    accountId: number;
    email: string;
    fullName: string;
    roleName: string;
    status: string;
  };
  violationType: string;
  fineAmount: number;
  description?: string;
  status: 'PAID' | 'UNPAID';
  createdAt: string;
  paidAt: string | null;
};

export const violationsApi = {
  myViolations: () => api<Violation[]>('/api/violations/my-history', { method: 'GET' }),
  allViolations: () => api<Violation[]>('/api/violations', { method: 'GET' }),

  pay: async (id: number) => {
    const res = await fetch(`${API_URL}/api/violations/${id}/pay`, {
      method: 'POST',
      headers: authHdr(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi thanh toán');
    return res.json() as Promise<Violation>;
  },
};
