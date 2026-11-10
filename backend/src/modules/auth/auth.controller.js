const crypto = require('crypto');
const authService = require('./auth.service');
const oauthService = require('./oauth.service');
const env = require('../../config/env');
const { success } = require('../../utils/responseFormatter');

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: 10 * 60 * 1000, // 10 phút
};

function generateAndSetState(res) {
  const state = crypto.randomBytes(32).toString('hex');
  res.cookie('oauth_state', state, COOKIE_OPTIONS);
  return state;
}

function mapErrorCode(err, defaultProviderCode) {
  if (err.code === 'EMAIL_ALREADY_IN_USE') return 'email_in_use';
  if (err.code === 'INVALID_STATE') return 'invalid_state';
  if (err.code === 'GOOGLE_CONFIG_MISSING' || err.code === 'DISCORD_CONFIG_MISSING') return 'config_missing';
  if (err.code === 'STEAM_AUTH_CANCELLED') return 'auth_cancelled';
  return defaultProviderCode;
}

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
// EXCHANGE CODE (Đổi mã một lần lấy Token JWT)
// ==========================================

async function exchangeToken(req, res, next) {
  try {
    const { code } = req.body;
    const result = oauthService.exchangeCodeForToken(code);
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
    const state = generateAndSetState(res);
    const url = oauthService.getGoogleAuthUrl(state);
    return res.redirect(url);
  } catch (err) {
    console.error('[Google Redirect Error]', err);
    res.clearCookie('oauth_state');
    return res.redirect(`${env.clientUrl}/login?error=config_missing`);
  }
}

async function googleCallback(req, res, next) {
  try {
    const { code, state, error } = req.query;
    const expectedState = req.cookies?.oauth_state;
    res.clearCookie('oauth_state');

    if (error) {
      console.warn('[Google Auth Cancelled / Error]', error);
      return res.redirect(`${env.clientUrl}/login?error=auth_cancelled`);
    }

    if (!state || typeof state !== 'string' || state !== expectedState) {
      console.error('[Google Auth CSRF Error] State mismatch');
      return res.redirect(`${env.clientUrl}/login?error=invalid_state`);
    }

    const result = await oauthService.loginWithGoogle(code);
    const exchangeCode = oauthService.createExchangeCode(result.token, result.user);
    return res.redirect(`${env.clientUrl}/auth/callback?code=${exchangeCode}`);
  } catch (err) {
    console.error('[Google Callback Error]', err);
    const safeError = mapErrorCode(err, 'google_failed');
    return res.redirect(`${env.clientUrl}/login?error=${safeError}`);
  }
}

// ==========================================
// DISCORD OAUTH
// ==========================================

function discordRedirect(req, res, next) {
  try {
    const state = generateAndSetState(res);
    const url = oauthService.getDiscordAuthUrl(state);
    return res.redirect(url);
  } catch (err) {
    console.error('[Discord Redirect Error]', err);
    res.clearCookie('oauth_state');
    return res.redirect(`${env.clientUrl}/login?error=config_missing`);
  }
}

async function discordCallback(req, res, next) {
  try {
    const { code, state, error } = req.query;
    const expectedState = req.cookies?.oauth_state;
    res.clearCookie('oauth_state');

    if (error) {
      console.warn('[Discord Auth Cancelled / Error]', error);
      return res.redirect(`${env.clientUrl}/login?error=auth_cancelled`);
    }

    if (!state || typeof state !== 'string' || state !== expectedState) {
      console.error('[Discord Auth CSRF Error] State mismatch');
      return res.redirect(`${env.clientUrl}/login?error=invalid_state`);
    }

    const result = await oauthService.loginWithDiscord(code);
    const exchangeCode = oauthService.createExchangeCode(result.token, result.user);
    return res.redirect(`${env.clientUrl}/auth/callback?code=${exchangeCode}`);
  } catch (err) {
    console.error('[Discord Callback Error]', err);
    const safeError = mapErrorCode(err, 'discord_failed');
    return res.redirect(`${env.clientUrl}/login?error=${safeError}`);
  }
}

// ==========================================
// STEAM OPENID
// ==========================================

function steamRedirect(req, res, next) {
  try {
    const state = generateAndSetState(res);
    const url = oauthService.getSteamAuthUrl(state);
    return res.redirect(url);
  } catch (err) {
    console.error('[Steam Redirect Error]', err);
    res.clearCookie('oauth_state');
    return res.redirect(`${env.clientUrl}/login?error=config_missing`);
  }
}

async function steamCallback(req, res, next) {
  try {
    const expectedState = req.cookies?.oauth_state;
    res.clearCookie('oauth_state');

    const result = await oauthService.loginWithSteam(req.query, expectedState);
    const exchangeCode = oauthService.createExchangeCode(result.token, result.user);
    return res.redirect(`${env.clientUrl}/auth/callback?code=${exchangeCode}`);
  } catch (err) {
    console.error('[Steam Callback Error]', err);
    const safeError = mapErrorCode(err, 'steam_failed');
    return res.redirect(`${env.clientUrl}/login?error=${safeError}`);
  }
}

module.exports = {
  register,
  login,
  exchangeToken,
  googleRedirect,
  googleCallback,
  discordRedirect,
  discordCallback,
  steamRedirect,
  steamCallback,
};
