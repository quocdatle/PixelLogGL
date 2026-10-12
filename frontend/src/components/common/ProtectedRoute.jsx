import { Navigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Bọc quanh route cần đăng nhập mới vào được (vd: Library, Advisor, Analytics, Economy).
// Dùng: <Route path="/library" element={<ProtectedRoute><LibraryPage /></ProtectedRoute>} />
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // đang xác nhận token — module Library có thể thay bằng spinner riêng sau
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
