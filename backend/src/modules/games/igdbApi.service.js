require('../../config/env');

const IGDB_BASE_URL = 'https://api.igdb.com/v4';
const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_IMAGE_BASE = 'https://images.igdb.com/igdb/image/upload';
const REQUEST_TIMEOUT_MS = 15000;
const IGDB_ID_OFFSET = 100000000;

let cachedToken = null;
let tokenExpiresAt = 0;
let pendingTokenPromise = null;

const ESRB_RATING_MAP = {
  6: 'RP',
  7: 'EC',
  8: 'E',
  9: 'E10+',
  10: 'T',
  11: 'M',
  12: 'AO',
};

function createError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function getCredentials() {
  return {
    clientId: (process.env.TWITCH_CLIENT_ID || '').trim(),
    clientSecret: (process.env.TWITCH_CLIENT_SECRET || '').trim(),
  };
}

function isConfigured() {
  const { clientId, clientSecret } = getCredentials();
  return Boolean(clientId && clientSecret);
}

function toExternalId(igdbId) {
  return IGDB_ID_OFFSET + Number(igdbId);
}

function fromExternalId(externalId) {
  const n = Number(externalId);
  if (!Number.isInteger(n) || n < IGDB_ID_OFFSET) return null;
  return n - IGDB_ID_OFFSET;
}

function escapeApicalypseString(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/[\r\n]+/g, ' ')
    .trim();
}

function buildImageUrl(imageId, size = 't_cover_big') {
  if (!imageId) return null;
  return `${IGDB_IMAGE_BASE}/${size}/${imageId}.jpg`;
}

