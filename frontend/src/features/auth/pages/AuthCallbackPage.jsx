import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import authService from '../authService';

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokenAndUser } = useAuth();
  const hasExchangedRef = useRef(false);

  useEffect(() => {
    // Ngăn chặn chạy lặp lại trong môi trường React StrictMode
    if (hasExchangedRef.current) return;

    const code = searchParams.get('code');
    if (!code) {
      navigate('/login?error=auth_failed', { replace: true });
      return;
    }

    hasExchangedRef.current = true;

    authService
      .exchangeToken(code)
      .then(({ token, user }) => {
        setTokenAndUser(token, user);
        navigate('/library', { replace: true });
      })
      .catch((err) => {
        console.error('OAuth exchange error:', err);
        navigate('/login?error=auth_failed', { replace: true });
      });
  }, [searchParams, navigate, setTokenAndUser]);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="animate-spin w-8 h-8 text-emerald-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm font-medium">Đang hoàn tất đăng nhập...</span>
      </div>
    </div>
  );
}
