import api from '../../services/api';

// Khớp với backend/src/modules/auth — xem docs/api-documentation.md
async function register({ username, email, password }) {
  const res = await api.post('/auth/register', { username, email, password });
  return res.data.data; // { token, user }
}

async function login({ email, password }) {
  const res = await api.post('/auth/login', { email, password });
  return res.data.data; // { token, user }
}

/**
 * Đổi mã xác thực tạm thời dùng 1 lần (exchange code) lấy JWT token
 */
async function exchangeToken(code) {
  const res = await api.post('/auth/exchange', { code });
  return res.data.data; // { token, user }
}

/**
 * Trả về URL chuyển hướng để đăng nhập với mạng xã hội (Google, Discord, Steam)
 */
function getSocialLoginUrl(provider) {
  const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
  return `${cleanApiUrl}/auth/${provider.toLowerCase()}`;
}

export default { register, login, exchangeToken, getSocialLoginUrl };
