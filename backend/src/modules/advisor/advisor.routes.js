const express = require('express');
const advisorController = require('./advisor.controller');
const { verifyToken } = require('../../utils/jwt');

const router = express.Router();

// Middleware gắn userId nếu request có kèm Bearer token (không bắt buộc)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = verifyToken(authHeader.split(' ')[1]);
      req.userId = decoded.userId;
    } catch {
      // Token sai hoặc hết hạn thì bỏ qua, coi như khách vãng lai
    }
  }
  next();
}

// POST /api/advisor/chat -> Gửi tin nhắn tư vấn game
router.post('/chat', optionalAuth, advisorController.handleChat);

// GET /api/advisor/history -> Lấy lịch sử tư vấn
router.get('/history', optionalAuth, advisorController.getHistory);

module.exports = router;
