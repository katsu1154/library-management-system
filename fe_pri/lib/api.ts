const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const TOKEN_KEY = 'lms_token';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

export const tokenStore = {
  get: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  set: (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  },
  clear: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
  },
};

type ApiOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

export async function api<T = unknown>(
  path: string,
  opts: ApiOptions = {}
): Promise<T> {
  const { body, auth = true, headers, ...rest } = opts;

  const finalHeaders = new Headers(headers);
  finalHeaders.set('Accept', 'application/json');
  if (body !== undefined) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const token = tokenStore.get();
    if (token) finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && typeof window !== 'undefined') {
    tokenStore.clear();
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
  }

  const text = await response.text();
  const data: unknown = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message = extractErrorMessage(data, text, response.status);
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

function safeJsonParse(text: string): unknown {
  try { return JSON.parse(text); }
  catch { return text; }
}

function extractErrorMessage(data: unknown, rawText: string, status: number): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const m = (data as { message: unknown }).message;
    if (m) return String(m);
  }
  if (typeof data === 'string' && data.length > 0 && data !== 'null') return data;
  if (rawText.length > 0 && rawText !== 'null') return rawText;
  if (status === 400) return 'Yêu cầu không hợp lệ';
  if (status === 401) return 'Phiên đăng nhập hết hạn';
  if (status === 403) return 'Bạn không có quyền truy cập';
  if (status === 404) return 'Không tìm thấy';
  if (status >= 500) return 'Máy chủ đang gặp sự cố';
  return `HTTP ${status}`;
}