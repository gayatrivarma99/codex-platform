const express = require('express');
const router = express.Router();
const {
  getContests,
  getContestBySlug,
  registerContest,
  getContestLeaderboard,
  createContest,
  updateContest,
} = require('../controllers/contestController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getContests);
router.get('/:slug', optionalAuth, getContestBySlug);
router.get('/:id/leaderboard', getContestLeaderboard);
router.post('/:id/register', protect, registerContest);

// Instructor / Admin
router.post('/', protect, authorize('instructor', 'admin'), createContest);
router.put('/:id', protect, authorize('instructor', 'admin'), updateContest);

module.exports = router;
