const crypto = require('crypto');
const User = require('../users/user.model');
const env = require('../../config/env');
const { signToken } = require('../../utils/jwt');
const { toPublicUser } = require('./auth.service');

// Bộ nhớ lưu mã đổi token dùng một lần (One-Time Exchange Code)
// Code hết hạn sau 60 giây và chỉ được dùng duy nhất 1 lần
const exchangeCodes = new Map();

// Tự động dọn dẹp các exchange code quá hạn mỗi phút
setInterval(() => {
  const now = Date.now();
  for (const [code, item] of exchangeCodes.entries()) {
    if (item.expiresAt <= now) {
      exchangeCodes.delete(code);
    }
  }
}, 60000).unref();

function createExchangeCode(token, user) {
  const code = crypto.randomBytes(32).toString('hex');
  exchangeCodes.set(code, {
    token,
    user,
    expiresAt: Date.now() + 60000, // 60s TTL
  });
  return code;
}

function exchangeCodeForToken(code) {
  if (!code || typeof code !== 'string') {
    const err = new Error('Mã đổi token không hợp lệ');
    err.statusCode = 400;
    err.code = 'INVALID_EXCHANGE_CODE';
    throw err;
  }

  const record = exchangeCodes.get(code);
  if (!record || record.expiresAt <= Date.now()) {
    exchangeCodes.delete(code);
    const err = new Error('Mã đổi token đã hết hạn hoặc không tồn tại');
    err.statusCode = 400;
    err.code = 'EXCHANGE_CODE_EXPIRED';
    throw err;
  }

  // Tiêu hủy mã ngay lập tức sau khi dùng
  exchangeCodes.delete(code);
  return { token: record.token, user: record.user };
}

/**
 * Xóa dấu tiếng Việt và ký tự đặc biệt
 */
function removeVietnameseTones(str) {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

/**
 * Tạo username duy nhất từ tên cơ bản (baseName)
 * Chuẩn hóa tiếng Việt đầy đủ (Lê Quốc Đạt -> Le_Quoc_Dat)
 */
async function generateUniqueUsername(baseName) {
  const asciiName = removeVietnameseTones(baseName);
  let cleaned = asciiName
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 20);

  if (!cleaned || cleaned.length < 3) {
    cleaned = 'player_' + Math.floor(1000 + Math.random() * 9000);
  }

  let candidate = cleaned;
  let counter = 1;
  while (await User.findOne({ username: candidate })) {
    const suffix = `_${counter}`;
    candidate = `${cleaned.slice(0, 20 - suffix.length)}${suffix}`;
    counter++;
  }
  return candidate;
}

// ==========================================
// 1. GOOGLE OAUTH 2.0
// ==========================================

function getGoogleAuthUrl(state) {
  if (!env.google.clientId || !env.google.clientSecret) {
    const err = new Error('Chưa cấu hình Google OAuth credentials');
    err.statusCode = 500;
    err.code = 'GOOGLE_CONFIG_MISSING';
    throw err;
  }

  const params = new URLSearchParams({
    client_id: env.google.clientId,
    redirect_uri: env.google.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    prompt: 'select_account',
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function loginWithGoogle(code) {
  if (!code || typeof code !== 'string') {
    const err = new Error('Thiếu authorization code từ Google');
    err.statusCode = 400;
    err.code = 'MISSING_CODE';
    throw err;
  }

  // Đổi code lấy access token (timeout 10s)
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: env.google.clientId,
      client_secret: env.google.clientSecret,
      redirect_uri: env.google.callbackUrl,
      grant_type: 'authorization_code',
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    console.error('[Google Token Error]', errorBody);
    const err = new Error('Đổi token Google thất bại');
    err.statusCode = 401;
    err.code = 'GOOGLE_AUTH_FAILED';
    throw err;
  }

  const tokenData = await tokenRes.json();

  // Lấy user info
  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    signal: AbortSignal.timeout(10000),
  });

  if (!userInfoRes.ok) {
    const errorBody = await userInfoRes.text();
    console.error('[Google UserInfo Error]', errorBody);
    const err = new Error('Không thể lấy thông tin người dùng từ Google');
    err.statusCode = 401;
    err.code = 'GOOGLE_USERINFO_FAILED';
    throw err;
  }

  const userInfo = await userInfoRes.json();
  const { id: googleId, email, name, picture, verified_email, email_verified } = userInfo;

  // Chỉ chấp nhận email nếu Google xác nhận đã verified
  const isEmailVerified = Boolean(verified_email || email_verified);
  const verifiedEmail = isEmailVerified && email ? email.trim().toLowerCase() : null;

  // 1. Tìm user theo googleId
  let user = await User.findOne({ googleId });

  if (!user) {
    // 2. Nếu chưa có user theo googleId, kiểm tra xem email đã bị tài khoản khác sử dụng chưa
    if (verifiedEmail) {
      const existingEmailUser = await User.findOne({ email: verifiedEmail });
      if (existingEmailUser) {
        // Chống chiếm đoạt tài khoản: KHÔNG tự động liên kết nếu chưa xác minh
        const err = new Error('Email này đã được đăng ký bằng phương thức khác');
        err.statusCode = 409;
        err.code = 'EMAIL_ALREADY_IN_USE';
        throw err;
      }
    }

    // 3. Tạo user mới
    const rawUsername = name || (verifiedEmail ? verifiedEmail.split('@')[0] : `google_${googleId.slice(-6)}`);
    const username = await generateUniqueUsername(rawUsername);
    const finalEmail = verifiedEmail || `google_${googleId}@google.pixellog.local`;

    user = await User.create({
      username,
      email: finalEmail,
      googleId,
      avatarUrl: picture || null,
      authProvider: 'google',
      passwordHash: null,
    });
  }

  const token = signToken({ userId: user._id });
  return { token, user: toPublicUser(user) };
}

