// GIẢ ĐỊNH: services/api.js export default Axios instance và VITE_API_URL đã kết thúc bằng "/api".
// Nếu VITE_API_URL không có "/api" thì đổi các đường dẫn bên dưới thành '/api/analytics/...'.
import api from '../../services/api';

// Backend trả { success: true, data }, Axios bọc thêm 1 lớp .data nên cần bóc 2 lần.
const unwrap = (response) => response.data.data;

export const getOverview = () => api.get('/analytics/overview').then(unwrap);

export const getGenreStats = (sortBy = 'games') =>
  api.get('/analytics/genres', { params: { sortBy } }).then(unwrap);

export const getPlaytimeStats = (range = 'week') =>
  api.get('/analytics/playtime', { params: { range } }).then(unwrap);

export const getTopGames = (limit = 5) =>
  api.get('/analytics/top-games', { params: { limit } }).then(unwrap);