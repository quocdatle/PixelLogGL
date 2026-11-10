const authService = require('./auth.service');
const oauthService = require('./oauth.service');
const env = require('../../config/env');
const { success } = require('../../utils/responseFormatter');

// ==========================================
// TRUYỀN THỐNG (Local register / login)
// ==========================================

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

// ==========================================
// GOOGLE OAUTH
// ==========================================

function googleRedirect(req, res, next) {
  try {
    const url = oauthService.getGoogleAuthUrl();
    return res.redirect(url);
  } catch (err) {
    const clientUrl = env.clientUrl || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
}

async function googleCallback(req, res, next) {
  const clientUrl = env.clientUrl || 'http://localhost:5173';
  try {
    const { code, error } = req.query;
    if (error) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error)}`);
    }
    const result = await oauthService.loginWithGoogle(code);
    return res.redirect(`${clientUrl}/login?token=${result.token}`);
  } catch (err) {
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
}

async function googleLoginApi(req, res, next) {
  try {
    const { code } = req.body;
    const result = await oauthService.loginWithGoogle(code);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// DISCORD OAUTH
// ==========================================

function discordRedirect(req, res, next) {
  try {
    const url = oauthService.getDiscordAuthUrl();
    return res.redirect(url);
  } catch (err) {
    const clientUrl = env.clientUrl || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
}

async function discordCallback(req, res, next) {
  const clientUrl = env.clientUrl || 'http://localhost:5173';
  try {
    const { code, error } = req.query;
    if (error) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error)}`);
    }
    const result = await oauthService.loginWithDiscord(code);
    return res.redirect(`${clientUrl}/login?token=${result.token}`);
  } catch (err) {
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
}

async function discordLoginApi(req, res, next) {
  try {
    const { code } = req.body;
    const result = await oauthService.loginWithDiscord(code);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// STEAM OPENID
// ==========================================

function steamRedirect(req, res, next) {
  try {
    const url = oauthService.getSteamAuthUrl();
    return res.redirect(url);
  } catch (err) {
    const clientUrl = env.clientUrl || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
}

async function steamCallback(req, res, next) {
  const clientUrl = env.clientUrl || 'http://localhost:5173';
  try {
    const result = await oauthService.loginWithSteam(req.query);
    return res.redirect(`${clientUrl}/login?token=${result.token}`);
  } catch (err) {
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(err.message)}`);
  }
}

async function steamLoginApi(req, res, next) {
  try {
    const params = Object.keys(req.body).length > 0 ? req.body : req.query;
    const result = await oauthService.loginWithSteam(params);
    return success(res, result, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  googleRedirect,
  googleCallback,
  googleLoginApi,
  discordRedirect,
  discordCallback,
  discordLoginApi,
  steamRedirect,
  steamCallback,
  steamLoginApi,
};
