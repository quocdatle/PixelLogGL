const mongoose = require('mongoose');

const advisorLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sessionId: {
      type: String,
      default: 'default',
      trim: true,
    },
    userMessage: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    botReply: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index tối ưu truy vấn lịch sử theo người dùng và session
advisorLogSchema.index({ userId: 1, createdAt: -1 });
advisorLogSchema.index({ userId: 1, sessionId: 1, createdAt: -1 });

module.exports = mongoose.model('AdvisorLog', advisorLogSchema);
