import api from '../../services/api';

/**
 * Gửi tin nhắn đến Cố vấn AI Gemini
 * @param {string} message Tin nhắn người dùng
 * @param {string} sessionId ID phiên trò chuyện
 * @returns {Promise<{reply: string}>}
 */
export const sendAdvisorMessage = async (message, sessionId = 'default') => {
  const response = await api.post('/advisor/chat', { message, sessionId });
  return response.data?.data;
};

/**
 * Lấy lịch sử chat tư vấn của người dùng
 * @param {string} sessionId ID phiên trò chuyện
 * @returns {Promise<Array>}
 */
export const getAdvisorHistory = async (sessionId = 'default') => {
  const response = await api.get('/advisor/history', { params: { sessionId } });
  return response.data?.data || [];
};

/**
 * Xóa lịch sử hoặc bắt đầu cuộc hội thoại mới
 * @param {string} sessionId ID phiên trò chuyện
 * @returns {Promise<{message: string}>}
 */
export const clearAdvisorHistory = async (sessionId = 'default') => {
  const response = await api.delete('/advisor/history', { params: { sessionId } });
  return response.data?.data;
};

export default {
  sendAdvisorMessage,
  getAdvisorHistory,
  clearAdvisorHistory,
};
