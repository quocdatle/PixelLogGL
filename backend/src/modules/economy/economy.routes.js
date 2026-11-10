const express = require('express');
const requireAuth = require('../../middlewares/auth.middleware');
const validateBody = require('../../middlewares/validate.middleware');
const economyController = require('./economy.controller');

const router = express.Router();

// Danh sách các loại rương & tỷ lệ (công khai)
router.get('/cases', economyController.getCases);

// Ticker tin trúng thưởng gần nhất (công khai)
router.get('/recent-drops', economyController.getRecentDrops);

// Các endpoint yêu cầu xác thực người dùng
router.get('/wallet', requireAuth, economyController.getWallet);
router.post('/daily-reward', requireAuth, economyController.claimDailyReward);
router.post('/open', requireAuth, validateBody(['caseId']), economyController.openCase);
router.get('/inventory', requireAuth, economyController.getInventory);
router.post('/sell', requireAuth, validateBody(['inventoryId']), economyController.sellItem);
router.get('/history', requireAuth, economyController.getCaseHistory);

module.exports = router;
