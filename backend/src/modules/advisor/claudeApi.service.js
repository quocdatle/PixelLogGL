const Anthropic = require('@anthropic-ai/sdk');

// Khởi tạo client Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Gửi tin nhắn đến Anthropic Claude API
 * @param {String} userMessage - Câu hỏi của người dùng
 * @returns {Promise<String>} - Câu trả lời từ Claude
 */
const sendMessageToClaude = async (userMessage) => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Biến môi trường ANTHROPIC_API_KEY chưa được cấu hình trong .env');
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022', // Hoặc claude-3-haiku-20240307
      max_tokens: 1000,
      system: 'Bạn là Cố vấn AI cá nhân của nền tảng PixelLog. Hãy tư vấn game, gợi ý tựa game phù hợp gu người dùng một cách thân thiện, chuyên nghiệp.',
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    if (response && response.content && response.content.length > 0) {
      return response.content[0].text;
    }

    throw new Error('Không nhận được phản hồi hợp lệ từ dịch vụ Claude API.');
  } catch (error) {
    console.error('Lỗi tại claudeApi.service.js:', error);
    throw error;
  }
};

module.exports = {
  sendMessageToClaude,
};