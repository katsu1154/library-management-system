import { api, tokenStore } from './api';
import type { Author } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export const authorsApi = {
  list: () => api<Author[]>('/api/authors', { method: 'GET', auth: false }),

  create: async (data: { fullName: string; nationality: string; biography: string }) => {
    const res = await fetch(`${API_URL}/api/authors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi tạo tác giả');
    return res.json() as Promise<Author>;
  },

  update: async (id: number, data: AuthorRequestData) => {
    const res = await fetch(`${API_URL}/api/authors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi cập nhật');
    return res.json() as Promise<Author>;
  },

  remove: async (id: number) => {
    const res = await fetch(`${API_URL}/api/authors/${id}`, {
      method: 'DELETE',
      headers: authHdr(),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi xóa');
    return res.text();
  },
};