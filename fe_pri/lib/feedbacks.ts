import { api, tokenStore } from './api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const authHdr = () => ({ Authorization: `Bearer ${tokenStore.get()}` });

export type FeedbackType = 'BOOK_DAMAGE' | 'BOOK_REQUEST' | 'SERVICE_FEEDBACK' | 'OTHER';
export type FeedbackStatus = 'PENDING' | 'PROCESSING' | 'RESOLVED' | 'REJECTED' | 'RESPONDED';

export type Feedback = {
  id: number;
  user?: {
    id: number;
    email: string;
    fullName: string;
  };
  senderLoginName?: string;
  senderName?: string;
  type: string;
  content: string;
  attachmentUrl: string | null;
  status: FeedbackStatus;
  response: string | null;
  adminResponse?: string | null; 
  responder?: {
    id: number;
    email: string;
    fullName: string;
  };
  createdAt: string;
  respondedAt: string | null;
  resolvedAt?: string | null; 
};

export const TYPE_LABELS: Record<string, string> = {
  BOOK_DAMAGE: 'Báo cáo sách hỏng/rách',
  BOOK_REQUEST: 'Đề xuất mua sách mới',
  SERVICE_FEEDBACK: 'Góp ý thái độ phục vụ',
  OTHER: 'Khác',
};

export const STATUS_LABELS: Record<FeedbackStatus, string> = {
  PENDING: 'Chưa xử lý',
  PROCESSING: 'Đang xử lý',
  RESOLVED: 'Đã giải quyết',
  REJECTED: 'Từ chối',
  RESPONDED: 'Đã phản hồi',
};

export const getFeedbackSenderName = (fb: Feedback): string => {
  return fb.user?.fullName ?? fb.senderName ?? 'Ẩn danh';
};

export const getFeedbackSenderEmail = (fb: Feedback): string => {
  return fb.user?.email ?? fb.senderLoginName ?? '';
};

export const getFeedbackResponse = (fb: Feedback): string | null => {
  return fb.response ?? fb.adminResponse ?? null;
};

export const feedbacksApi = {
  myFeedbacks: () => api<Feedback[]>('/api/feedbacks/my', { method: 'GET' }),
  allFeedbacks: () => api<Feedback[]>('/api/feedbacks', { method: 'GET' }),

  create: async (data: { type: string; content: string; attachment?: File }) => {
    const fd = new FormData();
    fd.append('type', data.type);
    fd.append('content', data.content);
    if (data.attachment) fd.append('attachment', data.attachment);

    const res = await fetch(`${API_URL}/api/feedbacks`, {
      method: 'POST',
      headers: authHdr(),
      body: fd,
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi gửi phản ánh');
    return res.json() as Promise<Feedback>;
  },

  process: async (id: number, data: { status?: FeedbackStatus; adminResponse?: string }) => {
    const res = await fetch(`${API_URL}/api/feedbacks/${id}/respond`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHdr() },
      body: JSON.stringify({
        response: data.adminResponse,   
        status: data.status,
      }),
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi xử lý');
    return res.json() as Promise<Feedback>;
  },
};