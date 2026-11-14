const mongoose = require('mongoose');

// Bản cache thông tin game lấy từ IGDB API. Library (userGame) tham chiếu tới đây bằng ObjectId
// để nhiều người dùng cùng 1 game không bị lặp dữ liệu (xem CLAUDE.md mục 6).
const gameSchema = new mongoose.Schema(
  {
    igdbId: { type: Number, index: { unique: true, sparse: true } },
    rawgId: { type: Number, index: { sparse: true } }, // Giữ lại tương thích ngược với dữ liệu cũ
    steamAppId: { type: Number, index: { sparse: true } },
    source: { type: String, default: 'igdb' },
    name: { type: String, required: true, trim: true },
    slug: { type: String, default: null },
    backgroundImage: { type: String, default: null },
    released: { type: String, default: null }, // 'YYYY-MM-DD'
    genres: { type: [String], default: [] },
    platforms: { type: [String], default: [] },
    developers: { type: [String], default: [] },
    publishers: { type: [String], default: [] },
    website: { type: String, default: null },
    playtimeAvg: { type: Number, default: null },
    esrbRating: { type: String, default: null },
    screenshots: { type: [String], default: [] },
    rating: { type: Number, default: null }, // Điểm đánh giá (0-5)
    metacritic: { type: Number, default: null }, // Điểm phê bình (0-100)
    description: { type: String, default: '' },
    detailFetched: { type: Boolean, default: false }, // Đã gọi API chi tiết chưa
    screenshotsFetched: { type: Boolean, default: false },
  },
  { timestamps: true }
);

gameSchema.index({ name: 'text' });

module.exports = mongoose.model('Game', gameSchema);
