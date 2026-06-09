import { api, tokenStore } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export type StockItem = {
  bookId: number;        
  title: string;           
  isbn?: string;
  availableQuantity: number; 
  status: 'WARNING_LOW_STOCK' | 'SAFE';
  bookTitleId?: number;
  bookTitleName?: string;
  availableCopies?: number;
};

export type StockReport = {
  totalBooks: number;
  totalCopies: number;
  lowStockCount: number;
  items: StockItem[];
};

export type ImportTicket = {
  id: number;
  warehouseManager: { id: number; fullName: string; email: string };
  accountant?: { id: number; fullName: string; email: string };
  totalCost: number;
  importDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string;
  rejectReason?: string;
  invoiceNumber?: string;
  details: Array<{
    id?: number;
    book: { id: number; title: string; isbn?: string };
    quantity: number;
    unitPrice: number;
  }>;
};

export type InventoryCheckTicket = {
  id: number;
  warehouseManager: { id: number; fullName: string };
  checkDate: string;
  note?: string;
  details: Array<{
    id?: number;
    book: { id: number; title: string };
    systemQuantity: number;
    actualQuantity: number;
    difference: number;
    note?: string;
  }>;
};

const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

const post = async <T>(url: string, body: any): Promise<T> => {
  const res = await fetch(`${API_URL}${url}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHdr() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.text()) || 'Lỗi xử lý');
  return res.json();
};

export const inventoryApi = {
  createImportTicket: (data: Array<{ bookId: number; quantity: number; unitPrice: number }>, note?: string) => {
    const url = note ? `/api/warehouse/import?note=${encodeURIComponent(note)}` : '/api/warehouse/import';
    return post<ImportTicket>(url, data);
  },

  listImportTickets: () =>
    api<ImportTicket[]>('/api/warehouse/import', { method: 'GET' }),

  approveImportTicket: async (id: number, data: { actualCost?: number; invoiceNumber?: string }) => {
    const res = await fetch(`${API_URL}/api/warehouse/import/${id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi duyệt');
    return res.json() as Promise<ImportTicket>;
  },

  rejectImportTicket: async (id: number, reason?: string) => {
    const res = await fetch(`${API_URL}/api/warehouse/import/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify({ reason: reason ?? '' }),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi từ chối');
    return res.json() as Promise<ImportTicket>;
  },

  createInventoryCheck: (
    items: Array<{ bookId: number; actualQuantity: number; note?: string }>,
    note?: string
  ) => post<InventoryCheckTicket>('/api/warehouse/inventory-check', items),

  listInventoryChecks: () =>
    api<InventoryCheckTicket[]>('/api/warehouse/inventory-check', { method: 'GET' }),

  stock: async (): Promise<StockItem[]> => {
    const data = await api<StockItem[]>('/api/warehouse/report/low-stock', { method: 'GET' });
    return data.map(d => ({
      ...d,
      bookTitleId: d.bookId,
      bookTitleName: d.title,
      availableCopies: d.availableQuantity,
    }));
  },

  report: async (): Promise<StockReport> => {
    const items = await inventoryApi.stock();
    return {
      totalBooks: items.length,
      totalCopies: items.reduce((sum, item) => sum + (item.availableQuantity ?? 0), 0),
      lowStockCount: items.filter(i => i.status === 'WARNING_LOW_STOCK').length,
      items,
    };
  },

  importStock: (data: any, note?: string) => inventoryApi.createImportTicket(data, note),
  listPurchaseRequests: () => inventoryApi.listImportTickets(),
  approvePurchaseRequest: (id: number, data: { actualCost: number; invoiceNumber?: string }) =>
    inventoryApi.approveImportTicket(id, data),
  rejectPurchaseRequest: (id: number, reason?: string) => inventoryApi.rejectImportTicket(id, reason),
};