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

export default { register, login };
