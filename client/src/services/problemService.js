import api from './api';

export const problemService = {
  getProblems: async (params = {}) => {
    const res = await api.get('/problems', { params });
    return res.data;
  },

  getProblemBySlug: async (slug) => {
    const res = await api.get(`/problems/${slug}`);
    return res.data;
  },

  getCategories: async () => {
    const res = await api.get('/problems/categories/all');
    return res.data;
  },

  createProblem: async (problemData) => {
    const res = await api.post('/problems', problemData);
    return res.data;
  },

  updateProblem: async (id, problemData) => {
    const res = await api.put(`/problems/${id}`, problemData);
    return res.data;
  },

  deleteProblem: async (id) => {
    const res = await api.delete(`/problems/${id}`);
    return res.data;
  },
};
