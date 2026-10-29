const mongoose = require('mongoose');
const UserGame = require('./userGame.model');
const { GAME_STATUSES } = require('./userGame.model');
const Game = require('../games/game.model');
const gameService = require('../games/game.service');

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const SORT_OPTIONS = {
  recent: { updatedAt: -1 },
  name: { 'game.name': 1 },
  rating: { rating: -1, updatedAt: -1 },
  hours: { hoursPlayed: -1, updatedAt: -1 },
};

function httpError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function validationError(message) {
  return httpError(message, 400, 'VALIDATION_ERROR');
}

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Chỉ nhận đúng các field cho phép sửa, kiểm tra kiểu dữ liệu ở đây
// để Controller không phải biết chi tiết nghiệp vụ.
function pickUpdates(body) {
  const updates = {};

  if (body.status !== undefined) {
    if (!GAME_STATUSES.includes(body.status)) {
      throw validationError(`status phải là một trong: ${GAME_STATUSES.join(', ')}`);
    }
    updates.status = body.status;
  }

  if (body.rating !== undefined) {
    if (body.rating !== null) {
      const rating = Number(body.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
        throw validationError('rating phải là số nguyên từ 1 đến 10 (hoặc null để xoá điểm)');
      }
      updates.rating = rating;
    } else {
      updates.rating = null;
    }
  }

  if (body.hoursPlayed !== undefined) {
    const hours = Number(body.hoursPlayed);
    if (!Number.isFinite(hours) || hours < 0 || hours > 100000) {
      throw validationError('hoursPlayed phải là số từ 0 trở lên');
    }
    updates.hoursPlayed = Math.round(hours * 100) / 100;
  }

  if (body.note !== undefined) {
    if (typeof body.note !== 'string' || body.note.length > 1000) {
      throw validationError('note phải là chuỗi tối đa 1000 ký tự');
    }
    updates.note = body.note.trim();
  }

  return updates;
}

async function findOwned(userId, id) {
  const entry = await UserGame.findOne({ _id: id, userId }).populate('gameId');
  if (!entry) {
    throw httpError('Không tìm thấy game trong thư viện của bạn', 404, 'NOT_FOUND');
  }
  return entry;
}

// Đổi tên gameId -> game cho Frontend dễ dùng
function toDto(entry) {
  const obj = entry.toObject ? entry.toObject() : entry;
  const { gameId, __v, ...rest } = obj;
  return { ...rest, game: gameId };
}

async function list(userId, { status, search, sort, page, limit }) {
  if (status && !GAME_STATUSES.includes(status)) {
    throw validationError(`status phải là một trong: ${GAME_STATUSES.join(', ')}`);
  }

  const pageNum = toPositiveInt(page, 1);
  const limitNum = Math.min(toPositiveInt(limit, DEFAULT_LIMIT), MAX_LIMIT);
  const sortStage = SORT_OPTIONS[sort] || SORT_OPTIONS.recent;

  const match = { userId: new mongoose.Types.ObjectId(userId) };
  if (status) match.status = status;

  const pipeline = [
    { $match: match },
    { $lookup: { from: Game.collection.name, localField: 'gameId', foreignField: '_id', as: 'game' } },
    { $unwind: '$game' },
  ];

  if (search && search.trim()) {
    pipeline.push({ $match: { 'game.name': { $regex: escapeRegex(search.trim()), $options: 'i' } } });
  }

  pipeline.push({
    $facet: {
      items: [
        { $sort: sortStage },
        { $skip: (pageNum - 1) * limitNum },
        { $limit: limitNum },
        { $project: { gameId: 0, __v: 0, playSessions: 0 } },
      ],
      total: [{ $count: 'count' }],
    },
  });

  const [result] = await UserGame.aggregate(pipeline);
  const total = result.total[0]?.count || 0;

  return {
    items: result.items,
    total,
    page: pageNum,
    limit: limitNum,
    hasNext: pageNum * limitNum < total,
  };
}

// Số game theo từng trạng thái + tổng giờ chơi — để hiển thị tab/thống kê nhanh
async function summary(userId) {
  const rows = await UserGame.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: '$status', count: { $sum: 1 }, hours: { $sum: '$hoursPlayed' } } },
  ]);

  const byStatus = Object.fromEntries(GAME_STATUSES.map((s) => [s, 0]));
  let total = 0;
  let totalHours = 0;
  rows.forEach((row) => {
    byStatus[row._id] = row.count;
    total += row.count;
    totalHours += row.hours;
  });

  return { total, byStatus, totalHours: Math.round(totalHours * 100) / 100 };
}

async function add(userId, { rawgId, status }) {
  const rawg = toPositiveInt(rawgId, null);
  if (!rawg) {
    throw validationError('rawgId phải là số nguyên dương');
  }
  if (status !== undefined && !GAME_STATUSES.includes(status)) {
    throw validationError(`status phải là một trong: ${GAME_STATUSES.join(', ')}`);
  }

  const game = await gameService.ensureCached(rawg);

  const exists = await UserGame.exists({ userId, gameId: game._id });
  if (exists) {
    throw httpError('Game này đã có trong thư viện của bạn', 409, 'ALREADY_IN_LIBRARY');
  }

  const entry = await UserGame.create({ userId, gameId: game._id, status: status || 'backlog' });
  return toDto(await entry.populate('gameId'));
}

async function getOne(userId, id) {
  return toDto(await findOwned(userId, id));
}

async function update(userId, id, body) {
  const updates = pickUpdates(body);
  if (Object.keys(updates).length === 0) {
    throw validationError('Không có trường hợp lệ nào để cập nhật (status, rating, hoursPlayed, note)');
  }

  const entry = await findOwned(userId, id);
  entry.set(updates);
  await entry.save();
  return toDto(entry);
}

async function remove(userId, id) {
  const result = await UserGame.deleteOne({ _id: id, userId });
  if (result.deletedCount === 0) {
    throw httpError('Không tìm thấy game trong thư viện của bạn', 404, 'NOT_FOUND');
  }
  return { message: 'Đã xoá game khỏi thư viện' };
}

// Ghi nhận 1 lần chơi: lưu session và cộng dồn vào hoursPlayed.
// Đang ở backlog thì tự chuyển sang playing.
async function addPlaySession(userId, id, { minutes, playedAt, note }) {
  const mins = Number(minutes);
  if (!Number.isFinite(mins) || mins < 1 || mins > 1440) {
    throw validationError('minutes phải là số từ 1 đến 1440');
  }

  let playedDate = new Date();
  if (playedAt !== undefined) {
    playedDate = new Date(playedAt);
    if (Number.isNaN(playedDate.getTime()) || playedDate > new Date()) {
      throw validationError('playedAt không hợp lệ hoặc nằm ở tương lai');
    }
  }

  let sessionNote = '';
  if (note !== undefined) {
    if (typeof note !== 'string' || note.length > 300) {
      throw validationError('note phải là chuỗi tối đa 300 ký tự');
    }
    sessionNote = note.trim();
  }

  const entry = await findOwned(userId, id);
  entry.playSessions.push({ minutes: Math.round(mins), playedAt: playedDate, note: sessionNote });
  entry.hoursPlayed = Math.round((entry.hoursPlayed + mins / 60) * 100) / 100;
  if (entry.status === 'backlog') {
    entry.status = 'playing';
  }
  await entry.save();
  return toDto(entry);
}

module.exports = { list, summary, add, getOne, update, remove, addPlaySession };
