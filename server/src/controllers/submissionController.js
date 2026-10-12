const axios = require('axios');
const Problem = require('../models/Problem');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Contest = require('../models/Contest');
const Assessment = require('../models/Assessment');
const { checkAndAwardAchievements } = require('../services/achievementService');
const { calculateParticipantScore } = require('../services/contestScoringService');

const EXECUTION_SERVICE_URL =
  process.env.EXECUTION_SERVICE_URL || 'http://localhost:5050';
const EXECUTION_SECRET =
  process.env.EXECUTION_SECRET || 'codex_internal_secret_sandbox_token_2026';

// Helper to update user streak
function updateStreak(user) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!user.streak) {
    user.streak = { current: 1, longest: 1, lastSolvedDate: today };
    return;
  }

  if (!user.streak.lastSolvedDate) {
    user.streak.current = 1;
    user.streak.longest = Math.max(user.streak.longest || 0, 1);
    user.streak.lastSolvedDate = today;
    return;
  }

  const lastSolved = new Date(user.streak.lastSolvedDate);
  const lastDate = new Date(lastSolved.getFullYear(), lastSolved.getMonth(), lastSolved.getDate());
  const diffDays = Math.round((today - lastDate) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Solved today already, streak continues
    return;
  } else if (diffDays === 1) {
    // Solved consecutive day
    user.streak.current += 1;
    if (user.streak.current > user.streak.longest) {
      user.streak.longest = user.streak.current;
    }
    user.streak.lastSolvedDate = today;
  } else {
    // Streak broken
    user.streak.current = 1;
    user.streak.lastSolvedDate = today;
  }
}

// @desc    Run code against sample / custom input (Test Run)
// @route   POST /api/submissions/run
// @access  Private
exports.runCode = async (req, res, next) => {
  try {
    const { problemId, language, code, customInput } = req.body;

    if (!language || !code) {
      return res.status(400).json({
        success: false,
        error: 'Language and code are required',
      });
    }

    let testCasesToRun = [];

    if (customInput !== undefined && customInput !== null && customInput.trim() !== '') {
      testCasesToRun = [
        {
          id: 'custom_1',
          input: customInput,
          expectedOutput: '', // Expected output not required for arbitrary custom run
        },
      ];
    } else if (problemId) {
      const problem = await Problem.findById(problemId).select('+testCases');
      if (problem) {
        // Run against public test cases or first 2 test cases
        const publicCases = (problem.testCases || []).filter((tc) => tc.isPublic);
        testCasesToRun = publicCases.length > 0 ? publicCases : (problem.testCases || []).slice(0, 2);
      }
    }

    if (testCasesToRun.length === 0) {
      testCasesToRun = [{ id: 'sample_1', input: '', expectedOutput: '' }];
    }

    // Call isolated execution service
    const execResponse = await axios.post(
      `${EXECUTION_SERVICE_URL}/api/execute`,
      {
        language,
        code,
        testCases: testCasesToRun,
        timeoutMs: 4000,
      },
      {
        headers: {
          'x-execution-secret': EXECUTION_SECRET,
        },
        timeout: 10000,
      }
    );

    res.status(200).json({
      success: true,
      result: execResponse.data,
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Execution service is currently unavailable. Please verify execution service is running.',
      });
    }
    next(err);
  }
};

