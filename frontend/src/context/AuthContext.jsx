import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import authService from '../features/auth/authService';

// State đăng nhập dùng chung toàn app — mọi module khác (Library, Advisor...)
// đọc user hiện tại qua hook useAuth(), không tự đọc localStorage riêng.
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
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

  const login = useCallback(async (credentials) => {
    const { token, user: loggedInUser } = await authService.login(credentials);
    localStorage.setItem('token', token);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const setTokenAndUser = useCallback((token, loggedInUser) => {
    localStorage.setItem('token', token);
    setUser(loggedInUser);
  }, []);

  const loginWithToken = useCallback(async (token) => {
    localStorage.setItem('token', token);
    try {
      const res = await api.get('/users/me');
      setUser(res.data.data);
      return res.data.data;
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      throw err;
    }
  }, []);

  const register = useCallback(async (data) => {
    const { token, user: newUser } = await authService.register(data);
    localStorage.setItem('token', token);
    setUser(newUser);
    return newUser;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    setTokenAndUser,
    loginWithToken,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
