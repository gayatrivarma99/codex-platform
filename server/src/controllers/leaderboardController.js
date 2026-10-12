const User = require('../models/User');
const Submission = require('../models/Submission');
const UserAchievement = require('../models/UserAchievement');
const Problem = require('../models/Problem');

// @desc    Get global leaderboard
// @route   GET /api/leaderboard
// @access  Public
exports.getGlobalLeaderboard = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments({ status: 'active', role: 'student' });
    const users = await User.find({ status: 'active' })
      .select('name username avatar rating streak solvedProblems role')
      .populate('solvedProblems', '_id')
      .sort({ rating: -1, 'solvedProblems.length': -1 })
      .skip(skip)
      .limit(limitNum);

    const rankedUsers = users.map((u, idx) => ({
      rank: skip + idx + 1,
      _id: u._id,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      rating: u.rating,
      streak: u.streak ? u.streak.current : 0,
      problemsSolved: u.solvedProblems ? u.solvedProblems.length : 0,
      score: (u.rating || 1500) + (u.solvedProblems ? u.solvedProblems.length * 25 : 0),
    }));

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      leaderboard: rankedUsers,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get public user coding profile
// @route   GET /api/users/:username
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() })
      .populate('solvedProblems', 'title slug difficulty topics tags');

    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    // Solved breakdown
    const solved = user.solvedProblems || [];
    const easyCount = solved.filter((p) => p.difficulty === 'Easy').length;
    const mediumCount = solved.filter((p) => p.difficulty === 'Medium').length;
    const hardCount = solved.filter((p) => p.difficulty === 'Hard').length;

    // Total problems counts in system for progress bars
    const totalEasy = await Problem.countDocuments({ difficulty: 'Easy', isPublished: true });
    const totalMedium = await Problem.countDocuments({ difficulty: 'Medium', isPublished: true });
    const totalHard = await Problem.countDocuments({ difficulty: 'Hard', isPublished: true });

    // Submissions and acceptance rate
    const totalSubmissions = await Submission.countDocuments({ user: user._id });
    const acceptedSubmissions = await Submission.countDocuments({ user: user._id, status: 'Accepted' });
    const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    // Badges / Achievements
    const userAchievements = await UserAchievement.find({ user: user._id })
      .populate('achievement')
      .sort({ unlockedAt: -1 });

    // Recent submissions
    const recentSubmissions = await Submission.find({ user: user._id })
      .populate('problem', 'title slug difficulty')
      .sort({ submittedAt: -1 })
      .limit(10);

    // Activity heatmap: group submissions by date (YYYY-MM-DD) over past year
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);

    const submissionsPastYear = await Submission.find({
      user: user._id,
      submittedAt: { $gte: oneYearAgo },
    }).select('submittedAt status');

    const activityHeatmap = {};
    for (const sub of submissionsPastYear) {
      const dateStr = sub.submittedAt.toISOString().split('T')[0];
      activityHeatmap[dateStr] = (activityHeatmap[dateStr] || 0) + 1;
    }

    // Category / topic distribution
    const topicCounts = {};
    for (const prob of solved) {
      for (const topic of prob.topics || []) {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      }
    }

    res.status(200).json({
      success: true,
      profile: {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
        rating: user.rating,
        streak: user.streak || { current: 0, longest: 0 },
        memberSince: user.createdAt,
        stats: {
          totalSolved: solved.length,
          easy: { solved: easyCount, total: totalEasy },
          medium: { solved: mediumCount, total: totalMedium },
          hard: { solved: hardCount, total: totalHard },
          totalSubmissions,
          acceptedSubmissions,
          acceptanceRate,
        },
        topicDistribution: topicCounts,
        achievements: userAchievements.map((ua) => ({
          _id: ua._id,
          code: ua.achievement?.code,
          title: ua.achievement?.title,
          description: ua.achievement?.description,
          icon: ua.achievement?.icon,
          unlockedAt: ua.unlockedAt,
        })),
        recentSubmissions,
        activityHeatmap,
      },
    });
  } catch (err) {
    next(err);
  }
};
