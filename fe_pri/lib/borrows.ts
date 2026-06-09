import { api, tokenStore } from './api';
import type { BorrowTicket } from './types';

export type BorrowViolation = {
  id: number;
  violationType: string;
  fineAmount: number;
  description: string;
  status: string;
  createdAt: string;
  paidAt?: string | null;
};

export type BorrowTransaction = {
  id: number;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
};

export type BorrowDetailResponse = {
  ticket: BorrowTicket;
  violations: BorrowViolation[];
  transactions: BorrowTransaction[];
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export type { BorrowTicket };

export const getBorrowDisplayInfo = (ticket: BorrowTicket) => ({
  readerName: ticket.user?.fullName ?? '',
  loginName: ticket.user?.email ?? '',
  bookTitle: ticket.bookCopy?.book?.title ?? '',
  copyCode: ticket.bookCopy?.copyCode ?? '',
  borrowCode: ticket.borrowCode,
});

export const borrowsApi = {
  list: () => api<BorrowTicket[]>('/api/borrow/all', { method: 'GET' }),

  getDetail: async (ticketId: number) => {
    const res = await fetch(`${API_URL}/api/borrow/${ticketId}/detail`, {
      headers: authHdr(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi tải chi tiết');
    return res.json() as Promise<BorrowDetailResponse>;
  },

  findActiveByBorrowCode: async (borrowCode: string): Promise<BorrowTicket | null> => {
    const all = await api<BorrowTicket[]>('/api/borrow/all', { method: 'GET' });
    return all.find(
      (r) => r.borrowCode === borrowCode && r.status === 'BORROWED'
    ) || null;
  },


  confirmBorrow: async (borrowCode: string) => {
    const res = await fetch(`${API_URL}/api/borrow/pickup/${borrowCode}`, {
      method: 'POST',
      headers: authHdr(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi xác nhận');
    return res.json() as Promise<BorrowTicket>;
  },

  returnBook: async (borrowCode: string, reportedDamagePercent: number = 0) => {
    const res = await fetch(`${API_URL}/api/borrow/return/${borrowCode}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify({ reportedDamagePercent }),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi trả sách');
    return res.json() as Promise<BorrowTicket>;
  },

  renew: async (ticketId: number, extraDays: number = 3) => {
    const res = await fetch(`${API_URL}/api/borrow/${ticketId}/renew`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify({ extraDays }),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi gia hạn');
    return res.json() as Promise<BorrowTicket>;
  },

  reserve: async (bookId: number) => {
    const res = await fetch(`${API_URL}/api/borrow/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify({ bookId }),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi đặt sách');
    return res.json() as Promise<BorrowTicket>;
  },

  cancel: async (ticketId: number) => {
    const res = await fetch(`${API_URL}/api/borrow/${ticketId}/cancel`, {
      method: 'POST',
      headers: authHdr(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi huỷ đặt chỗ');
    return res.json() as Promise<BorrowTicket>;
  },

  remindOverdue: async (borrowCode: string) => {
    const res = await fetch(`${API_URL}/api/borrow/remind/${borrowCode}`, {
      method: 'POST',
      headers: authHdr(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi gửi nhắc nhở');
    return res.json();
  },
};

export const readerBorrowsApi = {
  myBorrows: () => api<BorrowTicket[]>('/api/borrow/my-tickets', { method: 'GET' }),

  reserve: async (bookId: number) => {
    const res = await fetch(`${API_URL}/api/borrow/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify({ bookId }),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi đặt sách');
    return res.json() as Promise<BorrowTicket>;
  },
};