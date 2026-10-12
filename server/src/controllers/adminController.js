const User = require('../models/User');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const Contest = require('../models/Contest');
const Assessment = require('../models/Assessment');

// @desc    Get complete platform stats and analytics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const suspendedUsers = await User.countDocuments({ status: 'suspended' });

    const studentCount = await User.countDocuments({ role: 'student' });
    const instructorCount = await User.countDocuments({ role: 'instructor' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    const totalProblems = await Problem.countDocuments();
    const easyProblems = await Problem.countDocuments({ difficulty: 'Easy' });
    const mediumProblems = await Problem.countDocuments({ difficulty: 'Medium' });
    const hardProblems = await Problem.countDocuments({ difficulty: 'Hard' });

    const totalSubmissions = await Submission.countDocuments();
    const acceptedSubmissions = await Submission.countDocuments({ status: 'Accepted' });
    const acceptanceRate =
      totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

    const totalContests = await Contest.countDocuments();
    const totalAssessments = await Assessment.countDocuments();

    // Submission trends for past 7 days
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const dayCount = await Submission.countDocuments({
        submittedAt: { $gte: startOfDay, $lte: endOfDay },
      });
      const acceptedCount = await Submission.countDocuments({
        submittedAt: { $gte: startOfDay, $lte: endOfDay },
        status: 'Accepted',
      });

      past7Days.push({
        date: startOfDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        submissions: dayCount,
        accepted: acceptedCount,
      });
    }

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          suspended: suspendedUsers,
          students: studentCount,
          instructors: instructorCount,
          admins: adminCount,
        },
        problems: {
          total: totalProblems,
          easy: easyProblems,
          medium: mediumProblems,
          hard: hardProblems,
        },
        submissions: {
          total: totalSubmissions,
          accepted: acceptedSubmissions,
          acceptanceRate,
        },
        contests: totalContests,
        assessments: totalAssessments,
        chartData: past7Days,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users with search, filtering and pagination
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      users,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Toggle user active/suspended status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, error: 'Cannot suspend your own account' });
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User status updated to ${user.status}`,
      status: user.status,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['student', 'instructor', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
      return res.status(400).json({ success: false, error: 'Cannot revoke your own admin role' });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User role changed to ${role}`,
      user,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all submissions for admin
// @route   GET /api/admin/submissions
// @access  Private (Admin)
exports.getAllSubmissionsAdmin = async (req, res, next) => {
  try {
    const { status, language, page = 1, limit = 25 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (language) query.language = language;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 25;
    const skip = (pageNum - 1) * limitNum;

    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
      .populate('user', 'username name email')
      .populate('problem', 'title slug difficulty')
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      submissions,
    });
  } catch (err) {
    next(err);
  }
};
