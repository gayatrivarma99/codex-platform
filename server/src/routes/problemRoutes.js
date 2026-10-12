const express = require('express');
const router = express.Router();
const {
  getProblems,
  getProblemBySlug,
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemCategories,
} = require('../controllers/problemController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/categories/all', getProblemCategories);
router.get('/', optionalAuth, getProblems);
router.get('/:slug', optionalAuth, getProblemBySlug);

// Instructor / Admin routes
router.post('/', protect, authorize('instructor', 'admin'), createProblem);
router.put('/:id', protect, authorize('instructor', 'admin'), updateProblem);
router.delete('/:id', protect, authorize('instructor', 'admin'), deleteProblem);

module.exports = router;