// ==========================================
// 2. DISCORD OAUTH 2.0
// ==========================================

function getDiscordAuthUrl(state) {
  if (!env.discord.clientId || !env.discord.clientSecret) {
    const err = new Error('Chưa cấu hình Discord OAuth credentials');
    err.statusCode = 500;
    err.code = 'DISCORD_CONFIG_MISSING';
    throw err;
  }

  const params = new URLSearchParams({
    client_id: env.discord.clientId,
    redirect_uri: env.discord.callbackUrl,
    response_type: 'code',
    scope: 'identify email',
    prompt: 'consent',
    state,
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

async function loginWithDiscord(code) {
  if (!code || typeof code !== 'string') {
    const err = new Error('Thiếu authorization code từ Discord');
    err.statusCode = 400;
    err.code = 'MISSING_CODE';
    throw err;
  }

  // Đổi code lấy token
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.discord.clientId,
      client_secret: env.discord.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: env.discord.callbackUrl,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    console.error('[Discord Token Error]', errorBody);
    const err = new Error('Đổi token Discord thất bại');
    err.statusCode = 401;
    err.code = 'DISCORD_AUTH_FAILED';
    throw err;
  }

  const tokenData = await tokenRes.json();

  // Lấy thông tin user
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    signal: AbortSignal.timeout(10000),
  });

  if (!userRes.ok) {
    const errorBody = await userRes.text();
    console.error('[Discord UserInfo Error]', errorBody);
    const err = new Error('Không thể lấy thông tin người dùng từ Discord');
    err.statusCode = 401;
    err.code = 'DISCORD_USERINFO_FAILED';
    throw err;
  }

  const discordUser = await userRes.json();
  const { id: discordId, username: discordUsername, global_name, email, avatar, verified } = discordUser;

  const isEmailVerified = Boolean(verified);
  const verifiedEmail = isEmailVerified && email ? email.trim().toLowerCase() : null;

  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
    : null;

  // 1. Tìm user theo discordId
  let user = await User.findOne({ discordId });

  if (!user) {
    // 2. Kiểm tra xung đột email
    if (verifiedEmail) {
      const existingEmailUser = await User.findOne({ email: verifiedEmail });
      if (existingEmailUser) {
        const err = new Error('Email này đã được đăng ký bằng phương thức khác');
        err.statusCode = 409;
        err.code = 'EMAIL_ALREADY_IN_USE';
        throw err;
      }
    }

    // 3. Tạo user mới
    const baseName = global_name || discordUsername;
    const username = await generateUniqueUsername(baseName);
    const finalEmail = verifiedEmail || `discord_${discordId}@discord.pixellog.local`;

    user = await User.create({
      username,
      email: finalEmail,
      discordId,
      avatarUrl,
      authProvider: 'discord',
      passwordHash: null,
    });
  }

  const token = signToken({ userId: user._id });
  return { token, user: toPublicUser(user) };
}

// ==========================================
// 3. STEAM OPENID 2.0
// ==========================================

function getSteamAuthUrl(state) {
  // Gắn state vào return_to để Steam chuyển hướng lại kèm state
  const returnToWithState = new URL(env.steam.callbackUrl);
  if (state) {
    returnToWithState.searchParams.set('state', state);
  }

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnToWithState.toString(),
    'openid.realm': env.steam.realm,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return `https://steamcommunity.com/openid/login?${params.toString()}`;
}

