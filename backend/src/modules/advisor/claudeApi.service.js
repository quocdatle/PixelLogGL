// File giữ lại để tương thích ngược — chuyển tiếp toàn bộ sang Google Gemini API
const geminiService = require('./geminiApi.service');

module.exports = {
  sendMessageToClaude: geminiService.sendMessageToGemini,
  sendMessageToGemini: geminiService.sendMessageToGemini,
};
