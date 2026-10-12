const express = require('express');
const router = express.Router();
const {
  createAssessment,
  getInstructorAssessments,
  getAssessmentByCode,
  startAssessment,
  finishAssessment,
  getAssessmentAnalytics,
} = require('../controllers/assessmentController');
const { protect, authorize } = require('../middleware/auth');

// Candidate routes
router.get('/code/:code', protect, getAssessmentByCode);
router.post('/:id/start', protect, startAssessment);
router.post('/:id/finish', protect, finishAssessment);

// Instructor / Admin routes
router.post('/', protect, authorize('instructor', 'admin'), createAssessment);
router.get('/instructor', protect, authorize('instructor', 'admin'), getInstructorAssessments);
router.get('/:id/analytics', protect, authorize('instructor', 'admin'), getAssessmentAnalytics);

module.exports = router;
