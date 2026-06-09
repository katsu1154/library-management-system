'use client';
import { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  AlertCircle,
  Loader2,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';
import { authApi } from '@/lib/auth';
import { ApiError } from '@/lib/api';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // giây

export default function VerifyOtpPageWrapper() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-gray-400">Đang tải...</div>}>
      <VerifyOtpPage />
    </Suspense>
  );
}

function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') ?? '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email) router.replace('/signup');
    else inputRefs.current[0]?.focus();
  }, [email, router]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const otp = digits.join('');
    if (otp.length === OTP_LENGTH && !isLoading && !success) {
      handleSubmit(otp);
    }
  }, [digits]);

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setError('');

    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleSubmit = async (otpCode: string) => {
    setIsLoading(true);
    setError('');
    try {
      await authApi.verifyAccount(email, otpCode);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 1500);
    } catch (e) {
      let msg = 'Mã OTP không đúng hoặc đã hết hạn';
      if (e instanceof ApiError && e.message) msg = e.message;
      setError(msg);
      setDigits(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await authApi.forgotPassword(email);
      setResendCooldown(RESEND_COOLDOWN);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Không gửi lại được mã';
      setError(msg);
    }
  };

  const maskedEmail = (() => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (!domain) return email;
    const visibleLen = Math.max(1, Math.min(3, name.length - 1));
    return `${name.slice(0, visibleLen)}${'*'.repeat(Math.max(0, name.length - visibleLen))}@${domain}`;
  })();

  return (
    <div>
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Quay lại đăng nhập
      </Link>

      <div className="flex justify-center mb-5">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
            success
              ? 'bg-green-100 text-green-600'
              : 'bg-emerald-100 text-emerald-600'
          }`}
        >
          {success ? <CheckCircle2 size={28} /> : <ShieldCheck size={28} />}
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {success ? 'Xác thực thành công' : 'Xác thực OTP'}
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm">
          {success ? (
            'Đang chuyển bạn về trang đăng nhập...'
          ) : (
            <>
              Vui lòng nhập mã gồm 6 chữ số vừa được gửi đến email
              <br />
              <span className="text-indigo-600 font-semibold">{maskedEmail}</span>
            </>
          )}
        </p>
      </div>

      <div className="flex justify-center gap-2 sm:gap-3 mb-5">
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
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            disabled={isLoading || success}
            className={`w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 rounded-xl outline-none transition-all
              ${error
                ? 'border-red-400 bg-red-50 text-red-600'
                : success
                ? 'border-green-400 bg-green-50 text-green-600'
                : digit
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'}
              disabled:cursor-not-allowed`}
          />
        ))}
      </div>

      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && !success && (
        <div className="text-center text-gray-500 text-sm mb-5 flex items-center justify-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          Đang xác thực...
        </div>
      )}

      {!success && (
        <button
          onClick={() => handleSubmit(digits.join(''))}
          disabled={isLoading || digits.join('').length < OTP_LENGTH}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Đang xác thực...
            </>
          ) : (
            'Xác nhận mã'
          )}
        </button>
      )}

      {!success && (
        <div className="text-center mt-5 text-sm text-gray-500">
          Bạn không nhận được mã?{' '}
          {resendCooldown > 0 ? (
            <span className="font-semibold text-gray-400">
              Gửi lại ({resendCooldown}s)
            </span>
          ) : (
            <button
              onClick={handleResend}
              className="font-bold text-indigo-600 hover:text-indigo-700"
            >
              Gửi lại mã
            </button>
          )}
        </div>
      )}
    </div>
  );
}