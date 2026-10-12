import axios from 'axios';

// Instance axios dùng chung cho toàn bộ app — mọi module gọi API qua đây,
// không tự tạo axios/fetch riêng trong component (xem CLAUDE.md mục 7).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Tự động gắn JWT vào mọi request nếu đã đăng nhập
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
