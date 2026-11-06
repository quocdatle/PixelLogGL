const { sendMessageToClaude } = require('./claudeApi.service');
const AdvisorLog = require('./advisorLog.model');

/**
 * POST /api/advisor/chat
 * Xử lý trò chuyện với Cố vấn AI
 */
exports.handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Nội dung tin nhắn không được để trống.',
      });
    }

    // 1. Gọi service gửi tin nhắn tới Claude API
    const reply = await sendMessageToClaude(message);

    // 2. Lưu lại lịch sử hội thoại vào MongoDB
    try {
      await AdvisorLog.create({
        userId: req.user ? req.user._id : null,
        userMessage: message,
        botReply: reply,
      });
    } catch (dbError) {
      console.warn('Lưu lịch sử chat vào DB thất bại:', dbError.message);
      // Không ném lỗi ra ngoài để người dùng vẫn nhận được câu trả lời từ AI
    }

    // 3. Trả về kết quả cho Frontend
    return res.status(200).json({
      success: true,
      reply: reply,
    });
  } catch (error) {
    console.error('Lỗi tại advisor.controller.js:', error);

    // Xử lý các loại lỗi từ Anthropic SDK
    if (error.status === 401 || error.message?.includes('x-api-key')) {
      return res.status(401).json({
        success: false,
        message: 'Khóa ANTHROPIC_API_KEY không hợp lệ hoặc hết hạn.',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Xin lỗi, không thể kết nối tới dịch vụ AI lúc này. Hãy kiểm tra lại backend nhé!',
      error: error.message,
    });
  }
};

/**
 * GET /api/advisor/history
 * Lấy lịch sử chat của người dùng
 */
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    
    // Tìm các đoạn chat tương ứng (nếu chưa đăng nhập thì lấy 20 bản ghi gần nhất)
    const query = userId ? { userId } : {};
    const history = await AdvisorLog.find(query)
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      success: true,
      data: history.reverse(),
    });
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử chat:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy lịch sử trò chuyện.',
    });
  }
};