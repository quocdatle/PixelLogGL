const advisorService = require('./advisor.service');
const { success } = require('../../utils/responseFormatter');

/**
 * POST /api/advisor/chat
 * Gửi tin nhắn đến Cố vấn AI Gemini
 */
async function handleChat(req, res, next) {
  try {
    const { message, sessionId } = req.body;
    const result = await advisorService.chat(req.userId, { message, sessionId });
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/advisor/history
 * Lấy lịch sử trò chuyện của người dùng
 */
async function getHistory(req, res, next) {
  try {
    const { sessionId, limit } = req.query;
    const history = await advisorService.getHistory(req.userId, { sessionId, limit });
    return success(res, history);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/advisor/history
 * Xóa lịch sử hoặc bắt đầu cuộc hội thoại mới
 */
async function clearHistory(req, res, next) {
  try {
    const { sessionId } = req.query;
    const result = await advisorService.clearHistory(req.userId, { sessionId });
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  handleChat,
  getHistory,
  clearHistory,
};
