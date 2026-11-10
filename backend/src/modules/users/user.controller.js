const userService = require('./user.service');
const { success } = require('../../utils/responseFormatter');

async function getProfile(req, res, next) {
  try {
    const profile = await userService.getProfile(req.userId);
    return success(res, profile);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const profile = await userService.updateProfile(req.userId, req.body);
    return success(res, profile);
  } catch (err) {
    next(err);
  }
}

async function getAvatarFrames(req, res, next) {
  try {
    const data = await userService.getAvatarFrames(req.userId);
    return success(res, data);
  } catch (err) {
    next(err);
  }
}

async function dailyCheckIn(req, res, next) {
  try {
    const result = await userService.dailyCheckIn(req.userId);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const result = await userService.changePassword(req.userId, req.body);
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  getAvatarFrames,
  dailyCheckIn,
  changePassword,
};
