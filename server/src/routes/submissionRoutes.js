const express = require('express');
const router = express.Router();
const {
  runCode,
  submitCode,
  getMySubmissions,
  getSubmissionById,
} = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');
const { codeExecutionLimiter } = require('../middleware/rateLimiter');

router.post('/run', protect, codeExecutionLimiter, runCode);
router.post('/submit', protect, codeExecutionLimiter, submitCode);
router.get('/me', protect, getMySubmissions);
router.get('/:id', protect, getSubmissionById);

module.exports = router;
