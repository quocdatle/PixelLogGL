const AdvisorLog = require('./advisorLog.model');
const geminiApi = require('./geminiApi.service');
const libraryService = require('../library/library.service');
const gameService = require('../games/game.service');

const MAX_MESSAGE_LENGTH = 1500;
const HISTORY_CONTEXT_LIMIT = 6; // Lấy 6 lượt gần nhất (mỗi lượt gồm 1 câu hỏi + 1 câu trả lời) để giữ ngữ cảnh
const LIBRARY_CONTEXT_LIMIT = 100; // Số game tối đa nạp vào prompt (bằng MAX_LIMIT của library.service.list)
const WISHLIST_CONTEXT_LIMIT = 15;
const DEFAULT_SESSION_ID = 'default';
const SESSION_ID_PATTERN = /^[\w-]{1,64}$/;
const TRUNCATED_NOTE = '\n\n*(Câu trả lời dài hơn giới hạn một lượt, bạn có thể gõ "tiếp tục" để xem thêm).*';

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  err.code = 'VALIDATION_ERROR';
  return err;
}

// sessionId đi thẳng vào filter Mongoose nên chỉ nhận chuỗi đơn giản,
// chặn các giá trị dạng object/mảng (vd: ?sessionId[$ne]=x).
function normalizeSessionId(value) {
  if (value === undefined || value === null) return DEFAULT_SESSION_ID;
  if (typeof value !== 'string' || !SESSION_ID_PATTERN.test(value)) {
    throw validationError('sessionId không hợp lệ (chỉ gồm chữ, số, "_" hoặc "-", tối đa 64 ký tự).');
  }
  return value;
}

/**
 * Tạo bản tóm tắt thư viện game của người dùng để đưa vào System Prompt
 */
async function buildUserLibraryContext(userId) {
  try {
    const [libraryData, stats] = await Promise.all([
      libraryService.list(userId, { sort: 'hours', limit: LIBRARY_CONTEXT_LIMIT }),
      libraryService.summary(userId),
    ]);
    const items = libraryData.items || [];

    // wishlist = game người dùng muốn chơi nhưng CHƯA sở hữu -> tách riêng khỏi danh sách đã sở hữu
    const owned = items.filter((i) => i.status !== 'wishlist');
    const wishlist = items.filter((i) => i.status === 'wishlist');
    const totalOwned = stats.total - (stats.byStatus?.wishlist || 0);

    if (totalOwned === 0 && wishlist.length === 0) {
      return 'Người dùng hiện chưa có tựa game nào trong thư viện PixelLog.';
    }

    const ownedTitles = owned.map((i) => i.game?.name).filter(Boolean);
    const hiddenOwned = Math.max(totalOwned - owned.length, 0);

    const topPlayed = owned
      .filter((i) => (i.hoursPlayed || 0) > 0)
      .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
      .slice(0, 5)
      .map((i) => `${i.game?.name} (${i.hoursPlayed}h)`);

    const topRated = owned
      .filter((i) => i.rating && i.rating >= 8)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((i) => `${i.game?.name} (${i.rating}/10)`);

    const genreCounts = {};
    owned.forEach((i) => {
      (i.game?.genres || []).forEach((g) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });
    const favoriteGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([genre]) => genre);

    const lines = [];
    if (owned.length === 0) {
      lines.push('Người dùng chưa sở hữu game nào trong thư viện PixelLog.');
    } else {
      const extra = hiddenOwned > 0 ? ` và ${hiddenOwned} game khác (không liệt kê tên)` : '';
      lines.push(`Danh sách game người dùng ĐÃ SỞ HỮU (${totalOwned} game): ${ownedTitles.join(', ')}${extra}.`);
    }
    if (topPlayed.length > 0) {
      lines.push(`Top game chơi nhiều nhất: ${topPlayed.join(', ')}.`);
    }
    if (topRated.length > 0) {
      lines.push(`Game đánh giá cao nhất: ${topRated.join(', ')}.`);
    }
    if (favoriteGenres.length > 0) {
      lines.push(`Thể loại thường chơi: ${favoriteGenres.join(', ')}.`);
    }
    if (wishlist.length > 0) {
      const wishlistTitles = wishlist
        .slice(0, WISHLIST_CONTEXT_LIMIT)
        .map((i) => i.game?.name)
        .filter(Boolean);
      lines.push(`Game người dùng ĐANG MUỐN CHƠI (wishlist, chưa sở hữu): ${wishlistTitles.join(', ')}.`);
    }

    return lines.join('\n');
  } catch (err) {
    console.warn('[ADVISOR] Không thể nạp ngữ cảnh thư viện của user:', err.message);
    return 'Không có thông tin thư viện.';
  }
}

