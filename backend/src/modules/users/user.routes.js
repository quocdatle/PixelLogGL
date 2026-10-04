const express = require('express');
const userController = require('./user.controller');
const requireAuth = require('../../middlewares/auth.middleware');
const validateBody = require('../../middlewares/validate.middleware');

const router = express.Router();

// Tất cả route ở đây đều cần đăng nhập (requireAuth chạy trước controller)
router.get('/me', requireAuth, userController.getProfile);
router.patch('/me', requireAuth, userController.updateProfile);
router.patch('/me/password', requireAuth, validateBody(['oldPassword', 'newPassword']), userController.changePassword);

module.exports = router;
