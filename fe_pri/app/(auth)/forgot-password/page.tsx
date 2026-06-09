'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  KeyRound,
  Mail,
  AlertCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { authApi } from '@/lib/auth';
import { ApiError } from '@/lib/api';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({ email: '', form: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    const newErrors = { email: '', form: '' };
    if (!email.trim()) newErrors.email = 'Vui lòng nhập email!';
    else if (!EMAIL_REGEX.test(email.trim()))
      newErrors.email = 'Email không hợp lệ';

    setErrors(newErrors);
    if (newErrors.email) return;

    setIsLoading(true);
    try {
      await authApi.forgotPassword(email.trim());
      router.push(
        `/reset-password?email=${encodeURIComponent(email.trim())}`
      );
    } catch (e) {
      let msg = 'Không gửi được mã. Vui lòng thử lại.';
      if (e instanceof ApiError) {
        if (e.status === 404) {
          msg = 'Email này chưa được đăng ký trong hệ thống';
        } else if (e.message) {
          msg = e.message;
        }
      }
      setErrors({ ...newErrors, form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) handleSubmit();
  };

  return (
    <div onKeyDown={onKeyDown}>
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">
          <KeyRound size={28} strokeWidth={2} />
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Quên mật khẩu
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm leading-relaxed">
          Nhập email của bạn để nhận mã khôi phục mật khẩu
          <br />
          từ hệ thống thư viện
        </p>
      </div>

      {errors.form && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 tracking-wide">
            THÔNG TIN KHÔI PHỤC
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              disabled={isLoading}
              autoComplete="email"
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

        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Đang gửi...
            </>
          ) : (
            'Gửi mã xác nhận'
          )}
        </button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </Link>
      </div>
    </div>
  );
}