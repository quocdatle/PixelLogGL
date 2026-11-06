const AdvisorLog = require('./advisorLog.model');
const geminiApi = require('./geminiApi.service');
const libraryService = require('../library/library.service');

const MAX_MESSAGE_LENGTH = 1500;
const HISTORY_CONTEXT_LIMIT = 6; // Lấy 6 lượt gần nhất (3 cặp user-model) để giữ ngữ cảnh

function validationError(message) {
  const err = new Error(message);
  err.statusCode = 400;
  err.code = 'VALIDATION_ERROR';
  return err;
}

/**
 * Tạo bản tóm tắt thư viện game của người dùng để đưa vào System Prompt
 */
async function buildUserLibraryContext(userId) {
  try {
    const libraryData = await libraryService.list(userId, { limit: 50 });
    const items = libraryData.items || [];

    if (items.length === 0) {
      return 'Người dùng hiện chưa có tựa game nào trong thư viện PixelLog.';
    }

    const ownedTitles = items.map((i) => i.game?.name).filter(Boolean);
    const topPlayed = [...items]
      .filter((i) => (i.hoursPlayed || 0) > 0)
      .sort((a, b) => (b.hoursPlayed || 0) - (a.hoursPlayed || 0))
      .slice(0, 5)
      .map((i) => `${i.game?.name} (${i.hoursPlayed}h)`);

    const topRated = [...items]
      .filter((i) => i.rating && i.rating >= 8)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((i) => `${i.game?.name} (${i.rating}/10)`);

    const genreCounts = {};
    items.forEach((i) => {
      (i.game?.genres || []).forEach((g) => {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      });
    });
    const favoriteGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([genre]) => genre);

    let context = `Danh sách game người dùng ĐÃ SỞ HỮU (${ownedTitles.length} game): ${ownedTitles.slice(0, 30).join(', ')}.`;
    if (topPlayed.length > 0) {
      context += `\nTop game chơi nhiều nhất: ${topPlayed.join(', ')}.`;
    }
    if (topRated.length > 0) {
      context += `\nGame đánh giá cao nhất: ${topRated.join(', ')}.`;
    }
    if (favoriteGenres.length > 0) {
      context += `\nThể loại thường chơi: ${favoriteGenres.join(', ')}.`;
    }

    return context;
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

PHONG CÁCH PHẢN HỒI:
- Sử dụng tiếng Việt tự nhiên, thân thiện, mang văn phong của một người bạn game thủ hiểu biết sâu sắc.
- Trình bày định dạng Markdown rõ ràng, dễ đọc (dùng tiêu đề ###, in đậm, danh sách gạch đầu dòng).`;
}

/**
 * Xử lý cuộc trò chuyện có nhớ ngữ cảnh
 */
async function chat(userId, { message, sessionId = 'default' }) {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    throw validationError('Nội dung tin nhắn không được để trống.');
  }

  const cleanMessage = message.trim();
  if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
    throw validationError(`Tin nhắn quá dài (tối đa ${MAX_MESSAGE_LENGTH} ký tự).`);
  }

  // 1. Tải lịch sử tin nhắn gần nhất để tạo ngữ cảnh hội thoại
  const recentLogs = await AdvisorLog.find({ userId, sessionId })
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

  // 3. Gọi Gemini API
  const reply = await geminiApi.generateContent({
    contents,
    systemInstruction,
  });

  // 4. Lưu hội thoại vào MongoDB
  try {
    await AdvisorLog.create({
      userId,
      sessionId,
      userMessage: cleanMessage,
      botReply: reply,
    });
  } catch (dbErr) {
    console.error('[ADVISOR] Lỗi lưu lịch sử chat vào DB:', dbErr.message);
  }

  return { reply };
}

/**
 * Lấy lịch sử trò chuyện của người dùng hiện tại
 */
async function getHistory(userId, { sessionId = 'default', limit = 30 } = {}) {
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 30, 1), 100);

  const query = { userId };
  if (sessionId) {
    query.sessionId = sessionId;
  }

  const logs = await AdvisorLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limitNum);

  return logs.reverse();
}

/**
 * Xóa hoặc bắt đầu phiên chat mới
 */
async function clearHistory(userId, { sessionId = 'default' } = {}) {
  await AdvisorLog.deleteMany({ userId, sessionId });
  return { message: 'Đã làm mới cuộc trò chuyện' };
}

module.exports = {
  chat,
  getHistory,
  clearHistory,
};
