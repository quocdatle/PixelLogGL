const STEAM_ID_OFFSET = 200000000;
const STEAM_ID_MAX = 300000000;
const STEAM_STORE_BASE = 'https://store.steampowered.com/api';
const STEAM_CDN_BASE = 'https://cdn.akamai.steamstatic.com/steam/apps';
const CHEAPSHARK_BASE = 'https://www.cheapshark.com/api/1.0';
const STEAMSPY_BASE = 'https://steamspy.com/api.php';
const STEAMCMD_BASE = 'https://api.steamcmd.net/v1/info';
const WIKI_SUMMARY_BASE = 'https://en.wikipedia.org/api/rest_v1/page/summary';

const USER_AGENT = 'PixelLogGL/1.0 (+https://github.com/PixelLogGL)';
const STEAM_DIRECT_TIMEOUT_MS = 3000;
const FALLBACK_TIMEOUT_MS = 10000;
const TOP100_CACHE_TTL_MS = 60 * 60 * 1000; // 1 giờ

let top100Cache = { fetchedAt: 0, items: [] };
let top100PendingPromise = null;

const STEAM_GENRES = [
  { id: 'action', name: 'Action', slug: 'action' },
  { id: 'adventure', name: 'Adventure', slug: 'adventure' },
  { id: 'rpg', name: 'RPG', slug: 'rpg' },
  { id: 'strategy', name: 'Strategy', slug: 'strategy' },
  { id: 'simulation', name: 'Simulation', slug: 'simulation' },
  { id: 'indie', name: 'Indie', slug: 'indie' },
  { id: 'sports', name: 'Sports', slug: 'sports' },
  { id: 'racing', name: 'Racing', slug: 'racing' },
  { id: 'casual', name: 'Casual', slug: 'casual' },
  { id: 'free-to-play', name: 'Free To Play', slug: 'free-to-play' },
  { id: 'massively-multiplayer', name: 'Massively Multiplayer', slug: 'massively-multiplayer' },
];

const STEAM_GENRE_ID_MAP = {
  1: 'Action',
  2: 'Strategy',
  3: 'RPG',
  4: 'Casual',
  9: 'Racing',
  18: 'Sports',
  23: 'Indie',
  25: 'Adventure',
  28: 'Simulation',
  29: 'Massively Multiplayer',
  37: 'Free To Play',
  70: 'Early Access',
};

function createError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function toExternalId(appId) {
  return STEAM_ID_OFFSET + Number(appId);
}

function fromExternalId(externalId) {
  const n = Number(externalId);
  if (!Number.isInteger(n) || n < STEAM_ID_OFFSET || n >= STEAM_ID_MAX) return null;
  return n - STEAM_ID_OFFSET;
}

function buildHeaderUrl(appId) {
  return `${STEAM_CDN_BASE}/${appId}/header.jpg`;
}

function buildHeroUrl(appId) {
  return `${STEAM_CDN_BASE}/${appId}/library_hero.jpg`;
}

function buildCapsuleUrl(appId) {
  return `${STEAM_CDN_BASE}/${appId}/library_600x900.jpg`;
}

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || null;
}

function parseSteamDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchJson(url, timeoutMs = FALLBACK_TIMEOUT_MS) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} from ${url}`);
  }
  return res.json();
}

async function getSteamSpyTop100() {
  if (top100Cache.items.length > 0 && Date.now() - top100Cache.fetchedAt < TOP100_CACHE_TTL_MS) {
    return top100Cache.items;
  }

  if (!top100PendingPromise) {
    top100PendingPromise = fetchJson(`${STEAMSPY_BASE}?request=top100in2weeks`, FALLBACK_TIMEOUT_MS)
      .then((data) => {
        const list = Object.values(data || {}).map((item) => {
          const pos = Number(item.positive) || 0;
          const neg = Number(item.negative) || 0;
          const total = pos + neg;
          const rating = total > 0 ? Math.round((pos / total) * 5 * 100) / 100 : null;
          return {
            rawgId: toExternalId(item.appid),
            steamAppId: Number(item.appid),
            source: 'steam',
            name: item.name,
            slug: slugify(item.name),
            backgroundImage: buildHeaderUrl(item.appid),
            released: null,
            genres: [],
            platforms: ['PC'],
            rating,
            metacritic: null,
            _reviewCount: total,
          };
        });
        top100Cache = { fetchedAt: Date.now(), items: list };
        return list;
      })
      .catch((err) => {
        console.warn('[STEAM_API] Không nạp được top100 từ SteamSpy:', err.message);
        return top100Cache.items;
      })
      .finally(() => {
        top100PendingPromise = null;
      });
  }

  return top100PendingPromise;
}

function normalizeCheapSharkDeal(deal) {
  const appId = Number(deal.steamAppID);
  if (!Number.isInteger(appId) || appId <= 0) return null;

  const ratingPct = Number(deal.steamRatingPercent);
  const rating = Number.isFinite(ratingPct) && ratingPct > 0
    ? Math.round((ratingPct / 20) * 100) / 100
    : null;

  const meta = Number(deal.metacriticScore);
  const metacritic = Number.isFinite(meta) && meta > 0 ? meta : null;

  const relSec = Number(deal.releaseDate);
  const released = Number.isFinite(relSec) && relSec > 0
    ? new Date(relSec * 1000).toISOString().slice(0, 10)
    : null;

  return {
    rawgId: toExternalId(appId),
    steamAppId: appId,
    source: 'steam',
    name: deal.title,
    slug: slugify(deal.title),
    backgroundImage: buildHeaderUrl(appId),
    released,
    genres: [],
    platforms: ['PC'],
    rating,
    metacritic,
    _reviewCount: Number(deal.steamRatingCount) || 0,
  };
}

function normalizeCheapSharkGame(game) {
  const appId = Number(game.steamAppID);
  if (!Number.isInteger(appId) || appId <= 0) return null;

  return {
    rawgId: toExternalId(appId),
    steamAppId: appId,
    source: 'steam',
    name: game.external,
    slug: slugify(game.external),
    backgroundImage: buildHeaderUrl(appId),
    released: null,
    genres: [],
    platforms: ['PC'],
    rating: null,
    metacritic: null,
    _reviewCount: 0,
  };
}

async function trySteamStoreSearch(search, pageSize) {
  const url = new URL(`${STEAM_STORE_BASE}/storesearch/`);
  url.searchParams.set('term', search);
  url.searchParams.set('l', 'english');
  url.searchParams.set('cc', 'US');

  const data = await fetchJson(url.toString(), STEAM_DIRECT_TIMEOUT_MS);
  const items = (data?.items || []).slice(0, pageSize);
  return items.map((item) => ({
    rawgId: toExternalId(item.id),
    steamAppId: Number(item.id),
    source: 'steam',
    name: item.name,
    slug: slugify(item.name),
    backgroundImage: buildHeaderUrl(item.id),
    released: null,
    genres: [],
    platforms: ['PC'],
    rating: null,
    metacritic: item.metascore ? Number(item.metascore) : null,
  }));
}

async function searchGames({ search, page = 1, pageSize = 20 }) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(pageSize) || 20, 1), 40);
  const cleanSearch = (search || '').trim();

  // Nếu không có từ khóa -> trả về danh sách top game phổ biến trên Steam
  if (!cleanSearch) {
    const topList = await getSteamSpyTop100();
    const start = (safePage - 1) * safeLimit;
    const sliced = topList.slice(start, start + safeLimit).map(({ _reviewCount, ...rest }) => rest);
    return {
      count: topList.length,
      hasNext: start + safeLimit < topList.length,
      page: safePage,
      results: sliced,
    };
  }

  // 1. Thử Steam Store Search trực tiếp (nhanh nếu mạng/VPN không chặn)
  try {
    const directResults = await trySteamStoreSearch(cleanSearch, safeLimit);
    if (directResults.length > 0) {
      return {
        count: directResults.length,
        hasNext: false,
        page: 1,
        results: directResults,
      };
    }
  } catch {
    // ISP chặn store.steampowered.com -> chuyển sang nguồn mirror Steam (CheapShark + SteamSpy)
  }

  // 2. Truy vấn đồng thời CheapShark Steam Store + SteamSpy Top100 (đều qua CDN/HTTPS ổn định)
  const qLower = cleanSearch.toLowerCase();
  const dealsUrl = `${CHEAPSHARK_BASE}/deals?storeID=1&title=${encodeURIComponent(cleanSearch)}&pageSize=40`;
  const gamesUrl = `${CHEAPSHARK_BASE}/games?title=${encodeURIComponent(cleanSearch)}&limit=20`;

  const [dealsRes, gamesRes, top100] = await Promise.all([
    fetchJson(dealsUrl, FALLBACK_TIMEOUT_MS).catch(() => []),
    fetchJson(gamesUrl, FALLBACK_TIMEOUT_MS).catch(() => []),
    getSteamSpyTop100().catch(() => []),
  ]);

  const byAppId = new Map();

  // Ưu tiên giữ metadata đầy đủ nhất cho mỗi steamAppId
  (Array.isArray(dealsRes) ? dealsRes : []).forEach((deal) => {
    const item = normalizeCheapSharkDeal(deal);
    if (item && !byAppId.has(item.steamAppId)) {
      byAppId.set(item.steamAppId, item);
    }
  });

  top100.forEach((item) => {
    if (item.name?.toLowerCase().includes(qLower)) {
      const existing = byAppId.get(item.steamAppId);
      if (!existing) {
        byAppId.set(item.steamAppId, item);
      } else if (item._reviewCount > existing._reviewCount) {
        existing._reviewCount = item._reviewCount;
      }
    }
  });

  (Array.isArray(gamesRes) ? gamesRes : []).forEach((g) => {
    const item = normalizeCheapSharkGame(g);
    if (item && !byAppId.has(item.steamAppId)) {
      byAppId.set(item.steamAppId, item);
    }
  });

  const allMatches = Array.from(byAppId.values());
  if (allMatches.length === 0) {
    return { count: 0, hasNext: false, page: safePage, results: [] };
  }

  // Sắp xếp thông minh: Khớp chính xác tên -> Bắt đầu bằng từ khóa -> Lượt đánh giá Steam cao nhất
  allMatches.sort((a, b) => {
    const aName = (a.name || '').toLowerCase();
    const bName = (b.name || '').toLowerCase();

    const aExact = aName === qLower ? 2 : aName.startsWith(qLower) ? 1 : 0;
    const bExact = bName === qLower ? 2 : bName.startsWith(qLower) ? 1 : 0;
    if (bExact !== aExact) return bExact - aExact;

    return (b._reviewCount || 0) - (a._reviewCount || 0);
  });

  const start = (safePage - 1) * safeLimit;
  const pageItems = allMatches
    .slice(start, start + safeLimit)
    .map(({ _reviewCount, ...rest }) => rest);

  return {
    count: allMatches.length,
    hasNext: start + safeLimit < allMatches.length,
    page: safePage,
    results: pageItems,
  };
}

async function fetchWikipediaSummary(title) {
  if (!title) return '';
  try {
    const clean = title.replace(/[™®©]/g, '').trim();
    const slug = encodeURIComponent(clean.replace(/\s+/g, '_'));
    const data = await fetchJson(`${WIKI_SUMMARY_BASE}/${slug}`, 5000);
    if (data?.type !== 'disambiguation' && data?.extract) {
      return data.extract;
    }
  } catch {
    // Bỏ qua nếu không có bài Wikipedia trùng khớp chính xác
  }
  return '';
}

function parseSteamCmdPlatforms(oslist) {
  if (!oslist) return ['PC'];
  const tokens = String(oslist)
    .split(',')
    .map((s) => s.trim().toLowerCase());
  const mapped = [];
  if (tokens.includes('windows')) mapped.push('PC (Windows)');
  if (tokens.includes('macos')) mapped.push('macOS');
  if (tokens.includes('linux')) mapped.push('Linux');
  return mapped.length > 0 ? mapped : ['PC'];
}

async function getGameDetail(appId) {
  const id = Number(appId);
  if (!Number.isInteger(id) || id <= 0) {
    throw createError('steamAppId không hợp lệ', 400, 'INVALID_ID');
  }

  // 1. Thử lấy đồng thời Steam Store AppDetails (mô tả + screenshots) và SteamSpy (rating + giờ chơi TB)
  const [storeData, spyInitial] = await Promise.all([
    fetchJson(`${STEAM_STORE_BASE}/appdetails?appids=${id}&l=english&cc=us`, STEAM_DIRECT_TIMEOUT_MS).catch(() => null),
    fetchJson(`${STEAMSPY_BASE}?request=appdetails&appid=${id}`, FALLBACK_TIMEOUT_MS).catch(() => null),
  ]);

  const entry = storeData?.[String(id)];
  if (entry?.success && entry.data) {
    const d = entry.data;
    const platforms = [];
    if (d.platforms?.windows) platforms.push('PC (Windows)');
    if (d.platforms?.mac) platforms.push('macOS');
    if (d.platforms?.linux) platforms.push('Linux');

    const pos = Number(spyInitial?.positive) || 0;
    const neg = Number(spyInitial?.negative) || 0;
    const total = pos + neg;
    const rating = total > 0 ? Math.round((pos / total) * 5 * 100) / 100 : null;
    const avgForever = Number(spyInitial?.average_forever);
    const playtimeAvg = Number.isFinite(avgForever) && avgForever > 0 ? Math.round(avgForever / 60) : null;

    return {
      rawgId: toExternalId(id),
      steamAppId: id,
      source: 'steam',
      name: d.name,
      slug: slugify(d.name),
      backgroundImage: buildHeaderUrl(id),
      released: parseSteamDate(d.release_date?.date),
      genres: (d.genres || []).map((g) => g.description).filter(Boolean),
      platforms: platforms.length > 0 ? platforms : ['PC'],
      developers: Array.isArray(d.developers) ? d.developers : [],
      publishers: Array.isArray(d.publishers) ? d.publishers : [],
      website: d.website || `https://store.steampowered.com/app/${id}`,
      playtimeAvg,
      esrbRating: null,
      screenshots: (d.screenshots || [])
        .map((s) => s.path_full || s.path_thumbnail)
        .filter(Boolean)
        .slice(0, 8),
      rating,
      metacritic: d.metacritic?.score ?? null,
      description: stripHtml(d.detailed_description || d.about_the_game || d.short_description),
    };
  }

  // 2. Fallback sang SteamSpy + SteamCMD + Wikipedia nếu store.steampowered.com bị chặn
  const [spyRes, cmdRes] = await Promise.all([
    Promise.resolve(spyInitial),
    fetchJson(`${STEAMCMD_BASE}/${id}`, FALLBACK_TIMEOUT_MS).catch(() => null),
  ]);

  const cmdCommon = cmdRes?.data?.[String(id)]?.common || null;
  const gameName = spyRes?.name || cmdCommon?.name;

  if (!gameName) {
    throw createError('Không tìm thấy game trên Steam', 404, 'GAME_NOT_FOUND');
  }

  const pos = Number(spyRes?.positive) || 0;
  const neg = Number(spyRes?.negative) || 0;
  const totalReviews = pos + neg;
  const rating = totalReviews > 0
    ? Math.round((pos / totalReviews) * 5 * 100) / 100
    : cmdCommon?.review_percentage
    ? Math.round((Number(cmdCommon.review_percentage) / 20) * 100) / 100
    : null;

  const genresFromSpy = spyRes?.genre
    ? String(spyRes.genre).split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const genresFromCmd = cmdCommon?.genres
    ? Object.values(cmdCommon.genres)
        .map((gid) => STEAM_GENRE_ID_MAP[Number(gid)])
        .filter(Boolean)
    : [];
  const genres = Array.from(new Set([...genresFromSpy, ...genresFromCmd]));

  const developers = spyRes?.developer
    ? String(spyRes.developer).split(',').map((s) => s.trim()).filter(Boolean)
    : [];
  const publishers = spyRes?.publisher
    ? String(spyRes.publisher).split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  const metacritic = cmdCommon?.metacritic_score
    ? Number(cmdCommon.metacritic_score)
    : null;

  const releaseTs = Number(cmdCommon?.steam_release_date);
  const released = Number.isFinite(releaseTs) && releaseTs > 0
    ? new Date(releaseTs * 1000).toISOString().slice(0, 10)
    : null;

  const avgForever = Number(spyRes?.average_forever);
  const playtimeAvg = Number.isFinite(avgForever) && avgForever > 0
    ? Math.round(avgForever / 60)
    : null;

  const topTags = spyRes?.tags ? Object.keys(spyRes.tags).slice(0, 6) : [];
  const wikiSummary = await fetchWikipediaSummary(gameName);
  const fallbackDesc = topTags.length > 0
    ? `Tựa game trên Steam thuộc thể loại ${genres.join(', ') || 'Game'}. Thẻ nổi bật từ cộng đồng: ${topTags.join(', ')}.`
    : `Tựa game phát hành trên nền tảng Steam (AppID: ${id}).`;

  return {
    rawgId: toExternalId(id),
    steamAppId: id,
    source: 'steam',
    name: gameName,
    slug: slugify(gameName),
    backgroundImage: buildHeaderUrl(id),
    released,
    genres,
    platforms: parseSteamCmdPlatforms(cmdCommon?.oslist),
    developers,
    publishers,
    website: `https://store.steampowered.com/app/${id}`,
    playtimeAvg,
    esrbRating: null,
    screenshots: [buildHeaderUrl(id), buildHeroUrl(id), buildCapsuleUrl(id)],
    rating,
    metacritic,
    description: wikiSummary || fallbackDesc,
  };
}

async function getGenres() {
  return STEAM_GENRES;
}

module.exports = {
  STEAM_ID_OFFSET,
  toExternalId,
  fromExternalId,
  searchGames,
  getGameDetail,
  getGenres,
};
