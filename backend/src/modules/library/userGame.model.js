const mongoose = require('mongoose');

const GAME_STATUSES = ['backlog', 'playing', 'completed', 'dropped'];

// Mỗi lần chơi — chỉ dùng trong 1 UserGame nên EMBED (xem CLAUDE.md mục 6)
const playSessionSchema = new mongoose.Schema(
  {
    playedAt: { type: Date, default: Date.now },
    minutes: { type: Number, required: true, min: 1 },
    note: { type: String, default: '', trim: true, maxlength: 300 },
  },
  { _id: true }
);

const userGameSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
    status: { type: String, enum: GAME_STATUSES, default: 'backlog' },
    rating: { type: Number, min: 1, max: 10, default: null }, // điểm cá nhân 1-10
    hoursPlayed: { type: Number, min: 0, default: 0 },
    note: { type: String, default: '', trim: true, maxlength: 1000 },
    playSessions: { type: [playSessionSchema], default: [] },
  },
  { timestamps: true }
);

// Mỗi người chỉ thêm 1 game 1 lần vào thư viện
userGameSchema.index({ userId: 1, gameId: 1 }, { unique: true });

const UserGame = mongoose.model('UserGame', userGameSchema);

module.exports = UserGame;
module.exports.GAME_STATUSES = GAME_STATUSES;
