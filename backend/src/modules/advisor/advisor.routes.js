const express = require('express');
const rateLimit = require('express-rate-limit');
const advisorController = require('./advisor.controller');
const requireAuth = require('../../middlewares/auth.middleware');
const { error } = require('../../utils/responseFormatter');

const router = express.Router();

// Bắt buộc xác thực cho toàn bộ endpoint của Advisor (tránh lộ lịch sử & bảo vệ quota API)
router.use(requireAuth);

// Giới hạn tần suất gọi AI theo từng người dùng (15 requests / phút)
const chatRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  keyGenerator: (req) => req.userId || req.ip,
  handler: (req, res) => {
    return error(
      res,
      'Bạn đang gửi tin nhắn quá nhanh. Vui lòng đợi một lát trước khi tiếp tục nhé!',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/advisor/chat -> Gửi tin nhắn tư vấn game
router.post('/chat', chatRateLimiter, advisorController.handleChat);

// GET /api/advisor/history -> Lấy lịch sử tư vấn của user hiện tại
router.get('/history', advisorController.getHistory);

// DELETE /api/advisor/history -> Xóa lịch sử / bắt đầu hội thoại mới
router.delete('/history', advisorController.clearHistory);

module.exports = router;
