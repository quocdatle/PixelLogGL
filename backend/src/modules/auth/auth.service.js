const bcrypt = require('bcrypt');
const User = require('../users/user.model');
const { signToken } = require('../../utils/jwt');

const SALT_ROUNDS = 10;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function register({ username, email, password }) {
  const normalizedEmail = (email || '').trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalizedEmail) || normalizedEmail.endsWith('.pixellog.local')) {
    const err = new Error('Email không hợp lệ');
    err.statusCode = 400;
    err.code = 'INVALID_EMAIL';
    throw err;
  }

  const existing = await User.findOne({ $or: [{ email: normalizedEmail }, { username }] });
  if (existing) {
    const field = existing.email === normalizedEmail ? 'Email' : 'Username';
    const err = new Error(`${field} đã được sử dụng`);
    err.statusCode = 409;
    err.code = 'ALREADY_EXISTS';
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, email: normalizedEmail, passwordHash });

  const token = signToken({ userId: user._id });
  return { token, user: toPublicUser(user) };
}

async function login({ email, password }) {
  const identifier = email ? email.trim() : '';
  const user = await User.findOne({
    $or: [{ email: identifier.toLowerCase() }, { username: identifier }],
  });
  if (!user || !user.passwordHash) {
    throw unauthorized();
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw unauthorized();
  }

  const token = signToken({ userId: user._id });
  return { token, user: toPublicUser(user) };
}

function unauthorized() {
  const err = new Error('Email hoặc mật khẩu không đúng');
  err.statusCode = 401;
  err.code = 'INVALID_CREDENTIALS';
  return err;
}

// Không bao giờ trả passwordHash về cho frontend
function toPublicUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    authProvider: user.authProvider || 'local',
  };
}

module.exports = { register, login, toPublicUser };
