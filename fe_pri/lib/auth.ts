import { api, tokenStore } from './api';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  ResetPasswordRequest,
  SocialLoginRequest,
  UserProfile,
  VerifyOtpRequest,
} from './types';


export const authApi = {
  login: (email: string, password: string) =>
    api<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password } satisfies LoginRequest,
      auth: false,
    }),

  register: (payload: RegisterRequest) =>
    api<string>('/api/auth/register', {
      method: 'POST',
      body: payload,
      auth: false,
    }),

  verifyAccount: (email: string, otpCode: string) =>
    api<string>('/api/auth/verify-account', {
      method: 'POST',
      body: { email, otpCode } satisfies VerifyOtpRequest,
      auth: false,
    }),

  forgotPassword: (email: string) =>
    api<string>(
      `/api/auth/forgot-password?email=${encodeURIComponent(email)}`,
      { method: 'POST', auth: false }
    ),

  resetPassword: (payload: ResetPasswordRequest) =>
    api<string>('/api/auth/reset-password', {
      method: 'POST',
      body: payload,
      auth: false,
    }),

  socialLogin: (payload: SocialLoginRequest) =>
    api<LoginResponse>('/api/auth/social-login', {
      method: 'POST',
      body: payload,
      auth: false,
    }),

  logout: () => {
    tokenStore.clear();
  },
};

export const profileApi = {
  me: () => api<UserProfile>('/api/users/me', { method: 'GET' }),

  updateProfile: async (data: { fullName?: string; phoneNumber?: string; identityNumber?: string; avatar?: File }) => {
    const formData = new FormData();
    if (data.fullName) formData.append('fullName', data.fullName);
    if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
    if (data.identityNumber) formData.append('identityNumber', data.identityNumber);
    if (data.avatar) formData.append('avatar', data.avatar);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/users/me`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${tokenStore.get()}` },
      body: formData,
    });
    if (!res.ok) throw new Error((await res.text()) || 'Lỗi cập nhật hồ sơ');
    return res.json();
  },

  changePassword: (data: { oldPassword: string; newPassword: string }) =>
    api('/api/users/me/password', {
      method: 'PUT',
      body: data,
    }),
};