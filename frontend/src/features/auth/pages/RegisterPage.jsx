import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import useAuth from '../../../hooks/useAuth';
import authService from '../authService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleSocialLogin(provider) {
    window.location.href = authService.getSocialLoginUrl(provider);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Tinh toan do bao mat mat khau
  function getPasswordStrength(val) {
    if (!val) return { percent: 0, text: 'Chưa nhập', colorClass: 'bg-zinc-300 dark:bg-zinc-700', textClass: 'text-zinc-500' };
    if (val.length < 6) {
      return { percent: 25, text: 'Yếu (Quá ngắn)', colorClass: 'bg-rose-500', textClass: 'text-rose-600 dark:text-rose-400' };
    }
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[^A-Za-z0-9]/.test(val);
    if (val.length < 10 && !hasNumber) {
      return { percent: 50, text: 'Trung bình', colorClass: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400' };
    }
    if (val.length >= 8 && (hasNumber || hasSpecial)) {
      return { percent: 100, text: 'Mạnh và an toàn', colorClass: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400' };
    }
    return { percent: 75, text: 'Khá tốt', colorClass: 'bg-teal-500', textClass: 'text-teal-600 dark:text-teal-400' };
  }

  const pwdStrength = getPasswordStrength(form.password);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    if (!agreeTerms) {
      setError('Vui lòng đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/library');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      activeTab="register"
      onTabChange={(tab) => tab === 'login' && navigate('/login')}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <FormField
          label="Tên người chơi (Username)"
          id="reg-username"
          name="username"
          type="text"
          placeholder="GamerTag99"
          value={form.username}
          onChange={handleChange}
          required
          icon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        {/* Email */}
        <FormField
          label="Địa chỉ Email"
          id="reg-email"
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

        {/* Password */}
        <div>
          <FormField
            label="Mật khẩu"
            id="reg-password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Tối thiểu 6 ký tự"
            value={form.password}
            onChange={handleChange}
            required
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

          {/* Thanh do do manh mat khau */}
          <div className="-mt-2 mb-4 space-y-1">
            <div className="flex h-1.5 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-colors duration-200 ${pwdStrength.colorClass}`}
                style={{ width: `${pwdStrength.percent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-zinc-500 dark:text-zinc-400">
              <span>
                Độ bảo mật: <b className={pwdStrength.textClass}>{pwdStrength.text}</b>
              </span>
              <span>Tối thiểu 6 ký tự</span>
            </div>
          </div>
        </div>

        {/* Dong y dieu khoan */}
        <div className="flex items-start">
          <input
            id="reg-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-zinc-300 dark:border-zinc-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
          />
          <label htmlFor="reg-terms" className="ml-2 block text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed cursor-pointer">
            Tôi đồng ý với{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              Điều khoản dịch vụ
            </span>{' '}
            và{' '}
            <span className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
              Chính sách bảo mật
            </span>.
          </label>
        </div>

        {/* Thong bao loi */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Nut Tao tai khoan */}
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
              <span>Đang tạo tài khoản...</span>
            </>
          ) : (
            'Khởi tạo tài khoản PixelLog'
          )}
        </button>

        {/* Alternate login label */}
        <div className="my-3 text-center text-xs text-zinc-400 dark:text-zinc-500 font-medium">
          Hoặc đăng ký nhanh qua
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
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.005.105.005.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 12-5.373 12-12s-5.372-12-12-12zM7.557 15.422l-1.427-.59c.277-.923 1.109-1.589 2.096-1.611l1.458.604c-.267.926-1.114 1.597-2.127 1.597zm8.384-8.777c1.391 0 2.52 1.131 2.52 2.524 0 1.391-1.129 2.524-2.52 2.524-1.393 0-2.523-1.133-2.523-2.524 0-1.393 1.13-2.524 2.523-2.524zm0 .84c-.93 0-1.684.754-1.684 1.684 0 .93.754 1.684 1.684 1.684.93 0 1.684-.754 1.684-1.684 0-.93-.754-1.684-1.684-1.684zm-7.669 9.176c-.927 0-1.683-.755-1.683-1.684 0-.177.03-.348.082-.507l1.791.74c.058.82-.44 1.451-1.19 1.451z" />
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

      {/* Switch to Login footer */}
      <p className="mt-5 text-center text-xs text-zinc-500 dark:text-zinc-400">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
        >
          Đăng nhập
        </button>
      </p>
    </AuthLayout>
  );
}
