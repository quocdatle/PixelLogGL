import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import useAuth from '../../../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Tính toán độ bảo mật mật khẩu
  function getPasswordStrength(val) {
    if (!val) return { percent: 0, text: 'Chưa nhập', colorClass: 'bg-slate-300 dark:bg-slate-700', textClass: 'text-slate-500' };
    if (val.length < 6) {
      return { percent: 25, text: 'Yếu (Quá ngắn)', colorClass: 'bg-rose-500', textClass: 'text-rose-600 dark:text-rose-400' };
    }
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[^A-Za-z0-9]/.test(val);
    if (val.length < 10 && !hasNumber) {
      return { percent: 50, text: 'Trung bình', colorClass: 'bg-amber-500', textClass: 'text-amber-600 dark:text-amber-400' };
    }
    if (val.length >= 8 && (hasNumber || hasSpecial)) {
      return { percent: 100, text: 'Mạnh & An toàn', colorClass: 'bg-emerald-500', textClass: 'text-emerald-600 dark:text-emerald-400' };
    }
    return { percent: 75, text: 'Khá tốt', colorClass: 'bg-indigo-500', textClass: 'text-indigo-600 dark:text-indigo-400' };
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
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
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

          {/* Thanh đo độ mạnh mật khẩu */}
          <div className="-mt-2 mb-4 space-y-1">
            <div className="flex h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${pwdStrength.colorClass}`}
                style={{ width: `${pwdStrength.percent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
              <span>
                Độ bảo mật: <b className={pwdStrength.textClass}>{pwdStrength.text}</b>
              </span>
              <span>Tối thiểu 6 ký tự</span>
            </div>
          </div>
        </div>

        {/* Đồng ý điều khoản */}
        <div className="flex items-start">
          <input
            id="reg-terms"
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="reg-terms" className="ml-2 block text-xs text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer">
            Tôi đồng ý với{' '}
            <span className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Điều khoản dịch vụ
            </span>{' '}
            và{' '}
            <span className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
              Chính sách bảo mật
            </span>.
          </label>
        </div>

        {/* Thông báo lỗi */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        {/* Nút Tạo tài khoản */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm shadow-md shadow-indigo-500/25 dark:shadow-indigo-600/30 hover:shadow-lg hover:shadow-indigo-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            'Khởi tạo Vault cá nhân'
          )}
        </button>
      </form>

      {/* Switch to Login footer */}
      <p className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer"
        >
          Đăng nhập
        </button>
      </p>
    </AuthLayout>
  );
}
