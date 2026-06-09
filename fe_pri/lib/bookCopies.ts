import { api, tokenStore } from './api';
import type { BookCopy } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export type BookCopyRequestData = {
  copyCode: string;
  status: string;
  bookTitleId: number;
  shelfLocationId: number;
};

export const bookCopiesApi = {
  list: () => api<BookCopy[]>('/api/book-copies', { method: 'GET' }),

  create: async (data: BookCopyRequestData) => {
    const res = await fetch(`${API_URL}/api/book-copies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi tạo bản sao');
    return res.json() as Promise<BookCopy>;
  },

  update: async (id: number, data: BookCopyRequestData) => {
    const res = await fetch(`${API_URL}/api/book-copies/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi cập nhật');
    return res.json() as Promise<BookCopy>;
  },

  remove: async (id: number) => {
    const res = await fetch(`${API_URL}/api/book-copies/${id}`, {
      method: 'DELETE',
      headers: authHdr(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi xóa');
    return res.text();
  },
};