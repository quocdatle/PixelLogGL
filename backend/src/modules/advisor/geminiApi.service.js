const { geminiApiKey, geminiModel } = require('../../config/env');

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const REQUEST_TIMEOUT_MS = 25000;
const MAX_RETRIES = 2;
// finishReason khiến Gemini không trả nội dung vì lý do an toàn / chính sách
const BLOCKED_FINISH_REASONS = ['SAFETY', 'RECITATION', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII'];

function createHttpError(message, statusCode, code) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gửi yêu cầu generateContent đến Google Gemini API
 * @param {Object} options
 * @param {Array<{role: string, parts: Array<{text: string}>}>} options.contents Lịch sử tin nhắn
 * @param {string} options.systemInstruction Hướng dẫn hệ thống
 * @returns {Promise<{text: string, truncated: boolean}>} text: câu trả lời; truncated: true nếu bị cắt do hết MAX_TOKENS
 */
async function generateContent({ contents, systemInstruction }) {
  if (!geminiApiKey) {
    console.error('[GEMINI] Server chưa cấu hình GEMINI_API_KEY trong file môi trường .env');
    throw createHttpError('Dịch vụ Cố vấn AI chưa được kích hoạt trên hệ thống.', 503, 'AI_NOT_CONFIGURED');
  }

  const model = geminiModel || 'gemini-3.5-flash';
  const endpoint = `${GEMINI_BASE_URL}/${model}:generateContent`;

  const payload = {
    contents,
    generationConfig: {
      maxOutputTokens: 1200,
      temperature: 0.7,
    },
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  let attempt = 0;
  while (attempt <= MAX_RETRIES) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': geminiApiKey,
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      const rawText = await response.text();
      let data;
      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch (parseErr) {
        console.error('[GEMINI] Phản hồi không phải JSON hợp lệ từ upstream:', rawText.slice(0, 300));
        throw createHttpError('Dịch vụ AI phản hồi dữ liệu không hợp lệ.', 502, 'INVALID_AI_RESPONSE');
      }

      if (!response.ok) {
        const upstreamStatus = response.status;
        const upstreamError = data?.error?.message || rawText.slice(0, 200);
        console.error(`[GEMINI] Upstream lỗi HTTP ${upstreamStatus}:`, upstreamError);

        // Retry khi gặp 429 (Rate limit) hoặc 503 (Overloaded)
        if ((upstreamStatus === 429 || upstreamStatus === 503) && attempt < MAX_RETRIES) {
          attempt++;
          const backoffMs = attempt * 1200;
          console.warn(`[GEMINI] Đang thử lại (lần ${attempt}/${MAX_RETRIES}) sau ${backoffMs}ms...`);
          await sleep(backoffMs);
          continue;
        }

        if (upstreamStatus === 429) {
          throw createHttpError('Hệ thống AI hiện đang quá tải lượt yêu cầu. Vui lòng thử lại sau giây lát.', 429, 'AI_RATE_LIMITED');
        }

        throw createHttpError('Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.', 502, 'AI_SERVICE_UNAVAILABLE');
      }

      // Kiểm tra chặn ở cấp độ Prompt (Safety / Policy)
      if (data.promptFeedback?.blockReason) {
        console.warn('[GEMINI] Prompt bị chặn do chính sách:', data.promptFeedback.blockReason);
        // Ném lỗi (thay vì trả về như một câu trả lời) để service không lưu tin nhắn bị chặn vào lịch sử
        throw createHttpError(
          'Nội dung câu hỏi chạm đến chính sách an toàn của hệ thống. Vui lòng đặt câu hỏi khác liên quan đến game!',
          422,
          'AI_CONTENT_BLOCKED'
        );
      }

      const candidate = data.candidates?.[0];
      if (!candidate) {
        console.warn('[GEMINI] Không tìm thấy candidate phản hồi từ upstream:', data);
        throw createHttpError('Không nhận được câu trả lời từ AI.', 502, 'EMPTY_AI_RESPONSE');
      }

      // Nối toàn bộ parts thay vì chỉ lấy parts[0]
      const textParts = (candidate.content?.parts || [])
        .map((p) => p.text)
        .filter(Boolean)
        .join('');

      if (!textParts) {
        if (BLOCKED_FINISH_REASONS.includes(candidate.finishReason)) {
          console.warn('[GEMINI] Câu trả lời bị chặn:', candidate.finishReason);
          throw createHttpError(
            'Câu trả lời bị ẩn do tiêu chuẩn an toàn nội dung. Bạn có thể hỏi theo cách khác nhé!',
            422,
            'AI_CONTENT_BLOCKED'
          );
        }
        throw createHttpError('Nội dung phản hồi từ AI bị rỗng.', 502, 'EMPTY_AI_RESPONSE');
      }

      // Trả nguyên văn câu trả lời của model; ghi chú "bị cắt" do service thêm khi hiển thị, không lưu vào lịch sử
      return {
        text: textParts.trim(),
        truncated: candidate.finishReason === 'MAX_TOKENS',
      };
    } catch (err) {
      if (err.name === 'TimeoutError') {
        console.error('[GEMINI] Yêu cầu bị timeout sau', REQUEST_TIMEOUT_MS, 'ms');
        throw createHttpError('Dịch vụ AI phản hồi quá lâu (quá thời gian chờ). Vui lòng thử lại.', 504, 'GEMINI_TIMEOUT');
      }
      if (err.statusCode) {
        throw err;
      }
      console.error('[GEMINI] Lỗi kết nối mạng:', err.message);
      throw createHttpError('Không thể kết nối tới dịch vụ AI.', 502, 'GEMINI_UNREACHABLE');
    }
  }
}

module.exports = {
  generateContent,
};
