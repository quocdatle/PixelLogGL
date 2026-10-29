const gameService = require('./game.service');
const { success } = require('../../utils/responseFormatter');

async function searchGames(req, res, next) {
  try {
    const { search, page, pageSize, genres, ordering } = req.query;
    const result = await gameService.search({ search, page, pageSize, genres, ordering });
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function listGenres(req, res, next) {
  try {
    const genres = await gameService.listGenres();
    return success(res, genres);
  } catch (err) {
    next(err);
  }
}

async function getGame(req, res, next) {
  try {
    const game = await gameService.getByRawgId(req.params.rawgId);
    return success(res, game);
  } catch (err) {
    next(err);
  }
}

module.exports = { searchGames, listGenres, getGame };
