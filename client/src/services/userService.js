import api from './api';

export const userService = {
  getLeaderboard: async (params = {}) => {
    const res = await api.get('/leaderboard', { params });
    return res.data;
  },

  getUserProfile: async (username) => {
    const res = await api.get(`/users/${username}`);
    return res.data;
  },

  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  markNotificationAsRead: async (id) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsAsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },

  search: async (q) => {
    const res = await api.get('/search', { params: { q } });
    return res.data;
  },
};
