import api from './api';

export const adminService = {
  getStats: async () => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  getUsers: async (params = {}) => {
    const res = await api.get('/admin/users', { params });
    return res.data;
  },

  toggleUserStatus: async (userId) => {
    const res = await api.put(`/admin/users/${userId}/status`);
    return res.data;
  },

  changeUserRole: async (userId, role) => {
    const res = await api.put(`/admin/users/${userId}/role`, { role });
    return res.data;
  },

  getSubmissions: async (params = {}) => {
    const res = await api.get('/admin/submissions', { params });
    return res.data;
  },
};
