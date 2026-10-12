import api from './api';

export const assessmentService = {
  getInstructorAssessments: async () => {
    const res = await api.get('/assessments/instructor');
    return res.data;
  },

  createAssessment: async (data) => {
    const res = await api.post('/assessments', data);
    return res.data;
  },

  getAssessmentByCode: async (code) => {
    const res = await api.get(`/assessments/code/${code}`);
    return res.data;
  },

  startAssessment: async (id) => {
    const res = await api.post(`/assessments/${id}/start`);
    return res.data;
  },

  finishAssessment: async (id) => {
    const res = await api.post(`/assessments/${id}/finish`);
    return res.data;
  },

  getAnalytics: async (id) => {
    const res = await api.get(`/assessments/${id}/analytics`);
    return res.data;
  },
};
