import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import useAuth from '../../../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
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

  function handleSocialLogin(provider) {
    alert(`Đăng nhập bằng ${provider} sẽ sớm ra mắt ở bản cập nhật tiếp theo.`);
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
          type="email"
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

        {/* Alternate login label */}
        <div className="my-3 text-center text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          Hoặc kết nối qua tài khoản
        </div>

        {/* Social Logins */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Steam */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Steam')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current text-zinc-900 dark:text-zinc-100" viewBox="0 0 24 24">
              <path d="M12 2a10 10 0 0 0-10 9.87c0 4.95 3.65 9.04 8.43 9.87l2.84-4.14a3.3 3.3 0 0 1-1.27-.67l-3.95 1.63a5.55 5.55 0 0 1-.05-.83c0-3.07 2.49-5.55 5.55-5.55s5.55 2.48 5.55 5.55a5.55 5.55 0 0 1-5.55 5.55c-.29 0-.58-.02-.85-.07l-2.88 4.2A10 10 0 0 0 22 12 10 10 0 0 0 12 2Z" />
            </svg>
            <span>Steam</span>
          </button>

          {/* Discord */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Discord')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current text-[#5865F2]" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>Discord</span>
          </button>

          {/* Google */}
          <button
            type="button"
            onClick={() => handleSocialLogin('Google')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors duration-150 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17Z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z" />
              <path fill="#FBBC05" d="M5.28 14.27a7.18 7.18 0 0 1 0-4.54V6.58H1.25a11.98 11.98 0 0 0 0 10.84l4.03-3.15Z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z" />
            </svg>
            <span>Google</span>
          </button>
        </div>
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
