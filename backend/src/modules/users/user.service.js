const bcrypt = require('bcrypt');
const User = require('./user.model');
const { toPublicUser } = require('../auth/auth.service');

async function getProfile(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng');
    err.statusCode = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }
  return toPublicUser(user);
}

async function updateProfile(userId, { avatarUrl }) {
  const user = await User.findByIdAndUpdate(userId, { avatarUrl }, { new: true });
  if (!user) {
    const err = new Error('Không tìm thấy người dùng');
    err.statusCode = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }
  return toPublicUser(user);
}

async function changePassword(userId, { oldPassword, newPassword }) {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Không tìm thấy người dùng');
    err.statusCode = 404;
    err.code = 'USER_NOT_FOUND';
    throw err;
  }

  const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
  if (!isMatch) {
    const err = new Error('Mật khẩu cũ không đúng');
    err.statusCode = 400;
    err.code = 'WRONG_PASSWORD';
    throw err;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return { message: 'Đổi mật khẩu thành công' };
}

module.exports = { getProfile, updateProfile, changePassword };
