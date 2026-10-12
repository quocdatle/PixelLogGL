import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Dùng trong bất kỳ component nào cần biết user hiện tại hoặc gọi login/register/logout.
// Bắt buộc component phải nằm trong <AuthProvider> (đã bọc ở main.jsx).
export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth() phải được gọi bên trong <AuthProvider>');
  }
  return ctx;
}
