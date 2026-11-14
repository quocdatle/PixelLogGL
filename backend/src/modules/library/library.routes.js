const express = require('express');
const libraryController = require('./library.controller');
const requireAuth = require('../../middlewares/auth.middleware');
const validateBody = require('../../middlewares/validate.middleware');
const { error } = require('../../utils/responseFormatter');

const router = express.Router();

// Toàn bộ thư viện là dữ liệu cá nhân -> mọi route đều cần đăng nhập
router.use(requireAuth);

function validateAddGame(req, res, next) {
  if (!req.body.igdbId && !req.body.rawgId && !req.body.gameId) {
    return error(res, 'Thiếu trường bắt buộc: igdbId', 400, 'MISSING_FIELDS');
  }
  next();
}

router.get('/', libraryController.list);
router.get('/summary', libraryController.summary); // phải đặt trước '/:id'
router.post('/', validateAddGame, libraryController.add);
router.get('/:id', libraryController.getOne);
router.patch('/:id', libraryController.update);
router.delete('/:id', libraryController.remove);
router.post('/:id/play-sessions', validateBody(['minutes']), libraryController.addPlaySession);

module.exports = router;
