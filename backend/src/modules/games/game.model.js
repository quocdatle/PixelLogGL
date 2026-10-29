const mongoose = require('mongoose');

// Bản cache thông tin game lấy từ RAWG. Library (userGame) tham chiếu tới đây bằng ObjectId
// để nhiều người dùng cùng 1 game không bị lặp dữ liệu (xem CLAUDE.md mục 6).
const gameSchema = new mongoose.Schema(
  {
    rawgId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, default: null },
    backgroundImage: { type: String, default: null },
    released: { type: String, default: null }, // RAWG trả dạng 'YYYY-MM-DD'
    genres: { type: [String], default: [] },
    platforms: { type: [String], default: [] },
    rating: { type: Number, default: null }, // điểm cộng đồng RAWG (0-5)
    metacritic: { type: Number, default: null },
    description: { type: String, default: '' },
    detailFetched: { type: Boolean, default: false }, // đã gọi API chi tiết (có description) chưa
  },
  { timestamps: true }
);

gameSchema.index({ name: 'text' });

module.exports = mongoose.model('Game', gameSchema);
