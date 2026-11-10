import api from '../../services/api';

/**
 * Lấy số dư ví Xu ảo và trạng thái điểm danh
 * @returns {Promise<{balance: number, totalEarned: number, totalSpent: number, canClaimDaily: boolean, nextDailyAt: string|null, dailyRewardAmount: number}>}
 */
export const getWallet = async () => {
  const res = await api.get('/economy/wallet');
  return res.data?.data;
};

/**
 * Điểm danh hàng ngày nhận Xu
 * @returns {Promise<{balance: number, claimedAmount: number, nextDailyAt: string, message: string}>}
 */
export const claimDailyReward = async () => {
  const res = await api.post('/economy/daily-reward');
  return res.data?.data;
};

/**
 * Lấy danh sách rương mở hòm và tỷ lệ rơi
 * @returns {Promise<Array>}
 */
export const getCases = async () => {
  const res = await api.get('/economy/cases');
  return res.data?.data || [];
};

/**
 * Gửi lệnh mở hòm tới server (kết quả và RNG tính 100% tại backend)
 * @param {string} caseId Mã định danh loại rương ('standard', 'cyber', 'mythic')
 * @returns {Promise<{wonItem: Object, isNew: boolean, remainingBalance: number, reelItems: Array, targetIndex: number, cost: number}>}
 */
export const openCase = async (caseId) => {
  const res = await api.post('/economy/open', { caseId });
  return res.data?.data;
};

/**
 * Lấy danh sách vật phẩm trong kho đồ / bộ sưu tập
 * @param {Object} params Bộ lọc: rarity, type, search, sort, page, limit
 * @returns {Promise<{items: Array, pagination: Object, summary: Object}>}
 */
export const getInventory = async (params = {}) => {
  const res = await api.get('/economy/inventory', { params });
  return res.data?.data;
};

/**
 * Bán vật phẩm trong kho để lấy lại Xu
 * @param {string} inventoryId ID bản ghi trong túi đồ
 * @param {number} quantity Số lượng muốn bán
 * @returns {Promise<{soldItem: Object, refundedCoins: number, remainingBalance: number, remainingQuantity: number, message: string}>}
 */
export const sellItem = async (inventoryId, quantity = 1) => {
  const res = await api.post('/economy/sell', { inventoryId, quantity });
  return res.data?.data;
};

/**
 * Xem lịch sử mở hòm gần đây của tài khoản
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const getCaseHistory = async (limit = 20) => {
  const res = await api.get('/economy/history', { params: { limit } });
  return res.data?.data || [];
};

/**
 * Xem bảng tin trúng thưởng thời gian thực (toàn server)
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const getRecentDrops = async (limit = 10) => {
  const res = await api.get('/economy/recent-drops', { params: { limit } });
  return res.data?.data || [];
};

export default {
  getWallet,
  claimDailyReward,
  getCases,
  openCase,
  getInventory,
  sellItem,
  getCaseHistory,
  getRecentDrops,
};