/**
 * Xây dựng System Instruction có giới hạn chủ đề & cá nhân hóa
 */
function buildSystemInstruction(libraryContext) {
  return `Bạn là Cố vấn AI cá nhân của nền tảng PixelLog (website quản lý thư viện game cho game thủ).

QUY TẮC CỐT LÕI VỀ PHẠM VI CHỦ ĐỀ (BẮT BUỘC TUÂN THỦ):
1. Bạn CHỈ ĐƯỢC PHÉP trả lời các câu hỏi liên quan trực tiếp đến VIDEO GAME, GAMING (gợi ý tựa game, phân tích cốt truyện, cơ chế gameplay, mẹo chơi, lịch sử game, tin tức gaming, phần cứng/phụ kiện chơi game, cấu hình máy chơi game).
2. NẾU người dùng hỏi các chủ đề KHÔNG liên quan đến game (ví dụ: làm thơ tình, viết code ứng dụng không liên quan game, giải toán, chính trị, y tế, tài chính, đời sống...), bạn PHẢI TỪ CHỐI một cách lịch sự, thân thiện và nhắc người dùng rằng bạn là Cố vấn chuyên về thế giới game của PixelLog.
3. KHÔNG đóng vai trò trợ lý LLM tổng quát cho mục đích khác ngoài game.

THÔNG TIN VỀ THƯ VIỆN GAME CỦA NGƯỜI DÙNG HIỆN TẠI:
${libraryContext}
- Hướng dẫn áp dụng: Hãy ưu tiên gợi ý các game phù hợp với gu thể loại và chất lượng mà người dùng yêu thích.
- ĐẶC BIỆT: TUYỆT ĐỐI KHÔNG gợi ý lại những game người dùng ĐÃ SỞ HỮU ở danh sách trên, trừ khi người dùng chủ động yêu cầu giải đáp hoặc tư vấn về chính tựa game đó.
- Game trong mục "ĐANG MUỐN CHƠI (wishlist)" là game chưa sở hữu, bạn được phép nhắc tới hoặc gợi ý.
- Nếu danh sách ghi "và N game khác (không liệt kê tên)", hãy nhắc người dùng kiểm tra lại thư viện của mình để tránh trùng lặp khi bạn gợi ý một tựa game phổ biến.

PHONG CÁCH PHẢN HỒI:
- Sử dụng tiếng Việt tự nhiên, thân thiện, mang văn phong của một người bạn game thủ hiểu biết sâu sắc.
- Trình bày định dạng Markdown rõ ràng, dễ đọc (dùng tiêu đề ###, in đậm, danh sách gạch đầu dòng).
- KHI và CHỈ KHI bạn nhắc tới hoặc gợi ý các tựa game cụ thể trong câu trả lời, hãy thêm 1 dòng cuối cùng theo đúng định dạng:
[[GAMES: Tên Tiếng Anh Chuẩn 1 | Tên Tiếng Anh Chuẩn 2 | Tên Tiếng Anh Chuẩn 3]]
(tối đa 4 tựa game nổi bật nhất để hệ thống hiển thị thẻ game tương tác cho người dùng bấm thêm vào kho). Nếu không gợi ý tựa game cụ thể nào thì không thêm dòng này.`;
}

const GAMES_TAG_REGEX = /\[\[GAMES:\s*([^\]]+)\]\]/i;

