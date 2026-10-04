const authService = require('./auth.service');
const { success } = require('../../utils/responseFormatter');

async function register(req, res, next) {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register({ username, email, password });
    return success(res, result, 201);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
