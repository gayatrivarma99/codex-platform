const slugify = require('slugify');
const Contest = require('../models/Contest');
const Problem = require('../models/Problem');

// @desc    Get all contests (upcoming, live, completed)
// @route   GET /api/contests
// @access  Public
exports.getContests = async (req, res, next) => {
  try {
    const contests = await Contest.find()
      .populate('createdBy', 'username name')
      .populate('problems.problem', 'title slug difficulty')
      .sort({ startTime: -1 });

    const serverTime = new Date();

    const formattedContests = contests.map((c) => {
      const cObj = c.toObject();
      const status = c.getCurrentStatus();
      cObj.status = status;
      cObj.participantCount = c.participants ? c.participants.length : 0;
      cObj.isRegistered = req.user
        ? c.participants.some((p) => p.user.toString() === req.user._id.toString())
        : false;
      delete cObj.participants; // Don't send whole participant array on list view
      return cObj;
    });

    res.status(200).json({
      success: true,
      serverTime,
      contests: formattedContests,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get contest by slug
// @route   GET /api/contests/:slug
// @access  Public
exports.getContestBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;

    const contest = await Contest.findOne({ slug })
      .populate('createdBy', 'username name')
      .populate('problems.problem', 'title slug difficulty topics tags');

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found',
      });
    }

    const currentStatus = contest.getCurrentStatus();
    const contestObj = contest.toObject();
    contestObj.status = currentStatus;
    contestObj.serverTime = new Date();

    let isRegistered = false;
    if (req.user) {
      isRegistered = contest.participants.some(
        (p) => p.user.toString() === req.user._id.toString()
      );
    }
    contestObj.isRegistered = isRegistered;

    // If upcoming and user is not admin/creator, hide problem statements to prevent leakage
    const isOwnerOrAdmin =
      req.user &&
      (req.user.role === 'admin' ||
        (req.user.role === 'instructor' &&
          contest.createdBy._id.toString() === req.user._id.toString()));

    if (currentStatus === 'upcoming' && !isOwnerOrAdmin) {
      contestObj.problems = contestObj.problems.map((p, idx) => ({
        _id: p._id,
        order: p.order,
        points: p.points,
        problem: {
          title: `Problem ${String.fromCharCode(65 + idx)}`,
          slug: '#',
          difficulty: 'Hidden',
        },
      }));
    }

    res.status(200).json({
      success: true,
      contest: contestObj,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Register for contest
// @route   POST /api/contests/:id/register
// @access  Private
exports.registerContest = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found',
      });
    }

    if (contest.getCurrentStatus() === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Cannot register for a completed contest',
      });
    }

    const alreadyRegistered = contest.participants.some(
      (p) => p.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        error: 'You are already registered for this contest',
      });
    }

    contest.participants.push({
      user: req.user._id,
      registeredAt: new Date(),
      score: 0,
      penalty: 0,
      submissions: [],
    });

    await contest.save();

    res.status(200).json({
      success: true,
      message: 'Successfully registered for contest',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get contest leaderboard
// @route   GET /api/contests/:id/leaderboard
// @access  Public
exports.getContestLeaderboard = async (req, res, next) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('participants.user', 'username name avatar rating')
      .populate('problems.problem', 'title slug');

    if (!contest) {
      return res.status(404).json({
        success: false,
        error: 'Contest not found',
      });
    }

    // Rank participants: highest score first, then lowest penalty
    const rankedParticipants = (contest.participants || [])
      .map((p) => {
        const solvedCount = (p.submissions || []).filter(
          (s) => s.status === 'Accepted'
        ).length;
        return {
          user: p.user,
          score: p.score || 0,
          penalty: p.penalty || 0,
          solvedCount,
          submissions: p.submissions || [],
        };
      })
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.penalty - b.penalty;
      })
      .map((p, index) => ({
        rank: index + 1,
        ...p,
      }));

    res.status(200).json({
      success: true,
      contestTitle: contest.title,
      serverTime: new Date(),
      leaderboard: rankedParticipants,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new contest
// @route   POST /api/contests
// @access  Private (Instructor, Admin)
exports.createContest = async (req, res, next) => {
  try {
    const { title, description, startTime, endTime, duration, problems } = req.body;

    if (!title || !startTime || !endTime || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Title, startTime, endTime, and duration are required',
      });
    }

    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Contest.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const contest = await Contest.create({
      title,
      slug,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: Number(duration),
      problems: problems || [],
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      contest,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update contest
// @route   PUT /api/contests/:id
// @access  Private (Instructor, Admin)
exports.updateContest = async (req, res, next) => {
  try {
    let contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({ success: false, error: 'Contest not found' });
    }

    if (
      req.user.role !== 'admin' &&
      contest.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this contest',
      });
    }

    contest = await Contest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, contest });
  } catch (err) {
    next(err);
  }
};
