import api from '../../services/api';

export const userService = {
  async getProfile() {
    const res = await api.get('/users/me');
    return res.data?.data;
  },

  async updateProfile(payload) {
    const res = await api.patch('/users/me', payload);
    return res.data?.data;
  },

  async getAvatarFrames() {
    const res = await api.get('/users/me/frames');
    return res.data?.data;
  },

  async dailyCheckIn() {
    const res = await api.post('/users/me/check-in');
    return res.data?.data;
  },

  async changePassword({ oldPassword, newPassword }) {
    const res = await api.patch('/users/me/password', { oldPassword, newPassword });
    return res.data?.data;
  },
};

export default userService;
