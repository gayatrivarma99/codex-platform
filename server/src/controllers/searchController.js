const Problem = require('../models/Problem');
const User = require('../models/User');
const Contest = require('../models/Contest');

// @desc    Global search across problems, users, and contests
// @route   GET /api/search
// @access  Public
exports.globalSearch = async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const query = q.trim();

    if (!query) {
      return res.status(200).json({
        success: true,
        results: { problems: [], users: [], contests: [] },
      });
    }

    const regex = new RegExp(query, 'i');

    const [problems, users, contests] = await Promise.all([
      Problem.find({
        isPublished: true,
        $or: [{ title: regex }, { tags: { $in: [regex] } }, { topics: { $in: [regex] } }],
      })
        .select('title slug difficulty topics acceptanceRate')
        .limit(6),

      User.find({
        status: 'active',
        $or: [{ name: regex }, { username: regex }],
      })
        .select('name username avatar rating role')
        .limit(6),

      Contest.find({
        $or: [{ title: regex }, { description: regex }],
      })
        .select('title slug startTime endTime duration status')
        .limit(6),
    ]);

    res.status(200).json({
      success: true,
      results: {
        problems,
        users,
        contests,
      },
    });
  } catch (err) {
    next(err);
  }
};
