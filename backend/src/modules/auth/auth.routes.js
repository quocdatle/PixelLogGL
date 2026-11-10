const express = require('express');
const rateLimit = require('express-rate-limit');
const authController = require('./auth.controller');
const validateBody = require('../../middlewares/validate.middleware');

const router = express.Router();

// Giới hạn tần suất gọi API auth để chống brute-force và spam
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 50, // tối đa 50 requests mỗi 15 phút cho mỗi IP
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu từ địa chỉ IP này, vui lòng thử lại sau 15 phút',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authLimiter);

// Local Auth
router.post('/register', validateBody(['username', 'email', 'password']), authController.register);
router.post('/login', validateBody(['email', 'password']), authController.login);

// One-time code exchange
router.post('/exchange', validateBody(['code']), authController.exchangeToken);

// Google OAuth 2.0
router.get('/google', authController.googleRedirect);
router.get('/google/callback', authController.googleCallback);

// Discord OAuth 2.0
router.get('/discord', authController.discordRedirect);
router.get('/discord/callback', authController.discordCallback);

// Steam OpenID 2.0
router.get('/steam', authController.steamRedirect);
router.get('/steam/callback', authController.steamCallback);

module.exports = router;
