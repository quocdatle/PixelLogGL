const User = require('../users/user.model');
const env = require('../../config/env');
const { signToken } = require('../../utils/jwt');
const { toPublicUser } = require('./auth.service');

/**
 * Tạo username duy nhất từ tên cơ bản (baseName)
 * Đảm bảo không trùng lặp với user đã có trong DB
 */
async function generateUniqueUsername(baseName) {
  let cleaned = (baseName || 'player')
    .toString()
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

function getGoogleAuthUrl() {
  if (!env.google.clientId) {
    const err = new Error('Chưa cấu hình GOOGLE_CLIENT_ID trong biến môi trường');
    err.statusCode = 500;
    err.code = 'GOOGLE_CONFIG_MISSING';
    throw err;
  }

  const params = new URLSearchParams({
    client_id: env.google.clientId,
    redirect_uri: env.google.callbackUrl,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

async function loginWithGoogle(code) {
  if (!code) {
    const err = new Error('Thiếu authorization code từ Google');
    err.statusCode = 400;
    err.code = 'MISSING_CODE';
    throw err;
  }

  if (!env.google.clientId || !env.google.clientSecret) {
    const err = new Error('Chưa cấu hình Google OAuth credentials');
    err.statusCode = 500;
    err.code = 'GOOGLE_CONFIG_MISSING';
    throw err;
  }

  // Đổi code lấy token
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
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    const err = new Error(tokenData.error_description || tokenData.error || 'Đổi token Google thất bại');
    err.statusCode = 401;
    err.code = 'GOOGLE_AUTH_FAILED';
    throw err;
  }

  // Lấy thông tin user
  const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const userInfo = await userInfoRes.json();
  if (!userInfoRes.ok || !userInfo.id) {
    const err = new Error('Không thể lấy thông tin người dùng từ Google');
    err.statusCode = 401;
    err.code = 'GOOGLE_USERINFO_FAILED';
    throw err;
  }

  const { id: googleId, email, name, picture } = userInfo;

  // 1. Tìm user theo googleId
  let user = await User.findOne({ googleId });

  // 2. Nếu chưa có googleId nhưng đã có tài khoản trùng email, liên kết tài khoản
  if (!user && email) {
    user = await User.findOne({ email });
    if (user) {
      user.googleId = googleId;
      if (!user.avatarUrl && picture) {
        user.avatarUrl = picture;
      }
      await user.save();
    }
  }

  // 3. Nếu hoàn toàn chưa có, tạo user mới
  if (!user) {
    const username = await generateUniqueUsername(name || email?.split('@')[0]);
    user = await User.create({
      username,
      email: email || `google_${googleId}@google.pixellog.local`,
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

function getDiscordAuthUrl() {
  if (!env.discord.clientId) {
    const err = new Error('Chưa cấu hình DISCORD_CLIENT_ID trong biến môi trường');
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
  });

  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

async function loginWithDiscord(code) {
  if (!code) {
    const err = new Error('Thiếu authorization code từ Discord');
    err.statusCode = 400;
    err.code = 'MISSING_CODE';
    throw err;
  }

  if (!env.discord.clientId || !env.discord.clientSecret) {
    const err = new Error('Chưa cấu hình Discord OAuth credentials');
    err.statusCode = 500;
    err.code = 'DISCORD_CONFIG_MISSING';
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
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    const err = new Error(tokenData.error_description || tokenData.error || 'Đổi token Discord thất bại');
    err.statusCode = 401;
    err.code = 'DISCORD_AUTH_FAILED';
    throw err;
  }

  // Lấy thông tin user
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const discordUser = await userRes.json();
  if (!userRes.ok || !discordUser.id) {
    const err = new Error('Không thể lấy thông tin người dùng từ Discord');
    err.statusCode = 401;
    err.code = 'DISCORD_USERINFO_FAILED';
    throw err;
  }

  const { id: discordId, username: discordUsername, global_name, email, avatar } = discordUser;
  const avatarUrl = avatar
    ? `https://cdn.discordapp.com/avatars/${discordId}/${avatar}.png`
    : null;

  // 1. Tìm user theo discordId
  let user = await User.findOne({ discordId });

  // 2. Nếu chưa có discordId nhưng trùng email, liên kết
  if (!user && email) {
    user = await User.findOne({ email });
    if (user) {
      user.discordId = discordId;
      if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
      }
      await user.save();
    }
  }

  // 3. Nếu chưa có, tạo user mới
  if (!user) {
    const baseName = global_name || discordUsername;
    const username = await generateUniqueUsername(baseName);
    user = await User.create({
      username,
      email: email || `discord_${discordId}@discord.pixellog.local`,
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

function getSteamAuthUrl() {
  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': env.steam.callbackUrl,
    'openid.realm': env.steam.realm,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return `https://steamcommunity.com/openid/login?${params.toString()}`;
}

async function loginWithSteam(queryParams) {
  if (!queryParams || Object.keys(queryParams).length === 0) {
    const err = new Error('Thiếu tham số xác thực từ Steam');
    err.statusCode = 400;
    err.code = 'MISSING_STEAM_PARAMS';
    throw err;
  }

  // Chuẩn bị tham số để gửi xác thực lại với Steam OpenID Provider
  const validationParams = new URLSearchParams();
  for (const [key, value] of Object.entries(queryParams)) {
    validationParams.append(key, value);
  }
  validationParams.set('openid.mode', 'check_authentication');

  const verifyRes = await fetch('https://steamcommunity.com/openid/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: validationParams.toString(),
  });

  const verifyText = await verifyRes.text();
  if (!verifyText.includes('is_valid:true')) {
    const err = new Error('Chữ ký OpenID của Steam không hợp lệ');
    err.statusCode = 401;
    err.code = 'STEAM_VERIFICATION_FAILED';
    throw err;
  }

  // Trích xuất SteamID 64-bit từ openid.claimed_id
  const claimedId = queryParams['openid.claimed_id'] || queryParams['openid.identity'] || '';
  const match = claimedId.match(/\/id\/(\d+)$/);
  if (!match || !match[1]) {
    const err = new Error('Không thể tìm thấy SteamID hợp lệ từ phản hồi');
    err.statusCode = 400;
    err.code = 'STEAM_ID_NOT_FOUND';
    throw err;
  }

  const steamId = match[1];
  let personaName = `SteamUser_${steamId.slice(-6)}`;
  let avatarUrl = null;

  // Lấy thêm thông tin từ Steam Web API nếu đã cấu hình key
  if (env.steam.apiKey) {
    try {
      const summaryRes = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${env.steam.apiKey}&steamids=${steamId}`
      );
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        const player = summaryData?.response?.players?.[0];
        if (player) {
          if (player.personaname) personaName = player.personaname;
          if (player.avatarfull) avatarUrl = player.avatarfull;
        }
      }
    } catch {
      // Giữ fallback name và null avatar nếu gọi API ngoài lỗi
    }
  }

  // 1. Tìm user theo steamId
  let user = await User.findOne({ steamId });

  // 2. Nếu đã có user, cập nhật avatar nếu chưa có
  if (user) {
    if (!user.avatarUrl && avatarUrl) {
      user.avatarUrl = avatarUrl;
      await user.save();
    }
  } else {
    // 3. Tạo user mới với steamId
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
  getGoogleAuthUrl,
  loginWithGoogle,
  getDiscordAuthUrl,
  loginWithDiscord,
  getSteamAuthUrl,
  loginWithSteam,
  generateUniqueUsername,
};
