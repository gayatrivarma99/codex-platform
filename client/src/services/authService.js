import api from './api';

export const authService = {
  login: async (login, password) => {
    const res = await api.post('/auth/login', { login, password });
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const res = await api.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (token, password) => {
    const res = await api.put(`/auth/reset-password/${token}`, { password });
    return res.data;
  },
};