async function extractAndResolveGames(rawText) {
  const match = rawText.match(GAMES_TAG_REGEX);
  const cleanReply = rawText.replace(GAMES_TAG_REGEX, '').trim();

  if (!match || !match[1]) {
    return { cleanReply, recommendedGames: [] };
  }

  const titles = match[1]
    .split('|')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);

  if (titles.length === 0) {
    return { cleanReply, recommendedGames: [] };
  }

  const resolvedResults = await Promise.allSettled(
    titles.map((title) => gameService.resolveByTitle(title))
  );

  const seenIds = new Set();
  const recommendedGames = [];
  resolvedResults.forEach((res) => {
    if (res.status === 'fulfilled' && res.value && !seenIds.has(res.value.rawgId)) {
      const g = res.value;
      seenIds.add(g.rawgId);
      recommendedGames.push({
        rawgId: g.rawgId,
        name: g.name,
        backgroundImage: g.backgroundImage || null,
        released: g.released || null,
        genres: g.genres || [],
        rating: g.rating ?? null,
        metacritic: g.metacritic ?? null,
      });
    }
  });

  return { cleanReply, recommendedGames };
}

/**
 * Xử lý cuộc trò chuyện có nhớ ngữ cảnh
 */
async function chat(userId, { message, sessionId } = {}) {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw validationError('Nội dung tin nhắn không được để trống.');
  }

  const cleanMessage = message.trim();
  if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
    throw validationError(`Tin nhắn quá dài (tối đa ${MAX_MESSAGE_LENGTH} ký tự).`);
  }

  const session = normalizeSessionId(sessionId);

  // 1. Tải lịch sử tin nhắn gần nhất để tạo ngữ cảnh hội thoại
  const recentLogs = await AdvisorLog.find({ userId, sessionId: session })
    .sort({ createdAt: -1 })
    .limit(HISTORY_CONTEXT_LIMIT);

  // Đảo ngược về thứ tự thời gian tăng dần
  recentLogs.reverse();

  const contents = [];
  recentLogs.forEach((log) => {
    if (log.userMessage && log.botReply) {
      contents.push({ role: 'user', parts: [{ text: log.userMessage }] });
      contents.push({ role: 'model', parts: [{ text: log.botReply }] });
    }
  });

  // Gắn tin nhắn hiện tại của user vào cuối
  contents.push({ role: 'user', parts: [{ text: cleanMessage }] });

  // 2. Tải dữ liệu thư viện game để cá nhân hóa gợi ý
  const libraryContext = await buildUserLibraryContext(userId);
  const systemInstruction = buildSystemInstruction(libraryContext);

  // 3. Gọi Gemini API (nếu prompt/câu trả lời bị chặn sẽ ném lỗi AI_CONTENT_BLOCKED -> không lưu log)
  const { text, truncated } = await geminiApi.generateContent({
    contents,
    systemInstruction,
  });

  // 4. Trích xuất và tra cứu thẻ game tương tác nếu có
  const { cleanReply, recommendedGames } = await extractAndResolveGames(text);

  // 5. Lưu hội thoại vào MongoDB
  try {
    await AdvisorLog.create({
      userId,
      sessionId: session,
      userMessage: cleanMessage,
      botReply: cleanReply,
      recommendedGames,
    });
  } catch (dbErr) {
    console.error('[ADVISOR] Lỗi lưu lịch sử chat vào DB:', dbErr.message);
  }

  return {
    reply: truncated ? `${cleanReply}${TRUNCATED_NOTE}` : cleanReply,
    recommendedGames,
  };
}

/**
 * Lấy lịch sử trò chuyện của người dùng hiện tại
 */
async function getHistory(userId, { sessionId, limit = 30 } = {}) {
  const session = normalizeSessionId(sessionId);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);

  const logs = await AdvisorLog.find({ userId, sessionId: session })
    .sort({ createdAt: -1 })
    .limit(limitNum);

  return logs.reverse();
}

/**
 * Xóa hoặc bắt đầu phiên chat mới
 */
async function clearHistory(userId, { sessionId } = {}) {
  const session = normalizeSessionId(sessionId);
  await AdvisorLog.deleteMany({ userId, sessionId: session });
  return { message: 'Đã làm mới cuộc trò chuyện' };
}

module.exports = {
  chat,
  getHistory,
  clearHistory,
};
