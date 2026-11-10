const Game = require('./game.model');
const rawgApi = require('./rawgApi.service');

const MAX_PAGE_SIZE = 40;

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function search({ search, page, pageSize, genres, ordering }) {
  return rawgApi.searchGames({
    search: search?.trim(),
    page: toPositiveInt(page, 1),
    pageSize: Math.min(toPositiveInt(pageSize, 20), MAX_PAGE_SIZE),
    genres,
    ordering,
  });
}

async function listGenres() {
  return rawgApi.getGenres();
}

// Lấy game theo rawgId: ưu tiên bản đã cache trong DB, chưa có (hoặc chưa có mô tả/screenshots) thì gọi RAWG.
async function getByRawgId(rawgId) {
  const id = toPositiveInt(rawgId, null);
  if (!id) {
    const err = new Error('rawgId không hợp lệ');
    err.statusCode = 400;
    err.code = 'INVALID_ID';
    throw err;
  }

  const cached = await Game.findOne({ rawgId: id });
  if (cached?.detailFetched && cached?.screenshotsFetched) {
    return cached;
  }

  const detail = await rawgApi.getGameDetail(id);
  return Game.findOneAndUpdate(
    { rawgId: id },
    { $set: { ...detail, detailFetched: true, screenshotsFetched: true } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
}

// Tìm nhanh 1 tựa game theo tên (ưu tiên cache DB trước, không có mới gọi RAWG)
async function resolveByTitle(title) {
  const cleanTitle = (title || '').trim();
  if (!cleanTitle) return null;

  const exactMatch = await Game.findOne({
    name: { $regex: `^${escapeRegex(cleanTitle)}$`, $options: 'i' },
  }).lean();

  if (exactMatch) {
    return exactMatch;
  }

  const searchRes = await rawgApi.searchGames({ search: cleanTitle, page: 1, pageSize: 1 });
  const top = searchRes?.results?.[0];
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
