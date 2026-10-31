const mongoose = require('mongoose');
const UserGame = require('../library/userGame.model'); // chỉ ĐỌC, không sửa module library
const Game = require('../games/game.model'); // chỉ ĐỌC, không sửa module games

// ---------------------------------------------------------------------------
// Hằng số
// ---------------------------------------------------------------------------
// Lấy tên collection từ model để $lookup không bị sai khi đổi tên model.
const GAME_COLLECTION = Game.collection.name;

// Lấy trực tiếp từ model Library để luôn khớp: backlog, playing, completed, dropped, wishlist.
const STATUSES = UserGame.GAME_STATUSES;

const MAX_GENRES = 8; // số thể loại hiển thị riêng, phần còn lại gộp vào "Khác"
const OTHER_GENRE_LABEL = 'Khác';

// Việt Nam là UTC+7 và không có giờ mùa hè, nên có thể dùng offset cố định.
const TIMEZONE = 'Asia/Ho_Chi_Minh';
const TZ_OFFSET_MS = 7 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const PLAYTIME_RANGES = {
  week: { unit: 'week', defaultPeriods: 8, maxPeriods: 26 },
  month: { unit: 'month', defaultPeriods: 6, maxPeriods: 24 },
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
// Trong aggregate(), Mongoose KHÔNG tự ép kiểu userId (string) sang ObjectId.
// Quên bước này thì $match luôn rỗng mà không báo lỗi.
const toObjectId = (id) => new mongoose.Types.ObjectId(id);

const minutesToHours = (minutes) => Math.round((minutes / 60) * 10) / 10;

// Tổng số phút chơi của 1 UserGame, tính từ hoursPlayed (giờ). Đây là số mà Library cộng dồn
// mỗi khi ghi phiên chơi và cũng cho phép sửa tay, nên dùng nó cho mọi con số "tổng giờ".
// Riêng biểu đồ theo thời gian phải dùng playSessions vì chỉ có ở đó mới có ngày chơi.
const addTotalMinutes = {
  $addFields: { totalMinutes: { $multiply: [{ $ifNull: ['$hoursPlayed', 0] }, 60] } },
};

// ---- Helper cho mốc thời gian (tính trong "không gian giờ VN") --------------
// Ta dịch thời điểm sang UTC+7 rồi dùng getter UTC, nhờ đó các mốc đầu tuần
// và đầu tháng khớp với $dateTrunc chạy với timezone Asia/Ho_Chi_Minh.
const nowInVietnam = () => new Date(Date.now() + TZ_OFFSET_MS);

const startOfPeriod = (unit, date) => {
  if (unit === 'month') {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }
  // Tuần bắt đầu từ thứ Hai (getUTCDay: 0 = Chủ nhật).
  const daysSinceMonday = (date.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - daysSinceMonday));
};

const addPeriods = (unit, date, count) => {
  if (unit === 'month') {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1));
  }
  return new Date(date.getTime() + count * 7 * DAY_MS);
};

const dateKey = (date) => date.toISOString().slice(0, 10); // YYYY-MM-DD

const pad2 = (n) => String(n).padStart(2, '0');

const periodLabel = (unit, date) =>
  unit === 'month'
    ? `${pad2(date.getUTCMonth() + 1)}/${date.getUTCFullYear()}`
    : `${pad2(date.getUTCDate())}/${pad2(date.getUTCMonth() + 1)}`;

// ---------------------------------------------------------------------------
// 1. Tổng quan
// ---------------------------------------------------------------------------
/**
 * Tổng số game, tổng giờ chơi, điểm đánh giá trung bình và số game theo trạng thái.
 */
const getOverview = async (userId) => {
  const [result] = await UserGame.aggregate([
    { $match: { userId: toObjectId(userId) } },
    addTotalMinutes,
    {
      $facet: {
        summary: [
          {
            $group: {
              _id: null,
              totalGames: { $sum: 1 },
              totalMinutes: { $sum: '$totalMinutes' },
              avgRating: { $avg: '$rating' }, // $avg bỏ qua giá trị null
            },
          },
        ],
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
      },
    },
  ]);

  const summary = result.summary[0] || { totalGames: 0, totalMinutes: 0, avgRating: null };

  // Luôn trả đủ 4 trạng thái (giá trị 0 nếu chưa có) để frontend không phải xử lý thiếu key.
  const byStatus = Object.fromEntries(STATUSES.map((status) => [status, 0]));
  result.byStatus.forEach(({ _id, count }) => {
    if (_id in byStatus) byStatus[_id] = count;
  });

  return {
    totalGames: summary.totalGames,
    totalHours: minutesToHours(summary.totalMinutes),
    avgRating: summary.avgRating === null ? null : Math.round(summary.avgRating * 10) / 10,
    byStatus,
  };
};

// ---------------------------------------------------------------------------
// 2. Phân bổ thể loại
// ---------------------------------------------------------------------------
/**
 * Phân bổ thể loại trong thư viện.
 * Lưu ý: 1 game có nhiều thể loại sẽ được tính vào từng thể loại đó,
 * nên tổng "games" có thể lớn hơn tổng số game thực tế.
 *
 * @param {'games'|'hours'} sortBy - tiêu chí sắp xếp
 * @returns {Promise<Array<{genre: string, games: number, hours: number}>>}
 */
