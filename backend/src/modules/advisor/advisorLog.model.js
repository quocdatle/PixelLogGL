const mongoose = require('mongoose');

const advisorLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Để false nếu cho phép khách (chưa đăng nhập) nhắn tin
    },
    userMessage: {
      type: String,
      required: true,
      trim: true,
    },
    botReply: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Tự động tạo createdAt và updatedAt
  }
);

module.exports = mongoose.model('AdvisorLog', advisorLogSchema);