async function fetchTwitchToken() {
  const { clientId, clientSecret } = getCredentials();
  if (!clientId || !clientSecret) {
    throw createError(
      'Server chưa cấu hình TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET cho IGDB API',
      500,
      'IGDB_NOT_CONFIGURED'
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });

  let res;
  try {
    res = await fetch(TWITCH_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
    console.error(`[IGDB_AUTH] ${isTimeout ? 'Timeout' : 'Lỗi mạng'} khi lấy Twitch token:`, {
      name: err.name,
      message: err.message,
      cause: err.cause?.code || err.cause?.message,
    });
    throw createError(
      isTimeout ? 'Twitch OAuth phản hồi quá chậm' : 'Không kết nối được tới Twitch OAuth',
      isTimeout ? 504 : 502,
      isTimeout ? 'IGDB_TIMEOUT' : 'IGDB_UNREACHABLE'
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.error(`[IGDB_AUTH] Twitch trả lỗi HTTP ${res.status}:`, text);
    throw createError(
      `Xác thực IGDB/Twitch thất bại (${res.status}) — kiểm tra lại TWITCH_CLIENT_ID và TWITCH_CLIENT_SECRET`,
      502,
      'IGDB_AUTH_ERROR'
    );
  }

  const data = await res.json();
  cachedToken = data.access_token;
  const expiresInMs = Math.max(60, Number(data.expires_in) || 3600) * 1000;
  tokenExpiresAt = Date.now() + expiresInMs;
  return cachedToken;
}

async function getAccessToken(forceRefresh = false) {
  if (!forceRefresh && cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  if (forceRefresh) {
    cachedToken = null;
    tokenExpiresAt = 0;
  }

  if (!pendingTokenPromise) {
    pendingTokenPromise = fetchTwitchToken().finally(() => {
      pendingTokenPromise = null;
    });
  }
  return pendingTokenPromise;
}

async function igdbFetch(endpoint, apicalypseQuery, retryOnAuth = true) {
  const { clientId } = getCredentials();
  const token = await getAccessToken(false);

  let res;
  try {
    res = await fetch(`${IGDB_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'text/plain',
      },
      body: apicalypseQuery,
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
    console.error(`[IGDB_API] ${isTimeout ? 'Timeout' : 'Lỗi mạng'} tại ${endpoint}:`, {
      name: err.name,
      message: err.message,
      cause: err.cause?.code || err.cause?.message,
    });
    throw createError(
      isTimeout ? 'IGDB API phản hồi quá chậm' : 'Không kết nối được tới IGDB API',
      isTimeout ? 504 : 502,
      isTimeout ? 'IGDB_TIMEOUT' : 'IGDB_UNREACHABLE'
    );
  }

  if ((res.status === 401 || res.status === 403) && retryOnAuth) {
    await getAccessToken(true);
    return igdbFetch(endpoint, apicalypseQuery, false);
  }

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    console.error(`[IGDB_API] Lỗi HTTP ${res.status} tại ${endpoint}:`, errBody);
    throw createError(`IGDB API trả lỗi (${res.status})`, 502, 'IGDB_ERROR');
  }

  return res.json();
}

function normalizeGame(raw) {
  const coverUrl = buildImageUrl(raw.cover?.image_id, 't_cover_big');
  const firstShot = buildImageUrl(raw.screenshots?.[0]?.image_id, 't_screenshot_big');
  const scoreSource =
    typeof raw.rating === 'number'
      ? raw.rating
      : typeof raw.aggregated_rating === 'number'
      ? raw.aggregated_rating
      : null;

  return {
    rawgId: toExternalId(raw.id),
    igdbId: raw.id,
    source: 'igdb',
    name: raw.name,
    slug: raw.slug || null,
    backgroundImage: coverUrl || firstShot || null,
    released:
      typeof raw.first_release_date === 'number'
        ? new Date(raw.first_release_date * 1000).toISOString().slice(0, 10)
        : null,
    genres: (raw.genres || []).map((g) => g.name).filter(Boolean),
    platforms: (raw.platforms || []).map((p) => p.name).filter(Boolean),
    rating: scoreSource !== null ? Math.round((scoreSource / 20) * 100) / 100 : null,
    metacritic:
      typeof raw.aggregated_rating === 'number'
        ? Math.round(raw.aggregated_rating)
        : null,
  };
}

async function searchGames({ search, page = 1, pageSize = 20, genres }) {
  const safeLimit = Math.min(Math.max(Number(pageSize) || 20, 1), 40);
  const safePage = Math.max(Number(page) || 1, 1);
  const offset = (safePage - 1) * safeLimit;
  const cleanSearch = escapeApicalypseString(search);

  const lines = [
    'fields id,name,slug,cover.image_id,screenshots.image_id,first_release_date,genres.name,platforms.name,rating,aggregated_rating;',
  ];

  const whereClauses = [];
  if (genres) {
    const cleanGenre = escapeApicalypseString(genres);
    if (/^\d+$/.test(cleanGenre)) {
      whereClauses.push(`genres = (${cleanGenre})`);
    } else if (cleanGenre) {
      whereClauses.push(`genres.slug = "${cleanGenre}"`);
    }
  }

  if (cleanSearch) {
    lines.push(`search "${cleanSearch}";`);
  } else {
    whereClauses.push('rating_count > 30');
    lines.push('sort rating desc;');
  }

  if (whereClauses.length > 0) {
    lines.push(`where ${whereClauses.join(' & ')};`);
  }

  lines.push(`limit ${safeLimit + 1};`);
  lines.push(`offset ${offset};`);

  const rows = await igdbFetch('/games', lines.join('\n'));
  const list = Array.isArray(rows) ? rows : [];
  const hasNext = list.length > safeLimit;
  const trimmed = list.slice(0, safeLimit);

  return {
    count: offset + trimmed.length + (hasNext ? 1 : 0),
    hasNext,
    page: safePage,
    results: trimmed.map(normalizeGame),
  };
}

async function getGameDetail(igdbId) {
  const id = Number(igdbId);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError('igdbId không hợp lệ', 400, 'INVALID_ID');
  }

  const query = [
    'fields id,name,slug,summary,storyline,cover.image_id,screenshots.image_id,first_release_date,genres.name,platforms.name,involved_companies.developer,involved_companies.publisher,involved_companies.company.name,websites.url,websites.category,age_ratings.category,age_ratings.rating,rating,aggregated_rating;',
    `where id = ${id};`,
    'limit 1;',
  ].join('\n');

  const rows = await igdbFetch('/games', query);
  const raw = Array.isArray(rows) ? rows[0] : null;
  if (!raw) {
    throw createError('Không tìm thấy game trên IGDB', 404, 'GAME_NOT_FOUND');
  }

  const companies = raw.involved_companies || [];
  const developers = companies
    .filter((c) => c.developer && c.company?.name)
    .map((c) => c.company.name);
  const publishers = companies
    .filter((c) => c.publisher && c.company?.name)
    .map((c) => c.company.name);

  const websites = raw.websites || [];
  const officialSite =
    websites.find((w) => w.category === 1)?.url || websites[0]?.url || null;

  const esrbObj = (raw.age_ratings || []).find((a) => a.category === 1);
  const esrbRating = esrbObj ? ESRB_RATING_MAP[esrbObj.rating] || null : null;

  const screenshots = (raw.screenshots || [])
    .map((s) => buildImageUrl(s.image_id, 't_screenshot_big'))
    .filter(Boolean)
    .slice(0, 8);

  const description = [raw.summary, raw.storyline].filter(Boolean).join('\n\n');

  return {
    ...normalizeGame(raw),
    developers: Array.from(new Set(developers)),
    publishers: Array.from(new Set(publishers)),
    website: officialSite,
    playtimeAvg: null,
    esrbRating,
    screenshots,
    description,
  };
}

async function getGenres() {
  const rows = await igdbFetch(
    '/genres',
    'fields id,name,slug;\nsort name asc;\nlimit 50;'
  );
  return (Array.isArray(rows) ? rows : []).map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
  }));
}

module.exports = {
  IGDB_ID_OFFSET,
  isConfigured,
  toExternalId,
  fromExternalId,
  searchGames,
  getGameDetail,
  getGenres,
  normalizeGame,
};
