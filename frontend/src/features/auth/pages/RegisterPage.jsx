import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import FormField from '../components/FormField';
import useAuth from '../../../hooks/useAuth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (form.password.length < 6) {
      setError('Password phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate('/library'); // đổi lại route thật khi module Library sẵn sàng
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại, thử lại.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout activeTab="register" onTabChange={(tab) => tab === 'login' && navigate('/login')}>
      <form onSubmit={handleSubmit}>
        <FormField
          label="Username"
          id="reg-username"
          name="username"
          type="text"
          placeholder="playername"
          value={form.username}
          onChange={handleChange}
          required
        />
        <FormField
          label="Email"
          id="reg-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          required
        />
        <FormField
          label="Password"
          id="reg-password"
          name="password"
          type="password"
          placeholder="********"
          value={form.password}
          onChange={handleChange}
          required
        />
        <p className="mb-5 text-[13px] text-[#5B6B8C] -mt-3">At least 6 characters.</p>

        {error && <p className="mb-5 text-[14px] text-[#2D5FEA]">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-[#2D5FEA] text-[#FFFFFF] border-0 rounded-sm font-mono font-bold text-[15px] cursor-pointer disabled:opacity-60"
        >
          {loading ? 'Đang tạo tài khoản...' : 'Create account'}
        </button>
      </form>

      <p className="mt-5 text-[14px] text-[#5B6B8C]">
        Already have an account?{' '}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="bg-transparent border-0 p-0 text-[#2D5FEA] underline cursor-pointer font-inherit"
        >
          Log in
        </button>
      </p>
    </AuthLayout>
  );
}
