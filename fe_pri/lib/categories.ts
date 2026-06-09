import { api, tokenStore } from './api';
import type { Category } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export const categoriesApi = {
  list: () => api<Category[]>('/api/categories', { method: 'GET', auth: false }),

  create: async (data: { name: string; description: string; parentId?: number | null }) => {
    const res = await fetch(`${API_URL}/api/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi tạo thể loại');
    return res.json() as Promise<Category>;
  },

  update: async (id: number, data: { name: string; description: string; parentId?: number | null }) => {
    const res = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi cập nhật');
    return res.json() as Promise<Category>;
  },

  remove: async (id: number) => {
    const res = await fetch(`${API_URL}/api/categories/${id}`, {
      method: 'DELETE',
      headers: authHdr(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi xóa');
    return res.text();
  },
};