async function loginWithSteam(queryParams, expectedState) {
  if (!queryParams || typeof queryParams !== 'object') {
    const err = new Error('Thiếu tham số xác thực từ Steam');
    err.statusCode = 400;
    err.code = 'MISSING_STEAM_PARAMS';
    throw err;
  }

  // 1. Kiểm tra tham số không được là array/object
  for (const [key, value] of Object.entries(queryParams)) {
    if (typeof value !== 'string') {
      const err = new Error(`Tham số ${key} không hợp lệ`);
      err.statusCode = 400;
      err.code = 'INVALID_PARAM_TYPE';
      throw err;
    }
  }

  // 2. Kiểm tra openid.mode
  if (queryParams['openid.mode'] !== 'id_res') {
    const err = new Error('Người dùng đã hủy xác thực Steam hoặc phản hồi không hợp lệ');
    err.statusCode = 400;
    err.code = 'STEAM_AUTH_CANCELLED';
    throw err;
  }

  // 3. Kiểm tra openid.op_endpoint đúng là Steam
  if (queryParams['openid.op_endpoint'] !== 'https://steamcommunity.com/openid/login') {
    const err = new Error('Nhà cung cấp OpenID không hợp lệ');
    err.statusCode = 400;
    err.code = 'INVALID_OPENID_ENDPOINT';
    throw err;
  }

  // 4. Kiểm tra openid.return_to phải khớp với STEAM_CALLBACK_URL của site
  const returnTo = queryParams['openid.return_to'] || '';
  if (!returnTo.startsWith(env.steam.callbackUrl)) {
    const err = new Error('Địa chỉ return_to của Steam không khớp với trang web');
    err.statusCode = 400;
    err.code = 'INVALID_RETURN_TO';
    throw err;
  }

  // 5. Kiểm tra state đối chiếu chống CSRF
  if (expectedState) {
    const urlObj = new URL(returnTo);
    const returnState = urlObj.searchParams.get('state') || queryParams['state'];
    if (!returnState || returnState !== expectedState) {
      const err = new Error('State xác thực không khớp hoặc đã hết hạn');
      err.statusCode = 403;
      err.code = 'INVALID_STATE';
      throw err;
    }
  }

  // 6. Gửi xác thực hai chiều lại với Steam Server (check_authentication)
  const validationParams = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    if (key.startsWith('openid.')) {
      validationParams.append(key, value);
    }
  }
  validationParams.set('openid.mode', 'check_authentication');

  const verifyRes = await fetch('https://steamcommunity.com/openid/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: validationParams.toString(),
    signal: AbortSignal.timeout(10000),
  });

  if (!verifyRes.ok) {
    const errorBody = await verifyRes.text();
    console.error('[Steam Verify Error]', errorBody);
    const err = new Error('Không thể kết nối đến Steam OpenID Provider');
    err.statusCode = 502;
    err.code = 'STEAM_PROVIDER_ERROR';
    throw err;
  }

  const verifyText = await verifyRes.text();
  if (!verifyText.includes('is_valid:true')) {
    console.error('[Steam Invalid Signature]', verifyText);
    const err = new Error('Chữ ký OpenID của Steam không hợp lệ');
    err.statusCode = 401;
    err.code = 'STEAM_VERIFICATION_FAILED';
    throw err;
  }

  // 7. Trích xuất SteamID 64-bit
  const claimedId = queryParams['openid.claimed_id'] || queryParams['openid.identity'] || '';
  const match = claimedId.match(/\/id\/(\d{15,25})$/);
  if (!match || !match[1]) {
    const err = new Error('Không tìm thấy SteamID hợp lệ từ phản hồi');
    err.statusCode = 400;
    err.code = 'STEAM_ID_NOT_FOUND';
    throw err;
  }

  const steamId = match[1];
  let personaName = `Steam_${steamId.slice(-6)}`;
  let avatarUrl = null;

  // Lấy thêm thông tin từ Steam Web API nếu có key
  if (env.steam.apiKey) {
    try {
      const summaryRes = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${env.steam.apiKey}&steamids=${steamId}`,
        { signal: AbortSignal.timeout(10000) }
      );
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        const player = summaryData?.response?.players?.[0];
        if (player) {
          if (player.personaname) personaName = player.personaname;
          if (player.avatarfull) avatarUrl = player.avatarfull;
        }
      } else {
        console.warn('[Steam Web API Warning] Status not OK:', summaryRes.status);
      }
    } catch (e) {
      console.warn('[Steam Web API Warning] Failed to fetch player summary:', e.message);
    }
  }

  // 8. Tìm hoặc tạo user
  let user = await User.findOne({ steamId });

  if (user) {
    if (!user.avatarUrl && avatarUrl) {
      user.avatarUrl = avatarUrl;
      await user.save();
    }
  } else {
    const username = await generateUniqueUsername(personaName);
    const email = `steam_${steamId}@steam.pixellog.local`;
    user = await User.create({
      username,
      email,
      steamId,
      avatarUrl,
      authProvider: 'steam',
      passwordHash: null,
    });
  }

  const token = signToken({ userId: user._id });
  return { token, user: toPublicUser(user) };
}

module.exports = {
  createExchangeCode,
  exchangeCodeForToken,
  getGoogleAuthUrl,
  loginWithGoogle,
  getDiscordAuthUrl,
  loginWithDiscord,
  getSteamAuthUrl,
  loginWithSteam,
  generateUniqueUsername,
};
