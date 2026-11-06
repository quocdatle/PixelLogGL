// Import đối tượng axios đã cấu hình sẵn base URL (ví dụ trỏ tới http://localhost:5000/api hoặc cổng 5002)
import api from './api'; // Thay đổi đường dẫn này cho khớp với cấu trúc thư mục thực tế của bạn (vd: './axiosClient' hoặc '../utils/api')

/**
 * Gửi tin nhắn đến Cố vấn AI và nhận câu trả lời
 * @param {String} message Tin nhắn/câu hỏi của người dùng
 * @returns {Promise<Object>} Phản hồi từ server chứa nội dung tư vấn
 */
export const sendAdvisorMessage = async (message) => {
  try {
    const response = await api.post('/advisor/chat', { message });
    return response.data;
  } catch (error) {
    console.error('Lỗi khi gọi dịch vụ Cố vấn AI:', error);
    throw error.response?.data || error.message;
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
    throw error.response?.data || error.message;
  }
};