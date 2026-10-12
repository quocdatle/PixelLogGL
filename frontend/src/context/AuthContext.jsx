import { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import authService from '../features/auth/authService';

// State đăng nhập dùng chung toàn app — mọi module khác (Library, Advisor...)
// đọc user hiện tại qua hook useAuth(), không tự đọc localStorage riêng.
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true khi đang kiểm tra token lúc load app

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    // Có token cũ (vd: F5 lại trang) -> xác nhận token còn hợp lệ bằng cách lấy hồ sơ
    api
      .get('/users/me')
      .then((res) => setUser(res.data.data))
      .catch(() => {
        localStorage.removeItem('token'); // token hết hạn/sai -> xóa luôn
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(credentials) {
    const { token, user: loggedInUser } = await authService.login(credentials);
    localStorage.setItem('token', token);
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function register(data) {
    const { token, user: newUser } = await authService.register(data);
    localStorage.setItem('token', token);
    setUser(newUser);
    return newUser;
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
