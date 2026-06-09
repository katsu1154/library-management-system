'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  KeySquare,
} from 'lucide-react';
import { authApi } from '@/lib/auth';
import { ApiError } from '@/lib/api';

const OTP_LENGTH = 6;

export default function ResetPasswordPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Đang tải...</div>}>
      <ResetPasswordPage />
    </Suspense>
  );
}

function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({ otp: '', password: '', confirmPassword: '', form: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.replace('/forgot-password');
    else inputRefs.current[0]?.focus();
  }, [email, router]);

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setErrors((p) => ({ ...p, otp: '' }));
    if (cleaned && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...digits];
      next[index - 1] = '';
      setDigits(next);
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async () => {
    const otpCode = digits.join('');
    const newErrors = { otp: '', password: '', confirmPassword: '', form: '' };

    if (otpCode.length < OTP_LENGTH) newErrors.otp = 'Vui lòng nhập đủ 6 chữ số';
    if (!password) newErrors.password = 'Vui lòng nhập mật khẩu mới';
    else if (password.length < 6) newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
    if (!confirmPassword) newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    else if (confirmPassword !== password)
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';

    setErrors(newErrors);
    const hasError = Object.entries(newErrors).some(
      ([k, v]) => k !== 'form' && v.length > 0
    );
    if (hasError) return;

    setIsLoading(true);
    try {
      await authApi.resetPassword({
        email,
        otpCode,
        newPassword: password,
      });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (e) {
      let msg = 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.';
      if (e instanceof ApiError) {
        if (e.status === 400 || e.status === 401) {
          msg = 'Mã OTP không đúng hoặc đã hết hạn';
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
    if (e.key === 'Enter' && !isLoading && !success) handleSubmit();
  };

  const maskedEmail = (() => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const visibleLen = Math.max(1, Math.min(3, name.length - 1));
    return `${name.slice(0, visibleLen)}${'*'.repeat(Math.max(0, name.length - visibleLen))}@${domain}`;
  })();

  return (
    <div onKeyDown={onKeyDown}>
      <Link
        href="/forgot-password"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Đổi email khác
      </Link>

      <div className="flex justify-center mb-5">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
            success ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'
          }`}
        >
          {success ? <CheckCircle2 size={28} /> : <KeySquare size={28} />}
        </div>
      </div>

      <div className="text-center mb-7">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {success ? 'Đặt lại thành công' : 'Đặt lại mật khẩu'}
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm leading-relaxed">
          {success ? (
            'Đang chuyển bạn về trang đăng nhập...'
          ) : (
            <>
              Nhập mã OTP đã gửi đến <br />
              <span className="text-indigo-600 font-semibold">{maskedEmail}</span>
              <br /> và mật khẩu mới của bạn.
            </>
          )}
        </p>
      </div>

      {!success && (
        <>
          {errors.form && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{errors.form}</span>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold text-gray-700 mb-2 ml-1 tracking-wide text-center">
              MÃ OTP (6 CHỮ SỐ)
            </label>
            <div className="flex justify-center gap-2">
              {digits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                  onPaste={handlePaste}
                  disabled={isLoading}
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold border-2 rounded-xl outline-none transition-all
                    ${errors.otp
                      ? 'border-red-400 bg-red-50 text-red-600'
                      : digit
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'}
                    disabled:cursor-not-allowed`}
                />
              ))}
            </div>
            {errors.otp && (
              <p className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1 justify-center">
                <AlertCircle size={14} /> {errors.otp}
              </p>
            )}
          </div>

          <div className="space-y-3.5 mt-5">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 tracking-wide">
                MẬT KHẨU MỚI
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                  }}
                  disabled={isLoading}
                  autoComplete="new-password"
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

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 tracking-wide">
                XÁC NHẬN MẬT KHẨU
              </label>
              <div className="relative">
                <ShieldCheck
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((p) => ({ ...p, confirmPassword: '' }));
                  }}
                  disabled={isLoading}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-3 border rounded-xl outline-none transition-all text-sm placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed
                    ${errors.confirmPassword
                      ? 'border-red-400 bg-red-50'
                      : 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((p) => !p)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 p-1"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Đang xử lý...
                </>
              ) : (
                'Đặt lại mật khẩu'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}