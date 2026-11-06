import api from '../../services/api';

/**
 * Gửi tin nhắn đến Cố vấn AI Gemini và nhận câu trả lời
 * @param {String} message Tin nhắn/câu hỏi của người dùng
 * @returns {Promise<Object>} Phản hồi từ server chứa nội dung tư vấn
 */
export const sendAdvisorMessage = async (message) => {
  try {
    const response = await api.post('/advisor/chat', { message });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi dịch vụ Cố vấn AI:', error);
    throw error.response?.data || error;
  }
};

/**
 * Lấy lịch sử chat tư vấn của người dùng
 * @returns {Promise<Array>} Danh sách lịch sử tin nhắn
 */
export const getAdvisorHistory = async () => {
  try {
    const response = await api.get('/advisor/history');
    return response.data;
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử chat:', error);
    throw error.response?.data || error;
  }
};

export default {
  sendAdvisorMessage,
  getAdvisorHistory,
};
