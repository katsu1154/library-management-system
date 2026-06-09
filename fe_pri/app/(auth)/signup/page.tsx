'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  User,
  Mail,
  Lock,
  ShieldCheck,
  Phone,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { authApi } from '@/lib/auth';
import { ApiError } from '@/lib/api';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/context/AuthContext';

type FieldErrors = {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  form: string;
};

const EMPTY_ERRORS: FieldErrors = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  form: '',
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const {socialLogin} = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FieldErrors>(EMPTY_ERRORS);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  const validate = (): FieldErrors => {
    const e: FieldErrors = { ...EMPTY_ERRORS };
    if (!formData.fullName.trim()) e.fullName = 'Vui lòng nhập họ và tên!';
    else if (formData.fullName.trim().length < 2)
      e.fullName = 'Họ tên phải có ít nhất 2 ký tự';

    if (!formData.email.trim()) e.email = 'Vui lòng nhập email!';
    else if (!EMAIL_REGEX.test(formData.email.trim()))
      e.email = 'Email không hợp lệ';

    if (formData.phoneNumber.trim() && !/^[0-9]{9,11}$/.test(formData.phoneNumber.trim()))
      e.phoneNumber = 'Số điện thoại không hợp lệ (9–11 chữ số)';

    if (!formData.password) e.password = 'Vui lòng nhập mật khẩu!';
    else if (formData.password.length < 6)
      e.password = 'Mật khẩu tối thiểu 6 ký tự';

    if (!formData.confirmPassword)
      e.confirmPassword = 'Vui lòng xác nhận mật khẩu!';
    else if (formData.confirmPassword !== formData.password)
      e.confirmPassword = 'Mật khẩu xác nhận không khớp';

    return e;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    setErrors(newErrors);
    const hasError = Object.entries(newErrors).some(
      ([k, v]) => k !== 'form' && v.length > 0
    );
    if (hasError) return;

    setIsLoading(true);
    try {
      const email = formData.email.trim();
      await authApi.register({
        loginName: email,
        email,
        fullName: formData.fullName.trim(),
        password: formData.password,
        phoneNumber: formData.phoneNumber.trim() || undefined,
      });

      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (e) {
      let msg = 'Không kết nối được máy chủ. Vui lòng thử lại.';
      if (e instanceof ApiError) {
        msg = e.message || 'Đăng ký thất bại';
      }
      setErrors({ ...newErrors, form: msg });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) handleSubmit();
  };
  const triggerGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      setErrors((p) => ({ ...p, form: '' })); 
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

  return (
    <div onKeyDown={onKeyDown}>
      {/* Logo icon */}
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 bg-gray-100 text-gray-600 rounded-2xl flex items-center justify-center shadow-sm">
          <UserPlus size={28} strokeWidth={2} />
        </div>
      </div>

      <div className="text-center mb-7">
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          Tạo tài khoản mới
        </h2>
        <p className="text-gray-500 mt-1.5 text-sm">
          Đăng ký để sử dụng các dịch vụ của thư viện
        </p>
      </div>

      
      <button
        type="button"
        onClick={() => triggerGoogleLogin()}
        disabled={isLoading || isGoogleLoading || isMicrosoftLoading}
        title="Đăng nhập với Google"
        className="w-full mb-5 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-gray-700 font-semibold text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
      >
        {isGoogleLoading ? (
          <Loader2 size={18} className="animate-spin text-gray-500" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24">
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
        {isGoogleLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}
      </button>

      <div className="relative mb-5">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-4 text-gray-400 font-medium tracking-wider">
            Hoặc
          </span>
        </div>
      </div>

      {errors.form && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium flex items-start gap-2">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span>{errors.form}</span>
        </div>
      )}

      <div className="space-y-3.5">
        <FormField
          label="HỌ VÀ TÊN"
          icon={<User size={18} />}
          value={formData.fullName}
          onChange={(v) => updateField('fullName', v)}
          error={errors.fullName}
          disabled={isLoading}
          autoComplete="name"
        />

        <FormField
          label="EMAIL"
          icon={<Mail size={18} />}
          value={formData.email}
          onChange={(v) => updateField('email', v)}
          type="email"
          error={errors.email}
          disabled={isLoading}
          autoComplete="email"
        />

        <FormField
          label="SỐ ĐIỆN THOẠI"
          icon={<Phone size={18} />}
          value={formData.phoneNumber}
          onChange={(v) => updateField('phoneNumber', v)}
          type="tel"
          error={errors.phoneNumber}
          disabled={isLoading}
          autoComplete="tel"
        />

        <FormField
          label="MẬT KHẨU"
          icon={<Lock size={18} />}
          value={formData.password}
          onChange={(v) => updateField('password', v)}
          type={showPassword ? 'text' : 'password'}
          error={errors.password}
          disabled={isLoading}
          autoComplete="new-password"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
              className="text-gray-400 hover:text-indigo-600 p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        <FormField
          label="XÁC NHẬN MẬT KHẨU"
          icon={<ShieldCheck size={18} />}
          value={formData.confirmPassword}
          onChange={(v) => updateField('confirmPassword', v)}
          type={showConfirmPassword ? 'text' : 'password'}
          error={errors.confirmPassword}
          disabled={isLoading}
          autoComplete="new-password"
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              tabIndex={-1}
              className="text-gray-400 hover:text-indigo-600 p-1"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-xl shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 size={18} className="animate-spin" /> Đang gửi...
            </>
          ) : (
            'Gửi mã OTP'
          )}
        </button>

        <div className="text-center text-sm text-gray-500 pt-2">
          Đã có tài khoản?{' '}
          <Link
            href="/login"
            className="font-bold text-indigo-600 hover:text-indigo-700"
          >
            Đăng nhập tại đây
          </Link>
        </div>
      </div>
    </div>
  );
}

type FormFieldProps = {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  error?: string;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
  autoComplete?: string;
};

function FormField({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = 'text',
  error,
  disabled,
  rightIcon,
  autoComplete,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 mb-1.5 ml-1 tracking-wide">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`w-full pl-10 ${rightIcon ? 'pr-11' : 'pr-4'} py-3 border rounded-xl outline-none transition-all text-sm placeholder:text-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error
              ? 'border-red-400 bg-red-50'
              : 'border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'}`}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1.5 ml-1 font-medium flex items-center gap-1">
          <AlertCircle size={14} /> {error}
        </p>
      )}
    </div>
  );
}