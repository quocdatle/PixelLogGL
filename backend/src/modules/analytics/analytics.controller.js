const analyticsService = require('./analytics.service');
const { success, error } = require('../../utils/responseFormatter');

const GENRE_SORT_OPTIONS = ['games', 'hours'];
const MAX_TOP_GAMES = 20;

// Đọc số nguyên từ query string; nếu không hợp lệ thì dùng giá trị mặc định,
// nếu vượt biên thì kẹp lại trong [min, max].
const parseIntInRange = (value, fallback, min, max) => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

// GET /api/analytics/overview
const getOverview = async (req, res, next) => {
  try {
    const data = await analyticsService.getOverview(req.userId);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
};

// GET /api/analytics/genres?sortBy=games|hours
const getGenreStats = async (req, res, next) => {
  try {
    const sortBy = req.query.sortBy || 'games';
    if (!GENRE_SORT_OPTIONS.includes(sortBy)) {
      return error(res, `sortBy phải là một trong: ${GENRE_SORT_OPTIONS.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
    const data = await analyticsService.getGenreStats(req.userId, sortBy);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
};

// GET /api/analytics/playtime?range=week|month&periods=8
const getPlaytimeStats = async (req, res, next) => {
  try {
    const range = req.query.range || 'week';
    if (!analyticsService.PLAYTIME_RANGES[range]) {
      const allowed = Object.keys(analyticsService.PLAYTIME_RANGES).join(', ');
      return error(res, `range phải là một trong: ${allowed}`, 400, 'VALIDATION_ERROR');
    }
    const periods = req.query.periods ? parseIntInRange(req.query.periods, undefined, 1, 100) : undefined;
    const data = await analyticsService.getPlaytimeStats(req.userId, range, periods);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
};

// GET /api/analytics/top-games?limit=5
const getTopGames = async (req, res, next) => {
  try {
    const limit = parseIntInRange(req.query.limit, 5, 1, MAX_TOP_GAMES);
    const data = await analyticsService.getTopGames(req.userId, limit);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
};

module.exports = { getOverview, getGenreStats, getPlaytimeStats, getTopGames };