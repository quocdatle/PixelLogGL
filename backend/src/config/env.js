const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${name}`);
  }
  return value;
}

const port = process.env.PORT || 5000;
const backendUrl = (process.env.BACKEND_URL || `http://localhost:${port}`).replace(/\/$/, '');
const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

module.exports = {
  port,
  mongoUri: required('MONGO_URI'),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // IGDB API (via Twitch Developer)
  twitch: {
    clientId: process.env.TWITCH_CLIENT_ID || '',
    clientSecret: process.env.TWITCH_CLIENT_SECRET || '',
  },
  twitchClientId: process.env.TWITCH_CLIENT_ID || '',
  twitchClientSecret: process.env.TWITCH_CLIENT_SECRET || '',

  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',

  // Client & Backend base URLs
  clientUrl,
  backendUrl,

  // Google OAuth 2.0
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || `${backendUrl}/api/auth/google/callback`,
  },

  // Discord OAuth 2.0
  discord: {
    clientId: process.env.DISCORD_CLIENT_ID || '',
    clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    callbackUrl: process.env.DISCORD_CALLBACK_URL || `${backendUrl}/api/auth/discord/callback`,
  },

  // Steam OpenID 2.0 (Auth only)
  steam: {
    apiKey: process.env.STEAM_API_KEY || '',
    callbackUrl: process.env.STEAM_CALLBACK_URL || `${backendUrl}/api/auth/steam/callback`,
    realm: process.env.STEAM_REALM || `${backendUrl}/`,
  },
};
