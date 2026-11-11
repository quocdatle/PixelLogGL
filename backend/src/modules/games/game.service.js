const Game = require('./game.model');
const rawgApi = require('./rawgApi.service');
const igdbApi = require('./igdbApi.service');
const steamApi = require('./steamApi.service');

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

async function search({ search, page, pageSize, genres, ordering }) {
  const safePage = toPositiveInt(page, 1);
  const safePageSize = Math.min(toPositiveInt(pageSize, 20), MAX_PAGE_SIZE);
  const cleanSearch = search?.trim();

  // 1. Ưu tiên Steam API (không cần 2FA/Twitch key, hoạt động ngay)
  try {
    const steamResult = await steamApi.searchGames({
      search: cleanSearch,
      page: safePage,
      pageSize: safePageSize,
    });
    if (steamResult.results.length > 0 || !cleanSearch) {
      return steamResult;
    }
  } catch (steamErr) {
    console.warn('[GAME_SERVICE] Steam search lỗi, thử nguồn dự phòng:', steamErr.message);
  }

  // 2. Fallback sang IGDB nếu đã cấu hình Twitch credentials
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
      console.warn('[GAME_SERVICE] IGDB search lỗi, thử fallback:', igdbErr.message);
    }
  }

  // 3. Fallback sang RAWG API
  try {
    return await rawgApi.searchGames({
      search: cleanSearch,
      page: safePage,
      pageSize: safePageSize,
      genres,
      ordering,
    });
  } catch (rawgErr) {
    // 4. Fallback cuối cùng về MongoDB cache
    const cachedResult = await searchCachedGames({
      search: cleanSearch,
      page: safePage,
      pageSize: safePageSize,
    });
    if (cachedResult.results.length > 0 || !cleanSearch) {
      return cachedResult;
    }
    return { count: 0, hasNext: false, page: safePage, results: [] };
  }
}

async function listGenres() {
  return steamApi.getGenres();
}

// Lấy game theo ID (hỗ trợ cả Steam ID >= 200M, IGDB ID >= 100M và RAWG ID < 100M)
async function getByRawgId(rawgId) {
  const id = toPositiveInt(rawgId, null);
  if (!id) {
    const err = new Error('rawgId không hợp lệ');
    err.statusCode = 400;
    err.code = 'INVALID_ID';
    throw err;
  }

  const steamAppId = steamApi.fromExternalId(id);
  const igdbDirectId = igdbApi.fromExternalId(id);

  let queryFilter = { rawgId: id };
  if (steamAppId) {
    queryFilter = { $or: [{ rawgId: id }, { steamAppId }] };
  } else if (igdbDirectId) {
    queryFilter = { $or: [{ rawgId: id }, { igdbId: igdbDirectId }] };
  }

  const cached = await Game.findOne(queryFilter);
  if (cached?.detailFetched && cached?.screenshotsFetched) {
    return cached;
  }

  // 1. Game từ Steam API
  if (steamAppId || cached?.source === 'steam') {
    const targetAppId = steamAppId || cached?.steamAppId;
    try {
      const detail = await steamApi.getGameDetail(targetAppId);
      return Game.findOneAndUpdate(
        { rawgId: detail.rawgId },
        { $set: { ...detail, detailFetched: true, screenshotsFetched: true } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      if (cached) return cached;
      throw err;
    }
  }

  // 2. Game từ IGDB API
  if (igdbDirectId || cached?.source === 'igdb') {
    const targetIgdbId = igdbDirectId || cached?.igdbId;
    try {
      const detail = await igdbApi.getGameDetail(targetIgdbId);
      return Game.findOneAndUpdate(
        { rawgId: detail.rawgId },
        { $set: { ...detail, detailFetched: true, screenshotsFetched: true } },
        { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
      );
    } catch (err) {
      if (cached) return cached;
      throw err;
    }
  }

  // 3. Game từ RAWG (hoặc cache cũ)
  try {
    const detail = await rawgApi.getGameDetail(id);
    return Game.findOneAndUpdate(
      { rawgId: id },
      { $set: { ...detail, source: 'rawg', detailFetched: true, screenshotsFetched: true } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  } catch (err) {
    if (cached) {
      return cached;
    }
    throw err;
  }
}

// Tìm nhanh 1 tựa game theo tên cho Cố vấn AI (ưu tiên cache DB, sau đó Steam -> IGDB -> RAWG)
async function resolveByTitle(title) {
  const cleanTitle = (title || '').trim();
  if (!cleanTitle) return null;

  const exactMatch = await Game.findOne({
    name: { $regex: `^${escapeRegex(cleanTitle)}$`, $options: 'i' },
  }).lean();

  if (exactMatch) {
    return exactMatch;
  }

  let top = null;
  try {
    const steamRes = await steamApi.searchGames({ search: cleanTitle, page: 1, pageSize: 1 });
    top = steamRes?.results?.[0] || null;
  } catch {
    top = null;
  }

  if (!top && igdbApi.isConfigured()) {
    try {
      const igdbRes = await igdbApi.searchGames({ search: cleanTitle, page: 1, pageSize: 1 });
      top = igdbRes?.results?.[0] || null;
    } catch {
      top = null;
    }
  }

  if (!top) {
    try {
      const searchRes = await rawgApi.searchGames({ search: cleanTitle, page: 1, pageSize: 1 });
      top = searchRes?.results?.[0] || null;
    } catch {
      top = null;
    }
  }

  if (!top) return null;

  return Game.findOneAndUpdate(
    { rawgId: top.rawgId },
    { $setOnInsert: top },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

// Dùng khi thêm game vào thư viện: bảo đảm game đã có trong DB rồi trả về document.
async function ensureCached(rawgId) {
  return getByRawgId(rawgId);
}

module.exports = { search, listGenres, getByRawgId, resolveByTitle, ensureCached };
