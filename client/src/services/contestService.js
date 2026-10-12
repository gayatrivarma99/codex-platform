import api from './api';

export const contestService = {
  getContests: async () => {
    const res = await api.get('/contests');
    return res.data;
  },

  getContestBySlug: async (slug) => {
    const res = await api.get(`/contests/${slug}`);
    return res.data;
  },

  registerContest: async (contestId) => {
    const res = await api.post(`/contests/${contestId}/register`);
    return res.data;
  },

  getContestLeaderboard: async (contestId) => {
    const res = await api.get(`/contests/${contestId}/leaderboard`);
    return res.data;
  },

  createContest: async (contestData) => {
    const res = await api.post('/contests', contestData);
    return res.data;
  },

  updateContest: async (id, contestData) => {
    const res = await api.put(`/contests/${id}`, contestData);
    return res.data;
  },
};
