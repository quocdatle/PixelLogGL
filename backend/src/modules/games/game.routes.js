const express = require('express');
const gameController = require('./game.controller');
const requireAuth = require('../../middlewares/auth.middleware');

const router = express.Router();

// Bắt buộc đăng nhập để người lạ không "đốt" quota RAWG API của nhóm
router.get('/search', requireAuth, gameController.searchGames);
router.get('/genres', requireAuth, gameController.listGenres);
router.get('/:rawgId', requireAuth, gameController.getGame);

module.exports = router;
