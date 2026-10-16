import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import useAuth from '../../../hooks/useAuth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
      navigate('/library'); // đổi lại route thật khi module Library sẵn sàng
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại, thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout activeTab="login" onTabChange={(tab) => tab === 'register' && navigate('/register')}>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Email"
          id="login-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <FormField
          label="Password"
          id="login-password"
          name="password"
          type="password"
          placeholder="********"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <p className="mb-5 text-[14px] text-[#2D5FEA] dark:text-[#3DA9FC]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#2D5FEA] dark:bg-[#3DA9FC] text-[#FFFFFF] dark:text-[#0B1220] border-0 rounded-sm font-mono font-bold text-[15px] cursor-pointer disabled:opacity-60"
        >
          {loading ? 'Đang đăng nhập...' : 'Log in'}
        </button>
      </form>

      <p className="mt-5 text-[14px] text-[#5B6B8C]">
        New here?{' '}
        <button
          type="button"
          onClick={() => navigate('/register')}
          className="bg-transparent border-0 p-0 text-[#2D5FEA] dark:text-[#3DA9FC] underline cursor-pointer font-inherit"
        >
          Create an account
        </button>
      </p>
    </AuthLayout>
  );
}
