require('../../config/env');

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const GEMINI_BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 30000;

function createError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

/**
 * Gửi tin nhắn đến Google Gemini API
 * @param {String} userMessage - Câu hỏi / yêu cầu từ người dùng
 * @returns {Promise<String>} - Phản hồi từ Gemini
 */
const sendMessageToGemini = async (userMessage) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw createError('Biến môi trường GEMINI_API_KEY chưa được cấu hình trong .env', 500, 'GEMINI_NOT_CONFIGURED');
  }

  const url = `${GEMINI_BASE_URL}?key=${encodeURIComponent(apiKey)}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: userMessage }],
      },
    ],
    systemInstruction: {
      parts: [
        {
          text: 'Bạn là Cố vấn AI cá nhân của nền tảng PixelLog (website quản lý thư viện game cá nhân). Hãy tư vấn game, phân tích gu chơi game, gợi ý các tựa game phù hợp một cách thân thiện, nhiệt tình, định dạng Markdown rõ ràng và hoàn toàn bằng tiếng Việt.',
        },
      ],
    },
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.7,
    },
  };

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err.name === 'TimeoutError') {
      throw createError('Kết nối đến Gemini API bị quá thời gian chờ (timeout). Vui lòng thử lại.', 504, 'GEMINI_TIMEOUT');
    }
    throw createError('Không thể kết nối đến máy chủ Google Gemini API.', 502, 'GEMINI_UNREACHABLE');
  }

  const data = await response.json();

  if (!response.ok) {
    const errorDetails = data?.error?.message || `HTTP ${response.status}`;
    if (response.status === 400 || response.status === 403) {
      throw createError(`Khóa GEMINI_API_KEY không hợp lệ hoặc bị từ chối: ${errorDetails}`, 401, 'INVALID_GEMINI_KEY');
    }
    throw createError(`Gemini API trả về lỗi (${response.status}): ${errorDetails}`, 502, 'GEMINI_ERROR');
  }

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) {
    throw createError('Không nhận được nội dung phản hồi hợp lệ từ Gemini API.', 502, 'EMPTY_AI_RESPONSE');
  }

  return reply.trim();
};

module.exports = {
  sendMessageToGemini,
  sendMessageToClaude: sendMessageToGemini,
};
