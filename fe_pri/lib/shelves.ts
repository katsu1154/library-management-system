import { api, tokenStore } from './api';
import type { ShelfLocation } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export type ShelfRequestData = {
  name: string;
  location: string;
  description: string;
  maxCapacity: number;
};

export const shelvesApi = {
  list: () => api<ShelfLocation[]>('/api/shelves', { method: 'GET' }),

  create: async (data: ShelfRequestData) => {
    const res = await fetch(`${API_URL}/api/shelves`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi tạo kệ');
    return res.json() as Promise<ShelfLocation>;
  },

  update: async (id: number, data: ShelfRequestData) => {
    const res = await fetch(`${API_URL}/api/shelves/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi cập nhật');
    return res.json() as Promise<ShelfLocation>;
  },

  remove: async (id: number) => {
    const res = await fetch(`${API_URL}/api/shelves/${id}`, {
      method: 'DELETE',
      headers: authHdr(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi xóa');
    return res.text();
  },
};