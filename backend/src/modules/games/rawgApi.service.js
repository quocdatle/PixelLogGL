require('../../config/env'); // nạp dotenv để đọc được RAWG_API_KEY

const RAWG_BASE_URL = 'https://api.rawg.io/api';
const REQUEST_TIMEOUT_MS = 10000;

function createError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

// Gọi RAWG từ Backend để không lộ API key ra Frontend (xem CLAUDE.md mục 11).
async function rawgFetch(path, params = {}) {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    throw createError('Server chưa cấu hình RAWG_API_KEY', 500, 'RAWG_NOT_CONFIGURED');
  }

  const url = new URL(`${RAWG_BASE_URL}${path}`);
  url.searchParams.set('key', apiKey);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, value);
    }
  });

  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
  } catch (err) {
    throw createError('Không kết nối được tới RAWG API', 502, 'RAWG_UNREACHABLE');
  }

  if (res.status === 404) {
    throw createError('Không tìm thấy game trên RAWG', 404, 'GAME_NOT_FOUND');
  }
  if (!res.ok) {
    throw createError(`RAWG API trả lỗi (${res.status})`, 502, 'RAWG_ERROR');
  }
  return res.json();
}

// Chuyển dữ liệu thô của RAWG về đúng shape của Game model
function normalizeGame(raw) {
  return {
    rawgId: raw.id,
    name: raw.name,
    slug: raw.slug || null,
    backgroundImage: raw.background_image || null,
    released: raw.released || null,
    genres: (raw.genres || []).map((g) => g.name),
    platforms: (raw.platforms || []).map((p) => p.platform?.name).filter(Boolean),
    rating: typeof raw.rating === 'number' ? raw.rating : null,
    metacritic: typeof raw.metacritic === 'number' ? raw.metacritic : null,
  };
}

async function searchGames({ search, page = 1, pageSize = 20, genres, ordering }) {
  const data = await rawgFetch('/games', {
    search,
    page,
    page_size: pageSize,
    genres,
    ordering,
    search_precise: search ? 'true' : undefined,
  });

  return {
    count: data.count,
    hasNext: Boolean(data.next),
    page: Number(page),
    results: (data.results || []).map(normalizeGame),
  };
}

async function getGameDetail(rawgId) {
  const raw = await rawgFetch(`/games/${rawgId}`);
  return {
    ...normalizeGame(raw),
    // RAWG trả description dạng HTML — dùng bản text thuần để hiển thị an toàn
    description: raw.description_raw || '',
  };
}

async function getGenres() {
  const data = await rawgFetch('/genres', { ordering: 'name' });
  return (data.results || []).map((g) => ({ id: g.id, name: g.name, slug: g.slug }));
}

module.exports = { searchGames, getGameDetail, getGenres, normalizeGame };
