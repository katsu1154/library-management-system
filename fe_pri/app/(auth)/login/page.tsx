'use client';
import { useState, useEffect, } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGoogleLogin } from '@react-oauth/google';
import { getMsalInstance, loginRequest, isInteractionInProgressError } from '@/lib/msal';
import {
  BookOpen,
  User,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ApiError } from '@/lib/api';

let _redirectProcessed = false;

export default function LoginPage() {
  const router = useRouter();
  const { login, socialLogin } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({ email: '', password: '', form: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  const handleSubmit = async () => {
    const newErrors = { email: '', password: '', form: '' };
    if (!formData.email.trim()) newErrors.email = 'Vui lòng nhập email đăng nhập!';
    if (!formData.password) newErrors.password = 'Vui lòng nhập mật khẩu!';
    setErrors(newErrors);
    if (newErrors.email || newErrors.password) return;

    setIsLoading(true);
    try {
      await login(formData.email.trim(), formData.password);
      router.push('/');
    } catch (e) {
      let msg = 'Không kết nối được máy chủ. Vui lòng thử lại.';
      if (e instanceof ApiError) {
        msg =
          e.status === 401 || e.status === 400 || e.status === 403
            ? 'Sai tên đăng nhập hoặc mật khẩu!'
            : e.message;
      }
      setErrors({ ...newErrors, form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setErrors({ email: '', password: '', form: '' });
      try {
        await socialLogin('GOOGLE', tokenResponse.access_token);
        router.push('/');
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : 'Đăng nhập Google thất bại';
        setErrors((p) => ({ ...p, form: msg }));
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setErrors((p) => ({ ...p, form: 'Đăng nhập Google bị hủy hoặc thất bại' }));
      setIsGoogleLoading(false);
    },
  });
  const handleMicrosoftLogin = async () => {
  setIsMicrosoftLoading(true);
  setErrors({ email: '', password: '', form: '' });
  try {
    const msal = await getMsalInstance();
    await msal.loginRedirect(loginRequest);
  } catch (e) {
    setIsMicrosoftLoading(false);
    let msg = 'Không khởi động được đăng nhập Microsoft';
    if (e instanceof Error) msg = e.message;
    setErrors((p) => ({ ...p, form: msg }));
  }
};
useEffect(() => {
  if (_redirectProcessed) return;
  _redirectProcessed = true;

  let cancelled = false;
  (async () => {
    try {
      const msal = await getMsalInstance();
      const response = await msal.handleRedirectPromise();
      if (cancelled) return;

      if (response?.accessToken) {
        setIsMicrosoftLoading(true);
        try {
          await socialLogin('OFFICE365', response.accessToken);
          if (!cancelled) router.push('/');
        } catch (e) {
          if (cancelled) return;
          setIsMicrosoftLoading(false);
          let msg = 'Đăng nhập Microsoft thất bại';
          if (e instanceof ApiError) msg = e.message || msg;
          setErrors((p) => ({ ...p, form: msg }));
        }
      }
    } catch (e) {
      if (cancelled) return;
      console.error('[MSAL]', e);
      setIsMicrosoftLoading(false);
      const msg = e instanceof Error ? e.message : 'Lỗi xử lý đăng nhập Microsoft';
      setErrors((p) => ({ ...p, form: msg }));
    }
  })();

  return () => {
    cancelled = true;
  };
}, []);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isGoogleLoading) handleSubmit();
  };

  const anyLoading = isLoading || isGoogleLoading || isMicrosoftLoading;

  return (
    <div onKeyDown={onKeyDown}>
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
          <BookOpen size={28} strokeWidth={2} />
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Hệ thống Thư viện
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm">
          Vui lòng đăng nhập để truy cập tài khoản của bạn
        </p>
      </div>

      {errors.form && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
            Email đăng nhập
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              disabled={anyLoading}
              autoComplete="username"
              className={`w-full pl-10 pr-4 py-3 border rounded-xl outline-none transition-all text-sm placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed
                ${errors.email
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}`}
            />
          </div>
          {errors.email && (
            <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium flex items-center gap-1">
              <AlertCircle size={14} /> {errors.email}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5 ml-1">
            Mật khẩu
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              disabled={anyLoading}
              autoComplete="current-password"
              className={`w-full pl-10 pr-11 py-3 border rounded-xl outline-none transition-all text-sm placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed
                ${errors.password
                  ? 'border-red-400 bg-red-50'
                  : 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium flex items-center gap-1">
              <AlertCircle size={14} /> {errors.password}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSubmit}
            disabled={anyLoading}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
          <Link
            href="/signup"
            className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl text-center hover:bg-gray-50 transition-all active:scale-[0.98]"
          >
            Đăng ký ngay
          </Link>
        </div>

        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-gray-400 font-medium tracking-wider">
              Hoặc tiếp tục với
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-5">
          <button
            type="button"
            onClick={() => triggerGoogleLogin()}
            disabled={anyLoading}
            title="Đăng nhập với Google"
            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full bg-white hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isGoogleLoading ? (
              <Loader2 size={18} className="animate-spin text-gray-500" />
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={anyLoading}
            title="Đăng nhập với Microsoft"
            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-full bg-white hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
            {isMicrosoftLoading ? (
                <Loader2 size={18} className="animate-spin text-gray-500" />
            ) : (
                <svg width="20" height="20" viewBox="0 0 23 23" fill="none">
                <path d="M11 0H0V11H11V0Z" fill="#F25022" />
                <path d="M23 0H12V11H23V0Z" fill="#7FBA00" />
                <path d="M11 12H0V23H11V12Z" fill="#00A4EF" />
                <path d="M23 12H12V23H23V12Z" fill="#FFB900" />
                </svg>
            )}
           </button>
        </div>
      </div>
    </div>
  );
}