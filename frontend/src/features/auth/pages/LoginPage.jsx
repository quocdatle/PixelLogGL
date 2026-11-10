import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import SocialLoginButtons from '../components/SocialLoginButtons';
import useAuth from '../../../hooks/useAuth';

const OAUTH_ERROR_MAP = {
  email_in_use: 'Email này đã được sử dụng bởi phương thức đăng nhập khác. Vui lòng đăng nhập bằng tài khoản ban đầu.',
  invalid_state: 'Phiên xác thực không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.',
  config_missing: 'Tính năng đăng nhập này chưa được kích hoạt trên hệ thống.',
  auth_cancelled: 'Bạn đã hủy đăng nhập bằng mạng xã hội.',
  google_failed: 'Đăng nhập Google thất bại, vui lòng thử lại.',
  discord_failed: 'Đăng nhập Discord thất bại, vui lòng thử lại.',
  steam_failed: 'Đăng nhập Steam thất bại, vui lòng thử lại.',
  auth_failed: 'Xác thực tài khoản thất bại, vui lòng thử lại.',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Ánh xạ an toàn mã lỗi từ URL nếu có
  const oauthErrorCode = searchParams.get('error');
  const initialError = oauthErrorCode ? (OAUTH_ERROR_MAP[oauthErrorCode] || 'Đăng nhập thất bại, vui lòng thử lại.') : '';
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/library');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      activeTab="login"
      onTabChange={(tab) => tab === 'register' && navigate('/register')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Field */}
        <FormField
          label="Email hoặc Username"
          id="login-email"
          name="email"
          type="text"
          placeholder="gamer@example.com"
          value={form.email}
          onChange={handleChange}
          required
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          }
        />

        {/* Password Field */}
        <FormField
          label="Mật khẩu"
          id="login-password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          required
          labelAction={
            <button
              type="button"
              onClick={() => alert('Vui lòng kiểm tra email để đặt lại mật khẩu.')}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
            >
              Quên mật khẩu?
            </button>
          }
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          }
          rightElement={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors duration-150 cursor-pointer"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          }
        />

        {/* Remember me checkbox */}
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="remember-me" className="ml-2 block text-xs text-zinc-600 dark:text-zinc-400 font-medium cursor-pointer">
            Duy trì đăng nhập 30 ngày
          </label>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm transition-colors duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            'Đăng nhập vào PixelLog'
          )}
        </button>

        {/* Reusable Social Logins */}
        <SocialLoginButtons title="Hoặc kết nối qua tài khoản" />
      </form>

      {/* Switch to Register footer */}
      <p className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
        >
          Đăng ký ngay
        </button>
      </p>
    </AuthLayout>
  );
}
