import { api, tokenStore } from './api';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export type Notification = {
  id: number;
  title: string;
  message: string;
  read: boolean;      
  createdAt: string;

  senderName?: string;
  targetType?: string;
};

export type MyNotification = Notification;

export type SendNotificationRequest = {
  targetType: 'ALL' | 'INTERNAL' | 'EXTERNAL' | 'STAFF' | 'ROLE' | 'USER';
  targetId?: string;  
  title: string;
  message: string;
};

export const notificationsApi = {
  myList: () => api<Notification[]>('/api/notifications/my', { method: 'GET' }),
  list: () => api<Notification[]>('/api/notifications/my', { method: 'GET' }),

  create: async (data: SendNotificationRequest | { title: string; content: string; targetType: string }) => {
    const payload: Record<string, string | undefined> = {
      title: data.title,
      targetType: data.targetType,
    };

    if ('message' in data) {
      payload.message = data.message;
    } else if ('content' in data) {
      payload.message = (data as { content: string }).content;
    }

    if ('targetId' in data && (data as SendNotificationRequest).targetId) {
      payload.targetId = (data as SendNotificationRequest).targetId;
    }

    const res = await fetch(`${API_URL}/api/notifications/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi');
    return res.json();
  },

  unreadCount: () => api<number>('/api/notifications/unread-count', { method: 'GET' }),

  markAsRead: (id: number) => api<any>(`/api/notifications/${id}/read`, { method: 'PUT' }),

  markAllAsRead: async () => {
    return Promise.resolve();
  },
};
