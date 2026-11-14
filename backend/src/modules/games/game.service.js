const Game = require('./game.model');
const igdbApi = require('./igdbApi.service');

const MAX_PAGE_SIZE = 40;

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function searchCachedGames({ search, page = 1, pageSize = 20 }) {
  const filter = {};
  if (search && search.trim()) {
    filter.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
  }

  const skip = (page - 1) * pageSize;
  const [total, items] = await Promise.all([
    Game.countDocuments(filter),
    Game.find(filter)
      .sort({ rating: -1, updatedAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean(),
  ]);

  return {
    count: total,
    hasNext: skip + items.length < total,
    page,
    results: items,
  };
}

async function search(queryOrOptions = {}, maybeOptions = {}) {
  const options =
    typeof queryOrOptions === 'string'
      ? { search: queryOrOptions, ...maybeOptions }
      : queryOrOptions || {};

  const { search, page, pageSize, genres, ordering } = options;
  const safePage = toPositiveInt(page, 1);
  const safePageSize = Math.min(toPositiveInt(pageSize, 20), MAX_PAGE_SIZE);
  const cleanSearch = typeof search === 'string' ? search.trim() : '';

  // 1. Tìm kiếm từ IGDB API
  if (igdbApi.isConfigured()) {
    try {
      return await igdbApi.searchGames({
        search: cleanSearch,
        page: safePage,
        pageSize: safePageSize,
        genres,
        ordering,
      });
    } catch (igdbErr) {
      console.warn('[GAME_SERVICE] IGDB search gặp lỗi, dùng cache MongoDB:', igdbErr.message);
    }
  }

  // 2. Fallback về cache MongoDB
  const cachedResult = await searchCachedGames({
    search: cleanSearch,
    page: safePage,
    pageSize: safePageSize,
  });

  return cachedResult;
}

async function listGenres() {
  if (igdbApi.isConfigured()) {
    try {
      return await igdbApi.getGenres();
    } catch (err) {
      console.warn('[GAME_SERVICE] Không lấy được genres từ IGDB, dùng cache:', err.message);
    }
  }

  const distinctGenres = await Game.distinct('genres');
  return distinctGenres.filter(Boolean).map((name, index) => ({
    id: index + 1,
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  }));
}

// Lấy thông tin game theo ID (ưu tiên cache MongoDB, nếu chưa có thì tải từ IGDB)
async function getByIgdbId(gameId) {
  const id = toPositiveInt(gameId, null);
  if (!id) {
    const err = new Error('ID game không hợp lệ');
    err.statusCode = 400;
    err.code = 'INVALID_ID';
    throw err;
  }

  const queryFilter = { $or: [{ igdbId: id }, { rawgId: id }] };
  const cached = await Game.findOne(queryFilter);

  if (cached?.detailFetched && cached?.screenshotsFetched) {
    return cached;
  }

  if (igdbApi.isConfigured()) {
    try {
      const detail = await igdbApi.getGameDetail(id);
      return await Game.findOneAndUpdate(
        { $or: [{ igdbId: detail.igdbId }, { rawgId: detail.igdbId }] },
        {
          $set: {
            ...detail,
            source: 'igdb',
            detailFetched: true,
            screenshotsFetched: true,
          },
        },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      if (cached) return cached;
      throw err;
    }
  }

  if (cached) {
    return cached;
  }

  const notFoundErr = new Error('Không tìm thấy thông tin game');
  notFoundErr.statusCode = 404;
  notFoundErr.code = 'GAME_NOT_FOUND';
  throw notFoundErr;
}

// Tìm nhanh 1 tựa game theo tên cho Cố vấn AI
async function resolveByTitle(title) {
  const cleanTitle = (title || '').trim();
  if (!cleanTitle) return null;

  const exactMatch = await Game.findOne({
    name: { $regex: `^${escapeRegex(cleanTitle)}$`, $options: 'i' },
  }).lean();

  if (exactMatch) {
    return exactMatch;
  }

  if (!igdbApi.isConfigured()) return null;

  let top = null;
  try {
    const searchRes = await igdbApi.searchGames({ search: cleanTitle, page: 1, pageSize: 1 });
    top = searchRes?.results?.[0] || null;
  } catch {
    top = null;
  }

  if (!top) return null;

  return Game.findOneAndUpdate(
    { $or: [{ igdbId: top.igdbId }, { rawgId: top.igdbId }] },
    { $setOnInsert: top },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

async function ensureCached(gameId) {
  return getByIgdbId(gameId);
}

module.exports = {
  search,
  listGenres,
  getByIgdbId,
  getByRawgId: getByIgdbId, // Alias tương thích ngược
  resolveByTitle,
  ensureCached,
};
