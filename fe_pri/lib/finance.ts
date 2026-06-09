import { api } from './api';

export type FinanceTransactionItem = {
  date: string;        
  description: string;
  type: 'INCOME' | 'EXPENSE';
  amount: number;
};

export type FinanceReport = {
  totalIncome: number;
  totalExpense: number;
  profit: number;      
  transactions: FinanceTransactionItem[];
};

export type FineHistoryItem = {
  id: number;
  user: {
    id: number;
    fullName: string;
    identityNumber: string;
    email: string;
  };
  violationType: string;
  fineAmount: number;
  description: string;
  status: string;
  createdAt: string;
  paidAt?: string;
  borrowTicketId?: number;
};

export const financeApi = {
  fineHistory: () => api<FineHistoryItem[]>('/api/violations', { method: 'GET' }),

  depositHistory: () => api<any[]>('/api/finance/deposits', { method: 'GET' }),
  report: () =>
    api<FinanceReport>(`/api/finance/report`, { method: 'GET' }),

  deposit: (data: { userId: number; amount: number; note: string }) =>
    api('/api/finance/deposit', {
      method: 'POST',
      body: data,
    }),

  searchUser: (phone: string) =>
    api<any>(`/api/finance/search-user?phone=${encodeURIComponent(phone)}`, { method: 'GET' }),
};