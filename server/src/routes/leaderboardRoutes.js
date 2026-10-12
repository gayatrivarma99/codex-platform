const express = require('express');
const router = express.Router();
const {
  getGlobalLeaderboard,
  getUserProfile,
} = require('../controllers/leaderboardController');

router.get('/leaderboard', getGlobalLeaderboard);
router.get('/users/:username', getUserProfile);

module.exports = router;
