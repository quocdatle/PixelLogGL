import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const LibraryPage = lazy(() => import('./features/library/pages/LibraryPage'));
const AnalyticsPage = lazy(() => import('./features/analytics/pages/AnalyticsPage'));

function RouteLoadingFallback() {
  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400">
      <div className="flex items-center gap-3">
        <svg
          className="animate-spin w-5 h-5 text-emerald-500"
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
        <span className="text-sm font-medium">Đang tải trang...</span>
      </div>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/library" replace />,
  },
  {
    path: '/index.html',
    element: <Navigate to="/library" replace />,
  },
  {
    path: '/login',
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <RegisterPage />
      </Suspense>
    ),
  },
  {
    path: '/library',
    element: (
      <Suspense fallback={<RouteLoadingFallback />}>
        <ProtectedRoute>
          <LibraryPage />
        </ProtectedRoute>
      </Suspense>
    ),
  },
  {
  path: '/analytics',
  element: (
    <Suspense fallback={<RouteLoadingFallback />}>
      <ProtectedRoute>
        <AnalyticsPage />
      </ProtectedRoute>
    </Suspense>
  ),
},
  {
    path: '*',
    element: <Navigate to="/library" replace />,
  },
]);

export default router;
