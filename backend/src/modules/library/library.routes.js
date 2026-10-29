const express = require('express');
const libraryController = require('./library.controller');
const requireAuth = require('../../middlewares/auth.middleware');
const validateBody = require('../../middlewares/validate.middleware');

const router = express.Router();

// Toàn bộ thư viện là dữ liệu cá nhân -> mọi route đều cần đăng nhập
router.use(requireAuth);

router.get('/', libraryController.list);
router.get('/summary', libraryController.summary); // phải đặt trước '/:id'
router.post('/', validateBody(['rawgId']), libraryController.add);
router.get('/:id', libraryController.getOne);
router.patch('/:id', libraryController.update);
router.delete('/:id', libraryController.remove);
router.post('/:id/play-sessions', validateBody(['minutes']), libraryController.addPlaySession);

module.exports = router;
