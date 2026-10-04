const bcrypt = require('bcrypt');
const User = require('../users/user.model');
const { signToken } = require('../../utils/jwt');

const SALT_ROUNDS = 10;

async function register({ username, email, password }) {
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    const field = existing.email === email ? 'Email' : 'Username';
    const err = new Error(`${field} đã được sử dụng`);
    err.statusCode = 409;
    err.code = 'ALREADY_EXISTS';
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, email, passwordHash });

  const token = signToken({ userId: user._id });
  return { token, user: toPublicUser(user) };
}

async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
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
  };
}

module.exports = { register, login, toPublicUser };
