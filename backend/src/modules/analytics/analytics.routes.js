const express = require('express');
const requireAuth = require('../../middlewares/auth.middleware'); // module.exports = requireAuth
const analyticsController = require('./analytics.controller');

const router = express.Router();

// Mọi thống kê đều theo người dùng đang đăng nhập (req.userId do requireAuth gắn vào).
router.use(requireAuth);

router.get('/overview', analyticsController.getOverview);
router.get('/genres', analyticsController.getGenreStats);
router.get('/playtime', analyticsController.getPlaytimeStats);
router.get('/top-games', analyticsController.getTopGames);

module.exports = router;