const express = require('express');
const authRoutes = require('../modules/auth/auth.routes');
const userRoutes = require('../modules/users/user.routes');

const router = express.Router();

// Điểm duy nhất gom route mọi module — thêm module mới ở Sprint sau
// chỉ cần thêm 1 dòng router.use() ở đây, không sửa route cũ.
router.get('/health', (req, res) => res.json({ success: true, message: 'Server đang chạy OK' }));

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
