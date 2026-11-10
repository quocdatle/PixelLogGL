const economyService = require('./economy.service');
const { success } = require('../../utils/responseFormatter');

// GET /api/economy/wallet
async function getWallet(req, res, next) {
  try {
    const data = await economyService.getWallet(req.userId);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

// POST /api/economy/daily-reward
async function claimDailyReward(req, res, next) {
  try {
    const data = await economyService.claimDailyReward(req.userId);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

// GET /api/economy/cases
async function getCases(req, res, next) {
  try {
    const data = await economyService.getCases();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

// POST /api/economy/open
async function openCase(req, res, next) {
  try {
    const { caseId } = req.body;
    const data = await economyService.openCase(req.userId, { caseId });
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

// GET /api/economy/inventory
async function getInventory(req, res, next) {
  try {
    const { rarity, type, search, sort, page, limit } = req.query;
    const data = await economyService.getInventory(req.userId, {
      rarity,
      type,
      search,
      sort,
      page,
      limit,
    });
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

// POST /api/economy/sell
async function sellItem(req, res, next) {
  try {
    const { inventoryId, quantity } = req.body;
    const data = await economyService.sellItem(req.userId, { inventoryId, quantity });
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

// GET /api/economy/history
async function getCaseHistory(req, res, next) {
  try {
    const { limit } = req.query;
    const data = await economyService.getCaseHistory(req.userId, { limit });
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

// GET /api/economy/recent-drops
async function getRecentDrops(req, res, next) {
  try {
    const { limit } = req.query;
    const data = await economyService.getRecentDrops({ limit });
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getWallet,
  claimDailyReward,
  getCases,
  openCase,
  getInventory,
  sellItem,
  getCaseHistory,
  getRecentDrops,
};