// @desc    Submit code solution against all problem test cases
// @route   POST /api/submissions/submit
// @access  Private
exports.submitCode = async (req, res, next) => {
  try {
    const { problemId, language, code, contestId, assessmentId } = req.body;

    if (!problemId || !language || !code) {
      return res.status(400).json({
        success: false,
        error: 'Problem ID, language, and code are required',
      });
    }

    const problem = await Problem.findById(problemId).select('+testCases');
    if (!problem) {
      return res.status(404).json({
        success: false,
        error: 'Problem not found',
      });
    }

    const allTestCases = problem.testCases || [];
    if (allTestCases.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'This problem does not have test cases configured yet.',
      });
    }

    // Call execution service with all test cases (both public and hidden)
    const execResponse = await axios.post(
      `${EXECUTION_SERVICE_URL}/api/execute`,
      {
        language,
        code,
        testCases: allTestCases.map((tc, idx) => ({
          id: `tc_${idx + 1}`,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        })),
        timeoutMs: problem.timeLimit || 4000,
        memoryLimitMb: problem.memoryLimit || 64,
      },
      {
        headers: {
          'x-execution-secret': EXECUTION_SECRET,
        },
        timeout: 15000,
      }
    );

    const execData = execResponse.data;

    // Mask hidden test case actual inputs/outputs from stored results
    const sanitizedResults = (execData.results || []).map((r, idx) => {
      const tc = allTestCases[idx];
      const isPublic = tc && tc.isPublic;
      return {
        id: r.id,
        status: r.status,
        passed: r.passed,
        executionTime: r.executionTime,
        error: r.error,
        input: isPublic ? r.input : '[Hidden Test Case]',
        expectedOutput: isPublic ? r.expectedOutput : '[Hidden]',
        actualOutput: isPublic ? r.actualOutput : '[Hidden]',
      };
    });

    // Create Submission record
    const submission = await Submission.create({
      user: req.user._id,
      problem: problem._id,
      language,
      code,
      status: execData.status,
      executionTime: execData.executionTime || 0,
      memoryUsed: execData.memoryUsed || 0,
      testCasesPassed: execData.testCasesPassed || 0,
      totalTestCases: allTestCases.length,
      results: sanitizedResults,
      contest: contestId || null,
      assessment: assessmentId || null,
    });

    // Increment problem stats
    problem.totalSubmissions += 1;
    if (execData.status === 'Accepted') {
      problem.acceptedSubmissions += 1;
    }
    await problem.save();

    const io = req.app.get('io');

    // Update user stats if accepted
    const user = await User.findById(req.user._id);
    if (execData.status === 'Accepted') {
      const alreadySolved = user.solvedProblems.some(
        (id) => id.toString() === problem._id.toString()
      );

      if (!alreadySolved) {
        user.solvedProblems.push(problem._id);
        updateStreak(user);
        await user.save();
      }

      // Check and award achievements asynchronously
      checkAndAwardAchievements(user._id, io);
    }

    // Handle contest updates if submission is inside contest
    if (contestId) {
      const contest = await Contest.findById(contestId);
      if (contest && contest.getCurrentStatus() === 'live') {
        let participant = contest.participants.find(
          (p) => p.user.toString() === req.user._id.toString()
        );

        if (!participant) {
          contest.participants.push({
            user: req.user._id,
            score: 0,
            penalty: 0,
            submissions: [],
          });
          participant = contest.participants[contest.participants.length - 1];
        }

        let pSub = participant.submissions.find(
          (s) => s.problem.toString() === problem._id.toString()
        );

        const contestProb = contest.problems.find(
          (cp) => cp.problem.toString() === problem._id.toString()
        );
        const problemPoints = contestProb ? contestProb.points : 100;

        if (!pSub) {
          pSub = {
            problem: problem._id,
            status: execData.status === 'Accepted' ? 'Accepted' : 'Failed',
            solvedAt: execData.status === 'Accepted' ? new Date() : null,
            attempts: execData.status === 'Accepted' ? 0 : 1,
            points: execData.status === 'Accepted' ? problemPoints : 0,
          };
          participant.submissions.push(pSub);
        } else if (pSub.status !== 'Accepted') {
          if (execData.status === 'Accepted') {
            pSub.status = 'Accepted';
            pSub.solvedAt = new Date();
            pSub.points = problemPoints;
          } else {
            pSub.attempts = (pSub.attempts || 0) + 1;
          }
        }

        // Recalculate participant score
        const { totalScore, totalPenalty } = calculateParticipantScore(
          contest.startTime,
          participant.submissions
        );
        participant.score = totalScore;
        participant.penalty = totalPenalty;

        await contest.save();

        // Broadcast live leaderboard update
        if (io) {
          io.to(`contest_${contest._id}`).emit('contest_submission_update', {
            contestId: contest._id,
            userId: user._id,
            username: user.username,
            score: totalScore,
            penalty: totalPenalty,
          });
        }
      }
    }

    // Handle assessment updates if submission is inside assessment
    if (assessmentId) {
      const assessment = await Assessment.findById(assessmentId);
      if (assessment) {
        let candidate = assessment.candidates.find(
          (c) => c.user && c.user.toString() === req.user._id.toString()
        );

        if (candidate) {
          const asmtProb = assessment.problems.find(
            (ap) => ap.problem.toString() === problem._id.toString()
          );
          const points = asmtProb ? asmtProb.points : 100;
          const score = execData.status === 'Accepted' ? points : 0;

          const existingSub = candidate.problemSubmissions.find(
            (ps) => ps.problem.toString() === problem._id.toString()
          );

          if (!existingSub) {
            candidate.problemSubmissions.push({
              problem: problem._id,
              submission: submission._id,
              score,
            });
          } else {
            existingSub.submission = submission._id;
            existingSub.score = Math.max(existingSub.score || 0, score);
          }

          // Total score
          const totalEarned = candidate.problemSubmissions.reduce(
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
        }
      }
    }

    res.status(201).json({
      success: true,
      submission,
    });
  } catch (err) {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({
        success: false,
        error: 'Execution service is currently unavailable. Please ensure execution service is running.',
      });
    }
    next(err);
  }
};

// @desc    Get current user submissions
// @route   GET /api/submissions/me
// @access  Private
exports.getMySubmissions = async (req, res, next) => {
  try {
    const { problemId, page = 1, limit = 20 } = req.query;
    const query = { user: req.user._id };

    if (problemId) {
      query.problem = problemId;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Submission.countDocuments(query);
    const submissions = await Submission.find(query)
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

// @desc    Get single submission by id
// @route   GET /api/submissions/:id
// @access  Private
exports.getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problem', 'title slug difficulty')
      .populate('user', 'username name');

    if (!submission) {
      return res.status(404).json({
        success: false,
        error: 'Submission not found',
      });
    }

    // Role check: Only the owner, instructor, or admin can view source code
    const isOwner = submission.user._id.toString() === req.user._id.toString();
    const isStaff = req.user.role === 'admin' || req.user.role === 'instructor';

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this submission details',
      });
    }

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (err) {
    next(err);
  }
};