const getGenreStats = async (userId, sortBy = 'games') => {
  const rows = await UserGame.aggregate([
    { $match: { userId: toObjectId(userId) } },
    addTotalMinutes,
    { $lookup: { from: GAME_COLLECTION, localField: 'gameId', foreignField: '_id', as: 'game' } },
    { $unwind: '$game' },
    { $unwind: '$game.genres' },
    {
      $group: {
        _id: '$game.genres',
        games: { $sum: 1 },
        totalMinutes: { $sum: '$totalMinutes' },
      },
    },
  ]);

  const items = rows
    .map((row) => ({ genre: row._id, games: row.games, totalMinutes: row.totalMinutes }))
    .sort((a, b) => {
      const primary = sortBy === 'hours' ? b.totalMinutes - a.totalMinutes : b.games - a.games;
      return primary || a.genre.localeCompare(b.genre);
    });

  // Gộp phần đuôi vào "Khác" để biểu đồ tròn không bị quá nhiều lát.
  let visible = items;
  if (items.length > MAX_GENRES) {
    const head = items.slice(0, MAX_GENRES - 1);
    const tail = items.slice(MAX_GENRES - 1);
    visible = [
      ...head,
      {
        genre: OTHER_GENRE_LABEL,
        games: tail.reduce((sum, item) => sum + item.games, 0),
        totalMinutes: tail.reduce((sum, item) => sum + item.totalMinutes, 0),
      },
    ];
  }

  return visible.map(({ genre, games, totalMinutes }) => ({
    genre,
    games,
    hours: minutesToHours(totalMinutes),
  }));
};

// ---------------------------------------------------------------------------
// 3. Giờ chơi theo tuần / tháng
// ---------------------------------------------------------------------------
/**
 * Giờ chơi theo từng tuần hoặc tháng gần nhất.
 * Kỳ không có dữ liệu vẫn được trả về với giá trị 0 để biểu đồ không bị đứt quãng.
 *
 * @param {'week'|'month'} range
 * @param {number} [periods] - số kỳ muốn lấy
 */
const getPlaytimeStats = async (userId, range = 'week', periods) => {
  const config = PLAYTIME_RANGES[range];
  if (!config) {
    throw new Error(`Range không hợp lệ: ${range}`);
  }

  const { unit, defaultPeriods, maxPeriods } = config;
  const periodCount = Math.min(Math.max(periods || defaultPeriods, 1), maxPeriods);

  // Dựng sẵn danh sách các kỳ (cũ -> mới).
  const currentStart = startOfPeriod(unit, nowInVietnam());
  const firstStart = addPeriods(unit, currentStart, -(periodCount - 1));
  const buckets = Array.from({ length: periodCount }, (_, i) => addPeriods(unit, firstStart, i));

  // Mốc thời gian thực (UTC) của đầu kỳ đầu tiên, dùng để lọc phiên chơi.
  const rangeStart = new Date(firstStart.getTime() - TZ_OFFSET_MS);

  const dateTrunc = {
    date: '$playSessions.playedAt',
    unit,
    timezone: TIMEZONE,
    ...(unit === 'week' && { startOfWeek: 'monday' }),
  };

  const rows = await UserGame.aggregate([
    { $match: { userId: toObjectId(userId) } },
    { $unwind: '$playSessions' },
    { $match: { 'playSessions.playedAt': { $gte: rangeStart } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: { $dateTrunc: dateTrunc }, timezone: TIMEZONE },
        },
        totalMinutes: { $sum: '$playSessions.minutes' },
      },
    },
  ]);

  const minutesByKey = new Map(rows.map((row) => [row._id, row.totalMinutes]));

  return {
    range,
    periods: periodCount,
    items: buckets.map((start) => {
      const minutes = minutesByKey.get(dateKey(start)) || 0;
      return {
        periodStart: dateKey(start),
        label: periodLabel(unit, start),
        minutes,
        hours: minutesToHours(minutes),
      };
    }),
  };
};

// ---------------------------------------------------------------------------
// 4. Game chơi nhiều nhất
// ---------------------------------------------------------------------------
/**
 * Top game có tổng giờ chơi cao nhất của người dùng.
 */
const getTopGames = async (userId, limit = 5) => {
  return UserGame.aggregate([
    { $match: { userId: toObjectId(userId) } },
    addTotalMinutes,
    { $match: { totalMinutes: { $gt: 0 } } },
    { $sort: { totalMinutes: -1 } },
    { $limit: limit }, // limit trước $lookup để chỉ join số bản ghi cần thiết
    { $lookup: { from: GAME_COLLECTION, localField: 'gameId', foreignField: '_id', as: 'game' } },
    { $unwind: '$game' },
    {
      $project: {
        _id: 0,
        userGameId: '$_id',
        gameId: 1,
        name: '$game.name',
        status: 1,
        rating: 1,
        hours: { $round: [{ $divide: ['$totalMinutes', 60] }, 1] },
      },
    },
  ]);
};

module.exports = {
  PLAYTIME_RANGES,
  getOverview,
  getGenreStats,
  getPlaytimeStats,
  getTopGames,
};