import { api, tokenStore } from './api';
import type { Publisher } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export const publishersApi = {
  list: () => api<Publisher[]>('/api/publishers', { method: 'GET', auth: false }),

  create: async (data: { fullName: string; address: string; contact: string }) => {
    const res = await fetch(`${API_URL}/api/publishers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi tạo NXB');
    return res.json() as Promise<Publisher>;
  },

  update: async (id: number, data:  { fullName: string; address: string; contact: string }) => {
    const res = await fetch(`${API_URL}/api/publishers/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi cập nhật');
    return res.json() as Promise<Publisher>;
  },

  remove: async (id: number) => {
    const res = await fetch(`${API_URL}/api/publishers/${id}`, {
      method: 'DELETE',
      headers: authHdr(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi xóa');
    return res.text();
  },
};