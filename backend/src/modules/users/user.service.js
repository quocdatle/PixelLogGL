const bcrypt = require('bcrypt');
const User = require('./user.model');
const Wallet = require('../economy/wallet.model');
const economyService = require('../economy/economy.service');
const { toPublicUser } = require('../auth/auth.service');
const {
  AVATAR_FRAMES,
  FRAME_MAP,
  MAX_LEVEL,
  ensureMilestoneFrames,
  getRequiredCheckIns,
} = require('./levelSystem');

function createError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

async function getProfile(userId) {
  const [user, wallet] = await Promise.all([
    User.findById(userId),
    Wallet.findOne({ userId }).select('balance lastDailyReward'),
  ]);

  if (!user) {
    throw createError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
  }

  let modified = false;
  if (!user.lastCheckInAt && wallet?.lastDailyReward) {
    user.lastCheckInAt = wallet.lastDailyReward;
    modified = true;
  }

  const newlyUnlocked = ensureMilestoneFrames(user);
  if (newlyUnlocked.length > 0) {
    modified = true;
  }

  if (modified) {
    await user.save();
  }

  const publicProfile = toPublicUser(user);
  return {
    ...publicProfile,
    coinBalance: wallet ? wallet.balance : Wallet.INITIAL_BALANCE,
  };
}

async function updateProfile(userId, body = {}) {
  const user = await User.findById(userId);
  if (!user) {
    throw createError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
  }

  ensureMilestoneFrames(user);

  if (body.avatarUrl !== undefined) {
    if (body.avatarUrl === null || body.avatarUrl === '') {
      user.avatarUrl = null;
    } else if (typeof body.avatarUrl === 'string' && /^https?:\/\/.+/i.test(body.avatarUrl.trim())) {
      user.avatarUrl = body.avatarUrl.trim();
    } else {
      throw createError('avatarUrl phải là đường dẫn http/https hợp lệ hoặc rỗng', 400, 'INVALID_AVATAR_URL');
    }
  }

  if (body.bio !== undefined) {
    if (typeof body.bio !== 'string' || body.bio.length > 300) {
      throw createError('Tiểu sử tối đa 300 ký tự', 400, 'VALIDATION_ERROR');
    }
    user.bio = body.bio.trim();
  }

  if (body.favoritePlatform !== undefined) {
    if (typeof body.favoritePlatform !== 'string' || body.favoritePlatform.length > 40) {
      throw createError('Nền tảng yêu thích tối đa 40 ký tự', 400, 'VALIDATION_ERROR');
    }
    user.favoritePlatform = body.favoritePlatform.trim() || 'PC';
  }

  if (body.equippedFrame !== undefined) {
    if (body.equippedFrame === null || body.equippedFrame === '') {
      user.equippedFrame = null;
    } else {
      if (!FRAME_MAP.has(body.equippedFrame)) {
        throw createError('Khung avatar không tồn tại', 400, 'INVALID_FRAME');
      }
      if (!user.unlockedFrames.includes(body.equippedFrame)) {
        throw createError('Bạn chưa mở khóa khung avatar này', 403, 'FRAME_NOT_UNLOCKED');
      }
      user.equippedFrame = body.equippedFrame;
    }
  }

  await user.save();
  return toPublicUser(user);
}

async function getAvatarFrames(userId) {
  const user = await User.findById(userId);
  if (!user) {
    throw createError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
  }

  const newlyUnlocked = ensureMilestoneFrames(user);
  if (newlyUnlocked.length > 0) {
    await user.save();
  }

  const unlockedSet = new Set(user.unlockedFrames || []);
  const frames = AVATAR_FRAMES.map((frame) => ({
    ...frame,
    unlocked: unlockedSet.has(frame.id),
    equipped: user.equippedFrame === frame.id,
  }));

  return {
    level: user.level || 1,
    maxLevel: MAX_LEVEL,
    checkInProgress: user.checkInProgress || 0,
    requiredCheckIns: getRequiredCheckIns(user.level || 1),
    equippedFrame: user.equippedFrame || null,
    frames,
  };
}

async function dailyCheckIn(userId) {
  return economyService.claimDailyReward(userId);
}

async function changePassword(userId, { oldPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) {
    throw createError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
  }

  if (!user.passwordHash) {
    throw createError('Tài khoản liên kết mạng xã hội chưa có mật khẩu', 400, 'NO_PASSWORD_SET');
  }

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    throw createError('Mật khẩu cũ không đúng', 400, 'WRONG_PASSWORD');
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { message: 'Đổi mật khẩu thành công' };
}

module.exports = {
  getProfile,
  updateProfile,
  getAvatarFrames,
  dailyCheckIn,
  changePassword,
};
