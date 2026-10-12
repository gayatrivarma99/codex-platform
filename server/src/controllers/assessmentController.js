const Assessment = require('../models/Assessment');
const Problem = require('../models/Problem');

// @desc    Create new assessment
// @route   POST /api/assessments
// @access  Private (Instructor, Admin)
exports.createAssessment = async (req, res, next) => {
  try {
    const {
      title,
      code,
      description,
      startTime,
      endTime,
      duration,
      passingScore,
      problems,
      candidateEmails,
    } = req.body;

    if (!title || !code || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'Title, code, startTime, and endTime are required',
      });
    }

    const cleanCode = code.toUpperCase().trim();
    const existing = await Assessment.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'Assessment code already exists. Please choose another.',
      });
    }

    const candidates = (candidateEmails || []).map((email) => ({
      email: email.toLowerCase().trim(),
      status: 'invited',
    }));

    const assessment = await Assessment.create({
      title,
      code: cleanCode,
      description: description || '',
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      duration: duration || 60,
      passingScore: passingScore || 60,
      problems: problems || [],
      candidates,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      assessment,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get assessments created by instructor
// @route   GET /api/assessments/instructor
// @access  Private (Instructor, Admin)
exports.getInstructorAssessments = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { createdBy: req.user._id };

    const assessments = await Assessment.find(query)
      .populate('problems.problem', 'title slug difficulty')
      .sort({ createdAt: -1 });

    const formatted = assessments.map((a) => {
      const candidates = a.candidates || [];
      const completed = candidates.filter((c) => c.status === 'completed');
      const passed = completed.filter((c) => c.passed).length;

      return {
        _id: a._id,
        title: a.title,
        code: a.code,
        startTime: a.startTime,
        endTime: a.endTime,
        duration: a.duration,
        passingScore: a.passingScore,
        totalProblems: a.problems.length,
        totalCandidates: candidates.length,
        completedCount: completed.length,
        passedCount: passed,
        createdAt: a.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      assessments: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get assessment by access code (Candidate entry)
// @route   GET /api/assessments/code/:code
// @access  Private
exports.getAssessmentByCode = async (req, res, next) => {
  try {
    const code = req.params.code.toUpperCase().trim();
    const assessment = await Assessment.findOne({ code })
      .populate('problems.problem', 'title slug difficulty description constraints examples starterCode');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        error: 'Assessment not found with this code',
      });
    }

    const now = new Date();
    if (now < assessment.startTime) {
      return res.status(400).json({
        success: false,
        error: `Assessment has not started yet. Starts at ${assessment.startTime.toLocaleString()}`,
      });
    }

    if (now > assessment.endTime) {
      return res.status(400).json({
        success: false,
        error: 'Assessment has already concluded.',
      });
    }

    // Check candidate record
    let candidate = assessment.candidates.find(
      (c) =>
        (c.user && c.user.toString() === req.user._id.toString()) ||
        c.email.toLowerCase() === req.user.email.toLowerCase()
    );

    if (!candidate) {
      // Auto-register candidate on entry
      candidate = {
        email: req.user.email,
        user: req.user._id,
        status: 'invited',
      };
      assessment.candidates.push(candidate);
      await assessment.save();
    } else if (!candidate.user) {
      candidate.user = req.user._id;
      await assessment.save();
    }

    res.status(200).json({
      success: true,
      assessment: {
        _id: assessment._id,
        title: assessment.title,
        code: assessment.code,
        description: assessment.description,
        duration: assessment.duration,
        passingScore: assessment.passingScore,
        problems: assessment.problems,
        candidateStatus: candidate.status,
        startedAt: candidate.startedAt,
        serverTime: new Date(),
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Start assessment attempt
// @route   POST /api/assessments/:id/start
// @access  Private
exports.startAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    let candidate = assessment.candidates.find(
      (c) =>
        (c.user && c.user.toString() === req.user._id.toString()) ||
        c.email.toLowerCase() === req.user.email.toLowerCase()
    );

    if (!candidate) {
      candidate = {
        email: req.user.email,
        user: req.user._id,
        status: 'in_progress',
        startedAt: new Date(),
      };
      assessment.candidates.push(candidate);
    } else {
      if (candidate.status === 'completed') {
        return res.status(400).json({
          success: false,
          error: 'You have already submitted this assessment',
        });
      }
      if (!candidate.startedAt) {
        candidate.startedAt = new Date();
        candidate.status = 'in_progress';
      }
      candidate.user = req.user._id;
    }

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment started',
      startedAt: candidate.startedAt,
      duration: assessment.duration,
      serverTime: new Date(),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Submit / finish assessment
// @route   POST /api/assessments/:id/finish
// @access  Private
exports.finishAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    const candidate = assessment.candidates.find(
      (c) =>
        (c.user && c.user.toString() === req.user._id.toString()) ||
        c.email.toLowerCase() === req.user.email.toLowerCase()
    );

    if (!candidate) {
      return res.status(404).json({ success: false, error: 'Candidate record not found' });
    }

    candidate.status = 'completed';
    candidate.submittedAt = new Date();

    const totalEarned = (candidate.problemSubmissions || []).reduce(
      (acc, curr) => acc + (curr.score || 0),
      0
    );
    const maxPoints = assessment.problems.reduce(
      (acc, curr) => acc + (curr.points || 100),
      0
    );

    candidate.score = totalEarned;
    candidate.totalPoints = maxPoints;
    const percentage = maxPoints > 0 ? (totalEarned / maxPoints) * 100 : 0;
    candidate.passed = percentage >= (assessment.passingScore || 60);

    await assessment.save();

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      result: {
        score: candidate.score,
        totalPoints: candidate.totalPoints,
        percentage: Math.round(percentage),
        passed: candidate.passed,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get assessment analytics
// @route   GET /api/assessments/:id/analytics
// @access  Private (Instructor, Admin)
exports.getAssessmentAnalytics = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate('candidates.user', 'name username email')
      .populate('problems.problem', 'title difficulty');

    if (!assessment) {
      return res.status(404).json({ success: false, error: 'Assessment not found' });
    }

    if (
      req.user.role !== 'admin' &&
      assessment.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view analytics for this assessment',
      });
    }

    const candidates = assessment.candidates || [];
    const completed = candidates.filter((c) => c.status === 'completed');
    const passed = completed.filter((c) => c.passed);

    const scores = completed.map((c) => c.score || 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;

    res.status(200).json({
      success: true,
      analytics: {
        totalInvited: candidates.length,
        totalCompleted: completed.length,
        completionRate: candidates.length > 0 ? Math.round((completed.length / candidates.length) * 100) : 0,
        passRate: completed.length > 0 ? Math.round((passed.length / completed.length) * 100) : 0,
        averageScore: avgScore,
        highestScore: maxScore,
        lowestScore: minScore,
        candidatesList: candidates,
        problems: assessment.problems,
      },
    });
  } catch (err) {
    next(err);
  }
};
