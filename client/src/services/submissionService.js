import api from './api';

export const submissionService = {
  runCode: async ({ problemId, language, code, customInput }) => {
    const res = await api.post('/submissions/run', {
      problemId,
      language,
      code,
      customInput,
    });
    return res.data;
  },

  submitCode: async ({ problemId, language, code, contestId, assessmentId }) => {
    const res = await api.post('/submissions/submit', {
      problemId,
      language,
      code,
      contestId,
      assessmentId,
    });
    return res.data;
  },

  getMySubmissions: async (params = {}) => {
    const res = await api.get('/submissions/me', { params });
    return res.data;
  },

  getSubmissionById: async (id) => {
    const res = await api.get(`/submissions/${id}`);
    return res.data;
  },
};
