const express = require('express');
const router = express.Router();
const advisorController = require('./advisor.controller');

// POST /api/advisor/chat -> Gửi tin nhắn tư vấn
router.post('/chat', advisorController.handleChat);

// GET /api/advisor/history -> Lấy lịch sử tư vấn
router.get('/history', advisorController.getHistory);

module.exports = router;