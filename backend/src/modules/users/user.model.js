const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    bio: { type: String, default: '', trim: true, maxlength: 300 },
    favoritePlatform: { type: String, default: 'PC', trim: true, maxlength: 40 },
    level: { type: Number, default: 1, min: 1, max: 100 },
    checkInProgress: { type: Number, default: 0, min: 0 },
    totalCheckIns: { type: Number, default: 0, min: 0 },
    checkInStreak: { type: Number, default: 0, min: 0 },
    lastCheckInAt: { type: Date, default: null },
    unlockedFrames: { type: [String], default: [] },
    equippedFrame: { type: String, default: null },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'discord', 'steam'],
      default: 'local',
    },
    googleId: { type: String, index: { unique: true, sparse: true } },
    discordId: { type: String, index: { unique: true, sparse: true } },
    steamId: { type: String, index: { unique: true, sparse: true } },
  },
  { timestamps: true } // tự có createdAt/updatedAt, không tự thêm field ngày giờ thủ công
);

module.exports = mongoose.model('User', userSchema);

