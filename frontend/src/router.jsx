import { createBrowserRouter } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import LibraryPage from './features/library/pages/LibraryPage';
import GameSearchPage from './features/library/pages/GameSearchPage';

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/library', element: <ProtectedRoute><LibraryPage /></ProtectedRoute> },
  { path: '/library/search', element: <ProtectedRoute><GameSearchPage /></ProtectedRoute> },
]);

export default router;
