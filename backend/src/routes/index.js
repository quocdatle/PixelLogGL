const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');
const gameRoutes = require('../modules/games/game.routes');
const libraryRoutes = require('../modules/library/library.routes');
const analyticsRoutes = require('../modules/analytics/analytics.routes');
// 1. Thêm import route của Advisor
const advisorRoutes = require('../modules/advisor/advisor.routes');

const router = express.Router();

// Điểm duy nhất gom route mọi module — thêm module mới ở Sprint sau
// chỉ cần thêm 1 dòng router.use() ở đây, không sửa route cũ.
router.get('/health', (req, res) => res.json({ success: true, message: 'Server đang chạy OK' }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/games', gameRoutes);
router.use('/user-games', libraryRoutes);
router.use('/analytics', analyticsRoutes);
// 2. Đăng ký endpoint /api/advisor
router.use('/advisor', advisorRoutes);

module.exports = router;