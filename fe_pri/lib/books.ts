// src/lib/books.ts
import { api, tokenStore } from './api';
import type { BookTitle, Page } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export type BookSearchParams = {
  keyword?: string;
  categoryId?: number;
  sort?: 'latest' | 'oldest' | 'title-asc';
  page?: number;
  size?: number;
};

export const booksApi = {
 
  list: () =>
    api<BookTitle[]>('/api/books', { method: 'GET', auth: false }),

  getById: (id: number) =>
    api<BookTitle>(`/api/books/${id}`, { method: 'GET', auth: false }),

  search: (params: BookSearchParams = {}) => {
    const qs = new URLSearchParams();
    if (params.keyword) qs.set('keyword', params.keyword);
    if (params.categoryId !== undefined) qs.set('categoryId', String(params.categoryId));
    if (params.sort) qs.set('sort', params.sort);
    if (params.page !== undefined) qs.set('page', String(params.page));
    if (params.size !== undefined) qs.set('size', String(params.size));
    return api<Page<BookTitle>>(
      `/api/books/search?${qs.toString()}`,
      { method: 'GET', auth: false }
    );
  },

  create: async (formData: FormData) => {
    const res = await fetch(`${API_URL}/api/books`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenStore.get()}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Lỗi khi tạo đầu sách');
    }
    return res.json();
  },

  update: async (id: number, formData: FormData) => {
    const res = await fetch(`${API_URL}/api/books/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokenStore.get()}`,
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Lỗi khi cập nhật đầu sách');
    }
    return res.json();
  },

  deleteBook: async (id: number) => {
    const res = await fetch(`${API_URL}/api/books/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenStore.get()}`,
      },
    });
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Lỗi khi xóa đầu sách');
    }
    return res.text();
  }
};