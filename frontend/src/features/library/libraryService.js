import api from '../../services/api';

// Khớp với backend/src/modules/games và modules/library — xem docs/api-documentation.md

// Trạng thái game trong thư viện — giá trị `value` trùng với enum ở backend (userGame.model.js)
export const GAME_STATUS_OPTIONS = [
  { value: 'backlog', label: 'Chưa chơi' },
  { value: 'playing', label: 'Đang chơi' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'dropped', label: 'Bỏ dở' },
];

// Lấy message lỗi dễ hiểu từ response chuẩn { success:false, message, code }
export function getErrorMessage(err, fallback = 'Có lỗi xảy ra, vui lòng thử lại') {
  return err?.response?.data?.message || fallback;
}

export function getErrorCode(err) {
  return err?.response?.data?.code || null;
}

// ---------- Games (tra cứu qua RAWG, đi qua backend để giữ API key) ----------

async function searchGames({ search, page = 1, pageSize = 20, genres, ordering } = {}) {
  const res = await api.get('/games/search', { params: { search, page, pageSize, genres, ordering } });
  return res.data.data; // { count, hasNext, page, results: [game] }
}

async function getGenres() {
  const res = await api.get('/games/genres');
  return res.data.data; // [{ id, name, slug }]
}

async function getGame(rawgId) {
  const res = await api.get(`/games/${rawgId}`);
  return res.data.data;
}

// ---------- Library (thư viện cá nhân) ----------

async function getLibrary({ status, search, sort, page = 1, limit = 20 } = {}) {
  const res = await api.get('/user-games', { params: { status, search, sort, page, limit } });
  return res.data.data; // { items, total, page, limit, hasNext }
}

async function getSummary() {
  const res = await api.get('/user-games/summary');
  return res.data.data; // { total, byStatus, totalHours }
}

async function addToLibrary({ rawgId, status }) {
  const res = await api.post('/user-games', { rawgId, status });
  return res.data.data;
}

async function updateEntry(id, patch) {
  const res = await api.patch(`/user-games/${id}`, patch);
  return res.data.data;
}

async function removeEntry(id) {
  const res = await api.delete(`/user-games/${id}`);
  return res.data.data;
}

async function addPlaySession(id, { minutes, note }) {
  const res = await api.post(`/user-games/${id}/play-sessions`, { minutes, note });
  return res.data.data;
}

export default {
  searchGames,
  getGenres,
  getGame,
  getLibrary,
  getSummary,
  addToLibrary,
  updateEntry,
  removeEntry,
  addPlaySession,
};
